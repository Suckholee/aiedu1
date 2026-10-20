import {after} from 'next/server';
import {dispatchSmsSafely} from '@/lib/lms/sms';
import {z} from 'zod';
import {requireSameOrigin,LmsError,lmsResponse,lmsFailure} from '@/lib/lms/access';
import {createAdminClient} from '@/lib/supabase/admin';
import {resolveCohort} from '@/lib/lms/platform-learning';
import {BANK_TRANSFER_PAYMENT_METHOD} from '@/lib/lms/payment-channel';
const schema=z.object({requestId:z.uuid(),courseId:z.string().min(1).max(200),name:z.string().trim().min(1).max(200),email:z.email().max(254).transform(v=>v.toLowerCase()),phone:z.string().max(30).transform(v=>v.replace(/\D/g,'')).refine(v=>v.length>=8&&v.length<=15),company:z.string().trim().max(200),notes:z.string().trim().max(2000),referralCode:z.string().trim().max(50),agreePrivacy:z.literal(true),agreeRefund:z.literal(true)});
export async function POST(request:Request){
 try{
  requireSameOrigin(request);
  const c=schema.parse(await request.json());
  const cohort=await resolveCohort(c.courseId);
  const {data,error}=await createAdminClient().rpc('lms_guest_application',{request_id:c.requestId,command:{cohort_id:cohort.id,name:c.name,email:c.email,phone:c.phone,company:c.company,note:c.notes,referral_code:c.referralCode,payment_method:BANK_TRANSFER_PAYMENT_METHOD,privacy_agreed:true,refund_agreed:true}});
  if(error)throw new LmsError(error.code==='P0001'?error.message:'신청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',error.code==='P0001'?400:503);
  after(dispatchSmsSafely);
  return lmsResponse(data);
 }catch(e){if(e instanceof z.ZodError)return lmsResponse({error:'신청 정보와 필수 동의를 확인해주세요.'},400);return lmsFailure(e);}
}
