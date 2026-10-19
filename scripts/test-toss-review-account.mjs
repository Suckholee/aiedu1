import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';

const require = createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const base = process.env.LMS_TEST_BASE ?? 'http://localhost:3100';
assert.ok(['http://localhost:3100', 'https://aiedu1.vercel.app'].includes(base));
const record = JSON.parse(await readFile('.local-data/toss-review-account.json', 'utf8'));
const credentials = JSON.parse(await readFile('.local-data/toss-review-credentials.json', 'utf8'));
assert.equal(credentials.authUserId, record.authUserId);
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {auth: {persistSession: false, autoRefreshToken: false}});
let cookies = [], checks = 0;
const session = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {cookies: {getAll: () => cookies, setAll: values => {for (const value of values) {cookies = cookies.filter(c => c.name !== value.name);if (value.value) cookies.push(value);}}}});
const check = (condition, message) => {assert.ok(condition, message);checks++;};
const http = async (path, status, body) => {
  const response = await fetch(base + path, {method: body ? 'POST' : 'GET', headers: {Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '), Origin: base, 'Content-Type': 'application/json'}, ...(body ? {body: JSON.stringify(body)} : {}), signal: AbortSignal.timeout(20000)});
  assert.equal(response.status, status, path);checks++;
  return response;
};
try {
  const rejected = await session.auth.signInWithPassword({email: record.email, password: 'intentionally-wrong-review-password'});
  check(Boolean(rejected.error) && !rejected.data.session, 'Incorrect password does not create a session');
  const verified = await session.auth.signInWithPassword({email: credentials.email, password: credentials.password});assert.ifError(verified.error);
  check(verified.data.user.id === record.authUserId, 'Expected review identity');
  const member = (await (await http('/api/lms/session', 200)).json()).member;
  check(member.id === record.profileId, 'Expected profile');
  check(member.roles.length === 0, 'No staff role');
  check(member.onboarding_required === false, 'Operational identity can reach application');
  check(!member.phone && !member.privacy_consented_at && !member.service_alimtalk_opt_in && !member.marketing_opt_in, 'No fabricated personal data or consent');
  const membership = await (await http('/api/lms/firebase-session', 200, {mode: 'membership'})).json();
  check(membership.member.id === record.profileId, 'Registered native email identity is accepted by existing membership bridge');
  await http('/api/lms/manage', 403);await http('/api/lms/finance', 403);await http('/api/lms/shorts?manage=1', 403);
  const billing = await (await http('/api/lms/billing', 200)).json();
  check(billing.orders.length === 0 && billing.payments.length === 0 && billing.refunds.length === 0, 'No other member financial records');
  for (const [table, expected] of [['lms_profiles', 1], ['lms_staff_members', 0], ['lms_orders', 0], ['lms_payments', 0], ['lms_refunds', 0]]) {
    const result = await session.from(table).select('*');assert.ifError(result.error);check(result.data.length === expected, 'RLS isolation: ' + table);
  }
  await http('/login', 200);
  console.log(`PASS: ${checks} actual password login, invalid-password denial, review identity, membership bridge, ordinary-member RLS, finance/admin denial and empty own billing checks; no password printed`);
} finally {await session.auth.signOut({scope: 'local'});}
