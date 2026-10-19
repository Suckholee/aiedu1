import 'server-only';
import {currentMember,LmsError} from './lms/access';import {identityFromMember,type PlatformIdentity} from './lms/platform-identity';import {createAdminClient} from './supabase/admin';
export {isPlatformAdmin,visiblePlatform} from './lms/platform-identity';
export async function platformIdentity(request:Request):Promise<PlatformIdentity|null>{
 // Supabase is authoritative. A missing/expired Firebase browser session must not hide a valid LMS member.
 const member=await currentMember();if(member)return identityFromMember(member);
 const header=request.headers.get('authorization');if(!header)return null;
 if(!header.startsWith('Bearer '))throw new LmsError('로그인을 다시 확인하세요.',401);
 const {platformAuth}=await import('./firebase-admin');
 const user=await platformAuth.verifyIdToken(header.slice(7),true).catch(()=>{throw new LmsError('로그인을 다시 확인하세요.',401);});
 // Firebase custom compatibility tokens cannot independently replace the Supabase session.
 if(user.firebase.sign_in_provider!=='google.com'||!user.email_verified)throw new LmsError('카카오 또는 구글 계정으로 다시 로그인하세요.',401);
 const {data:profile,error}=await createAdminClient().from('lms_profiles').select('id,status,auth_user_id,lms_staff_members(role)').eq('legacy_firebase_uid',user.uid).maybeSingle();
 if(error)throw new LmsError('권한 정보를 확인하지 못했습니다.',503);
 if(profile?.status==='suspended')throw new LmsError('이용이 중지된 회원입니다.',403);
 return {uid:user.uid,email:user.email,email_verified:!!user.email_verified,lmsRoles:(profile?.lms_staff_members??[]).map(r=>r.role),lmsProfileId:profile?.id??null};
}
