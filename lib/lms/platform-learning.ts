import 'server-only';
import type {PlatformData} from '@/lib/platform-types';
import type {LmsMember} from './types';
import {createAdminClient} from '@/lib/supabase/admin';
import {allRows,runLearning} from './learning';
import {readCatalog} from './catalog';
import {enrollmentNames} from './learning-types';
import {LmsError} from './access';

export async function readPlatformLearning(){
 const [enrollments,lessons,attendance,progress,sessions,orders]=await Promise.all(['lms_enrollments','lms_lessons','lms_attendance','lms_lesson_progress','lms_sessions','lms_orders'].map(t=>allRows(t)));
 return {enrollments,lessons,attendance,progress,sessions,orders};
}
export function overlayLearning(data:PlatformData,learning:Awaited<ReturnType<typeof readPlatformLearning>>,cohorts:{id:string;legacy_course_id:string|null}[]){
 const courseId=(id:string)=>cohorts.find(c=>c.id===id)?.legacy_course_id??id;
 data.enrollments=learning.enrollments.map(e=>{
  const sessions=learning.sessions.filter(s=>s.cohort_id===e.cohort_id&&!s.archived);
  const order=learning.orders.find(o=>o.enrollment_id===e.id&&o.enrollment_applied_at===e.applied_at&&o.status!=='cancelled');
  return {orderId:order?.id,orderNumber:order?(order.legacy_order_id||`LMS-${order.id.replaceAll('-','').toUpperCase()}`):undefined,paymentStatus:order?({pending:'미결제',paid:'결제완료',refunded:'환불',partially_refunded:'부분 환불',cancelled:'취소'}[order.status]):undefined,id:e.legacy_id??e.id,lmsId:e.id,learnerId:e.learner_id,courseId:courseId(e.cohort_id),name:e.contact_name,email:e.contact_email,phone:e.contact_phone,
   status:enrollmentNames[e.status as keyof typeof enrollmentNames],amount:Number(e.amount_krw),createdAt:e.applied_at,accessUntil:e.access_until,
   attendance:sessions.length>0&&sessions.every(s=>learning.attendance.some(a=>a.enrollment_id===e.id&&a.session_id===s.id&&a.status!=='absent')),
   progress:learning.progress.filter(p=>p.enrollment_id===e.id&&p.progress_percent===100).map(p=>{const lesson=learning.lessons.find(l=>l.id===p.lesson_id);return lesson?.legacy_material_id??p.lesson_id;}),
   notes:e.notes.map((n:any)=>typeof n==='string'?n:`${n.at} ${n.text}`)};
 });
 data.materials=learning.lessons.filter(l=>!l.archived&&l.content_url).map(l=>({id:l.legacy_material_id??l.id,courseId:courseId(l.cohort_id),title:l.title,url:l.content_url,createdAt:''}));
 return data;
}
export async function resolveCohort(courseId:string){const {cohorts}=await readCatalog();const h=cohorts.find(c=>c.id===courseId||c.legacy_course_id===courseId);if(!h)throw new LmsError('기수를 찾을 수 없습니다.');return h;}
export async function legacyLearningCommand(c:any,member:LmsMember){
 if(c.action==='enroll')return runLearning({action:'apply',cohort_id:(await resolveCohort(c.courseId)).id,name:c.name,phone:c.phone,company:c.company,note:c.notes,payment_method:c.paymentMethod,receipt_type:c.receiptType,receipt_number:c.receiptNumber,depositor_name:c.depositorName},member);
 if(c.action==='material'){
  const cohort=await resolveCohort(c.courseId);const lessons=await allRows('lms_lessons','*',{column:'cohort_id',value:cohort.id});
  return runLearning({action:'lesson',cohort_id:cohort.id,title:c.title,content_url:c.url,position:Math.max(-1,...lessons.map(l=>l.position))+1,required:true,kind:'document'},member);
 }
 const rows=await allRows('lms_enrollments','id,legacy_id,cohort_id');
 const e=rows?.find(e=>e.id===c.id||e.legacy_id===c.id);if(!e)throw new LmsError('신청 내역을 찾을 수 없습니다.');
 if(c.action==='status'){
  if(c.status==='환불')throw new LmsError('학습 운영에서 수강권을 회수하세요. 금전 환불은 별도 정산 절차가 필요합니다.');
  return runLearning({action:'status',id:e.id,status:{승인:'active',반려:'rejected',수료:'completed'}[c.status as string]},member);
 }
 if(c.action==='note')return runLearning({...c,id:e.id},member);
 if(c.action==='attendance'){
  const sessions=(await allRows('lms_sessions','*',{column:'cohort_id',value:e.cohort_id})).filter(s=>!s.archived);
  if(sessions.length!==1)throw new LmsError('학습 운영 화면에서 출결 회차를 선택하세요.');
  return runLearning({action:'attendance',id:e.id,session_id:sessions[0].id,status:c.attendance?'present':'absent'},member);
 }
 if(c.action==='progress'){
  const lessons=await allRows('lms_lessons','*',{column:'cohort_id',value:e.cohort_id});const l=lessons.find(l=>l.id===c.materialId||l.legacy_material_id===c.materialId);
  if(!l)throw new LmsError('학습 차시를 찾을 수 없습니다.');
  return runLearning({action:'progress',id:e.id,lesson_id:l.id,percent:100},member);
 }
 throw new LmsError('지원하지 않는 명령입니다.');
}
