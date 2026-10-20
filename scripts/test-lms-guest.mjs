import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
const id=n=>`b0000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
try {
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);
 for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')&&!f.includes('brand_blog')).sort())await db.exec(await readFile(new URL(f,dir),'utf8'));
 await db.query("insert into public.lms_courses(id,slug,title,published) values($1,'guest-test','테스트',true)",[id(1)]);
 await db.query("insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,price_krw) values($1,$2,'테스트','offline','open',1,150000)",[id(2),id(1)]);
 const payload={cohort_id:id(2),name:'비회원',email:'guest@example.com',phone:'01012345678',company:'회사',note:'문의',referral_code:''};
 const apply=(key=id(3),p=payload)=>db.query('select public.lms_guest_application($1::jsonb,$2::uuid) receipt',[JSON.stringify(p),key]).then(r=>r.rows[0].receipt);
 const receipt=await apply();assert.equal(receipt.amount,150000);assert.deepEqual(await apply(),receipt);
 await assert.rejects(()=>apply(id(3),{...payload,name:'변경'}));
 await assert.rejects(()=>apply(id(4)));
 assert.equal((await db.query('select count(*)::int n from public.lms_profiles')).rows[0].n,1);
 assert.equal((await db.query('select count(*)::int n from auth.users')).rows[0].n,0);
 assert.equal((await db.query('select count(*)::int n from public.lms_orders')).rows[0].n,1);
 assert.equal((await db.query('select contact_email,company,learner_note from public.lms_enrollments')).rows[0].contact_email,payload.email);
 await db.exec('set role anon');await assert.rejects(()=>apply());await db.exec('reset role');
 await db.exec('set role authenticated');await assert.rejects(()=>apply());await db.exec('reset role');
 console.log('PASS: guest application, atomic order/profile, capacity rollback, retry idempotency, payload isolation, no auth signup and RPC permissions');
} finally {await db.close();}
