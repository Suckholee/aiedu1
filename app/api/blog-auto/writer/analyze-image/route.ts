import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  '';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { base64Image, imageUrl } = await req.json();

    if (!base64Image && !imageUrl) {
      return NextResponse.json(
        { error: 'base64Image 또는 imageUrl이 필요합니다.' },
        { status: 400 }
      );
    }

    let data = '';
    let mimeType = 'image/jpeg';

    if (imageUrl) {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      data = Buffer.from(arrayBuffer).toString('base64');
      mimeType = response.headers.get('content-type') || 'image/jpeg';
    } else if (base64Image) {
      if (base64Image.includes(',')) {
        const commaIdx = base64Image.indexOf(',');
        const header = base64Image.slice(0, commaIdx);
        data = base64Image.slice(commaIdx + 1);
        const mimeMatch = header.match(/data:([^;]+)/);
        mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      } else {
        data = base64Image;
        mimeType = 'image/jpeg';
      }
    }

    const prompt = `당신은 네이버/티스토리 전문 블로그 마케터입니다.
이 사진을 정밀하게 분석하여 블로그 본문에 자연스럽고 매력적으로 녹여낼 수 있는 핵심 요약, 상세 시각 묘사, 키워드, 그리고 사진 밑에 들어갈 한 줄 캡션을 작성해주세요.

반드시 다음 JSON 규격으로만 응답하세요:
{
  "summary": "사진 핵심 피사체 및 분위기 1줄 요약 (예: 노릇하게 구워진 시그니처 숙성 삼겹살과 신선한 미나리)",
  "details": "구체적인 시각적 디테일과 특징 2~3문장 (예: 두툼한 육질 사이로 흐르는 육즙과 그릴 자국이 선명하며, 은은한 숯불 향이 전해지는 생생한 비주얼입니다.)",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "suggestedCaption": "사진 바로 아래 들어갈 감성적인 1줄 캡션 (예: 겉바속촉 그 자체! 육즙이 팡 터지는 순간)"
}`;

    // 빠른 Vision 모델 순서
    const visionModels = [
      process.env.GOOGLE_API_MODEL || 'gemini-2.5-flash',
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro',
    ];
    let result: any = null;
    let lastError: any = null;

    for (const modelName of visionModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        });

        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data,
              mimeType,
            },
          },
        ]);
        if (result && result.response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Vision model ${modelName} attempt failed, trying fallback:`, err.message);
      }
    }

    if (!result) {
      throw lastError || new Error('모든 Vision 모델 분석에 실패했습니다.');
    }

    const responseText = result.response.text().trim();
    let analysis: any = null;

    try {
      const cleanJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);
    } catch (parseErr) {
      console.warn('JSON parse fallback triggered for image analysis:', parseErr);
      analysis = {
        summary: responseText.slice(0, 100).replace(/["{}\n]/g, ' ').trim() || '사진 분석 완료',
        details: responseText.replace(/["{}\n]/g, ' ').trim() || '사진의 시각적 요소를 성공적으로 분석했습니다.',
        keywords: ['블로그사진', '현장사진', '후기'],
        suggestedCaption: responseText.slice(0, 80).replace(/["{}\n]/g, ' ').trim() || '생생한 현장 사진',
      };
    }

    // 빈 필드 방어
    if (!analysis.summary) analysis.summary = '사진 분석 완료';
    if (!analysis.details) analysis.details = analysis.summary;
    if (!analysis.keywords || !Array.isArray(analysis.keywords)) analysis.keywords = ['사진', '후기'];
    if (!analysis.suggestedCaption) analysis.suggestedCaption = analysis.summary;

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: error.message || '이미지 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
