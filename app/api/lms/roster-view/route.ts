import {z} from 'zod';
import {createHmac} from 'node:crypto';
import {cookies} from 'next/headers';
import {requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
import {createAdminClient} from '@/lib/supabase/admin';
import {requireRosterSession,rosterConfig} from '@/lib/lms/roster-access';
import {issueRosterSession,matchesRosterCode,rosterCookie,rosterLifetime} from '@/lib/lms/roster-session';
import {readApplicantRoster} from '@/lib/lms/roster';
export const runtime='nodejs';
const options={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/api/lms/roster-view'};
export async function GET(){try{const expiry=await requireRosterSession();return lmsResponse({...await readApplicantRoster(),expiresAt:new Date(expiry*1000).toISOString()});}catch(e){return lmsFailure(e);}}
export async function POST(request:Request){
 try{
  requireSameOrigin(request);const {code}=z.object({code:z.string().max(100)}).parse(await request.json());
  const {hash,secret}=rosterConfig(),correct=matchesRosterCode(code,hash);
  const ip=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()??'unknown':'local';
  const ipHash=createHmac('sha256',secret).update(`roster-ip:${ip}`).digest('hex');
  const {data,error}=await createAdminClient().rpc('lms_roster_code_attempt',{ip_hash:ipHash,failed:!correct});
  if(error)throw new LmsError('조회 연결을 확인하지 못했습니다.',503);
  if(!data)throw new LmsError('코드 입력 시도가 많습니다. 15분 후 다시 시도해주세요.',429);
  if(!correct)throw new LmsError('조회 코드가 올바르지 않습니다.',401);
  (await cookies()).set(rosterCookie,issueRosterSession(secret,hash),{...options,maxAge:rosterLifetime});
  return lmsResponse({ok:true});
 }catch(e){return lmsFailure(e instanceof z.ZodError?new LmsError('조회 코드를 입력해주세요.'):e);}
}
export async function DELETE(request:Request){try{requireSameOrigin(request);(await cookies()).set(rosterCookie,'',{...options,maxAge:0});return lmsResponse({ok:true});}catch(e){return lmsFailure(e);}}
