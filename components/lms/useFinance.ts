'use client';
import {useCallback,useEffect,useRef,useState} from 'react';import {useAuth} from '@/contexts/AuthContext';import {toast} from 'sonner';import type {FinanceData} from '@/lib/lms/finance-types';
export function useFinance(search:string,cohort:string,page:number){
 const {lmsMember,lmsLoading,lmsError}=useAuth();const [data,setData]=useState<FinanceData|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);const version=useRef(0),intent=useRef(new Map<string,string>());
 const load=useCallback(async()=>{const generation=++version.current;try{const r=await fetch(`/api/lms/finance?q=${encodeURIComponent(search)}&cohort=${encodeURIComponent(cohort)}&page=${page}`,{cache:'no-store'});const body=await r.json();if(generation!==version.current)return;if(!r.ok)throw Error(body.error);setData(body);setError('');}catch(e){if(generation===version.current){setData(null);setError(e instanceof Error?e.message:'조회 실패');}}},[search,cohort,page]);
 useEffect(()=>{++version.current;setData(null);if(!lmsLoading&&lmsMember)void load();return()=>{++version.current;};},[load,lmsLoading,lmsMember?.id]);
 const save=async(input:Record<string,unknown>)=>{setBusy(true);const generation=version.current;const key=JSON.stringify(input);let command=input;
  if(['refund_request','settlement_confirm'].includes(String(input.action))){if(!intent.current.has(key))intent.current.set(key,crypto.randomUUID());command={...input,idempotency_key:intent.current.get(key)};}
  try{const r=await fetch('/api/lms/finance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)});const body=await r.json();if(!r.ok)throw Error(body.error);if(generation!==version.current)return false;intent.current.delete(key);await load();toast.success('저장했습니다.');return true;}catch(e){toast.error(e instanceof Error?e.message:'저장 실패');return false;}finally{setBusy(false);}
 };
 return {data:lmsMember&&data?.actor_id===lmsMember.id?data:null,error:error||(!lmsLoading&&!lmsMember?lmsError:''),busy,load,save,lmsMember,lmsLoading};
}
