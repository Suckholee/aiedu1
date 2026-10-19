import { ZodError } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError } from '@/lib/lms/access';
import { readCatalog } from '@/lib/lms/catalog';
import { managementCommand } from '@/lib/lms/validation';
export const runtime='nodejs';
export async function GET(request:Request) {
  try {
    const member=await requireMember(['admin','operations']);
    const url=new URL(request.url);
    const {courses,cohorts}=await readCatalog();
    let members=[],totalMembers=0;
    if(member.roles.includes('admin')) {
      const client=createAdminClient();
      const page=Math.floor(Math.max(0,Math.min(10000,Number(url.searchParams.get('page'))||0)));
      const q=(url.searchParams.get('q')??'').replace(/[%_,().\\]/g,'').slice(0,100);
      let query=client.from('lms_profiles').select('*,lms_staff_members(role)',{count:'exact'}).order('created_at',{ascending:false});
      if(q)query=query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`);
      const result=await query.range(page*50,page*50+49);
      if(result.error)throw new LmsError('회원 목록을 조회하지 못했습니다.',503);
      members=(result.data??[]).map(({lms_staff_members,...p})=>({...p,roles:lms_staff_members.map(r=>r.role)}));
      totalMembers=result.count??0;
    }
    return lmsResponse({member,courses,cohorts,members,totalMembers});
  }catch(error){return lmsFailure(error);}
}
export async function POST(request:Request) {
  try {
    requireSameOrigin(request);
    const member=await requireMember(['admin','operations']);
    const command=managementCommand.parse(await request.json());
    if(['roles','member'].includes(command.action)&&!member.roles.includes('admin'))throw new LmsError('관리자 권한이 필요합니다.',403);
    const {data,error}=await createAdminClient().rpc('lms_manage',{command,actor:member.id});
    if(error) {
      if(error.code==='23505')throw new LmsError('같은 주소 또는 중복된 기록이 있습니다.');
      if(error.code==='P0001')throw new LmsError(error.message);
      throw new LmsError('저장할 값과 연결 상태를 확인하세요.');
    }
    return lmsResponse({id:data});
  }catch(error){return lmsFailure(error instanceof ZodError?new LmsError(error.issues[0]?.message??'입력값을 확인하세요.'):error);}
}
