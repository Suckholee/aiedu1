import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  '';

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { transcript, partnerName } = await req.json();

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json(
        { error: '분석할 녹음본 대화 텍스트(스크립트)를 입력해주세요.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const prompt = `당신은 BNI 비즈니스 네트워킹 및 1:1 원투원 미팅 전문 분석 AI 작가입니다.
아래 제공된 텍스트는 ${partnerName ? `${partnerName} 대표님과의 ` : ''}1:1 원투원(121) 미팅 중 스마트폰/클로바노트/비토 등으로 녹음한 후 변환된 실제 대화 텍스트(전사 스크립트)입니다.

이 대화 원문을 깊이 있게 분석하여, 네이버 블로그 글 작성에 바로 활용할 수 있도록 핵심 정보를 추출하고 요약하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "conversationCore": "오늘 나눈 대화의 핵심 주제 및 인상 깊었던 실제 이야기 요약 (3~5문장, 대화 맥락과 구체적 사실 중심)",
  "myInsight": "작성자(나)의 시각에서 얻은 비즈니스 인사이트 및 내 사업에 적용할 수 있는 배움 (2~3문장)",
  "synergyPlan": "두 대표님이 서로 약속한 상생 협업, 추천 리퍼럴 교환 계획, 다음 일정 (2~3문장)",
  "targetReferral": "대화 중 상대방 대표님이 연결받고 싶어 하거나 필요로 한 이상적인 고객/리퍼럴 (언급된 경우, 없으면 '')",
  "partnerStrength": "대화 과정에서 자연스럽게 드러난 상대방 대표님의 숨은 역량, 차별화된 강점 및 전문성 (언급된 경우, 없으면 '')"
}

[녹음본 대화 원문]:
${transcript.trim()}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Parse Transcript Error:', error);
    return NextResponse.json(
      { error: error.message || '녹음본 텍스트 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
