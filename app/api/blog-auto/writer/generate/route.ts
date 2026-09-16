import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/blog-automation/content-generator';
import { getSkillById, type BlogSkillId } from '@/lib/blog-automation/blog-skills';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function 타임아웃 제한 해제 (최대 60초)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// 전역 최신 글 캐시 (크롬 확장 프로그램용)
const globalForLatest = globalThis as unknown as { _latestBlogAutoPost?: any };

export async function GET() {
  const post = globalForLatest._latestBlogAutoPost;
  if (!post) {
    return NextResponse.json({
      success: false,
      message: '아직 생성된 최신 글이 없습니다.',
    });
  }
  return NextResponse.json({
    success: true,
    post,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      skillId = 'general',
      platform = 'naver',
      targetAudience,
      copyFormula = 'auto',
      tone = 'friendly',
      requiredKeywords,
      customFields = {},
      customInstructions,
      images = [],
      directPromptOverride,
    } = body;

    if (!topic && !directPromptOverride) {
      return NextResponse.json(
        { error: '블로그 주제 또는 세부 프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 미분석 사진이 있을 경우 서버 Gemini Flash Vision으로 초고속 선행 분석 실행
    const processedImages = await Promise.all(
      images.map(async (img: any, idx: number) => {
        const hasDetailedAnalysis =
          img.description &&
          img.description.length > 25 &&
          !img.description.includes('촬영 사진') &&
          !img.description.includes('실습 사진') &&
          !img.description.includes('원투원 양식지') &&
          img.description !== img.name;

        if (hasDetailedAnalysis) {
          return img;
        }

        // Base64 또는 이미지 URL이 있을 때 Vision 분석 실행
        const base64Data = img.url;
        if (base64Data && (base64Data.startsWith('data:image/') || base64Data.startsWith('http'))) {
          try {
            const genAI = new GoogleGenerativeAI(
              process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
            );
            const visionModel = genAI.getGenerativeModel({ model: process.env.GOOGLE_API_MODEL || 'gemini-2.5-flash' });

            let inlinePart: any = null;
            if (base64Data.startsWith('data:image/')) {
              const match = base64Data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
              if (match) {
                inlinePart = {
                  inlineData: {
                    mimeType: match[1],
                    data: match[2],
                  },
                };
              }
            } else if (base64Data.startsWith('http')) {
              try {
                const imgRes = await fetch(base64Data);
                if (imgRes.ok) {
                  const arrayBuffer = await imgRes.arrayBuffer();
                  const mimeType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
                  inlinePart = {
                    inlineData: {
                      mimeType,
                      data: Buffer.from(arrayBuffer).toString('base64'),
                    },
                  };
                }
              } catch (fetchErr) {
                console.warn(`HTTP image fetch failed for #${idx + 1}:`, fetchErr);
              }
            }

            if (inlinePart) {
              const visionPrompt = `당신은 블로그 본문에 사진을 생생하게 묘사하는 전문 작가입니다. 
이 사진을 면밀히 관찰하고, 블로그 글의 스토리텔링과 현장감에 자연스럽게 녹아들 수 있도록 상세히 분석해주세요:
1. 인물 사진인 경우: 인물의 표정(미소, 진지함 등), 안경 착용 여부, 옷차림/스타일, 느껴지는 인상/분위기, 대화나 미팅 상황에서의 태도를 구체적으로 묘사하세요. (예: "지적이고 신뢰감 넘치는 뿔테 안경과 차분한 셔츠 차림으로 밝게 미소 짓고 계신 모습", "진지하게 이야기를 경청하는 따뜻한 눈빛")
2. 공간/배경인 경우: 조명, 카페나 사무실 분위기, 테이블 위 소품(음료, 노트북, 서류 등)의 전반적인 무드를 묘사하세요.
3. 양식지/서류인 경우: 정성스럽게 작성된 양식지 내용이나 손글씨 메모의 시각적 특징을 묘사하세요.
반드시 한국어로 1~3문장 내외의 생생하고 자연스러운 묘사글로 작성해주세요.`;
              const vResult = await visionModel.generateContent([visionPrompt, inlinePart]);
              const vText = vResult.response.text().trim();
              return {
                ...img,
                description: vText,
                caption: img.caption || vText.slice(0, 40),
              };
            }
          } catch (vErr) {
            console.warn(`Image #${idx + 1} Vision Pre-analysis skip:`, vErr);
          }
        }

        return {
          ...img,
          description: img.description || img.caption || img.name || `사진 ${idx + 1}`,
          caption: img.caption || img.description || img.name || `사진 ${idx + 1}`,
        };
      })
    );

    // 이미지 정보 추출 (피사체 및 맥락 중심)
    const imageUrls = processedImages.map((img: any) => img.url).filter(Boolean);
    const imageDescriptions = processedImages.map((img: any, idx: number) => {
      return `[IMAGE_${idx + 1}] ${img.description || img.caption || `사진 ${idx + 1}`}`;
    });

    // 필수 키워드와 추가 지시사항을 customFields에 병합
    const mergedCustomFields: Record<string, string> = { ...customFields };
    if (requiredKeywords && requiredKeywords.trim()) {
      mergedCustomFields['requiredKeywords'] = requiredKeywords.trim();
    }
    if (customInstructions && customInstructions.trim()) {
      mergedCustomFields['customInstructions'] = customInstructions.trim();
    }

    const generated = await generateBlogContent({
      topic: topic?.trim() || '블로그 콘텐츠 작성',
      skillId: skillId as BlogSkillId,
      customFields: mergedCustomFields,
      imageDescriptions: imageDescriptions.length > 0 ? imageDescriptions : undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      marketing: {
        platform: platform || 'naver',
        targetAudience: targetAudience?.trim() || undefined,
        copyFormula: copyFormula !== 'auto' ? copyFormula : undefined,
        tone: tone || undefined,
      },
    });

    // 최신 글 전역 캐싱
    globalForLatest._latestBlogAutoPost = generated;

    return NextResponse.json({
      success: true,
      post: generated,
    });
  } catch (error: any) {
    console.error('Blog Writer Generate Error:', error);
    return NextResponse.json(
      { error: error.message || '블로그 글 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
