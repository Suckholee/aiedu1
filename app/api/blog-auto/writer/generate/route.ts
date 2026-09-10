import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/blog-automation/content-generator';
import { getSkillById, type BlogSkillId } from '@/lib/blog-automation/blog-skills';

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
        if (img.description && img.caption) {
          return img;
        }

        // Base64 또는 이미지 URL이 있을 때 Vision 분석 실행
        const base64Data = img.url;
        if (base64Data && (base64Data.startsWith('data:image/') || base64Data.startsWith('http'))) {
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
            const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
            }

            if (inlinePart) {
              const visionPrompt = `이 사진의 핵심 피사체, 풍경, 행동, 분위기, 색감을 블로그 본문 스토리에 자연스럽게 녹여낼 수 있도록 1~2문장으로 생생하게 한국어로 설명해주세요.`;
              const vResult = await visionModel.generateContent([visionPrompt, inlinePart]);
              const vText = vResult.response.text().trim();
              return {
                ...img,
                description: vText,
                caption: vText,
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
