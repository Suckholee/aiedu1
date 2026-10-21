import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {readCatalog} from './catalog';
import {LmsError} from './access';
import type {LmsMember} from './types';
import type {LearningData} from './learning-types';
import {applicationOrder} from './application-orders';
import {orderNumber} from './finance-types';
import {canStudy} from './learning-types';
import {learningCommand} from './learning-validation';

// PostgREST defaults to 1,000 rows. Page every table so migration/rosters never truncate silently.
export async function allRows(table:string,columns='*',filter?:{column:string;value:string|string[]}) {
 const client=createAdminClient();const rows:any[]=[];
 for(let offset=0;;offset+=500){
  let query=client.from(table).select(columns).order(table==='lms_attendance'||table==='lms_lesson_progress'?'enrollment_id':'id');
  if(table==='lms_enrollments')query=query.eq('archived',false);
  if(table==='lms_orders')query=query.not('application_details','cs','{"archived_dummy":true}');
  if(table==='lms_attendance')query=query.order('session_id');
  if(table==='lms_lesson_progress')query=query.order('lesson_id');
  if(filter)query=Array.isArray(filter.value)?query.in(filter.column,filter.value):query.eq(filter.column,filter.value);
  const r=await query.range(offset,offset+499);
  if(r.error)throw new LmsError('학습 운영 데이터를 조회하지 못했습니다.',503);
  rows.push(...r.data);if(r.data.length<500)break;
 }
 return rows;
}
export async function readLearning(member:LmsMember):Promise<LearningData>{
 const staff=member.roles.some(r=>['admin','operations'].includes(r));
 const catalog=await readCatalog();
 const enrollments=await allRows('lms_enrollments','id,legacy_id,cohort_id,learner_id,status,access_until,applied_at,contact_name,contact_email,contact_phone,company,learner_note,amount_krw,notes',staff?undefined:{column:'learner_id',value:member.id});
 const visible=new Set(enrollments.map(e=>e.cohort_id));
 const learnable=new Set(enrollments.filter(canStudy).map(e=>e.cohort_id));
 const allowed=staff?null:visible;
 // Filter in DB for a single member's cohorts; an empty roster never reads another member's records.
 const cohortIds=staff?catalog.cohorts.map(c=>c.id):[...visible] as string[];
 const forIds=async(table:string,ids:string[],column='cohort_id')=>{
  const result:any[]=[];
  for(let offset=0;offset<ids.length;offset+=100)result.push(...await allRows(table,'*',{column,value:ids.slice(offset,offset+100)}));
  return result;
 };
 const enrollmentIds=enrollments.map(e=>e.id);
 const [sessions,lessons,attendance,progress]=await Promise.all([
  forIds('lms_sessions',cohortIds),forIds('lms_lessons',cohortIds),
  forIds('lms_attendance',staff?cohortIds:enrollmentIds,staff?'cohort_id':'enrollment_id'),
  forIds('lms_lesson_progress',staff?cohortIds:enrollmentIds,staff?'cohort_id':'enrollment_id')
 ]);
 const owns=new Set(enrollments.map(e=>e.id));
 const cohorts=catalog.cohorts.filter(c=>!allowed||allowed.has(c.id));
 const orders=await forIds('lms_orders',enrollmentIds,'enrollment_id');
 const notices=staff?await forIds('lms_payment_notices',orders.map(o=>o.id),'order_id'):[];
 return {actor_id:member.id,staff,courses:catalog.courses.filter(c=>cohorts.some(h=>h.course_id===c.id)).map(c=>({...c,metadata:{}})),cohorts:cohorts.map(h=>({...h,metadata:{}})),
  enrollments:enrollments.map(e=>{const o=applicationOrder(orders,e);return {...e,notes:staff?e.notes:[],payment:o?{order_id:o.id,number:orderNumber(o),status:o.status,amount_krw:Number(o.amount_krw),notice_requested:notices.some(n=>n.order_id===o.id)}:undefined};}),
  sessions:sessions.filter(s=>staff||learnable.has(s.cohort_id)),
  lessons:lessons.map(l=>({...l,content_url:staff||learnable.has(l.cohort_id)?l.content_url:''})),
  attendance:attendance.filter(a=>staff||owns.has(a.enrollment_id)),progress:progress.filter(p=>staff||owns.has(p.enrollment_id))};
}
export async function runLearning(input:unknown,member:LmsMember){
 const command=learningCommand.parse(input);
 const {data,error}=await createAdminClient().rpc('lms_learning',{command,actor:member.id});
 if(error){
  if(error.code==='P0001')throw new LmsError(error.message);
  if(error.code==='23505')throw new LmsError('같은 순서의 차시 또는 중복된 기록이 있습니다.');
  throw new LmsError('입력값과 연결 상태를 확인하세요.');
 }
 return data as string;
}
