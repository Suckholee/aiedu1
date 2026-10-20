import 'server-only';
import {sendSolapiMessage} from './sms-provider';
import {createAdminClient} from '@/lib/supabase/admin';
import {smsPhone,smsSender,smsText,type SmsPayload} from './sms-content';
export function smsConfigured(){return !!(process.env.SOLAPI_API_KEY&&process.env.SOLAPI_API_SECRET&&smsSender(process.env.SOLAPI_SENDER_NUMBER??''));}
export async function dispatchSmsJobs(limit=3){
 if(!smsConfigured())return {configured:false,processed:0};
 const admin=createAdminClient();let processed=0;
 for(let n=0;n<limit;n++){
  const claim=await admin.rpc('lms_sms_claim');if(claim.error)throw Error('문자 대기열 연결 실패');if(!claim.data)break;if(claim.data.skipped)continue;
  const p=claim.data as SmsPayload,to=smsPhone(p.phone),text=smsText(p);let status='unknown',errorCode:string|null=null,messageId:string|null=null;
  if(!to||Buffer.byteLength(text,'utf8')>2000){status='failed';errorCode=to?'message_too_long':'invalid_mobile';}
  else{
   const result=await sendSolapiMessage({apiKey:process.env.SOLAPI_API_KEY!,apiSecret:process.env.SOLAPI_API_SECRET!,sender:smsSender(process.env.SOLAPI_SENDER_NUMBER!)!},{id:p.id,to,text});
   status=result.status;errorCode=result.errorCode;messageId=result.messageId;
  }
  // An uncertain provider response is never retried automatically: it may already have been accepted.
  const saved=await admin.from('lms_sms_jobs').update({status,error_code:errorCode,provider_message_id:messageId,message_text:text,updated_at:new Date().toISOString()}).eq('id',p.id).eq('status','processing');
  if(saved.error)throw Error('문자 요청 상태 저장 실패. 발송업체 확인이 필요합니다.');processed++;
 }
 return {configured:true,processed};
}
export async function dispatchSmsSafely(){try{await dispatchSmsJobs();}catch{console.error('SMS queue processing failed; check administrator message status.');}}
