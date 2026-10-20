import {z} from 'zod';
import {cookies} from 'next/headers';
import {requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
import {guestCookie,sendGuestCode,verifyGuestCode,guestSessionCommand} from '@/lib/lms/guest-lookup';
export const runtime='nodejs';
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('request'),email:z.string().trim().max(254).pipe(z.email()).transform(v=>v.toLowerCase())}),
 z.object({action:z.literal('verify'),challengeId:z.uuid(),code:z.string().regex(/^\d{6}$/)})
]);
export async function GET(){try{return lmsResponse(await guestSessionCommand('list'));}catch(e){return lmsFailure(e);}}
export async function POST(request:Request){
 try{
  requireSameOrigin(request);const c=command.parse(await request.json());
  if(c.action==='request')return lmsResponse(await sendGuestCode(c.email,request));
  await verifyGuestCode(c.challengeId,c.code);
  return lmsResponse({ok:true});
 }catch(e){return lmsFailure(e instanceof z.ZodError?new LmsError('이메일 주소와 6자리 인증번호를 확인해주세요.'):e);}
}
export async function DELETE(request:Request){
 try{requireSameOrigin(request);try{await guestSessionCommand('logout');}catch(e){if(!(e instanceof LmsError&&e.status===401))throw e;}
  (await cookies()).set(guestCookie,'',{path:'/api/lms/guest-lookup',maxAge:0,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict'});
  return lmsResponse({ok:true});
 }catch(e){return lmsFailure(e);}
}
