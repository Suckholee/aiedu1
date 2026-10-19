'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import {usePlatform} from '@/contexts/PlatformContext';
import {toast} from 'sonner';
import type {LearningData} from '@/lib/lms/learning-types';
export function useLearning(){
 const {lmsMember,lmsLoading,lmsError}=useAuth();const {refresh}=usePlatform();
 const [data,setData]=useState<LearningData|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);const version=useRef(0);
 const load=useCallback(async()=>{const generation=++version.current;try{
  const r=await fetch('/api/lms/learning',{cache:'no-store'});const body=await r.json();if(generation!==version.current)return;
  if(!r.ok)throw Error(body.error);setData(body);setError('');
 }catch(e){if(generation===version.current){setData(null);setError(e instanceof Error?e.message:'조회 실패');}}},[]);
 useEffect(()=>{++version.current;setData(null);setError('');if(!lmsLoading&&lmsMember)void load();return()=>{++version.current;};},[load,lmsLoading,lmsMember?.id]);
 useEffect(()=>{if(!lmsMember)return;const focus=()=>void load();window.addEventListener('focus',focus);return()=>window.removeEventListener('focus',focus);},[load,lmsMember?.id]);
 const save=async(command:object)=>{setBusy(true);const generation=version.current;try{
  const r=await fetch('/api/lms/learning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)});const result=await r.json();if(!r.ok)throw Error(result.error);
  if(generation!==version.current)return false;await load();void refresh();toast.success('저장했습니다.');return true;
 }catch(e){toast.error(e instanceof Error?e.message:'저장 실패');return false;}finally{setBusy(false);}};
 return {data:lmsMember&&data?.actor_id===lmsMember.id?data:null,error:error||(!lmsLoading&&!lmsMember?lmsError:''),busy,load,save,lmsMember,lmsLoading};
}
