import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const base=process.env.LMS_TEST_BASE??'http://localhost:3100';
if(!['http://localhost:3100','https://aiedu1.vercel.app'].includes(base))throw Error('Unexpected test destination.');
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const profile=await admin.from('lms_profiles').select('id,auth_user_id,email').eq('email','peter15975345@gmail.com').single();
if(profile.error||!profile.data.auth_user_id)throw Error('Existing administrator required.');
const identity=await admin.auth.admin.getUserById(profile.data.auth_user_id);
if(identity.error||!identity.data.user.email_confirmed_at)throw Error('Verified existing account required.');
const link=await admin.auth.admin.generateLink({type:'magiclink',email:profile.data.email});
if(link.error)throw Error('Unable to create isolated test session.');
let jar=[];const session=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>jar,setAll:cookies=>{for(const cookie of cookies){jar=jar.filter(c=>c.name!==cookie.name);if(cookie.value)jar.push(cookie);}}}});
try{
 const verified=await session.auth.verifyOtp({token_hash:link.data.properties.hashed_token,type:'magiclink'});
 if(verified.error||verified.data.user.id!==profile.data.auth_user_id)throw Error('Test identity mismatch.');
 const headers={'Cookie':jar.map(c=>`${c.name}=${c.value}`).join('; '),'Origin':base,'Content-Type':'application/json'};
 const get=await fetch(base+'/api/lms/learning',{headers,signal:AbortSignal.timeout(20000)});assert.equal(get.status,200);const body=await get.json();assert.equal(body.staff,true);
 for(const key of ['courses','cohorts','enrollments','sessions','lessons','attendance','progress'])assert.ok(Array.isArray(body[key]),key);
 const post=async(command,origin=base)=>fetch(base+'/api/lms/learning',{method:'POST',headers:{...headers,Origin:origin},body:JSON.stringify(command),signal:AbortSignal.timeout(20000)});
 assert.equal((await post({action:'apply',cohort_id:'00000000-0000-4000-8000-000000000000',name:'Validation only',phone:'01000000000'})).status,400);
 assert.equal((await post({action:'progress',id:'bad',lesson_id:'bad',percent:101})).status,400);
 assert.equal((await post({action:'attendance_batch',session_id:'00000000-0000-4000-8000-000000000000',records:[]})).status,400);
 assert.equal((await post({action:'status',id:'00000000-0000-4000-8000-000000000000',status:'active'},'https://outside.example')).status,403);
 const manage=await fetch(base+'/api/lms/manage',{headers,signal:AbortSignal.timeout(20000)});assert.equal(manage.status,200);const members=await manage.json();assert.ok(members.totalMembers>=8);
 console.log('PASS: authenticated administrator learning DTO, validation, CSRF and existing member access; no business data written');
}finally{await session.auth.signOut({scope:'local'});}
