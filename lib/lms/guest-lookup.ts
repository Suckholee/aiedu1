import 'server-only';
import {createHash,createHmac,randomBytes,randomInt,randomUUID} from 'node:crypto';
import nodemailer from 'nodemailer';
import {cookies} from 'next/headers';
import {createAdminClient} from '@/lib/supabase/admin';
import {LmsError} from './access';
export const guestCookie='np_guest_lookup';
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
function protectedHash(value:string){
 const key=process.env.SUPABASE_SECRET_KEY;
 if(!key)throw new LmsError('인증 설정을 확인하지 못했습니다.',503);
 return createHmac('sha256',key).update(`guest-lookup:${value}`).digest('hex');
}
export async function guestCommand(command:Record<string,unknown>){
 const {data,error}=await createAdminClient().rpc('lms_guest_lookup',{command});
 if(error)throw new LmsError('비회원 조회 연결을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',503);
 return data;
}
export async function sendGuestCode(email:string,request:Request){
 const user=process.env.GMAIL_USER,password=process.env.GMAIL_APP_PASSWORD;
 if(!user||!password)throw new LmsError('이메일 인증 발송을 준비 중입니다. 담당자에게 문의해주세요.',503);
 const id=randomUUID(),code=String(randomInt(0,1_000_000)).padStart(6,'0');
 // Vercel overwrites this header; do not trust arbitrary forwarded IPs elsewhere.
 const ip=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()??'unknown':'local';
 const result=await guestCommand({action:'request',id,email,code_hash:protectedHash(`${id}:${code}`),ip_hash:protectedHash(`ip:${ip}`)});
 if(result.limited)throw new LmsError('인증번호 요청이 많습니다. 잠시 후 다시 시도해주세요. 재발송은 1분 후 가능합니다.',429);
 const mail=nodemailer.createTransport({service:'gmail',auth:{user,pass:password},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
 try{await mail.sendMail({from:{name:'네오앤피터 교육',address:user},to:email,subject:'[네오앤피터] 비회원 신청 조회 인증번호',text:`비회원 수강신청 조회 인증번호는 ${code} 입니다.\n10분 안에 입력해주세요. 인증번호를 다른 사람에게 알려주지 마세요.\n직접 요청하지 않았다면 이 메일을 무시해주세요. 회원가입은 진행되지 않습니다.`});}
 catch{throw new LmsError('인증 메일을 보내지 못했습니다. 1분 후 다시 요청해주세요.',503);}
 finally{mail.close();}
 return {challengeId:id,expiresIn:600};
}
export async function verifyGuestCode(id:string,code:string){
 const token=randomBytes(32).toString('hex');
 const result=await guestCommand({action:'verify',id,code_hash:protectedHash(`${id}:${code}`),session_hash:digest(token)});
 if(!result.verified)throw new LmsError('인증번호가 올바르지 않거나 만료되었습니다. 5회 실패 시 새 번호를 요청해주세요.',400);
 (await cookies()).set(guestCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/lms/guest-lookup',maxAge:1800});
}
export async function guestSessionCommand(action:'list'|'logout'){
 const token=(await cookies()).get(guestCookie)?.value;
 if(!token||! /^[a-f0-9]{64}$/.test(token))throw new LmsError('이메일 인증 후 신청 내역을 확인해주세요.',401);
 const result=await guestCommand({action,session_hash:digest(token)});
 if(result.unauthorized)throw new LmsError('조회 시간이 만료되었습니다. 이메일 인증을 다시 해주세요.',401);
 return result;
}
