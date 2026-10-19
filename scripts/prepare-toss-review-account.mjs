import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {auth: {persistSession: false, autoRefreshToken: false}});
const email = 'peter15975345+tosspayments-review@gmail.com';
const check = async promise => {const result = await promise;if (result.error) throw Error(result.error.code ?? 'Supabase request failed');return result.data;};

await mkdir('.local-data/backups', {recursive: true});
const before = {};
for (const table of ['lms_profiles', 'lms_staff_members', 'lms_orders', 'lms_payments', 'lms_refunds', 'lms_enrollments']) before[table] = await check(admin.from(table).select('*'));
await writeFile(`.local-data/backups/before-toss-review-${Date.now()}.json`, JSON.stringify(before), {mode: 0o600});

let user;
for (let page = 1; ; page++) {
  const result = await check(admin.auth.admin.listUsers({page, perPage: 100}));
  user = result.users.find(value => value.email?.toLowerCase() === email);
  if (user || result.users.length < 100) break;
}
if (user) {
  assert.equal(user.app_metadata?.provisioned_for, 'tosspayments_review', 'Refusing to modify an existing unrelated identity');
} else {
  // A separate explicit step initializes this dedicated review identity's password.
  user = (await check(admin.auth.admin.createUser({email, email_confirm: true, app_metadata: {provisioned_for: 'tosspayments_review'}, user_metadata: {full_name: '토스페이먼츠 심사'}}))).user;
}

let profile = (await check(admin.from('lms_profiles').select('*').eq('auth_user_id', user.id))).at(0);
if (!profile) {
  await check(admin.rpc('lms_link_identity', {firebase_uid: `supabase_${user.id}`, auth_id: user.id, verified_email: email, member_name: '토스페이먼츠 심사', avatar_url: null}));
  profile = (await check(admin.from('lms_profiles').select('*').eq('auth_user_id', user.id))).at(0);
  // Operational test identity: no fabricated phone, privacy or marketing consent.
  await check(admin.from('lms_profiles').update({onboarding_required: false}).eq('id', profile.id));
}
assert.equal(profile.status, 'active');
const roles = await check(admin.from('lms_staff_members').select('role').eq('profile_id', profile.id));
assert.equal(roles.length, 0, 'Review identity must have no staff privileges');

for (const table of ['lms_profiles', 'lms_staff_members', 'lms_orders', 'lms_payments', 'lms_refunds', 'lms_enrollments']) {
  const after = await check(admin.from(table).select('*'));
  const existing = table === 'lms_profiles' ? after.filter(row => row.id !== profile.id) : after;
  const normalize = rows => rows.map(row => JSON.stringify(row)).sort();
  assert.deepEqual(normalize(existing), normalize(before[table].filter(row => table !== 'lms_profiles' || row.id !== profile.id)), `Existing data changed: ${table}`);
}
if (process.argv.includes('--set-initial-password')) {
  if (user.app_metadata?.review_password_initialized) {
    const saved = JSON.parse(await readFile('.local-data/toss-review-credentials.json', 'utf8'));
    assert.equal(saved.authUserId, user.id, 'Existing credentials do not belong to this review identity');
  } else {
    const password = randomBytes(24).toString('base64url') + '!aA1';
    // Private operational file only; never print a password or include it in Git.
    await writeFile('.local-data/toss-review-credentials.json', JSON.stringify({email, password, authUserId: user.id, issuedAt: new Date().toISOString()}), {mode: 0o600});
    await check(admin.auth.admin.updateUserById(user.id, {password, app_metadata: {...user.app_metadata, review_password_initialized: true}}));
    user.app_metadata.review_password_initialized = true;
  }
}
const record = {email, authUserId: user.id, profileId: profile.id, roles: [], createdAt: user.created_at, setupRequired: !user.app_metadata?.review_password_initialized};
await writeFile('.local-data/toss-review-account.json', JSON.stringify(record, null, 2), {mode: 0o600});
console.log(JSON.stringify({email, ordinaryMember: true, staffRoles: roles.length, existingData: 'preserved', password: user.app_metadata?.review_password_initialized ? 'initialized; saved privately; not printed' : 'not initialized'}));
