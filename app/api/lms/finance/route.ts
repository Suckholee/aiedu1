import {ZodError} from 'zod';
import {requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
import {readFinance,runFinance,importFinance} from '@/lib/lms/finance';
export const runtime='nodejs';
export async function GET(request:Request){try{return lmsResponse(await readFinance(await requireMember(['admin','finance','operations']),new URL(request.url)));}catch(e){return lmsFailure(e);}}
export async function POST(request:Request){try{
 requireSameOrigin(request);const member=await requireMember(['admin','finance','operations']);const raw=await request.text();if(raw.length>2_000_000)throw new LmsError('가져올 기록은 2MB 이하로 나눠주세요.',413);const command=JSON.parse(raw);
 let id;if(command.action==='import_legacy')id=await importFinance(command.payload,member);
 else if(command.action==='import_seed'){
  const {INITIAL_SETTLEMENT_RECORDS,COURSE_SETTLEMENT_METAS}=await import('@/data/settlements');
  id=await importFinance({source:'repository:data/settlements.ts',kind:'repository_seed',records:INITIAL_SETTLEMENT_RECORDS,snapshots:{courses:COURSE_SETTLEMENT_METAS,records:INITIAL_SETTLEMENT_RECORDS}},member);
 }else id=await runFinance(command,member);
 return lmsResponse({id});
}catch(e){return lmsFailure(e instanceof ZodError?new LmsError(e.issues[0]?.message??'입력값을 확인하세요.'):e);}}
