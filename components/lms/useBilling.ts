'use client';
import {useCallback,useEffect,useRef,useState} from 'react';import {useAuth} from '@/contexts/AuthContext';import type {BillingData} from '@/lib/lms/checkout-types';
export function useBilling(){const {lmsMember,lmsLoading,lmsError}=useAuth();const [data,setData]=useState<BillingData|null>(null),[error,setError]=useState('');const version=useRef(0);
 const load=useCallback(async()=>{const v=++version.current;try{const r=await fetch('/api/lms/billing',{cache:'no-store'});const b=await r.json();if(v!==version.current)return;if(!r.ok)throw Error(b.error);setData(b);setError('');}catch(e){if(v===version.current){setData(null);setError(e instanceof Error?e.message:'신청 내역을 불러오지 못했습니다.');}}},[]);
 useEffect(()=>{++version.current;setData(null);setError('');if(!lmsLoading&&lmsMember)void load();return()=>{++version.current;};},[lmsLoading,lmsMember?.id,load]);
 useEffect(()=>{if(!lmsMember)return;const focus=()=>void load();window.addEventListener('focus',focus);return()=>window.removeEventListener('focus',focus);},[load,lmsMember?.id]);
 return {data:lmsMember&&data?.actor_id===lmsMember.id?data:null,error:error||(!lmsLoading&&!lmsMember?lmsError:''),load,lmsMember,lmsLoading};
}
