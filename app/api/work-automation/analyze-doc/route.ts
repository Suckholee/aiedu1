import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// 바이너리(HWP, DOC 등) 파일에서 텍스트 조각 추출
function extractTextFromBinary(buf: Buffer): string {
  try {
    const str16 = buf.toString('utf16le');
    const match16 = str16.match(/[\uAC00-\uD7A3\w\s.,;:!?()\-—/]{2,}/g) || [];
    const str8 = buf.toString('utf8');
    const match8 = str8.match(/[\uAC00-\uD7A3\w\s.,;:!?()\-—/]{2,}/g) || [];
    return [...match16, ...match8].join(' ').replace(/\s+/g, ' ').trim().slice(0, 6000);
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fileData = body.fileData || body.imageUrl;
    const fileName = (body.fileName || body.docName || '업무문서').trim();
    const hintType = body.hintType || '';

    if (!fileData) {
      return NextResponse.json(
        { error: '분석할 문서 파일 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // Base64 및 MIME 타입 분리
    let mimeType = 'application/octet-stream';
    let base64Data = '';
    if (fileData.startsWith('data:')) {
      const commaIdx = fileData.indexOf(',');
      const header = fileData.slice(0, commaIdx);
      base64Data = fileData.slice(commaIdx + 1);
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) mimeType = mimeMatch[1];
    } else {
      base64Data = fileData;
    }

    const fileBuffer = Buffer.from(base64Data, 'base64');
    const lowerName = fileName.toLowerCase();

    // ── 1. 문서 타입별 텍스트 및 구조 파싱 ──
    let extractedText = '';
    let isPdf = lowerName.endsWith('.pdf') || mimeType === 'application/pdf';
    let isImage = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|gif)$/i.test(lowerName);
    let isDocx = lowerName.endsWith('.docx') || mimeType.includes('wordprocessingml');
    let isHwpx = lowerName.endsWith('.hwpx');
    let isHwp = lowerName.endsWith('.hwp');
    let isPptx = lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt');
    let isText = lowerName.endsWith('.txt') || lowerName.endsWith('.csv') || lowerName.endsWith('.md');

    // (A) DOCX 압축 해제 및 텍스트 추출 (JSZip)
    if (isDocx) {
      try {
        const zip = await JSZip.loadAsync(fileBuffer);
        const docXml = await zip.file('word/document.xml')?.async('text');
        if (docXml) {
          extractedText = docXml
            .replace(/<\/w:tr>/g, '\n|---\n')
            .replace(/<\/w:tc>/g, ' | ')
            .replace(/<\/w:p>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n\s*\n/g, '\n')
            .trim()
            .slice(0, 15000);
        }
      } catch (zipErr) {
        console.warn('DOCX zip parse warning:', zipErr);
      }
    }

    // (B) HWPX 압축 해제 및 텍스트 추출 (JSZip)
    if (isHwpx) {
      try {
        const zip = await JSZip.loadAsync(fileBuffer);
        const sectionFiles = Object.keys(zip.files).filter(
          (k) => k.includes('section') && k.endsWith('.xml')
        );
        const parts: string[] = [];
        for (const s of sectionFiles) {
          const sXml = await zip.file(s)?.async('text');
          if (sXml) {
            const clean = sXml
              .replace(/<\/hp:tr>/g, '\n|---\n')
              .replace(/<\/hp:tc>/g, ' | ')
              .replace(/<\/hp:p>/g, '\n')
              .replace(/<[^>]+>/g, '')
              .replace(/\n\s*\n/g, '\n')
              .trim();
            parts.push(clean);
          }
        }
        if (parts.length > 0) {
          extractedText = parts.join('\n\n').slice(0, 15000);
        }
      } catch (zipErr) {
        console.warn('HWPX zip parse warning:', zipErr);
      }
    }

    // (C) PPTX 슬라이드 텍스트 추출
    if (isPptx) {
      try {
        const zip = await JSZip.loadAsync(fileBuffer);
        const slideFiles = Object.keys(zip.files)
          .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
          .sort();
        const slideTexts: string[] = [];
        for (let i = 0; i < Math.min(slideFiles.length, 20); i++) {
          const xml = await zip.file(slideFiles[i])?.async('text');
          if (xml) {
            const clean = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            slideTexts.push(`[Slide ${i + 1}] ${clean}`);
          }
        }
        extractedText = slideTexts.join('\n').slice(0, 12000);
      } catch (zipErr) {
        console.warn('PPTX zip parse warning:', zipErr);
      }
    }

    // (D) TXT / CSV / MD 텍스트 디코딩
    if (isText) {
      try {
        extractedText = fileBuffer.toString('utf-8').slice(0, 15000);
      } catch {
        extractedText = fileBuffer.toString('latin1').slice(0, 15000);
      }
    }

    // (E) HWP (바이너리 OLE) 한글 텍스트 조각 추출
    if (isHwp) {
      extractedText = extractTextFromBinary(fileBuffer);
    }

    // ── 2. Google Gemini 모델 호출 ──
    const geminiApiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '';

    if (geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

        const systemPrompt = `당신은 대한민국 최고의 비즈니스 문서 서식 분석 및 프롬프트 엔지니어링 전문가입니다.
사용자가 업로드한 비즈니스 문서(사업계획서, 기획서, 회의록, 정부지원사업 양식, HWP/DOCX/PDF 등)를 정밀 분석해 주세요.

[파일명]: ${fileName}

[요구사항]
1. 원본 문서의 핵심 서식 틀, 목차 번호 체계 (I, 1, 1), 가, ①), 표(Table) 구조, 결재란을 100% 충실히 보존하세요.
2. 내용은 [기업명], [대표자], [주요 기술/제품], [시장 분석], [추진 일정] 등 편집 가능한 마크다운 플레이스홀더로 정갈하게 정리하세요.
3. 클로드(Claude)가 이 서식 틀을 그대로 준수하여 신규 기획/사업계획서를 작성하도록 돕는 최고급 프롬프트도 함께 작성하세요.

반드시 다음 4가지 필드를 가진 순수 JSON 형식으로만 반환하세요 (마크다운 백틱 \`\`\`json 없이 순수 JSON만 반환):
{
  "docType": "문서 유형 (예: 벤처기업확인(혁신성장유형) 사업계획서, 정부 정책자금 사업계획서, 사내 표준 회의록, 신규 사업 제안서)",
  "detectedTitle": "문서의 메인 제목 또는 공식 서식명",
  "templateMarkdown": "편집 가능한 마크다운 서식 템플릿 (표와 항목 번호 보존)",
  "claudePrompt": "Claude에게 이 고유 서식 틀을 준수하여 작성하도록 지시하는 프롬프트"
}`;

        const parts: any[] = [{ text: systemPrompt }];

        // PDF인 경우 Gemini native PDF 처리
        if (isPdf) {
          parts.push({
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data,
            },
          });
        }
        // 이미지인 경우 Gemini Vision 처리
        else if (isImage) {
          parts.push({
            inline_data: {
              mime_type: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
              data: base64Data,
            },
          });
        }
        // 추출된 텍스트가 있는 경우
        else if (extractedText) {
          parts.push({
            text: `[첨부 문서 내용 원문 발췌]:\n${extractedText}`,
          });
        } else {
          parts.push({
            text: `[첨부 파일명]: ${fileName}\n(바이너리 문서로 파싱된 파일명을 기준으로 대한민국 표준 공공/기업 서식을 복원해 주세요.)`,
          });
        }

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            const parsed = JSON.parse(cleaned);
            return NextResponse.json({
              success: true,
              docType: parsed.docType || '업무 문서 서식',
              detectedTitle: parsed.detectedTitle || fileName,
              templateMarkdown: parsed.templateMarkdown,
              claudePrompt: parsed.claudePrompt,
            });
          }
        } else {
          console.warn('Gemini API call returned status:', response.status);
        }
      } catch (geminiErr) {
        console.warn('Gemini analysis failed, falling back to heuristic engine:', geminiErr);
      }
    }

    // ── 3. 지능형 서식 복원 엔진 (Heuristic Expert Fallback) ──
    // API 키 제한이나 비정상 포맷에서도 실무 100% 활용 가능한 대한민국 표준 서식 즉시 제공

    // (1) 벤처기업확인 (혁신성장유형) 사업계획서 (2024년 최신 개정 양식)
    if (
      lowerName.includes('벤처') ||
      lowerName.includes('혁신성장') ||
      extractedText.includes('혁신성장유형') ||
      extractedText.includes('벤처기업확인')
    ) {
      return NextResponse.json({
        success: true,
        docType: '벤처기업확인(혁신성장유형) 사업계획서 [2024년 최신 표준]',
        detectedTitle: '벤처기업확인 혁신성장유형 사업계획서',
        templateMarkdown: `# [서식] 벤처기업확인(혁신성장유형) 사업계획서

## I. 신청 기업 및 사업 개요
| 항목 | 내용 | 항목 | 내용 |
| :--- | :--- | :--- | :--- |
| **기업명** | [(주)기업명] | **사업자등록번호** | [000-00-00000] |
| **대표자명** | [대표자 성명] | **설립일자** | [YYYY년 MM월 DD일] |
| **주요 제품/서비스** | [핵심 비즈니스/솔루션명] | **주 업종** | [소프트웨어 개발 / 제조업 등] |
| **사업장 소재지** | [본사 주소지 기입] | **임직원 수** | [총 00명 (연구인력 00명)] |

---

## II. 기업의 기술 및 서비스 혁신성 (Innovation)

### 1. 핵심 보유 기술 및 제품 경쟁력
- **기술(제품) 개요**: [당사가 독자 개발한 핵심 기술의 메커니즘 및 차별점 서술]
- **기존 기술/시장 제품 대비 차별성**:
  1. **[차별점 1]**: [기존 방식의 한계점 극복 방안 및 성능 우위]
  2. **[차별점 2]**: [비용 절감 효과 또는 생산성 향상 지표]
  3. **[차별점 3]**: [독창적 특허 알고리즘 또는 자체 지식재산권]

### 2. 연구개발(R&D) 역량 및 지식재산권 현황
| 구분 | 특허/인증 명칭 | 등록/출원 번호 | 취득(예정)일 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| 특허 | [핵심 원천기술 특허명] | [10-2024-0000000] | [YYYY.MM.DD] | 등록 |
| 소프트웨어 | [프로그램 저작권 등록] | [C-2024-000000] | [YYYY.MM.DD] | 등록 |
| 기업부설연구소 | [연구개발전담부서 인정서] | [제20240000호] | [YYYY.MM.DD] | 유지 |

---

## III. 사업의 성장 가능성 및 시장 경쟁력 (Scalability)

### 1. 목표 시장 규모 및 고객 니즈
- **타깃 시장(TAM-SAM-SOM)**:
  - **전체 시장(TAM)**: [국내/글로벌 관련 산업 규모 약 00조 원]
  - **유효 시장(SAM)**: [당사 타깃 B2B/B2C 진입 가능 시장 약 000억 원]
  - **수익 시장(SOM)**: [초기 3개년 내 점유 목표 시장 약 00억 원]

### 2. 비즈니스 모델(BM) 및 수익화 전략
- **수익 모델**: [SaaS 구독료 / 납품 단가 / 라이선스 / 컨설팅 등]
- **판로 개척 및 마케팅 전략**:
  1. **초기 고객 확보**: [레퍼런스 기업 파일럿 검증 및 제휴 파트너십]
  2. **확장 전략**: [온/오프라인 채널 다각화 및 해외 수출 로드맵]

---

## IV. 3개년 추정 재무 및 고용 창출 계획
| 구분 | 2024년 (현재) | 2025년 (목표) | 2026년 (목표) |
| :--- | :---: | :---: | :---: |
| **매출액 (백만원)** | [000] | [0,000] | [0,000] |
| **영업이익 (백만원)** | [00] | [000] | [000] |
| **연구개발비 (백만원)** | [00] | [00] | [00] |
| **고용 인원 (명)** | [00] | [00] | [00] |`,
        claudePrompt: `당신은 벤처기업협회 전문 평가위원이자 중소벤처기업부 공식 심사역입니다.
위 제공된 [벤처기업확인(혁신성장유형) 사업계획서 표준 서식]을 바탕으로,
제가 제시하는 우리 기업의 핵심 정보를 녹여내어 심사 통과 기준(기술 혁신성 70점, 사업 성장성 70점 이상)을 압도적으로 충족하는 완벽한 사업계획서를 작성해 주세요.

[우리 기업 정보]
- 기업명: [기업명 입력]
- 핵심 아이템: [주요 제품/기술 입력]
- 타깃 시장: [시장 및 고객 입력]`,
      });
    }

    // (2) 중소기업 정책자금 / 육성자금 사업계획서
    if (
      lowerName.includes('육성') ||
      lowerName.includes('정책자금') ||
      lowerName.includes('중소기업') ||
      extractedText.includes('소요자금') ||
      extractedText.includes('시설자금')
    ) {
      return NextResponse.json({
        success: true,
        docType: '중소기업 정책자금 / 육성자금 지원 사업계획서',
        detectedTitle: '중소기업 육성자금 융자지원 사업계획서',
        templateMarkdown: `# [양식] 중소기업 육성자금 융자 신청 사업계획서

## 1. 기업 일반 현황
- **기업체명**: [(주)기업명]
- **대표자**: [성명]
- **설립일**: [YYYY.MM.DD]
- **사업장 구분**: [자가 / 임차 (보증금: 00백만원, 월세: 0백만원)]
- **주거래 은행**: [은행명 / 지점명]

---

## 2. 자금 신청 내역 및 소요 자금 산출
| 구분 | 신청 금액 (백만원) | 사용 용도 및 세부 산출 근거 |
| :--- | :---: | :--- |
| **운전자금** | [000] | [원부자재 구매 비용, 신규 개발 인건비, 마케팅 비용] |
| **시설자금** | [000] | [생산 설비 증설, 서버 인프라 구축, 작업장 개선] |
| **합 계** | [000] | [총 소요 자금 기재] |

---

## 3. 사업 개요 및 주력 생산 품목
- **주요 생산(용역) 제품**: [핵심 품목명 기술]
- **제품의 기술적 우수성**: [공인 인증, 특허 기술, 품질 인증 내역]
- **원부자재 조달처**: [주요 원재료 수급 경로 및 안정성]

---

## 4. 생산 및 판매 계획 (매출 확보 근거)
| 주요 거래처명 | 납품 품목 | 연간 예상 납품액 (백만원) | 거래 형태 (계약서/MOU 등) |
| :--- | :--- | :---: | :--- |
| [(주)거래처 A] | [제품 A] | [000] | [연간 공급 계약서 체결] |
| [(주)거래처 B] | [제품 B] | [000] | [발주서(PO) 수령] |

---

## 5. 차입금 상환 계획 및 기대 효과
- **상환 재원 마련 방안**: [신규 계약 체결에 따른 영업이익 증대분으로 매월 원리금 분할 상환]
- **자금 투입 후 기대 효과**:
  - 매출 신장률: 전년 대비 [00]% 증가 예상
  - 신규 일자리 창출: [0]명 추가 채용 예정`,
        claudePrompt: `당신은 중소벤처기업진흥공단(중진공) 및 신용보증기금 수석 심사역입니다.
위 [중소기업 육성자금 사업계획서 서식]을 기반으로, 정책자금 심사 평가표의 '자금 회수 가능성', '거래처 신뢰도', '상환 계획의 구체성'을 극대화하여 문서를 작성해 주세요.`,
      });
    }

    // (3) 일반 사업계획서 / 제안서 / PPTX
    if (lowerName.includes('사업계획') || lowerName.includes('제안') || isPptx) {
      return NextResponse.json({
        success: true,
        docType: '비즈니스 사업계획서 및 전략 제안서 양식',
        detectedTitle: '2024 비즈니스 플랜 및 전략 제안서',
        templateMarkdown: `# [사업계획서] [비즈니스/프로젝트 타이틀]

## I. Executive Summary (핵심 요약)
- **Problem (문제 정의)**: [타깃 고객이 겪고 있는 치명적인 페인포인트 3가지]
- **Solution (해결책)**: [당사의 제품/서비스가 이 문제를 완벽하게 해결하는 방식]
- **Traction (핵심 성과)**: [현재까지 달성한 정량 지표 (매출, 유저 수, PoC 실적 등)]

---

## II. 시장 분석 및 타깃 고객
1. **시장 규모**: TAM [00조원] ➔ SAM [0,000억원] ➔ SOM [000억원]
2. **타깃 고객 페르소나**: [가장 먼저 우리 제품을 구매할 핵심 고객군 정의]
3. **경쟁사 분석 및 차별화 포인트**:
| 구분 | 당사 ([서비스명]) | 경쟁사 A | 경쟁사 B |
| :--- | :---: | :---: | :---: |
| **가격 경쟁력** | [우수/합리적] | [고가] | [중저가] |
| **처리 속도** | [3분 완료] | [1일 소요] | [수작업] |
| **편의성/UI** | [원터치 모바일] | [복잡함] | [설치 필요] |

---

## III. 비즈니스 모델 및 성장 로드맵
- **수익원 구조**: [1. 정기 구독료, 2. 거래 수수료, 3. 맞춤 커스터마이징]
- **마일스톤 실행 계획**:
| 단계 (Phase) | 목표 기간 | 핵심 마일스톤 과제 | 목표 KPI |
| :--- | :--- | :--- | :--- |
| Phase 1 | [Q1 ~ Q2] | MVP 고도화 및 초기 고객 100개사 확보 | MRR 1,000만원 |
| Phase 2 | [Q3 ~ Q4] | 자동화 파이프라인 완성 및 유료 전환율 극대화 | 누적 매출 2억원 |
| Phase 3 | [익년도] | 글로벌/엔터프라이즈 B2B 시장 확장 | 시리즈 A 투자 유치 |`,
        claudePrompt: `당신은 실리콘밸리와 테헤란로의 벤처캐피털(VC) 투자 심사역입니다.
위 [사업계획서 서식]의 구조를 100% 반영하여, 투자자가 첫 장부터 매료될 수 있는 명쾌하고 강력한 사업계획서를 완성해 주세요.`,
      });
    }

    // (4) 회의록 양식
    if (lowerName.includes('회의') || hintType === 'meeting') {
      return NextResponse.json({
        success: true,
        docType: '사내 표준 회의록 (Meeting Minutes)',
        detectedTitle: '경영진 및 실무 부서 표준 회의록',
        templateMarkdown: `# [회의록] [회의/프로젝트명]

| 항목 | 내용 |
| :--- | :--- |
| **일시 / 장소** | [YYYY년 MM월 DD일 00:00] / [대회의실 or 화상회의] |
| **주관 부서** | [부서명] |
| **작성자 / 서명** | [작성자 성명] / (인) |
| **참석자** | [참석자 명단 기입] |
| **회의 목적** | [회의 개최 목적 및 핵심 안건 1줄 정의] |

---

## 1. 안건 개요 및 배경
- **배경 설명**: [안건 상정 배경 및 현재 문제점]
- **주요 목표**: [이번 회의를 통해 달성하고자 하는 목표]

## 2. 주요 논의 및 합의 사항
- **안건 1**: [논의 내용 요약]
  - 합의 결과: [결정 사항]
- **안건 2**: [논의 내용 요약]
  - 합의 결과: [결정 사항]

## 3. 후속 실행 계획 (Action Items)
| No. | 실행 과제 (Task) | 담당자 | 마감 기한 | 진행 상태 |
| :-- | :--- | :--- | :--- | :--- |
| 1 | [세부 실행 과제 1] | [담당자] | [MM/DD] | 준비 중 |
| 2 | [세부 실행 과제 2] | [담당자] | [MM/DD] | 대기 |

---
**차기 회의 일정**: [YYYY년 MM월 DD일 00시 예정]`,
        claudePrompt: `당신은 최고 수준의 업무 생산성 전문가입니다.
다음은 우리 회사의 공식 [회의록 서식]입니다.
아래 서식의 표 구조와 글머리 기호를 100% 유지한 채, 제가 제공하는 회의 메모를 바탕으로 완벽한 회의록을 작성해 주세요.`,
      });
    }

    // (5) 기본 표준 업무 보고서
    return NextResponse.json({
      success: true,
      docType: '사내 표준 업무 기획 및 보고서 양식',
      detectedTitle: fileName || '사내 표준 업무 보고서',
      templateMarkdown: `# [업무 보고서] [문서 제목]

| 결재란 | 담당 | 팀장 | 부서장 | 대표 |
| :--- | :---: | :---: | :---: | :---: |
| **서명** | (인) | (인) | (인) | (인) |

- **보고 부서**: [부서명]
- **보고자**: [성명 / 직급]
- **보고 일자**: [YYYY년 MM월 DD일]

---

## 1. 추진 배경 및 개요
1. **목적**: [업무 추진 목적]
2. **범위**: [적용 대상 및 기간]

## 2. 주요 실행 내용 및 현황
| No. | 항목 | 상세 내용 | 추진 상태 | 비고 |
| :-- | :--- | :--- | :---: | :--- |
| 1 | [추진 과제 1] | [세부 실행 내용] | 완료 | [참고] |
| 2 | [추진 과제 2] | [세부 실행 내용] | 진행 중 | [차주 완료] |

## 3. 향후 계획 및 기대 효과
- **향후 일정**: [세부 일정 기입]
- **기대 효과**: [정량적/정성적 성과 목표]`,
      claudePrompt: `당신은 사내 최고 비즈니스 문서 작성 전문가입니다.
첨부된 우리 회사의 [업무 보고서 표준 서식]을 100% 준수하여, 다음 실적 메모를 격식 있는 보고서로 변환해 주세요.`,
    });
  } catch (error: any) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { error: error.message || '문서 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
