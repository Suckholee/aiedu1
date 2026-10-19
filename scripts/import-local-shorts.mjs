import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFile,writeFile} from 'node:fs/promises';import {createClient} from '@supabase/supabase-js';import {createServerClient} from '@supabase/ssr';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const base=process.env.LMS_TEST_BASE??'http://localhost:3100';if(!['http://localhost:3100','https://aiedu1.vercel.app'].includes(base))throw Error('Unexpected destination');
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const check=async request=>{const r=await request;if(r.error)throw Error(r.error.code??r.error.message);return r.data;};
const buckets=await check(admin.storage.listBuckets());if(!buckets.some(b=>b.id==='lms-shorts'))await check(admin.storage.createBucket('lms-shorts',{public:false,fileSizeLimit:50*1024*1024,allowedMimeTypes:['video/mp4','image/webp','image/jpeg','image/png']}));
assert.equal((await check(admin.storage.getBucket('lms-shorts'))).public,false);
const profile=await check(admin.from('lms_profiles').select('id,auth_user_id,email').eq('email','peter15975345@gmail.com').single());
const link=await check(admin.auth.admin.generateLink({type:'magiclink',email:profile.email}));let jar=[];
const session=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>jar,setAll:cookies=>{for(const c of cookies){jar=jar.filter(v=>v.name!==c.name);if(c.value)jar.push(c);}}}});
try{
 const verified=await session.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'magiclink'});assert.equal(verified.data.user?.id,profile.auth_user_id);
 const headers={'Cookie':jar.map(c=>`${c.name}=${c.value}`).join('; '),'Origin':base,'Content-Type':'application/json'};
 async function post(body){const r=await fetch(base+'/api/lms/shorts',{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});const b=await r.json();if(!r.ok)throw Error(b.error);return b;}
 const response=await fetch(base+'/api/lms/shorts?manage=1',{headers});assert.equal(response.status,200);const existing=(await response.json()).shorts;
 const clips=[{title:'AI Q&A 자동화',description:'반복되는 질문, AI와 함께 답하는 방법.',video:'쇼츠영상/ai q&a.mp4',poster:'output/shorts/ai-qna.webp',duration:38},{title:'AI는 어디서 찾는가',description:'AI가 우리 가게를 추천하게 하려면?',video:'쇼츠영상/final-20261019-093227.mp4',poster:'output/shorts/ai-where.webp',duration:40},{title:'블로그 자동화',description:'블로그 초안 작성부터 글쓰기 화면 입력까지, AI와 함께 관리하는 방법.',video:'쇼츠영상/블로그자동화.mp4',poster:'output/shorts/blog-automation.webp',duration:46}];
 const registered=[];
 for(const [position,clip] of clips.entries()){
  if(existing.some(v=>v.title===clip.title)){registered.push({title:clip.title,existing:true});continue;}
  const paths={};for(const kind of ['video','poster']){const bytes=await readFile(clip[kind]);const type=kind==='video'?'video/mp4':'image/webp';const ticket=await post({action:'upload',kind,type,size:bytes.length});await check(session.storage.from('lms-shorts').uploadToSignedUrl(ticket.path,ticket.token,bytes,{contentType:type}));paths[kind+'_path']=ticket.path;}
  const saved=await post({action:'save',title:clip.title,description:clip.description,duration_seconds:clip.duration,position,published:true,...paths});registered.push({id:saved.id,title:clip.title});
 }
 const publicResponse=await fetch(base+'/api/lms/shorts');assert.equal(publicResponse.status,200);const pub=await publicResponse.json();assert.ok(pub.shorts.length>=clips.length);for(const clip of clips){const item=pub.shorts.find(s=>s.title===clip.title);assert.ok(item);assert.equal(item.video_path,undefined);const video=await fetch(item.video_url,{headers:{Range:'bytes=0-1023'}});assert.equal(video.status,206);assert.match(video.headers.get('content-type'),/video\/mp4/);assert.equal((await video.arrayBuffer()).byteLength,1024);assert.equal((await fetch(item.poster_url)).status,200);}
 await writeFile('.local-data/lms-shorts-import.json',JSON.stringify({at:new Date().toISOString(),base,registered,privateStorage:true,apiUpload:true,rangePlayback:true},null,2));console.log(`PASS: ${clips.length} real videos registered or preserved via administrator upload API; anonymous signed playback, MP4 byte ranges, posters and private storage verified`);
}finally{await session.auth.signOut({scope:'local'});}
