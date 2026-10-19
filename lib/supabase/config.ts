/** Public configuration only: safe to import from browser code. */
export function getSupabaseConfig() {
  // Keep static property access so Next.js can inline public variables.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('Supabase 프로젝트 URL과 Publishable key를 설정하세요.');
  }
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(
    parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  )) {
    throw new Error('Supabase에는 HTTPS 또는 로컬 개발 URL을 사용하세요.');
  }
  if (!key.startsWith('sb_publishable_')) {
    throw new Error('Supabase Publishable key(sb_publishable_...)를 사용하세요.');
  }
  return { url: parsed.origin, key };
}
