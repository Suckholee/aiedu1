import {z} from 'zod';
import {createHmac} from 'node:crypto';
import {after} from 'next/server';
import {requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
import {createAdminClient} from '@/lib/supabase/admin';
import {allRows} from '@/lib/lms/learning';
import {readCatalog} from '@/lib/lms/catalog';
import {smsConfigured,dispatchSmsSafely} from '@/lib/lms/sms';
import {smsPhone,smsText,type SmsPayload} from '@/lib/lms/sms-content';
import {orderNumber} from '@/lib/lms/finance-types';
export const runtime='nodejs';
const targets={kind:z.enum(['application','payment_reminder']),orderIds:z.array(z.uuid()).min(1).max(20)};
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('preview'),...targets}),z.object({action:z.literal('enqueue'),...targets,previewToken:z.string().regex(/^[a-f0-9]{64}$/)}),
 z.object({action:z.literal('settings'),enabled:z.boolean()}),z.object({action:z.literal('process')})
]);
async function preview(orderIds:string[],kind:SmsPayload['kind']){
 const admin=createAdminClient();const response=await admin.from('lms_orders').select('*').in('id',orderIds);if(response.error)throw new LmsError('주문을 조회하지 못했습니다.',503);
 const orders=response.data;const enrollmentIds=orders.map(o=>o.enrollment_id).filter(Boolean);
 const [enrollments,payments,catalog]=await Promise.all([enrollmentIds.length?allRows('lms_enrollments','*',{column:'id',value:enrollmentIds}):[],allRows('lms_payments','id,order_id,amount_krw',{column:'order_id',value:orderIds}),readCatalog()]);
 const learnerIds=enrollments.map(e=>e.learner_id);const profiles=learnerIds.length?await allRows('lms_profiles','id,auth_user_id',{column:'id',value:learnerIds}):[];
 const messages=orders.flatMap(o=>{
  const e=enrollments.find(e=>e.id===o.enrollment_id),h=catalog.cohorts.find(h=>h.id===e?.cohort_id);
  if(!e||!h||!['applied','active','completed'].includes(e.status)||e.applied_at!==o.enrollment_applied_at||!['pending','paid'].includes(o.status))return [];
  const due=Math.max(0,Number(o.amount_krw)-payments.filter(p=>p.order_id===o.id).reduce((sum,p)=>sum+Number(p.amount_krw),0));
  const payload:SmsPayload={id:'',order_id:o.id,kind,name:e.contact_name,phone:e.contact_phone,title:o.title,starts_at:h.starts_at,location:h.location,guest:!profiles.find(p=>p.id===e.learner_id)?.auth_user_id,number:orderNumber(o),payable:o.status==='pending'&&o.review_status==='verified'&&due>0,due};
  const to=smsPhone(payload.phone);if(!to||kind==='payment_reminder'&&!payload.payable)return [];
  return [{orderId:o.id,name:e.contact_name,to,text:smsText(payload)}];
 }).sort((a,b)=>a.orderId.localeCompare(b.orderId));
 const token=createHmac('sha256',process.env.SUPABASE_SECRET_KEY!).update(`sms-preview:${JSON.stringify({kind,messages})}`).digest('hex');
 return {messages,previewToken:token,excluded:orderIds.length-messages.length};
}
export async function GET(){try{
 await requireMember(['admin','operations']);const admin=createAdminClient();const [settings,jobs]=await Promise.all([admin.from('lms_sms_settings').select('enabled').eq('id',1).single(),admin.from('lms_sms_jobs').select('id,order_id,kind,status,created_at,error_code').order('created_at',{ascending:false}).limit(50)]);
 if(settings.error||jobs.error)throw new LmsError('문자 설정 연결을 확인하지 못했습니다.',503);
 return lmsResponse({configured:smsConfigured(),enabled:settings.data.enabled,jobs:jobs.data});
 }catch(e){return lmsFailure(e);}}
export async function POST(request:Request){try{
 requireSameOrigin(request);const member=await requireMember(['admin','operations']);const command=schema.parse(await request.json());const admin=createAdminClient();
 if(command.action==='preview')return lmsResponse(await preview([...new Set(command.orderIds)],command.kind));
 if(command.action==='settings'){
  if(command.enabled&&!smsConfigured())throw new LmsError('솔라피 API 키와 등록된 발신번호를 먼저 연결해주세요.',503);
  const result=await admin.from('lms_sms_settings').update({enabled:command.enabled,updated_at:new Date().toISOString()}).eq('id',1);if(result.error)throw new LmsError('문자 설정 저장 실패',503);
  return lmsResponse({ok:true});
 }
 if(!smsConfigured())throw new LmsError('문자 서비스 연결 전입니다. 솔라피 가입·발신번호 등록·API 키 설정이 필요합니다.',503);
 if(command.action==='process'){after(dispatchSmsSafely);return lmsResponse({queued:true});}
 const current=await preview([...new Set(command.orderIds)],command.kind);
 if(current.previewToken!==command.previewToken)throw new LmsError('신청 정보가 변경되었습니다. 문자를 다시 미리보기 해주세요.',409);
 if(!current.messages.length)throw new LmsError('발송 가능한 대상이 없습니다.');
 const result=await admin.rpc('lms_sms_queue',{command:{kind:command.kind,order_ids:current.messages.map(m=>m.orderId)},actor:member.id});
 if(result.error)throw new LmsError(result.error.code==='P0001'?result.error.message:'문자 대기열 저장 실패',400);
 after(dispatchSmsSafely);return lmsResponse({queued:result.data,excluded:current.excluded});
 }catch(e){return lmsFailure(e instanceof z.ZodError?new LmsError('문자 발송 종류와 대상을 확인해주세요.'):e);}}
