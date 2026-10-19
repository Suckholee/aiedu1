import {ZodError} from 'zod';import {requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';import {runCheckout} from '@/lib/lms/checkout';
export const runtime='nodejs';
export async function POST(request:Request){try{requireSameOrigin(request);const member=await requireMember();const raw=await request.text();if(raw.length>10000)throw new LmsError('입력 내용이 너무 깁니다.',413);return lmsResponse({id:await runCheckout(JSON.parse(raw),member)});}catch(e){return lmsFailure(e instanceof ZodError?new LmsError(e.issues[0]?.message??'입력값을 확인하세요.'):e);}}
