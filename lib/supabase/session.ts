import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './config';

/** Refresh cookies on LMS pages and APIs; authorization remains in the server data layer. */
export async function updateSupabaseSession(request: NextRequest) {
  const { url, key } = getSupabaseConfig();
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store');
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        const previous = response;
        response = NextResponse.next({ request });
        previous.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
        for (const name of ['cache-control', 'expires', 'pragma']) {
          const value = previous.headers.get(name);
          if (value) response.headers.set(name, value);
        }
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}
