'use client';
import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {auth} from '@/lib/firebase';import {GoogleAuthProvider,signInWithPopup,signInWithCustomToken,signOut as fbSignOut,onAuthStateChanged,type User as FirebaseUser} from 'firebase/auth';
import {createIdentityBridge,type BridgeIdentity} from '@/lib/lms/identity-bridge';
import {toast} from 'sonner';import type {LmsMember} from '@/lib/lms/types';import {createClient as createSupabaseClient} from '@/lib/supabase/client';import {safeNext} from '@/lib/lms/redirect';import {chooseSession} from '@/lib/lms/session-choice';
export interface User{uid:string;email:string|null;displayName:string|null;photoURL?:string|null;isGuest?:boolean}
interface AuthContextType{lmsMember:LmsMember|null;lmsLoading:boolean;lmsError:string;legacyError:string;reconnectLms:()=>Promise<void>;user:User|null;loading:boolean;signInWithGoogle:()=>Promise<void>;signInWithKakao:()=>Promise<void>;signInWithEmail:(email:string,password:string)=>Promise<void>;signInQuick:(name:string,email?:string)=>void;signOut:()=>Promise<void>}
const AuthContext=createContext<AuthContextType>({lmsMember:null,lmsLoading:true,lmsError:'',legacyError:'',reconnectLms:async()=>{},user:null,loading:true,signInWithGoogle:async()=>{},signInWithKakao:async()=>{},signInWithEmail:async()=>{},signInQuick:()=>{},signOut:async()=>{}});
type SyncIdentity=BridgeIdentity&{firebase:FirebaseUser|null;explicitGoogle:boolean};
const LOCAL_STORAGE_KEY='student_auth_user_v1';
async function request(path:string,init:RequestInit={},signal?:AbortSignal){const r=await fetch(path,{...init,cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)});const b=await r.json();if(!r.ok)throw Error(b.error??'회원 연결을 확인하지 못했습니다.');return b;}
export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<User|null>(null),[lmsMember,setLmsMember]=useState<LmsMember|null>(null),[loading,setLoading]=useState(true),[lmsLoading,setLmsLoading]=useState(true),[lmsError,setLmsError]=useState(''),[legacyError,setLegacyError]=useState('');
 const syncBridge=useRef<ReturnType<typeof createIdentityBridge<LmsMember|null|undefined,SyncIdentity>>|null>(null);
 const desiredUid=useRef<string|null>(null);
 const active=useRef<AbortController|null>(null),epoch=useRef(0),googlePending=useRef(false),signingOut=useRef(false),compatibility=useRef<{uid:string;promise:Promise<void>}|null>(null);
 const applyMember=(member:LmsMember)=>{const profile:User={uid:member.legacy_firebase_uid??`supabase_${member.auth_user_id}`,email:member.email,displayName:member.display_name,photoURL:member.photo_url,isGuest:false};desiredUid.current=profile.uid;setLmsMember(member);setUser(profile);setLmsError('');try{localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(profile));}catch{}};
 const restoreCompatibility=(member:LmsMember,run:number)=>{
  if(!auth)return;if(auth.currentUser?.uid===member.legacy_firebase_uid){setLegacyError('');return;}
  const uid=member.legacy_firebase_uid??`supabase_${member.auth_user_id}`;
  if(compatibility.current?.uid===uid)return;
  const job={uid,promise:Promise.resolve()};job.promise=(async()=>{try{const body=await request('/api/lms/firebase-session',{method:'POST'});if(run!==epoch.current||signingOut.current)return;await signInWithCustomToken(auth,body.token);if(desiredUid.current!==uid){if(auth.currentUser?.uid===uid)await fbSignOut(auth);return;}setLegacyError('');}catch{if(run===epoch.current)setLegacyError('사진·실습 저장소 연결을 다시 확인해주세요. 수강신청과 학습 내역은 이용할 수 있습니다.');}finally{if(compatibility.current===job)compatibility.current=null;}})();compatibility.current=job;
 };
 const performSync=async(firebase:FirebaseUser|null,explicitGoogle=false)=>{
  const run=++epoch.current;active.current?.abort();const controller=new AbortController();active.current=controller;if(explicitGoogle)setLmsMember(null);setLmsLoading(true);setLmsError('');
  try{
   const session=await request('/api/lms/session',{},controller.signal);
   let member=chooseSession(session.member,firebase?.uid??null,explicitGoogle);
   if(!member&&firebase){const linked=await request('/api/lms/session',{method:'POST',headers:{Authorization:`Bearer ${await firebase.getIdToken()}`}},controller.signal);member=linked.member;}
   if(run!==epoch.current||controller.signal.aborted)return;
   if(member){applyMember(member);restoreCompatibility(member,run);}
   else{desiredUid.current=null;setLmsMember(null);setUser(previous=>previous?.isGuest?previous:null);}
   return member??null;
  }catch(error){if(run!==epoch.current||controller.signal.aborted)return;const message=error instanceof Error&&['TimeoutError','TypeError'].includes(error.name)?'회원 연결이 지연되었습니다. 다시 시도해주세요.':error instanceof Error?error.message:'회원 연결을 확인하지 못했습니다.';desiredUid.current=null;setLmsMember(null);setUser(previous=>previous?.isGuest?previous:null);setLmsError(message);if(explicitGoogle)throw Error(message);}
  finally{if(run===epoch.current){active.current=null;setLmsLoading(false);setLoading(false);}}
 };
 if(!syncBridge.current)syncBridge.current=createIdentityBridge<LmsMember|null|undefined,SyncIdentity>(identity=>performSync(identity.firebase,identity.explicitGoogle));
 const synchronize=(firebase:FirebaseUser|null,explicitGoogle=false)=>syncBridge.current!.run({uid:`${explicitGoogle?'google':'restore'}:${firebase?.uid??'none'}`,firebase,explicitGoogle,getIdToken:async()=>''});
 const reconnectLms=async()=>{await synchronize(auth?.currentUser??null).catch(()=>{});};
 useEffect(()=>{
  try{const cached=JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)??'null');if(cached?.isGuest||cached?.uid?.startsWith('quick_'))setUser({...cached,isGuest:true});}catch{}
  const listener=async(fb:FirebaseUser|null)=>{if(googlePending.current)return;if(signingOut.current){++epoch.current;active.current?.abort();setUser(null);setLmsMember(null);setLmsLoading(false);setLoading(false);return;}if(window.location.pathname.startsWith('/auth/')){setLoading(false);setLmsLoading(false);return;}await synchronize(fb);};
  const unsubscribe=auth?onAuthStateChanged(auth,fb=>{void listener(fb).catch(()=>{});}):()=>{};
  if(!window.location.pathname.startsWith('/auth/'))void synchronize(auth?.currentUser??null).catch(()=>{});
  const focus=()=>{if(!googlePending.current&&!signingOut.current&&!window.location.pathname.startsWith('/auth/'))void synchronize(auth?.currentUser??null).catch(()=>{});};window.addEventListener('focus',focus);
  return()=>{unsubscribe();syncBridge.current?.cancel();++epoch.current;active.current?.abort();window.removeEventListener('focus',focus);};
 },[]);
 const signInWithGoogle=async()=>{let completed=false;googlePending.current=true;desiredUid.current=null;setLoading(true);++epoch.current;active.current?.abort();try{if(!auth)throw Error('구글 로그인 연결을 다시 시도해주세요.');const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await signInWithPopup(auth,provider);const member=await synchronize(result.user,true);if(!member)throw Error('회원 연결을 완료하지 못했습니다. 다시 시도해주세요.');completed=true;toast.success(`${member.display_name}님, 환영합니다!`);}finally{googlePending.current=false;setLoading(false);if(!completed)void synchronize(auth?.currentUser??null).catch(()=>{});}};
 const signInWithKakao=async()=>{setLoading(true);try{const providers=await request('/api/auth/providers');if(!providers.kakao)throw Error('카카오 로그인 연결을 준비하고 있습니다.');const next=safeNext(window.location.pathname+window.location.search);const {error}=await createSupabaseClient().auth.signInWithOAuth({provider:'kakao',options:{redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`}});if(error)throw Error('카카오 로그인을 다시 시도해주세요.');}catch(error){setLoading(false);throw error;}};
 const signInWithEmail=async(email:string,password:string)=>{
  let authenticated=false,completed=false;googlePending.current=true;setLoading(true);syncBridge.current?.cancel();++epoch.current;active.current?.abort();
  try{
   const client=createSupabaseClient();const {error}=await client.auth.signInWithPassword({email,password});
   if(error)throw Error('이메일 또는 비밀번호를 확인해 주세요. 등록된 이메일 계정에서만 이용할 수 있습니다.');
   authenticated=true;
   await request('/api/lms/firebase-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'membership'})});
   const member=await synchronize(null);if(!member)throw Error('회원 연결을 완료하지 못했습니다. 다시 로그인해 주세요.');
   completed=true;toast.success(`${member.display_name}님, 환영합니다!`);
  }catch(error){
   if(authenticated){await createSupabaseClient().auth.signOut({scope:'local'});setLmsMember(null);setUser(null);}
   throw error;
  }finally{googlePending.current=false;setLoading(false);if(!completed)void synchronize(auth?.currentUser??null).catch(()=>{});}
 };
 const signInQuick=(name:string,email?:string)=>{if(lmsLoading||lmsMember){toast.info('현재 계정에서 로그아웃한 뒤 로컬 실습을 시작해주세요.');return;}const profile:User={uid:`quick_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,displayName:name.trim()||'수강생',email:email?.trim()||null,photoURL:null,isGuest:true};setUser(profile);try{localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(profile));}catch{}toast.success('로컬 실습 프로필을 열었습니다.');};
 const signOut=async()=>{signingOut.current=true;desiredUid.current=null;syncBridge.current?.cancel();++epoch.current;active.current?.abort();try{await request('/api/lms/session',{method:'DELETE'});if(auth)await fbSignOut(auth);setUser(null);setLmsMember(null);setLmsError('');setLegacyError('');setLmsLoading(false);localStorage.removeItem(LOCAL_STORAGE_KEY);toast.info('로그아웃되었습니다.');if(window.location.pathname.startsWith('/admin'))window.location.replace('/');}catch(error){toast.error(error instanceof Error?error.message:'로그아웃을 다시 시도해주세요.');}finally{signingOut.current=false;setLoading(false);}};
 return <AuthContext.Provider value={{user,lmsMember,lmsLoading,lmsError,legacyError,loading,reconnectLms,signInWithGoogle,signInWithKakao,signInWithEmail,signInQuick,signOut}}>{legacyError&&<div role="status" className="bg-amber-50 p-3 text-sm text-amber-800">{legacyError} <button onClick={()=>void reconnectLms()}>다시 연결</button></div>}{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
