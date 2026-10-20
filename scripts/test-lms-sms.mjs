import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import ts from 'typescript';
const source=(await readFile(new URL('../lib/lms/sms-content.ts',import.meta.url),'utf8')).replace("'./payment-channel'",JSON.stringify(new URL('../lib/lms/payment-channel.ts',import.meta.url).href));
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {smsPhone,smsText}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const db=new PGlite(),id=n=>`d0000000-0000-4000-8000-${String(n).padStart(12,'0')}`;let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};const value=async(q,p=[])=>(await db.query(q,p)).rows[0]?.v;
const base={id:id(50),order_id:id(51),kind:'application',name:'확인용',phone:'01012345678',title:'특강',starts_at:null,location:'강의실',guest:true,number:'ORDER',payable:true,due:150000};
eq(smsPhone('+82 10-1234-5678'),'01012345678','mobile normalization');eq(smsPhone('0212345678'),null,'non-mobile rejected');eq(smsText(base).includes('150,000원'),true,'real due amount');eq(smsText({...base,payable:false,due:0}).includes('납부금액'),false,'paid receipt has no demand');eq(smsText(base).includes('/guest-applications'),true,'guest lookup link');
const rpc=(f,c,actor=1)=>value(`select public.${f}($1::jsonb,$2::uuid) v`,[JSON.stringify(c),id(actor)]);
const apply=async n=>rpc('lms_learning',{action:'apply',cohort_id:id(20),name:'확인용',phone:'01012345678'},n);
const queue=(order,kind='payment_reminder',actor=1)=>rpc('lms_sms_queue',{kind,order_ids:[order]},actor);
const claim=()=>value('select public.lms_sms_claim() v');
try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url);for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')&&!f.includes('brand_blog')).sort())await db.exec(await readFile(new URL(f,dir),'utf8'));
 for(let n=1;n<=8;n++)await db.query('insert into public.lms_profiles(id,display_name,email) values($1,$2,$3)',[id(n),'회원'+n,`sms${n}@example.com`]);
 await db.query("insert into public.lms_staff_members values($1,'admin')",[id(1)]);
 await db.query("insert into public.lms_courses(id,slug,title,published) values($1,'sms-test','테스트',true)",[id(10)]);await db.query("insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,price_krw) values($1,$2,'특강','offline','open',20,150000)",[id(20),id(10)]);
 await apply(2);eq(Number(await value('select count(*) v from public.lms_sms_jobs')),0,'disabled auto does not backfill');
 await db.exec('update public.lms_sms_settings set enabled=true');const enrollment=await apply(3);await apply(3);eq(Number(await value('select count(*) v from public.lms_sms_jobs')),1,'one atomic application job despite repeated submit');
 const job=await claim();eq(job.due,150000,'claim has current due');eq(await claim(),null,'concurrent worker cannot claim same job');
 await db.query("update public.lms_sms_jobs set status='accepted' where id=$1",[job.id]);eq(await queue(job.order_id),0,'recent send excluded');
 await db.exec("update public.lms_sms_jobs set created_at=now()-interval '2 hours'");eq(await queue(job.order_id),1,'manual reminder queued');eq(await queue(job.order_id),0,'manual duplicate excluded');
 await rpc('lms_learning',{action:'status',id:enrollment,status:'cancelled'});eq((await claim()).skipped,true,'cancelled before dispatch skipped');
 await apply(4);const other=await claim();await db.query("update public.lms_sms_jobs set updated_at=now()-interval '6 minutes' where id=$1",[other.id]);await claim();eq(await value('select status v from public.lms_sms_jobs where id=$1',[other.id]),'unknown','interrupted worker not retried blindly');
 const e5=await apply(5);const o5=await value('select id v from public.lms_orders where enrollment_id=$1',[e5]);await db.query("update public.lms_orders set status='paid' where id=$1",[o5]);const paid=await claim();eq(paid.payable,false,'paid order sends receipt without demand');
 await assert.rejects(()=>queue(o5,'application',2));checks++;
 await db.exec('update public.lms_sms_settings set enabled=false');eq(await claim(),null,'disabled worker stops');
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(()=>claim());checks++;await assert.rejects(()=>queue(o5));checks++;await assert.rejects(()=>db.exec('select * from public.lms_sms_jobs'));checks++;await db.exec('reset role');}
 console.log(`PASS: ${checks} message content, disabled state, atomic queue, dedupe, recent send guard, paid/cancelled revalidation, interrupted request and staff access checks; no SMS sent`);
}finally{await db.close();}
