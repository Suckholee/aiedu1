import {cronAuthorized} from '@/lib/brand-blog/validation';
import {dispatchSmsJobs} from '@/lib/lms/sms';
export const runtime='nodejs';
export async function GET(request:Request){
 if(!cronAuthorized(request.headers.get('authorization'),process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 if(process.env.VERCEL_ENV!=='production')return Response.json({error:'Production only'},{status:409});
 try{return Response.json(await dispatchSmsJobs(3),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'문자 처리 결과를 확인해주세요.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
