import { NextRequest, NextResponse } from 'next/server';

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 글로벌 인메모리 최신 글 캐시
const globalSync = globalThis as unknown as { _latestSyncedBlogPosts?: Record<string, any> };
if (!globalSync._latestSyncedBlogPosts) {
  globalSync._latestSyncedBlogPosts = {};
}

// 0. OPTIONS preflight 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// 1. 최신 글 가져오기 (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid') || 'global_latest';

  const cache = globalSync._latestSyncedBlogPosts || {};
  const post = cache[uid] || cache['global_latest'];

  if (!post) {
    return NextResponse.json(
      {
        success: false,
        message: '아직 서버에 전송된 글이 없습니다.',
      },
      { headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      success: true,
      post,
    },
    { headers: corsHeaders }
  );
}

// 2. 최신 글 저장하기 (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post, uid = 'global_latest' } = body;

    if (!post) {
      return NextResponse.json(
        { error: '포스트 데이터가 없습니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const postWithTimestamp = {
      ...post,
      updatedAt: Date.now(),
    };

    if (!globalSync._latestSyncedBlogPosts) {
      globalSync._latestSyncedBlogPosts = {};
    }
    globalSync._latestSyncedBlogPosts[uid] = postWithTimestamp;
    globalSync._latestSyncedBlogPosts['global_latest'] = postWithTimestamp;

    return NextResponse.json(
      {
        success: true,
        message: '서버 동기화 완료',
        post: postWithTimestamp,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Blog Sync API Error:', error);
    return NextResponse.json(
      { error: error.message || '서버 동기화 실패' },
      { status: 500, headers: corsHeaders }
    );
  }
}
