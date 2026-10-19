import {createRequire} from 'node:module';import {createClient} from '@supabase/supabase-js';import {readFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {isDeepStrictEqual} from 'node:util';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());const options={auth:{persistSession:false,autoRefreshToken:false}},url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY,options),anon=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options),backup=JSON.parse(await readFile(process.argv[2],'utf8'));let members;
for(const table of ['lms_profiles','lms_staff_members','lms_orders','lms_enrollments']){
 const {data,error}=await admin.from(table).select('*');assert(!error,'Read error: '+table);if(table==='lms_profiles')members=data;
 const before=backup[table];const projected=data.map(row=>Object.fromEntries(Object.keys(before[0]??row).map(k=>[k,row[k]])));
 const sort=rows=>rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).filter(([k])=>!['updated_at','last_seen_at'].includes(k)).sort(([a],[b])=>a.localeCompare(b))))).sort();
 assert(isDeepStrictEqual(sort(projected),sort(before)),'Existing data changed: '+table);
}
assert(members.every(p=>/^NP-[0-9A-F]{12}$/.test(p.referral_code)),'Missing code');assert(new Set(members.map(p=>p.referral_code)).size===members.length,'Duplicate code');
const r=await admin.from('lms_referrals').select('id',{count:'exact',head:true});assert(r.count===0,'Fabricated referral');
const denied=await anon.from('lms_referrals').select('id');assert(denied.error||denied.data?.length===0,'Anonymous referral access');
const reachable=await admin.rpc('lms_learning',{command:{action:'apply',cohort_id:'00000000-0000-4000-8000-000000000000',referral_code:'INVALID'},actor:null});assert(reachable.error?.code==='P0001','Referral RPC unavailable');
console.log(JSON.stringify({members:members.length,uniquePersonalCodes:members.length,existingIdentityRolesOrders:'preserved',fabricatedReferrals:0,anonymousRead:'blocked',transactionalRpc:'available'}));
