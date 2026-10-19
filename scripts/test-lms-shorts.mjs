import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import {shortsCommand} from '../lib/lms/shorts-validation.ts';
const db=new PGlite();let checks=0;const id=n=>`80000000-0000-4000-8000-${String(n).padStart(12,'0')}`;const eq=(a,b,m)=>{assert.equal(a,b,m);checks++;};const value=async(q,p=[])=>(await db.query(q,p)).rows[0]?.v;const rpc=(c,a=1)=>value('select public.lms_short_manage($1::jsonb,$2::uuid) v',[JSON.stringify(c),id(a)]);
try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
 for(const f of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>/^20261019000[1-8].*\.sql$/.test(f)).sort())await db.exec(await readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
 for(let n=1;n<=5;n++){await db.query('insert into auth.users values($1)',[id(n)]);await db.query('insert into public.lms_profiles(id,auth_user_id,display_name,email,status) values($1,$1,$2,$3,$4)',[id(n),'Fixture',`short${n}@example.com`,n===5?'suspended':'active']);}
 await db.exec(`insert into public.lms_staff_members values('${id(1)}','admin'),('${id(2)}','operations'),('${id(3)}','finance'),('${id(5)}','admin')`);
 const c={action:'save',title:'AI Q&A',description:'fixture',video_path:`${id(1)}/${id(10)}.mp4`,poster_path:`${id(1)}/${id(10)}.webp`,duration_seconds:37,position:0,published:false};
 for(const actor of [3,4,5]){await assert.rejects(()=>rpc(c,actor),e=>e.code==='P0001');checks++;}
 const first=await rpc(c);const second=await rpc({...c,title:'AI search',position:1,published:true},2);
 eq(Number(await value('select count(*) v from public.lms_shorts')),2,'staff can register');
 await db.exec('set role anon');eq(Number(await value('select count(*) v from public.lms_shorts')),1,'anonymous cannot list drafts');
 await assert.rejects(()=>rpc({...c,action:'publish',id:first,published:true}),e=>e.code==='42501');checks++;
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(4)]);await db.exec('set role authenticated');eq(Number(await value('select count(*) v from public.lms_shorts')),1,'learner cannot list drafts');await db.exec('reset role');
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);await db.exec('set role authenticated');eq(Number(await value('select count(*) v from public.lms_shorts')),2,'operations can list drafts');await db.exec('reset role');
 await rpc({action:'publish',id:second,published:false});eq(await value('select published v from public.lms_shorts where id=$1',[second]),false,'soft unpublish retains content');
 await rpc({...c,id:first,title:'Edited',position:3},2);eq(await value('select title v from public.lms_shorts where id=$1',[first]),'Edited','metadata update');eq(await value('select created_by v from public.lms_shorts where id=$1',[first]),id(1),'original creator preserved');
 for(const wrong of [{title:''},{duration_seconds:601},{video_path:'../../file.mp4'},{poster_path:'https://external.example/poster.jpg'},{position:-1}]){await assert.rejects(()=>rpc({...c,...wrong}),e=>e.code==='23514');checks++;}
 await assert.rejects(()=>rpc({action:'publish',id:id(99),published:true}),e=>e.code==='P0001');checks++;
 for(const command of [{action:'upload',kind:'video',type:'video/mp4',size:51*1024*1024},{action:'upload',kind:'poster',type:'image/png',size:6*1024*1024},{action:'upload',kind:'video',type:'image/png',size:100},{...c,video_path:'https://outside.example/file.mp4'}]){eq(shortsCommand.safeParse(command).success,false,'reject unsafe or oversized input');}
 eq(shortsCommand.safeParse({action:'upload',kind:'video',type:'video/mp4',size:8*1024*1024}).success,true,'valid upload ticket');
 await db.exec('set role service_role');await assert.rejects(()=>db.exec(`update public.lms_shorts set published=true`),e=>e.code==='42501');checks++;await db.exec('reset role');
 eq(Number(await value("select count(*) v from public.lms_audit_events where action like 'shorts.%'")),4,'changes audited');
 console.log(`PASS: ${checks} shorts permissions, draft isolation, publication, editing, audit, path and upload validation checks`);
}finally{await db.close();}
