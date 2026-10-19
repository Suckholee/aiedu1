import {runBrandBlog} from '@/lib/brand-blog/generate';
import {cronAuthorized} from '@/lib/brand-blog/validation';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){
 if(!cronAuthorized(request.headers.get('authorization'),process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 if(process.env.VERCEL_ENV!=='production')return Response.json({error:'운영 환경에서만 자동 생성합니다.'},{status:409});
 try{return Response.json(await runBrandBlog('cron'),{headers:{'Cache-Control':'no-store'}});}catch(error){return Response.json({error:error instanceof Error?error.message:'자동 생성 실패'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
