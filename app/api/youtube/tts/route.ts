import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

interface TTSRequest {
  texts: string[];
  voice?: string;
  speakingRate?: number;
}

const VOICES: Record<string, string> = {
  'female-1': 'ko-KR-Neural2-A',
  'female-2': 'ko-KR-Neural2-B',
  'male-1': 'ko-KR-Neural2-C',
  'standard-female': 'ko-KR-Standard-A',
  'standard-male': 'ko-KR-Standard-C',
};

async function synthesize(
  text: string,
  voiceName: string,
  speakingRate: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'ko-KR', name: voiceName },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
            pitch: 0,
            sampleRateHertz: 24000,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error('TTS API error:', res.status, err?.error?.message);
      return null;
    }

    const data = await res.json();
    return data.audioContent || null;
  } catch (err) {
    console.error('TTS fetch error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const { texts, voice = 'male-1', speakingRate = 1.0 }: TTSRequest =
      await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (texts.length > 20) {
      return NextResponse.json(
        { error: '최대 20개 장면까지 지원합니다.' },
        { status: 400 }
      );
    }

    const voiceName = VOICES[voice] || VOICES['male-1'];

    // Generate TTS for all scenes in parallel
    const audioFiles = await Promise.all(
      texts.map((text) =>
        text.trim() ? synthesize(text.trim(), voiceName, speakingRate) : null
      )
    );

    const successCount = audioFiles.filter(Boolean).length;
    if (successCount === 0) {
      return NextResponse.json(
        {
          error:
            'TTS 생성에 실패했습니다. Google Cloud Console에서 Cloud Text-to-Speech API를 활성화해주세요.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ audioFiles });
  } catch (error: unknown) {
    console.error('TTS route error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'TTS 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
