import type {LmsMember} from './types';import type {PlatformData} from '../platform-types';
export type PlatformIdentity={uid:string;email:string|null|undefined;email_verified:boolean;lmsRoles:string[];lmsProfileId:string|null};
export const identityFromMember=(member:LmsMember):PlatformIdentity=>({uid:member.legacy_firebase_uid??`supabase_${member.auth_user_id}`,email:member.email,email_verified:!!member.email,lmsRoles:member.roles,lmsProfileId:member.id});
export const isPlatformAdmin=(user:PlatformIdentity|null)=>!!user&&user.lmsRoles.some(r=>r==='admin'||r==='operations');
export function visiblePlatform(data:PlatformData,user:PlatformIdentity|null):PlatformData{
 const actorId=user?.lmsProfileId??null;
 if(isPlatformAdmin(user))return {...data,actorId};
 const enrollments=user?.lmsProfileId?data.enrollments.filter(e=>e.learnerId===user.lmsProfileId).map(e=>({...e,notes:[]})):[];
 return {...data,actorId,courses:data.courses.filter(c=>c.published),promotionPosts:data.promotionPosts.filter(p=>p.status==='게시 완료'),reviews:data.reviews.filter(r=>r.approved),logs:[],enrollments,materials:data.materials.filter(m=>enrollments.some(e=>e.courseId===m.courseId&&['승인','수료'].includes(e.status)&&(!e.accessUntil||Date.parse(e.accessUntil)>Date.now())))};
}
