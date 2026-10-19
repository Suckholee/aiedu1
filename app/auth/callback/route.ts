import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestOrigin,safeNext } from '@/lib/lms/redirect';
export async function GET(request:Request) {
  const url=new URL(request.url),origin=requestOrigin(request);
  const code=url.searchParams.get('code');
  if(code&&!url.searchParams.has('error')) {
    const client=await createClient();
    const {error}=await client.auth.exchangeCodeForSession(code);
    if(!error)return NextResponse.redirect(`${origin}/auth/complete?next=${encodeURIComponent(safeNext(url.searchParams.get('next')))}`,{headers:{'Cache-Control':'private, no-store'}});
  }
  return NextResponse.redirect(`${origin}/auth/complete?error=oauth`,{headers:{'Cache-Control':'private, no-store'}});
}
