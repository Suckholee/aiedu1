import { NextResponse, type NextRequest } from 'next/server';

// Firebase authorizes localhost for local Google sign-in, but not the loopback IP.
// Keep APIs and assets on their requested origin; canonicalize page navigation only.
export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0];
  if (process.env.NODE_ENV === 'development' && host === '127.0.0.1' &&
      ['GET', 'HEAD'].includes(request.method)) {
    const url = request.nextUrl.clone();
    url.hostname = 'localhost';
    return NextResponse.redirect(url, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api(?:/|$)|_next(?:/|$)|.*\\.[^/]+$).*)',
};
