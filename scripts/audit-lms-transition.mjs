import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {createClient} from '@supabase/supabase-js';import {cert,initializeApp} from 'firebase-admin/app';import {getFirestore} from 'firebase-admin/firestore';import {getAuth} from 'firebase-admin/auth';import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const app=initializeApp({credential:cert({projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_ADMIN_CLIENT_EMAIL,privateKey:process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g,'\n')})},'migration-audit');
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
try{
 const [profiles,roles]=await Promise.all([supabase.from('lms_profiles').select('id,legacy_firebase_uid,auth_user_id,status'),supabase.from('lms_staff_members').select('profile_id,role')]);assert.ifError(profiles.error);assert.ifError(roles.error);
 let users=[],token;do{const page=await getAuth(app).listUsers(1000,token);users.push(...page.users);token=page.pageToken;}while(token);
 const missing=profiles.data.filter(p=>p.legacy_firebase_uid&&!users.some(u=>u.uid===p.legacy_firebase_uid));const duplicates=profiles.data.filter(p=>p.auth_user_id).length-new Set(profiles.data.filter(p=>p.auth_user_id).map(p=>p.auth_user_id)).size;
 assert.equal(missing.length,0,'Legacy Firebase UID missing');assert.equal(duplicates,0,'Duplicate Supabase identity');
 const root=getFirestore(app).collection('aieduPlatforms').doc('main'),firebase={};for(const k of ['courses','enrollments','materials','banners','reviews','promotionPosts','logs'])firebase[k]=(await root.collection(k).count().get()).data().count;
 const counts={};for(const table of ['lms_courses','lms_cohorts','lms_enrollments','lms_materials','lms_orders','lms_payments','lms_refunds','lms_legacy_finance_records','lms_finance_imports']){const r=await supabase.from(table).select('*',{head:true,count:'exact'});assert.ifError(r.error);counts[table]=r.count;}
 assert.equal(counts.lms_enrollments,firebase.enrollments,'Enrollment source count mismatch');assert.equal(counts.lms_courses,firebase.courses,'Course source count mismatch');
 const result={checkedAt:new Date().toISOString(),readOnly:true,members:profiles.data.length,firebaseAuthUsers:users.length,missingLegacyUids:missing.length,duplicateAuthUids:duplicates,missingLegacyPointers:profiles.data.filter(p=>!p.legacy_firebase_uid).length,staff:roles.data.reduce((o,r)=>({...o,[r.role]:(o[r.role]??0)+1}),{}),firebase,supabase:counts};
 await mkdir('.local-data/audits',{recursive:true});await writeFile('.local-data/audits/lms-transition.json',JSON.stringify(result,null,2),{mode:0o600});console.log(JSON.stringify(result));
}finally{await app.delete();}
