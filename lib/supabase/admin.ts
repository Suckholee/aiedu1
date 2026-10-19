import 'server-only';
import { createClient } from '@supabase/supabase-js';

/** Never import from browser code. Callers must authorize each operation. */
export function createAdminClient() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!url || !key) throw Error('서버 데이터 연결 설정을 확인하세요.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
