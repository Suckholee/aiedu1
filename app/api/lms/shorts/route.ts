import {ZodError} from 'zod';
import {createAdminClient} from '@/lib/supabase/admin';
import {LmsError,requireMember,requireSameOrigin,lmsResponse,lmsFailure} from '@/lib/lms/access';
import {SHORTS_BUCKET,shortsCommand} from '@/lib/lms/shorts-validation';
export const runtime='nodejs';
export async function GET(request:Request){
 try{
  const staff=new URL(request.url).searchParams.get('manage')==='1';
  if(staff)await requireMember(['admin','operations']);
  const db=createAdminClient();let query=db.from('lms_shorts').select('*').order('position').order('created_at',{ascending:false}).limit(100);
  if(!staff)query=query.eq('published',true);
  const {data,error}=await query;if(error)throw new LmsError('쇼츠를 불러오지 못했습니다.',503);
  const paths=(data??[]).flatMap(row=>[row.video_path,row.poster_path]);
  const signed=paths.length?await db.storage.from(SHORTS_BUCKET).createSignedUrls(paths,3600):{data:[],error:null};
  if(signed.error||signed.data?.some(row=>row.error))throw new LmsError('영상 연결을 확인해주세요.',503);
  const urls=new Map<string,string>(signed.data?.filter(row=>row.path&&row.signedUrl).map(row=>[row.path!,row.signedUrl!] as [string,string]));
  return lmsResponse({shorts:(data??[]).map(row=>({id:row.id,title:row.title,description:row.description,duration_seconds:row.duration_seconds,position:row.position,published:row.published,video_url:urls.get(row.video_path),poster_url:urls.get(row.poster_path),...(staff?{video_path:row.video_path,poster_path:row.poster_path}:{})}))});
 }catch(e){return lmsFailure(e);}
}
export async function POST(request:Request){
 try{
  requireSameOrigin(request);const member=await requireMember(['admin','operations']);
  const c=shortsCommand.parse(await request.json()),db=createAdminClient();
  if(c.action==='upload'){
   const ext=c.type==='video/mp4'?'mp4':c.type==='image/jpeg'?'jpg':c.type.split('/')[1];
   const path=`${member.id}/${crypto.randomUUID()}.${ext}`;
   const {data,error}=await db.storage.from(SHORTS_BUCKET).createSignedUploadUrl(path);
   if(error)throw new LmsError('업로드를 준비하지 못했습니다.',503);
   return lmsResponse({path:data.path,token:data.token});
  }
  if(c.action==='save'){
   let previous:{video_path:string;poster_path:string}|null=null;
   if(c.id){const r=await db.from('lms_shorts').select('video_path,poster_path').eq('id',c.id).single();if(r.error)throw new LmsError('영상을 찾을 수 없습니다.');previous=r.data;}
   for(const key of ['video_path','poster_path'] as const){
    if(c[key]===previous?.[key])continue;
    if(!c[key].startsWith(member.id+'/'))throw new LmsError('현재 계정에서 업로드한 파일을 선택하세요.',403);
    const [folder,file]=c[key].split('/');const r=await db.storage.from(SHORTS_BUCKET).list(folder,{search:file,limit:10});const obj=r.data?.find(item=>item.name===file);
    const limit=key==='video_path'?50*1024*1024:5*1024*1024;
    if(r.error||!obj||!obj.metadata?.size||Number(obj.metadata.size)>limit)throw new LmsError('업로드된 파일과 용량을 확인하세요.');
   }
  }
  const {data,error}=await db.rpc('lms_short_manage',{command:c,actor:member.id});
  if(error)throw new LmsError(error.code==='P0001'?error.message:'영상 입력값을 확인하세요.');
  return lmsResponse({id:data});
 }catch(e){return lmsFailure(e instanceof ZodError?new LmsError(e.issues[0]?.message??'입력값을 확인하세요.'):e);}
}
