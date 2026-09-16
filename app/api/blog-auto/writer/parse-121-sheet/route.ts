import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  '';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { sheetText, fileBase64, mimeType: rawMime, partnerName } = await req.json();

    if (!sheetText && !fileBase64) {
      return NextResponse.json(
        { error: '분석할 원투원 양식지 파일(이미지/PDF) 또는 텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let parts: any[] = [];
    let textContent = sheetText ? sheetText.trim() : '';

    if (fileBase64) {
      let data = fileBase64;
      let mimeType = rawMime || 'image/jpeg';

      if (fileBase64.includes(',')) {
        const commaIdx = fileBase64.indexOf(',');
        const header = fileBase64.slice(0, commaIdx);
        data = fileBase64.slice(commaIdx + 1);
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }

      // 텍스트 파일인 경우 디코딩하여 텍스트에 병합
      if (mimeType.startsWith('text/') || mimeType === 'application/json') {
        try {
          const decoded = Buffer.from(data, 'base64').toString('utf-8');
          textContent = (textContent ? textContent + '\n\n' : '') + decoded;
        } catch {
          // fallback
        }
      } else {
        parts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }
    }

    const nameInstruction = partnerName?.trim()
      ? `참고: 사용자가 입력한 참석자(대표님) 성함은 "${partnerName.trim()}" 입니다. 이 대표님의 회사, 사업, 양식지 내용을 우선적으로 분석해주세요.`
      : '';

    const prompt = `당신은 BNI 비즈니스 네트워킹 전문 분석 비서입니다.
제공된 첨부 자료(양식지 이미지, PDF 스캔본 또는 텍스트)는 BNI 121 미팅(원투원) 참석자(상대방 대표님)의 121 사전 양식지, 프로필 소개서, 카카오톡 메시지입니다.
이 양식지를 면밀히 분석하여 아래 항목들을 정확히 추출하고 정돈된 JSON으로 응답해주세요.

${nameInstruction}

${textContent ? `[텍스트 내용]:\n${textContent}\n` : ''}

반드시 다음 JSON 형식으로만 응답하세요:
{
  "partnerName": "성함 및 직함 (예: 홍길동 대표). 입력된 성함이 있다면 반영하되 직함 보완",
  "partnerCompany": "회사명 (예: 알파브랜딩)",
  "partnerChapter": "소속 BNI 챕터 (예: BNI 마스터 챕터)",
  "partnerField": "전문분야 및 주력 비즈니스 카테고리 (예: 기업 브랜딩 및 공간 디자인)",
  "targetReferral": "이상적인 추천 고객 (어떤 고객을 소개받길 원하는지 명확히)",
  "partnerStrength": "차별화된 핵심 역량 및 경쟁력 (경쟁사와 다른 점)",
  "sheetSummary": "양식지 주요 내용 및 GAINS 핵심 1~2문장 요약",
  "preferredPlace": "미팅 장소나 활동 지역 (언급된 경우, 없으면 '')"
}
`;

    parts.push({ text: prompt });

    const candidateModels = [
      process.env.GOOGLE_API_MODEL || 'gemini-2.5-flash',
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3-flash-preview',
    ];
    let lastError: any = null;
    let parsed: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const result = await model.generateContent(parts);
        const responseText = result.response.text();
        parsed = JSON.parse(responseText);
        if (parsed) break;
      } catch (err: any) {
        console.warn(`Attempt with ${modelName} failed, trying fallback:`, err.message);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!parsed) {
      throw lastError || new Error('양식지 분석에 실패했습니다.');
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Parse 121 Sheet Error:', error);
    return NextResponse.json(
      { error: error.message || '양식지 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
