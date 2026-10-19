import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { memberProfileInput, profileComplete } from '../lib/lms/profile.ts';
const db=new PGlite(),id=n=>`90000000-0000-4000-8000-${String(n).padStart(12,'0')}`;let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const value=async(q,p=[])=>(await db.query(q,p)).rows[0]?.v;
const input={display_name:'테스트 회원',phone:'01012345678',industry:'교육·강의',company:'',job_title:'',privacy_version:'2026-10-19.v1',consent_to_privacy:true,service_alimtalk_opt_in:false,marketing_opt_in:false};
const save=(patch={},actor=1)=>value('select public.lms_save_own_profile($1::jsonb,$2::uuid) v',[JSON.stringify({...input,...patch}),id(actor)]);
const blocked=async(fn)=>{await assert.rejects(fn);checks++;};
try {
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);
 const files=(await readdir(dir)).filter(f=>f.endsWith('.sql')).sort();
 for(const f of files.filter(f=>!f.includes('0009')))await db.exec(await readFile(new URL(f,dir),'utf8'));
 for(let n=1;n<=3;n++){await db.query('insert into auth.users values($1)',[id(n)]);await db.query('insert into public.lms_profiles(id,auth_user_id,display_name,email,phone) values($1,$1,$2,$3,$4)',[id(n),'기존 회원',`profile${n}@example.com`,n===1?'01022223333':null]);}
 await db.query("insert into public.lms_staff_members values($1,'admin')",[id(2)]);
 await db.exec(await readFile(new URL('202610190009_lms_member_profiles.sql',dir),'utf8'));
 eq(await value('select phone v from public.lms_profiles where id=$1',[id(1)]),'01022223333','existing phone preserved');
 eq(await value('select bool_or(onboarding_required) v from public.lms_profiles'),false,'existing members not blocked');
 await db.query('insert into public.lms_profiles(id,display_name) values($1,$2)',[id(4),'신규']);
 eq(await value('select onboarding_required v from public.lms_profiles where id=$1',[id(4)]),true,'future members must complete onboarding');
 eq(memberProfileInput.parse({...input,phone:'+82 10-1234-5678'}).phone,'01012345678','mobile normalized');
 for(const patch of [{phone:'010123'},{phone:'010abcdefgh'},{display_name:' '},{industry:''},{consent_to_privacy:false},{privacy_version:'old'},{roles:['admin']},{id:id(2)},{marketing_opt_in:'true'}])eq(memberProfileInput.safeParse({...input,...patch}).success,false,'API rejects invalid or privileged input');
 for(const patch of [{phone:'010abc'},{industry:'invalid'},{consent_to_privacy:false},{privacy_version:'old'},{roles:['admin']},{id:id(2)},{service_alimtalk_opt_in:null}])await blocked(()=>save(patch));
 eq(await save(),id(1),'owner profile save');
 const p=(await db.query('select * from public.lms_profiles where id=$1',[id(1)])).rows[0];
 eq(profileComplete(p),true,'valid profile complete');eq(p.onboarding_required,false,'onboarding finished');
 eq(p.email,'profile1@example.com','verified identity unchanged');eq(p.auth_user_id,id(1),'auth UUID unchanged');
 eq(p.service_alimtalk_opt_in,false,'no forced service opt-in');eq(p.marketing_opt_in,false,'no forced marketing consent');
 eq(Number(await value('select count(*) v from public.lms_contact_consents')),1,'first consent recorded');
 await save();eq(Number(await value('select count(*) v from public.lms_contact_consents')),1,'retry does not duplicate consent');
 await save({service_alimtalk_opt_in:true});await save({service_alimtalk_opt_in:false});
 eq(Number(await value('select count(*) v from public.lms_contact_consents')),3,'opt-in and withdrawal recorded');
 eq(await value('select service_alimtalk_opt_in v from public.lms_profiles where id=$1',[id(1)]),false,'withdrawal effective');
 eq(await value('select display_name v from public.lms_profiles where id=$1',[id(2)]),'기존 회원','other profile unchanged');
 eq(Number(await value('select count(*) v from public.lms_staff_members')),1,'roles preserved');
 for(const role of ['anon','authenticated']){
  await db.exec(`set role ${role}`);await blocked(()=>save());await blocked(()=>db.exec("update public.lms_profiles set industry='forged'"));await blocked(()=>db.exec('delete from public.lms_contact_consents'));
  if(role==='authenticated'){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(3)]);eq(Number(await value('select count(*) v from public.lms_contact_consents')),0,'other learner cannot read consent history');}
  await db.exec('reset role');
 }
 await db.query("update public.lms_profiles set status='suspended' where id=$1",[id(3)]);await blocked(()=>save({},3));
 eq(Number(await value('select count(*) v from public.lms_orders')),0,'no synthetic orders');
 console.log(`PASS: ${checks} profile validation, consent history, opt-out, ownership, preserved identity/roles and RLS checks`);
} finally {await db.close();}
