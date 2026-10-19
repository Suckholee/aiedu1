import {createRequire} from 'node:module';import {createClient} from '@supabase/supabase-js';import {readFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {isDeepStrictEqual} from 'node:util';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const options={auth:{persistSession:false,autoRefreshToken:false}},url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY,options),anon=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
const backup=JSON.parse(await readFile(process.argv[2],'utf8'));const counts={};
for(const table of ['lms_profiles','lms_staff_members','lms_orders','lms_enrollments']){
 const {data,error}=await admin.from(table).select('*');assert(!error,'Read failed: '+table);counts[table]=data.length;
 const keys=table==='lms_profiles'?['id','auth_user_id','legacy_firebase_uid','display_name','email','phone','company','status']:null;
 const project=row=>keys?Object.fromEntries(keys.map(k=>[k,row[k]])):row;
 const sort=rows=>rows.map(project).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 assert(isDeepStrictEqual(sort(data),sort(backup[table])),'Existing data changed: '+table);
 if(table==='lms_profiles'){assert(data.every(p=>p.onboarding_required===false),'Existing member was forced into onboarding');assert(data.every(p=>p.marketing_opt_in===false&&p.service_alimtalk_opt_in===false),'Consent was fabricated');}
}
const version=await admin.from('lms_schema_versions').select('version').eq('version','202610190009');assert(version.data?.length===1,'Migration missing');
const history=await admin.from('lms_contact_consents').select('id',{count:'exact',head:true});assert(history.count===0,'Fabricated consent history');
const privateRead=await anon.from('lms_contact_consents').select('id');assert(privateRead.error||privateRead.data?.length===0,'Anonymous consent exposure');
const forged=await anon.rpc('lms_save_own_profile',{command:{},actor:backup.lms_profiles[0].id});assert(forged.error,'Anonymous profile mutation');
console.log(JSON.stringify({migration:'202610190009',counts,existingIdentityRolesAndOrders:'preserved',fabricatedConsents:0,anonymousReadAndWrite:'blocked'}));
