import {requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
import {createAdminClient} from '@/lib/supabase/admin';
import {blogCommand} from '@/lib/brand-blog/validation';
import {runBrandBlog} from '@/lib/brand-blog/generate';
export const runtime='nodejs';export const maxDuration=60;
export async function GET(request:Request){try{
 await requireMember(['admin','operations']);const url=new URL(request.url),page=Math.max(0,Math.min(10000,Number(url.searchParams.get('page'))||0));
 const client=createAdminClient();const [settings,posts,runs]=await Promise.all([client.from('brand_blog_settings').select('*').eq('id',1).single(),client.from('brand_blog_posts').select('*',{count:'exact'}).order('created_at',{ascending:false}).range(page*20,page*20+19),client.from('brand_blog_runs').select('id,job_day,status,attempts,started_at,finished_at,error,post_id,model,input_tokens,output_tokens').order('job_day',{ascending:false}).limit(10)]);
 if(settings.error||posts.error||runs.error)throw new LmsError('블로그 운영 데이터를 불러오지 못했습니다.',503);
 return lmsResponse({settings:settings.data,posts:posts.data,runs:runs.data,total:posts.count??0});
}catch(e){return lmsFailure(e);}}
export async function POST(request:Request){try{
 requireSameOrigin(request);const member=await requireMember(['admin','operations']);const parsed=blogCommand.safeParse(await request.json());if(!parsed.success)throw new LmsError(parsed.error.issues[0]?.message??'입력값을 확인하세요.');
 const command=parsed.data;
 if(command.action==='generate')return lmsResponse(await runBrandBlog('manual',member.id));
 if(command.action==='edit'){
  const {data:post,error}=await createAdminClient().from('brand_blog_posts').select('sources').eq('id',command.id).single();if(error||!post)throw new LmsError('글을 찾을 수 없습니다.');
  const ids=new Set(post.sources.map((s:any)=>s.id));if(command.article.sections.some(s=>!s.source_ids.length||s.source_ids.some(id=>!ids.has(id))))throw new LmsError('본문의 출처 연결을 확인하세요.');
 }
 const {error}=await createAdminClient().rpc('brand_blog_manage',{command,actor:member.id});if(error)throw new LmsError(error.code==='P0001'?error.message:'블로그 변경을 저장하지 못했습니다.');
 return lmsResponse({success:true});
}catch(e){return lmsFailure(e instanceof LmsError?e:new LmsError(e instanceof Error?e.message:'블로그 처리 실패',503));}}
