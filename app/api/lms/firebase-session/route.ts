import {createClient} from '@/lib/supabase/server';import {createAdminClient} from '@/lib/supabase/admin';import {currentMember,requireSameOrigin,lmsResponse,lmsFailure,LmsError} from '@/lib/lms/access';
export const runtime='nodejs';
export async function POST(request:Request){try{
 requireSameOrigin(request);const client=await createClient();const {data:{user},error}=await client.auth.getUser();if(error||!user)throw new LmsError('로그인을 다시 진행하세요.',401);
 const raw=await request.text();if(raw.length>1000)throw new LmsError('입력 내용을 확인하세요.');let payload:unknown;try{payload=raw?JSON.parse(raw):{};}catch{throw new LmsError('입력 내용을 확인하세요.');}if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new LmsError('입력 내용을 확인하세요.');const mode=(payload as {mode?:unknown}).mode??'token';if(typeof mode!=='string'||!['membership','token'].includes(mode))throw new LmsError('지원하지 않는 요청입니다.');
 const admin=createAdminClient();const {data:existing,error:profileError}=await admin.from('lms_profiles').select('id,status,legacy_firebase_uid,display_name').eq('auth_user_id',user.id).maybeSingle();
 if(profileError)throw new LmsError('회원 정보를 확인하지 못했습니다.',503);if(existing?.status==='suspended')throw new LmsError('이용이 중지된 회원입니다.',403);
 const kakao=user.identities?.some(i=>i.provider==='kakao');
 // A new member needs Kakao proof here. Google members were linked by the verified Firebase bridge.
 if(!existing&&!kakao)throw new LmsError('카카오 또는 구글 계정으로 다시 인증하세요.',403);
 const firebaseUid=existing?.legacy_firebase_uid??`supabase_${user.id}`,name=existing?.display_name??String(user.user_metadata?.name??user.user_metadata?.full_name??user.user_metadata?.preferred_username??'수강생').slice(0,100);
 if(!existing){const linked=await admin.rpc('lms_link_identity',{firebase_uid:firebaseUid,auth_id:user.id,verified_email:user.email??null,member_name:name,avatar_url:user.user_metadata?.avatar_url??user.user_metadata?.picture??null});if(linked.error)throw new LmsError('기존 회원 연결을 확인하세요.',409);}
 if(mode==='membership')return lmsResponse({member:await currentMember()});
 if(existing&&!existing.legacy_firebase_uid)throw new LmsError('기존 저장소 연결을 관리자에게 확인해주세요.',409);
 const {platformAuth}=await import('@/lib/firebase-admin');const firebaseUser=await platformAuth.getUser(firebaseUid).catch(async error=>{if(error.code!=='auth/user-not-found')throw error;return platformAuth.createUser({uid:firebaseUid,displayName:name}).catch(async createError=>{if(createError.code==='auth/uid-already-exists')return platformAuth.getUser(firebaseUid);throw createError;});});
 if(firebaseUser.disabled)throw new LmsError('이용이 중지된 회원입니다.',403);
 return lmsResponse({token:await platformAuth.createCustomToken(firebaseUid,{lms_provider:kakao?'kakao':'supabase'})});
}catch(error){return lmsFailure(error);}}
