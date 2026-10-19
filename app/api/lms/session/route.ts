import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { currentMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError } from '@/lib/lms/access';
export const runtime='nodejs';
export async function GET() {
  try{return lmsResponse({member:await currentMember()});}catch(error){return lmsFailure(error);}
}
export async function POST(request:Request) {
  try {
    requireSameOrigin(request);
    const bearer=request.headers.get('authorization');
    if(!bearer?.startsWith('Bearer '))throw new LmsError('Google 계정으로 로그인하세요.',401);
    const {platformAuth}=await import('@/lib/firebase-admin');
    const token=await platformAuth.verifyIdToken(bearer.slice(7),true).catch(()=>{throw new LmsError('로그인을 다시 확인하세요.',401);});
    if(!token.email_verified||!token.email||token.firebase.sign_in_provider!=='google.com')throw new LmsError('카카오 또는 구글 로그인 버튼으로 다시 인증하세요.',401);
    const admin=createAdminClient();
    const {data:old,error:lookupError}=await admin.from('lms_profiles').select('id,status,auth_user_id,email').eq('legacy_firebase_uid',token.uid).maybeSingle();
    if(lookupError)throw new LmsError('회원 연결을 확인하지 못했습니다.',503);
    if(old?.status==='suspended')throw new LmsError('이용이 중지된 회원입니다.',403);
    const current=await currentMember();
    if(current?.legacy_firebase_uid===token.uid)return lmsResponse({member:current});
    if(old?.auth_user_id) {
      const existing=await admin.auth.admin.getUserById(old.auth_user_id);
      if(existing.error||existing.data.user.email?.toLowerCase()!==token.email.toLowerCase())throw new LmsError('계정 이메일 변경은 관리자에게 문의하세요.',409);
    }
    // Generates a one-time token without sending email. Never returned or logged.
    const link=await admin.auth.admin.generateLink({type:'magiclink',email:token.email.toLowerCase()});
    if(link.error||!link.data.properties?.hashed_token)throw new LmsError('학습 계정 연결에 실패했습니다.',503);
    const linked=await admin.rpc('lms_link_identity',{firebase_uid:token.uid,auth_id:link.data.user.id,
      verified_email:token.email.toLowerCase(),member_name:old?'':token.name??'',avatar_url:token.picture??null});
    if(linked.error)throw new LmsError('기존 회원 연결을 확인하세요.',409);
    const client=await createClient();
    const verified=await client.auth.verifyOtp({token_hash:link.data.properties.hashed_token,type:'email'});
    if(verified.error)throw new LmsError('학습 세션을 시작하지 못했습니다.',503);
    return lmsResponse({member:await currentMember()});
  }catch(error){return lmsFailure(error);}
}
export async function DELETE(request:Request) {
  try{requireSameOrigin(request);const client=await createClient();const {error}=await client.auth.signOut({scope:'local'});if(error)throw new LmsError('로그아웃을 다시 시도하세요.',503);return lmsResponse({ok:true});}catch(error){return lmsFailure(error);}
}
