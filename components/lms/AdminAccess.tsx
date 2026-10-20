'use client';
import { useEffect,useState } from 'react';
import { useRouter,usePathname } from 'next/navigation';
import {RosterCodeAccess} from './RosterCodeAccess';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
export function AdminAccess(){
  const {user,lmsMember,lmsLoading,lmsError,reconnectLms}=useAuth();
  const [open,setOpen]=useState(false);
  const router=useRouter();
  const pathname=usePathname();
  useEffect(()=>{if(lmsMember?.roles.length)router.refresh();},[lmsMember?.id,lmsMember?.roles.join(','),router]);
  if(pathname==='/admin/learning')return <RosterCodeAccess/>;
  return <section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 space-y-4">
    <h1 className="text-2xl font-bold">교육 운영 관리</h1>
    <p className="text-slate-600">관리자·운영·회계 담당 계정으로 로그인하세요.</p>
    {lmsLoading?<p role="status">회원 권한을 확인하고 있습니다.</p>:<p role="status">{lmsError|| (user?'이 계정에 관리 권한이 없습니다. 관리자에게 문의하세요.':'카카오 또는 구글 계정으로 로그인하세요.')}</p>}
    <div className="flex gap-3"><button className="rounded-lg bg-indigo-600 px-4 py-2 text-white" onClick={()=>setOpen(true)}>로그인</button>{user&&<button onClick={()=>void reconnectLms()}>다시 연결</button>}<Link className="p-2" href="/">홈으로</Link></div>
    <AuthModal open={open} onOpenChange={setOpen}/>
  </section>;
}
