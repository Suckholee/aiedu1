import {after} from 'next/server';
import {dispatchSmsSafely} from '@/lib/lms/sms';
import {ZodError} from 'zod';
import {requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
import {readLearning,runLearning} from '@/lib/lms/learning';
export const runtime='nodejs';
export async function GET(){try{return lmsResponse(await readLearning(await requireMember()));}catch(e){return lmsFailure(e);}}
export async function POST(request:Request){try{
 requireSameOrigin(request);const member=await requireMember();
 const command=await request.json();const id=await runLearning(command,member);if(command.action==='apply')after(dispatchSmsSafely);return lmsResponse({id});
}catch(e){return lmsFailure(e instanceof ZodError?new LmsError(e.issues[0]?.message??'입력값을 확인하세요.'):e);}}
