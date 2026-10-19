import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
const db=new PGlite(),id=n=>`40000000-0000-4000-8000-${String(n).padStart(12,'0')}`;let checks=0;
const eq=(a,b,m)=>{assert.equal(a,b,m);checks++;};const scalar=async(q,p=[])=> (await db.query(q,p)).rows[0]?.v;
const link=(uid,authId,email='new@example.com')=>scalar('select public.lms_link_identity($1,$2,$3,$4,$5) v',[uid,authId,email,'New learner',null]);
const blocked=async(fn,code='42501')=>{await assert.rejects(fn,e=>e.code===code);checks++;};
try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile(new URL(f,dir),'utf8'));
 for(let n=1;n<=4;n++)await db.query('insert into auth.users values($1)',[id(n)]);
 const admin=await link('admin-firebase',id(1),'admin@example.com');await db.query("insert into public.lms_staff_members values($1,'admin')",[admin]);
 const learner=await link('google-new',id(2));eq(await link('google-new',id(2)),learner,'repeat signup returns same member');
 const kakao=await link('supabase_'+id(3),id(3),'kakao@example.com');eq(await link('supabase_'+id(3),id(3),'kakao@example.com'),kakao,'kakao retry idempotent');
 const sameEmail=await link('different-user',id(4),'admin@example.com');eq(sameEmail===admin,false,'email never claims admin profile');
 eq(Number(await scalar('select count(*) v from public.lms_staff_members')),1,'new members receive no staff roles');eq(Number(await scalar("select count(*) v from public.lms_audit_events where action='member.join'")),4,'one join audit each');
 await blocked(()=>link('google-new',id(4)),'P0001');await blocked(()=>link('different-firebase',id(2)),'P0001');
 await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);
 eq(Number(await scalar('select count(*) v from public.lms_profiles')),1,'student can read own profile');eq(Number(await scalar('select count(*) v from public.lms_staff_members')),0,'student cannot read staff roster');
 eq(await scalar("select lms_private.has_role(array['admin','operations','finance']) v"),false,'student not staff');
 await blocked(()=>db.exec("insert into public.lms_staff_members values('"+learner+"','admin')"));
 await blocked(()=>db.exec("update public.lms_profiles set status='active'"));
 await blocked(()=>link('forged',id(2)));await blocked(()=>db.query('select public.lms_manage($1::jsonb,$2::uuid)',[JSON.stringify({action:'roles',id:learner,roles:['admin']}),learner]));
 await db.exec('reset role');await db.query("update public.lms_profiles set status='suspended' where id=$1",[learner]);await blocked(()=>link('google-new',id(2)),'P0001');
 await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);eq(Number(await scalar('select count(*) v from public.lms_profiles')),0,'suspended identity has no active member access');
 await db.exec('reset role');eq(await link('admin-firebase',id(1),'admin@example.com'),admin,'admin continuity');eq(Number(await scalar("select count(*) v from public.lms_staff_members where role='admin'")),1,'existing admin role preserved');
 console.log(`PASS: ${checks} new Google/Kakao membership, retry, default learner role, own profile RLS, privilege escalation denial and suspended member checks`);
}finally{await db.close();}
