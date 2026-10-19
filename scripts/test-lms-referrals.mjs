import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import {normalizeReferralCode,maskedReferrer} from '../lib/lms/referrals.ts';
const db=new PGlite(),id=n=>`a0000000-0000-4000-8000-${String(n).padStart(12,'0')}`;let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};const v=async(q,p=[])=>(await db.query(q,p)).rows[0]?.v;
const rpc=(command,actor=3)=>v('select public.lms_learning($1::jsonb,$2::uuid) v',[JSON.stringify(command),id(actor)]);
let code={};const apply=(actor=3,referral_code=code[2])=>rpc({action:'apply',cohort_id:id(20),name:'테스트',phone:'01012345678',referral_code},actor);
const blocked=async(fn)=>{await assert.rejects(fn);checks++;};
try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')&&f<'202610190010').sort())await db.exec(await readFile(new URL(f,dir),'utf8'));
 for(let n=1;n<=5;n++){await db.query('insert into auth.users values($1)',[id(n)]);await db.query('insert into public.lms_profiles(id,auth_user_id,display_name,email) values($1,$1,$2,$3)',[id(n),'회원'+n,`ref${n}@example.com`]);}
 await db.query("insert into public.lms_staff_members values($1,'admin')",[id(1)]);
 await db.query("insert into public.lms_courses(id,slug,title,published) values($1,'referral-test','테스트',true)",[id(10)]);
 await db.query("insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,reserved_seats,price_krw) values($1,$2,'테스트','offline','open',8,7,150000)",[id(20),id(10)]);
 await db.exec(await readFile(new URL('202610190010_lms_referrals.sql',dir),'utf8'));
 for(let n=1;n<=5;n++)code[n]=await v('select referral_code v from public.lms_profiles where id=$1',[id(n)]);
 eq(new Set(Object.values(code)).size,5,'unique backfilled personal codes');eq(Object.values(code).every(c=>/^NP-[0-9A-F]{12}$/.test(c)),true,'code format');
 await db.query("insert into public.lms_profiles(id,display_name) values($1,'future')",[id(6)]);eq(/^NP-[0-9A-F]{12}$/.test(await v('select referral_code v from public.lms_profiles where id=$1',[id(6)])),true,'future code automatic');
 await blocked(()=>db.query('update public.lms_profiles set referral_code=$1 where id=$2',[code[2],id(3)]));
 eq(normalizeReferralCode(' np'+code[2].slice(3).toLowerCase()+' '),code[2],'code normalization');eq(maskedReferrer('이석호'),'이*호','lookup masked');
 await blocked(()=>apply(3,code[3]));await blocked(()=>apply(3,'NP-000000000000'));
 eq(Number(await v('select count(*) v from public.lms_orders')),0,'invalid/self referral creates no orders');
 await db.query("update public.lms_profiles set status='suspended' where id=$1",[id(5)]);await blocked(()=>apply(3,code[5]));
 const e=await apply(3,code[2].toLowerCase());eq(await apply(3,code[2]),e,'idempotent retry');
 eq(Number(await v('select count(*) v from public.lms_referrals')),1,'one attribution');eq(Number(await v('select count(*) v from public.lms_orders')),1,'one order');
 eq(Number(await v('select amount_krw v from public.lms_orders')),150000,'fee unchanged');eq(Number(await v('select reserved_seats v from public.lms_cohorts')),7,'reserved seats unchanged');
 await blocked(()=>apply(3,code[1]));await apply(3,'');eq(await v('select referrer_id v from public.lms_referrals'),id(2),'cannot overwrite attribution');
 await blocked(()=>apply(4,code[2]));eq(Number(await v('select count(*) v from public.lms_referrals')),1,'full capacity rolls back referral/order');
 await rpc({action:'status',id:e,status:'cancelled'});await apply(3,code[1]);eq(Number(await v('select count(*) v from public.lms_orders')),2,'reapply has new historical order');eq(Number(await v('select count(*) v from public.lms_referrals')),2,'reapply attributed separately');
 await rpc({action:'status',id:e,status:'cancelled'});const unassigned=await apply(4,'');await blocked(()=>apply(4,code[2]));eq(Number(await v('select count(*) v from public.lms_referrals')),2,'cannot retroactively hijack unassigned application');
 eq(Number(await v('select count(*) v from public.lms_staff_members')),1,'roles preserved');
 await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);eq(Number(await v('select count(*) v from public.lms_referrals')),0,'referrer cannot read referred learners');
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(3)]);eq(Number(await v('select count(*) v from public.lms_referrals')),2,'learner reads only own attribution');
 await blocked(()=>db.exec('delete from public.lms_referrals'));await blocked(()=>apply());await db.exec('reset role');
 await db.exec('set role anon');await blocked(()=>db.exec('select * from public.lms_referrals'));await blocked(()=>apply());await db.exec('reset role');
 eq(Number(await v('select count(*) v from public.lms_payments')),0,'no fabricated payments');
 console.log(`PASS: ${checks} personal code issuance, stable identity, attribution, idempotency, self/invalid denial, reapply history, seat capacity, fee preservation and RLS checks`);
}finally{await db.close();}
