import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LmsMember, LmsRole } from './types';

export class LmsError extends Error {
  constructor(message:string,public status=400){super(message);}
}
export async function currentMember():Promise<LmsMember|null> {
  const client=await createClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error || !user) return null;
  const admin=createAdminClient();
  const {data:member,error:profileError}=await admin.from('lms_profiles').select('*').eq('auth_user_id',user.id).maybeSingle();
  if(profileError) throw new LmsError('회원 정보를 조회하지 못했습니다.',503);
  if(!member || member.status!=='active') return null;
  const {data:roles,error:rolesError}=await admin.from('lms_staff_members').select('role').eq('profile_id',member.id);
  if(rolesError) throw new LmsError('권한 정보를 조회하지 못했습니다.',503);
  return {...member,roles:(roles??[]).map(r=>r.role)};
}
export async function requireMember(roles?:LmsRole[]) {
  const member=await currentMember();
  if(!member) throw new LmsError('카카오 또는 구글 계정으로 로그인하세요.',401);
  if(roles && !roles.some(r=>member.roles.includes(r))) throw new LmsError('접근 권한이 없습니다.',403);
  return member;
}
export function requireSameOrigin(request:Request) {
  const origin=request.headers.get('origin');
  // Next's internal request URL can use the bind address behind a reverse proxy.
  // The browser's Origin must match the actual Host, including the port.
  const host=request.headers.get('host')??new URL(request.url).host;
  let source:URL;
  try{source=new URL(origin??'');}catch{throw new LmsError('같은 사이트에서 요청하세요.',403);}
  const local=['localhost','127.0.0.1','[::1]'].includes(source.hostname);
  if(source.host!==host||(source.protocol!=='https:'&&!(source.protocol==='http:'&&local)))throw new LmsError('같은 사이트에서 요청하세요.',403);
}
export function lmsResponse(data:unknown,status=200) {
  return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
}
export function lmsFailure(error:unknown) {
  return lmsResponse({error:error instanceof LmsError?error.message:'처리에 실패했습니다. 잠시 후 다시 시도하세요.'},error instanceof LmsError?error.status:500);
}
