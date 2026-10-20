import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();const id=n=>`c0000000-0000-4000-8000-${String(n).padStart(12,'0')}`;let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const rpc=async command=>(await db.query('select public.lms_guest_lookup($1::jsonb) v',[JSON.stringify(command)])).rows[0].v;
const request=(n,email='guest@example.com',ip='ip')=>rpc({action:'request',id:id(n),email,code_hash:'correct',ip_hash:ip});
const verify=(n,code_hash='correct',session_hash='session')=>rpc({action:'verify',id:id(n),code_hash,session_hash});
const list=(session_hash='session')=>rpc({action:'list',session_hash});
try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')&&!f.includes('brand_blog')).sort())await db.exec(await readFile(new URL(f,dir),'utf8'));
 await db.query("insert into public.lms_courses(id,slug,title,published) values($1,'lookup-test','테스트',true)",[id(1)]);
 await db.query("insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,price_krw) values($1,$2,'테스트','offline','open',20,150000)",[id(2),id(1)]);
 for(const [n,email] of [[3,'guest@example.com'],[4,'other@example.com'],[5,'guest@example.com']])await db.query('select public.lms_guest_application($1::jsonb,$2::uuid)',[JSON.stringify({cohort_id:id(2),name:'비회원',email,phone:'01000000000',company:''}),id(n)]);
 // A member with the same email must not be included in guest results.
 await db.query("insert into public.lms_profiles(id,display_name,email) values($1,'회원','guest@example.com')",[id(6)]);
 await db.query('select public.lms_learning($1::jsonb,$2::uuid)',[JSON.stringify({action:'apply',cohort_id:id(2),name:'회원',phone:'01000000000'}),id(6)]);
 eq((await list()).unauthorized,true,'no session denied');eq((await request(10)).sent,true,'request accepted without enrollment disclosure');eq((await request(11)).limited,true,'resend throttled');
 eq((await verify(10,'bad')).verified,false,'incorrect code denied');eq((await verify(10,null)).verified,false,'missing code denied');eq((await list()).unauthorized,true,'failed verification does not authorize');eq((await verify(10)).verified,true,'correct code accepted');
 eq((await verify(10)).verified,false,'code cannot be replayed');
 const own=await list();eq(own.orders.length,2,'all and only guest applications for verified email');eq(own.orders.every(o=>o.amount_krw===150000&&o.due_krw===150000),true,'live billing values');eq(typeof own.expiresAt,'string','session expiry sent to UI');eq((await list('other-session')).unauthorized,true,'other token denied');
 await rpc({action:'logout',session_hash:'session'});eq((await list()).unauthorized,true,'logout revokes server session');
 await request(12,'other@example.com');for(let n=0;n<5;n++)await verify(12,'wrong');eq((await verify(12,'correct','blocked')).verified,false,'five failures lock challenge');
 await request(13,'expired@example.com');await db.query("update lms_private.guest_lookup_challenges set expires_at=now()-interval '1 second' where id=$1",[id(13)]);eq((await verify(13)).verified,false,'expired code denied');
 await request(14,'empty@example.com');await verify(14,'correct','empty');eq((await list('empty')).orders,[],'no applications has same authentication flow');
 await db.query("update lms_private.guest_lookup_challenges set session_expires_at=now()-interval '1 second' where id=$1",[id(14)]);eq((await list('empty')).unauthorized,true,'expired session denied');
 // A newer code invalidates older unverified challenges.
 await request(15,'resend@example.com');await db.query("update lms_private.guest_lookup_challenges set created_at=now()-interval '2 minutes' where id=$1",[id(15)]);await request(16,'resend@example.com');eq((await verify(15)).verified,false,'old code invalid after resend');
 await db.query("update lms_private.guest_lookup_challenges set created_at=now()-interval '2 minutes' where id=$1",[id(16)]);await request(17,'resend@example.com');await db.query("update lms_private.guest_lookup_challenges set created_at=now()-interval '2 minutes' where id=$1",[id(17)]);eq((await request(18,'resend@example.com')).limited,true,'three requests per email per fifteen minutes');
 for(let n=20;n<30;n++)await request(n,`ip${n}@example.com`,'limited-ip');eq((await request(30,'ip30@example.com','limited-ip')).limited,true,'per IP send limit');
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(()=>list());checks++;await assert.rejects(()=>db.exec('select * from lms_private.guest_lookup_challenges'));checks++;await db.exec('reset role');}
 eq(Number((await db.query('select count(*) n from auth.users')).rows[0].n),0,'lookup creates no auth accounts');
 console.log(`PASS: ${checks} OTP verification, attempt limits, resend limits, expiration, replay denial, email isolation, member exclusion, all guest receipts, billing, logout and database permissions checks`);
}finally{await db.close();}
