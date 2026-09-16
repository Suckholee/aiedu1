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

    const { sheetText } = await req.json();

    if (!sheetText || typeof sheetText !== 'string' || !sheetText.trim()) {
      return NextResponse.json(
        { error: '분석할 원투원 양식지 텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `당신은 BNI 비즈니스 네트워킹 전문 분석 비서입니다.
아래 제공된 텍스트는 BNI 121 미팅(원투원) 참석자(상대방 대표님)의 양식지, 프로필 소개글, 카카오톡 메시지 또는 메모입니다.
이 텍스트를 분석하여 아래 JSON 규격에 맞게 정보를 정밀하게 추출하고 구조화하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "partnerName": "성함 및 직함 (예: 홍길동 대표). 언급이 없으면 '파트너 대표'",
  "partnerCompany": "회사명 및 챕터 (예: OO솔루션 (BNI 마스터 챕터))",
  "partnerField": "전문분야 및 주력 비즈니스 카테고리 (예: 기업 브랜딩 및 공간 디자인)",
  "targetReferral": "이상적인 추천 고객 (어떤 고객을 소개받길 원하는지)",
  "partnerStrength": "차별화된 핵심 역량 및 경쟁력 (경쟁사와 다른 점)",
  "sheetSummary": "양식지 주요 내용 1~2문장 요약",
  "preferredPlace": "미팅 장소나 활동 지역 (언급된 경우, 없으면 '')"
}

[원문 텍스트]:
${sheetText.trim()}
`;

    const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
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

        const result = await model.generateContent(prompt);
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
      throw lastError || new Error('모든 모델에서 양식지 분석에 실패했습니다.');
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
