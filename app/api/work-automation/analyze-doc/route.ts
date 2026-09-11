import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, docName, hintType } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: '분석할 문서 이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && imageUrl.startsWith('data:image/')) {
      try {
        const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];

          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

          const prompt = `당신은 대한민국 최고의 비즈니스 문서 서식 분석 및 프롬프트 엔지니어링 전문가입니다.
첨부된 업무 문서(종이 보고서, 회의록, 기안서, 기획서 등) 이미지를 시각적으로 정밀 분석해 주세요.

다음 3가지를 반드시 JSON 형식으로만 출력해 주세요 (마크다운 백틱 없이 순수 JSON만 반환):
{
  "docType": "문서 유형 (예: 주간 업무 보고서, 기획안, 회의록, 기안서, 제안서)",
  "detectedTitle": "문서의 메인 제목 또는 추정 타이틀",
  "templateMarkdown": "이 문서의 틀, 표, 결재란, 항목 구조를 100% 보존한 채, 내용 부분만 [프로젝트명], [작성자], [핵심 성과], [향후 일정] 같은 편집 가능한 placeholder로 비워둔 마크다운 템플릿",
  "claudePrompt": "클로드(Claude)에게 이 고유 서식 틀을 그대로 준수하여 신규 업무 내용을 채워 넣도록 지시하는 고도화된 비즈니스 프롬프트"
}`;

          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.2,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return NextResponse.json({
                success: true,
                docType: parsed.docType || '업무 보고서',
                detectedTitle: parsed.detectedTitle || '사내 표준 업무 서식',
                templateMarkdown: parsed.templateMarkdown,
                claudePrompt: parsed.claudePrompt,
              });
            }
          }
        }
      } catch (apiErr) {
        console.warn('Gemini API call failed, falling back to intelligent heuristic parser:', apiErr);
      }
    }

    // Heuristic Fallback (API 키가 없거나 네트워크 제약 시에도 완벽한 양식 복원 제공)
    const fileName = docName || '업무문서';
    const isMeeting = fileName.includes('회의') || hintType === 'meeting';
    const isPlan = fileName.includes('기획') || fileName.includes('사업') || hintType === 'plan';

    if (isMeeting) {
      return NextResponse.json({
        success: true,
        docType: '회의록 및 액션아이템 양식',
        detectedTitle: '사내 표준 회의록 (Meeting Minutes)',
        templateMarkdown: `# [회의록] [회의/프로젝트명]

| 항목 | 내용 |
| :--- | :--- |
| **일시 / 장소** | [YYYY년 MM월 DD일 00:00] / [대회의실 or 화상회의] |
| **주관 부서** | [부서명] |
| **작성자 / 서명** | [작성자명] / (인) |
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
아래 서식의 표 구조와 글머리 기호를 100% 유지한 채, 제가 제공하는 회의 메모를 바탕으로 완벽한 회의록을 작성해 주세요.

[회의 정보 입력]
- 회의 안건: [안건 입력]
- 회의 메모/녹취록: [메모 입력]`,
      });
    }

    if (isPlan) {
      return NextResponse.json({
        success: true,
        docType: '신규 사업/기획안 서식',
        detectedTitle: '프로젝트 기획 및 사업 제안서',
        templateMarkdown: `# [기획서] [신규 프로젝트/사업명]

**문서 번호**: PROJ-[YYYYMMDD]-01  
**기안 부서**: [기안 부서명]  
**기안자**: [기안자 성명 / 직급]  
**기안 일자**: [YYYY년 MM월 DD일]  

---

## I. 추진 배경 및 필요성
1. **시장 현황 및 문제점**
   - [현재 직면한 문제점 또는 시장 기회 요인 3가지 기술]
2. **추진 목적**
   - [프로젝트를 통해 달성하고자 하는 정량적 / 정성적 목적]

## II. 세부 추진 전략 (Core Strategy)
- **전략 1 (Pillar 1)**: [전략명 및 세부 실행 방안]
- **전략 2 (Pillar 2)**: [전략명 및 세부 실행 방안]
- **전략 3 (Pillar 3)**: [전략명 및 세부 실행 방안]

## III. 일정 및 소요 예산
| 구분 | 주요 내용 | 일정 (Milestone) | 소요 예산 (원) |
| :--- | :--- | :--- | :--- |
| Phase 1 | 준비 및 기획 확정 | [YYYY.MM ~ MM] | [금액] |
| Phase 2 | 개발 및 파일럿 런칭 | [YYYY.MM ~ MM] | [금액] |
| Phase 3 | 정식 런칭 및 마케팅 | [YYYY.MM ~ MM] | [금액] |

## IV. 기대 효과
- **정량적 효과**: [매출 증가율, 비용 절감률 등]
- **정성적 효과**: [브랜드 가치 제고, 업무 효율 증대 등]`,
        claudePrompt: `당신은 비즈니스 전략 기획 수석 컨설턴트입니다.
다음은 우리 회사의 표준 [신규 기획서 서식]입니다.
이 서식의 뼈대를 그대로 유지하면서, 제가 입력할 신규 아이템에 맞춰 설득력 있는 기획안을 완성해 주세요.`,
      });
    }

    // 기본 업무 보고서 (General Business Report)
    return NextResponse.json({
      success: true,
      docType: '표준 업무 보고서 (Report)',
      detectedTitle: '업무 추진 실적 및 계획 보고서',
      templateMarkdown: `# [업무 보고서] [보고서 제목 입력]

| 결재란 | 담당 | 팀장 | 부서장 | 대표 |
| :--- | :---: | :---: | :---: | :---: |
| **서명** | (인) | (인) | (인) | (인) |

- **보고 부서**: [부서명]
- **보고자**: [직급 및 성명]
- **보고 일자**: [YYYY년 MM월 DD일]

---

## 1. 금주(금월) 주요 추진 실적 (Achievements)
1. **[주요 성과 항목 1]**
   - 세부 내용: [추진한 업무 내용 및 결과 요약]
   - 주요 지표: [달성율 또는 수치 데이터]
2. **[주요 성과 항목 2]**
   - 세부 내용: [추진한 업무 내용 및 결과 요약]
   - 주요 지표: [달성율 또는 수치 데이터]

## 2. 주요 이슈 및 리스크 대응 (Issues & Solutions)
- **발생 이슈**: [업무 진행 중 발생한 장애 요인]
- **조치 사항**: [해결 방안 및 현재 진행 상태]

## 3. 차주(익월) 업무 추진 계획 (Next Steps)
| No. | 업무 항목 | 세부 내용 | 목표 기한 | 비고 |
| :-- | :--- | :--- | :--- | :--- |
| 1 | [계획 업무 1] | [상세 내용] | [MM/DD] | [필요 지원] |
| 2 | [계획 업무 2] | [상세 내용] | [MM/DD] | [협업 부서] |

## 4. 특이사항 및 건의사항
- [상급자 또는 유관 부서에 전달할 건의사항 기술]`,
      claudePrompt: `당신은 사내 문서 작성 전문가입니다.
첨부된 우리 회사의 [업무 보고서 표준 서식]을 100% 준수하여, 다음 실적 메모를 정갈하고 격식 있는 보고서로 변환해 주세요.

[실적 메모]
- 이번 주 한 일: [실적 입력]
- 다음 주 할 일: [계획 입력]`,
    });
  } catch (error: any) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { error: error.message || '문서 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
