import {ZodError} from 'zod';import {requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';import {readBilling,runFinance} from '@/lib/lms/finance';
export const runtime='nodejs';
export async function GET(){try{return lmsResponse(await readBilling(await requireMember()));}catch(e){return lmsFailure(e);}}
export async function POST(request:Request){try{requireSameOrigin(request);const member=await requireMember();const command=await request.json();if(command.action!=='refund_request')throw new LmsError('환불 요청만 사용할 수 있습니다.',403);return lmsResponse({id:await runFinance(command,member)});}catch(e){return lmsFailure(e instanceof ZodError?new LmsError(e.issues[0]?.message??'입력값을 확인하세요.'):e);}}
