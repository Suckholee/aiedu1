import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

async function main() {
  if (!url || !key) throw Error('설정 대기: .env.supabase.example의 URL과 Publishable key를 .env.local에 입력하세요.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))) {
    throw Error('HTTPS 또는 로컬 개발 URL이 필요합니다.');
  }
  if (!key.startsWith('sb_publishable_')) throw Error('Publishable key(sb_publishable_...)를 사용하세요. Secret key는 사용하지 않습니다.');
  const settings = await fetch(`${parsed.origin}/auth/v1/settings`, {
    headers: { apikey: key }, signal: AbortSignal.timeout(10000),
  });
  if (!settings.ok) throw Error(`Supabase Auth 연결 실패 (HTTP ${settings.status}). URL과 키를 확인하세요.`);
  console.log('PASS: Supabase Auth API 연결');
  const client = createClient(parsed.origin, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }) },
  });
  const { data, error } = await client.from('lms_schema_versions').select('version').eq('version', '202610190006').maybeSingle();
  if (error || !data) throw Error('Auth 연결 확인. LMS DB 준비는 미확인: 마이그레이션 적용 및 공개 버전 조회 권한을 확인하세요.');
  console.log('PASS: LMS finance 202610190006 조회 (Publishable key + RLS)');
  console.log('로그인 전환·데이터 이전·Storage·결제 연동은 별도 검증 대상입니다.');
}

main().catch(error => {
  // Avoid dumping SDK errors or request headers, which may include credentials.
  console.error(error instanceof TypeError ? '연결 실패: URL 또는 네트워크를 확인하세요.' : error.message);
  process.exitCode = 1;
});
