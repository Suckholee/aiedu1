import { NextResponse, type NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/session';

// Firebase authorizes localhost for local Google sign-in, but not the loopback IP.
// Keep APIs and assets on their requested origin; canonicalize page navigation only.
export async function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0];
  if (process.env.NODE_ENV === 'development' && host === '127.0.0.1' &&
      ['GET', 'HEAD'].includes(request.method)) {
    const url = request.nextUrl.clone();
    url.hostname = 'localhost';
    return NextResponse.redirect(url, 307);
  }
  if(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/lms') || request.nextUrl.pathname.startsWith('/auth/') || request.nextUrl.pathname.startsWith('/api/platform') || ['/my-learning','/my-applications','/apply'].includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/checkout/'))) {
    return updateSupabaseSession(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/platform/:path*','/admin/:path*','/api/lms/:path*','/auth/:path*','/((?!api(?:/|$)|_next(?:/|$)|.*\\.[^/]+$).*)'],
};
