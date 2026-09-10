import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const SceneSchema = z.object({
  text: z.string(),
  narration: z.string(),
  duration: z.number().min(2).max(15),
  style: z.enum(['intro', 'content', 'highlight', 'outro']),
  emoji: z.string().optional(),
  imagePrompt: z.string().optional(),
});

const ScriptSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  scenes: z.array(SceneSchema).min(3).max(15),
});

export type VideoScript = z.infer<typeof ScriptSchema>;
export type Scene = z.infer<typeof SceneSchema>;

function getModel() {
  return genAI.getGenerativeModel({
    model: process.env.GOOGLE_API_MODEL || 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  });
}

function parseJson(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  throw new Error('JSON not found in response');
}

const MAX_TOPIC_LENGTH = 200;

function sanitizeTopic(raw: string): string {
  return raw
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\w\s/\-&.,!?()]/g, '')
    .trim()
    .slice(0, MAX_TOPIC_LENGTH);
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: '서버 설정 오류: API 키가 구성되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const {
      topic: rawTopic,
      format = 'shorts',
      targetAudience: rawAudience = '',
      hookStyle = 'question',
    } = await req.json();

    if (!rawTopic || typeof rawTopic !== 'string') {
      return NextResponse.json(
        { error: '영상 주제를 입력해주세요.' },
        { status: 400 }
      );
    }

    const topic = sanitizeTopic(rawTopic);
    if (!topic) {
      return NextResponse.json(
        { error: '유효하지 않은 주제입니다.' },
        { status: 400 }
      );
    }

    const targetAudience =
      typeof rawAudience === 'string'
        ? sanitizeTopic(rawAudience)
        : '';

    const isShorts = format === 'shorts';

    const hookGuide: Record<string, string> = {
      question:
        '질문형 훅: 시청자가 "나도 궁금하다"고 느끼게 만드는 강렬한 질문으로 시작. 예: "이거 모르면 손해봅니다", "왜 아무도 안 알려주는 걸까?"',
      shock:
        '충격형 훅: 예상을 뒤엎는 사실이나 놀라운 통계로 시작. 예: "90%가 실패하는 이유", "이건 진짜 충격입니다"',
      empathy:
        '공감형 훅: 타겟이 공감할 수 있는 고민/상황으로 시작. 예: "이거 나만 그런 거 아니죠?", "솔직히 힘들지 않으셨나요?"',
      story:
        '스토리형 훅: 짧은 일화나 "Before → After"로 시작. 예: "3개월 전까지만 해도...", "어제 이런 일이 있었는데요"',
    };

    const audienceSection = targetAudience
      ? `\n타겟 오디언스: ${targetAudience}
- 이 타겟 오디언스가 사용하는 언어/표현/관심사에 맞춰 콘텐츠를 작성하세요
- 제목과 썸네일 텍스트는 이 타겟이 클릭하고 싶어지는 문구로 작성하세요
- 태그에는 타겟 오디언스가 검색할 만한 키워드를 포함하세요`
      : '';

    const prompt = `당신은 YouTube 알고리즘 최적화 전문가이자 바이럴 콘텐츠 기획자입니다.
아래 주제로 ${isShorts ? 'YouTube Shorts (30~60초)' : '일반 YouTube 영상 (2~3분)'} 스크립트를 생성해주세요.

주제: ${topic}${audienceSection}

## 알고리즘 최적화 전략 (반드시 적용)

### 1. 3초 훅 (Swipe-away 방지)
${hookGuide[hookStyle] || hookGuide.question}
- 첫 번째 scene(intro)의 text는 반드시 3초 안에 시청자를 사로잡는 문구여야 합니다
- 궁금증/긴장감/공감을 유발하여 "다음이 궁금하게" 만드세요

### 2. 감정 곡선 설계 (Watch-through 극대화)
- intro: 호기심/놀라움 유발 (감정 에너지 70%)
- content 초반: 핵심 가치 전달 (감정 에너지 50%)
- highlight: 감정 최고조 — "이게 핵심입니다!" (감정 에너지 100%)
- content 후반: 구체적 근거/예시 (감정 에너지 60%)
- outro: 행동 유도 + 여운 (감정 에너지 80%)

### 3. 시청 지속률 최적화
- 매 장면마다 다음 장면이 궁금하게 만드는 "오픈 루프" 기법 사용
- text는 한 줄에 하나의 핵심 메시지만 (정보 과부하 방지)
- narration에 "그런데요", "근데 진짜 중요한 건요" 같은 전환어 활용

### 4. SEO & 검색 최적화
- title에 핵심 키워드를 앞쪽에 배치
- description 첫 문장에 가장 중요한 키워드 포함
- tags에 롱테일 키워드 포함 (예: "초보자를 위한 ___", "___ 하는 법")

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "title": "영상 제목 (매력적이고 클릭을 유도하는, 이모지 포함, 핵심 키워드 앞쪽 배치)",
  "description": "YouTube 영상 설명 (3~4문장, SEO 최적화, 해시태그 포함)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5", "롱테일키워드1", "롱테일키워드2"],
  "scenes": [
    {
      "text": "화면에 표시될 핵심 텍스트 (1~2줄, 간결하고 임팩트 있게)",
      "narration": "이 장면의 나레이션/설명 (자세하게, 2~3문장, 전환어 활용)",
      "duration": ${isShorts ? 5 : 10},
      "style": "intro",
      "emoji": "🔥",
      "imagePrompt": "futuristic AI technology concept, glowing neural network, dark background, cinematic, 4K"
    }
  ]
}

규칙:
- scenes는 ${isShorts ? '6~8개' : '10~15개'}
- 각 scene의 duration은 ${isShorts ? '3~6초' : '5~15초'}
- 전체 영상 길이는 ${isShorts ? '30~60초' : '2~3분'}
- text는 화면에 크게 표시되므로 간결하게 (최대 30자)
- narration은 나중에 TTS로 변환할 상세 설명
- style 종류:
  - "intro": 도입부 — 3초 훅으로 즉시 시선을 잡아야 함
  - "content": 본문 — 정보 전달 + 오픈 루프
  - "highlight": 핵심 강조 — 감정 최고조, 가장 기억에 남을 포인트
  - "outro": 마무리 — 행동 유도(구독/좋아요), 여운 남기기
- 첫 번째 scene은 반드시 intro, 마지막은 반드시 outro
- highlight는 1~2개만 사용
- tags는 7~10개로, 검색 볼륨이 높은 키워드와 롱테일 키워드를 섞어 사용
- emoji는 각 장면의 분위기를 나타내는 이모지 1개 (예: 🔥, 💡, 🚀, ⚡, 🎯, 💰, 📊, 🏆, ✨, 🤖)
- imagePrompt는 해당 장면의 배경 이미지를 AI로 생성하기 위한 **영어** 프롬프트. 구체적이고 시각적인 묘사를 해야 함. 텍스트/글자가 포함되지 않도록 "no text, no letters, no words" 포함. 예: "modern office with holographic displays, blue neon lighting, cinematic, no text"
- 한국어로 작성 (imagePrompt만 영어)`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} } as never],
    });

    const text = result.response.text();

    let script: VideoScript;
    try {
      const parsed = parseJson(text);
      script = ScriptSchema.parse(parsed);
    } catch (parseErr: unknown) {
      console.error(
        'Script parse/validation error:',
        parseErr instanceof Error ? parseErr.message : parseErr
      );
      return NextResponse.json(
        { error: 'AI 응답을 파싱하지 못했습니다. 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ script });
  } catch (error: unknown) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '스크립트 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
