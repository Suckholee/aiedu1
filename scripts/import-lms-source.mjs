import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const require=createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const sourcePath=process.argv[2];
const adminEmail=(process.argv[3]??'').trim().toLowerCase();
if(!sourcePath||!adminEmail)throw Error('Usage: node scripts/import-lms-source.mjs BACKUP_PATH VERIFIED_ADMIN_EMAIL');
const sourceText=await readFile(sourcePath,'utf8');
const source=JSON.parse(sourceText);
const digest=createHash('sha256').update(sourceText).digest('hex');
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
async function checked(request){const result=await request;if(result.error)throw Error(`Migration stopped: ${result.error.code??'request failed'}`);return result.data;}
const administrator=source.users.find(u=>u.email?.toLowerCase()===adminEmail&&u.emailVerified&&!u.disabled);
if(!administrator)throw Error('The selected admin must be an existing verified, enabled Firebase user.');
const deterministicId=value=>{
  const hex=createHash('sha256').update(value).digest('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
};
let insertedProfiles=0;
for(const user of source.users){
  const existing=await checked(client.from('lms_profiles').select('id').eq('legacy_firebase_uid',user.uid).maybeSingle());
  if(existing)continue;
  const profile=source.profiles.find(p=>p.id===user.uid)??{};
  await checked(client.from('lms_profiles').insert({id:deterministicId(`firebase:${source.project}:${user.uid}`),legacy_firebase_uid:user.uid,
    display_name:user.displayName||profile.displayName||'수강생',email:user.email,phone:profile.phone??null,company:profile.company??null,
    photo_url:user.photoURL,status:user.disabled?'suspended':'active'}));
  insertedProfiles++;
}
for(const course of source.platform.courses){
  const existing=await checked(client.from('lms_cohorts').select('id').eq('legacy_course_id',course.id).maybeSingle());
  if(existing)continue;
  const courseId=deterministicId(`course:${course.id}`),cohortId=deterministicId(`cohort:${course.id}`);
  const startsAt=`${course.startDate}T${course.startTime}:00+09:00`,endsAt=`${course.startDate}T${course.endTime}:00+09:00`;
  if(!Number.isFinite(Date.parse(startsAt))||Date.parse(endsAt)<=Date.parse(startsAt))throw Error('Legacy course schedule requires review. Source remains intact.');
  const parent=await checked(client.from('lms_courses').select('id').eq('id',courseId).maybeSingle());
  if(!parent)await checked(client.from('lms_courses').insert({id:courseId,legacy_id:course.id,slug:`legacy-${courseId}`,title:course.title,
    subtitle:course.subtitle,description:course.subtitle,category:course.category,level:course.level,published:course.published,
    thumbnail:course.thumbnail??'',metadata:course}));
  await checked(client.from('lms_cohorts').insert({id:cohortId,course_id:courseId,legacy_course_id:course.id,title:course.title,
    delivery_mode:'offline',status:course.published?'open':'draft',starts_at:startsAt,ends_at:endsAt,capacity:course.totalSeats,
    price_krw:course.price,location:course.location,instructor_name:course.instructor?.name??'',metadata:course}));
}
const profiles=await checked(client.from('lms_profiles').select('id,legacy_firebase_uid').in('legacy_firebase_uid',source.users.map(u=>u.uid)));
if(profiles.length!==source.users.length)throw Error('Profile count mismatch; cutover blocked.');
const selected=profiles.find(p=>p.legacy_firebase_uid===administrator.uid);
const role=await checked(client.from('lms_staff_members').select('role').eq('profile_id',selected.id).eq('role','admin').maybeSingle());
if(!role)await checked(client.from('lms_staff_members').insert({profile_id:selected.id,role:'admin'}));
for(const course of source.platform.courses){
  const migrated=await checked(client.from('lms_cohorts').select('legacy_course_id,metadata,price_krw,capacity').eq('legacy_course_id',course.id).single());
  if(JSON.stringify(migrated.metadata)!==JSON.stringify(course)) {
    // Postgres jsonb reorders keys; compare canonical objects.
    const canonical=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(v=>JSON.parse(canonical(v))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);
    if(canonical(migrated.metadata)!==canonical(course))throw Error('Legacy course metadata mismatch; cutover blocked.');
  }
}
await checked(client.from('lms_migration_runs').upsert({id:`firebase-foundation-${digest}`,source:`${source.project}/aieduPlatforms/main + verified users`,source_digest:digest,
  counts:{profiles:profiles.length,courses:source.platform.courses.length,retainedFirebase:Object.fromEntries(Object.entries(source.platform).filter(([k])=>k!=='courses').map(([k,v])=>[k,v.length]))}},{onConflict:'id'}));
console.log(JSON.stringify({verified:true,profiles:profiles.length,insertedProfiles,courses:source.platform.courses.length,adminAssigned:true,firebaseSourceChanged:false}));
