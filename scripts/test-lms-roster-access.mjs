import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {hashRosterValue,matchesRosterCode,issueRosterSession,validRosterSession} from '../lib/lms/roster-session.ts';
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const hash=hashRosterValue('test-code'),secret='test-secret',now=1792450000000;
eq(matchesRosterCode('test-code',hash),true,'correct code');eq(matchesRosterCode('bad',hash),false,'incorrect code');eq(matchesRosterCode('test-code',''),false,'missing config fails closed');
const token=issueRosterSession(secret,hash,now);eq(validRosterSession(token,secret,hash,now),true,'signed session accepted');
for(const candidate of ['',token+'x',token+'.extra','9999999999.'+token.split('.')[1]])eq(validRosterSession(candidate,secret,hash,now),false,'malformed/tampered token denied');
eq(validRosterSession(token,secret,hash,now+3600000),false,'session expires');eq(validRosterSession(token,'other-secret',hash,now),false,'wrong signer denied');eq(validRosterSession(token,secret,hashRosterValue('new-code'),now),false,'code rotation revokes old sessions');
const db=new PGlite();try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')&&!f.includes('brand_blog')).sort())await db.exec(await readFile(new URL(f,dir),'utf8'));
 const attempt=async(ip='ip-a',failed=true)=>(await db.query('select public.lms_roster_code_attempt($1,$2) v',[ip,failed])).rows[0].v;
 for(let n=0;n<5;n++)eq(await attempt(),true,'five failures recorded');eq(await attempt(),false,'sixth attempt denied');eq(await attempt('ip-a',false),false,'correct attempt also throttled during lockout');eq(await attempt('ip-b',false),true,'separate IP not blocked');
 await db.exec("update lms_private.roster_code_attempts set created_at=now()-interval '16 minutes'");eq(await attempt('ip-a',false),true,'lockout expires');
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(()=>attempt());checks++;await assert.rejects(()=>db.exec('select * from lms_private.roster_code_attempts'));checks++;await db.exec('reset role');}
 eq((await db.query('select count(*)::int n from public.lms_orders')).rows[0].n,0,'code access creates no orders');eq((await db.query('select count(*)::int n from public.lms_staff_members')).rows[0].n,0,'code access grants no admin roles');
 console.log(`PASS: ${checks} code validation, session signing, tampering, expiry, rotation, durable rate limits, database isolation and no privilege grants`);
}finally{await db.close();}
