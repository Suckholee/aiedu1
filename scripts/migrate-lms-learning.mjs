import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
if(process.env.NEXT_PUBLIC_SUPABASE_URL!=='https://ztfrqwpuypxbcimefcgw.supabase.co')throw Error('Unexpected project.');
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
async function checked(request){const r=await request;if(r.error)throw Error(`Stopped: ${r.error.code}`);return r.data;}
async function all(table){const rows=[];for(let offset=0;;offset+=500){const batch=await checked(client.from(table).select('*').order(['lms_attendance','lms_lesson_progress'].includes(table)?'enrollment_id':table==='lms_staff_members'?'profile_id':table==='lms_cohort_instructors'?'cohort_id':table==='lms_schema_versions'?'version':'id').range(offset,offset+499));rows.push(...batch);if(batch.length<500)return rows;}}
const tables=['lms_schema_versions','lms_profiles','lms_staff_members','lms_courses','lms_cohorts','lms_cohort_instructors','lms_lessons','lms_enrollments','lms_sessions','lms_attendance','lms_lesson_progress','lms_materials','lms_orders','lms_payments','lms_refunds','lms_audit_events','lms_migration_runs'];
const backup={exportedAt:new Date().toISOString(),tables:Object.fromEntries(await Promise.all(tables.map(async t=>[t,await all(t)])))};
await mkdir('.local-data/backups',{recursive:true});const backupPath=`.local-data/backups/lms-before-learning-${Date.now()}.json`;await writeFile(backupPath,JSON.stringify(backup,null,2),{mode:0o600});
if(process.argv.includes('--backup-only')){console.log(JSON.stringify({backup:backupPath,counts:Object.fromEntries(Object.entries(backup.tables).map(([t,rows])=>[t,rows.length]))}));process.exit(0);}
const sourcePath=process.argv[2];if(!sourcePath)throw Error('Usage: node scripts/migrate-lms-learning.mjs FIREBASE_BACKUP_PATH [--dry-run]');
const raw=await readFile(sourcePath,'utf8'),source=JSON.parse(raw);if(source.project!=='gahoseokho')throw Error('Unexpected Firebase source.');
const digest=createHash('sha256').update(raw).digest('hex');
if(!backup.tables.lms_schema_versions.some(v=>v.version==='202610190003'))throw Error('Apply learning schema first.');
const stable=v=>{const h=createHash('sha256').update(v).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;};
const cohortFor=id=>{const c=backup.tables.lms_cohorts.find(h=>h.id===id||h.legacy_course_id===id);if(!c)throw Error('Unmapped legacy cohort. Source retained; review required.');return c;};
const plan={lessons:[],enrollments:[],sessions:[],attendance:[],progress:[]};
for(const m of source.platform.materials){const h=cohortFor(m.courseId);plan.lessons.push({id:stable(`legacy-material:${m.id}`),legacy_material_id:m.id,cohort_id:h.id,title:m.title,position:plan.lessons.filter(l=>l.cohort_id===h.id).length,kind:'document',required:true,content_url:m.url});}
for(const old of source.platform.enrollments){
 const h=cohortFor(old.courseId);const users=source.users.filter(u=>u.email?.toLowerCase()===old.email?.toLowerCase()&&u.emailVerified&&!u.disabled);
 if(users.length!==1)throw Error('Legacy enrollment identity requires review. No email-only claim performed.');
 const member=backup.tables.lms_profiles.find(p=>p.legacy_firebase_uid===users[0].uid);if(!member)throw Error('Missing verified member.');
 const status={신청:'applied',승인:'active',반려:'rejected',수료:'completed',환불:'revoked'}[old.status];if(!status)throw Error('Unknown legacy status.');
 const id=stable(`legacy-enrollment:${old.id}`);plan.enrollments.push({id,legacy_id:old.id,cohort_id:h.id,learner_id:member.id,status,contact_name:old.name,contact_email:old.email,contact_phone:old.phone,amount_krw:old.amount,applied_at:old.createdAt,notes:(old.notes??[]).map(text=>({at:old.createdAt,text})),legacy_payload:old});
 if(old.attendance){
  if(!h.starts_at||!h.ends_at)throw Error('Legacy attendance schedule requires review.');
  const session=stable(`legacy-attendance-session:${h.id}`);
  if(!plan.sessions.some(s=>s.id===session))plan.sessions.push({id:session,cohort_id:h.id,title:'이전 단일 수업 출석 기록',starts_at:h.starts_at,ends_at:h.ends_at,location:h.location});
  plan.attendance.push({enrollment_id:id,session_id:session,cohort_id:h.id,status:'present',note:'기존 출석 확인 값을 보존 이전'});
 }
 for(const materialId of old.progress??[]){const lesson=plan.lessons.find(l=>l.legacy_material_id===materialId&&l.cohort_id===h.id);if(!lesson)throw Error('Legacy progress material requires review; source retained.');plan.progress.push({enrollment_id:id,lesson_id:lesson.id,cohort_id:h.id,progress_percent:100,completed_at:null});}
}
const counts=Object.fromEntries(Object.entries(plan).map(([k,v])=>[k,v.length]));
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({dryRun:true,backup:backupPath,counts}));process.exit(0);}
for(const [key,table,conflict] of [['lessons','lms_lessons','id'],['enrollments','lms_enrollments','id'],['sessions','lms_sessions','id'],['attendance','lms_attendance','enrollment_id,session_id'],['progress','lms_lesson_progress','enrollment_id,lesson_id']]){
 for(const row of plan[key])await checked(client.from(table).upsert(row,{onConflict:conflict,ignoreDuplicates:true}));
 const actual=await all(table);for(const row of plan[key])if(!actual.some(r=>row.id?r.id===row.id:Object.keys(row).filter(k=>k.endsWith('_id')).every(k=>r[k]===row[k])))throw Error('Verification mismatch; cutover blocked.');
}
await checked(client.from('lms_migration_runs').upsert({id:`firebase-learning-${digest}`,source:`${source.project}/aieduPlatforms/main`,source_digest:digest,counts},{onConflict:'id'}));
console.log(JSON.stringify({verified:true,backup:backupPath,counts,sourceChanged:false}));
