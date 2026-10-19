import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';

/**
 * User-scoped client; RLS applies. Auth cutover also needs the proxy helper.
 * Route Handlers returning private data must set private, no-store headers.
 */
export async function createClient() {
  const { url, key } = getSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; the session proxy handles refresh.
        }
      },
    },
  });
}
