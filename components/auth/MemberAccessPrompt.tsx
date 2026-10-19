'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';

/** Wait for session restoration before prompting; dismissing never causes a loop. */
export function MemberAccessPrompt({ purpose }: { purpose: string }) {
  const { lmsMember, lmsLoading, lmsError, reconnectLms } = useAuth();
  const [open, setOpen] = useState(false);
  const prompted = useRef(false);

  useEffect(() => {
    if (lmsLoading || lmsError || prompted.current) return;
    prompted.current = true;
    if (!lmsMember) setOpen(true);
  }, [lmsLoading, lmsError, lmsMember]);

  return <>
    {!lmsMember && !lmsLoading && <section className="rounded-2xl border border-slate-200 bg-white p-6">
      {lmsError ? <>
        <h2 className="font-bold">로그인 상태를 확인하지 못했습니다.</h2>
        <p role="alert" className="mt-2 text-sm text-slate-500">{lmsError}</p>
        <button type="button" onClick={() => void reconnectLms()} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">로그인 상태 다시 확인</button>
      </> : <>
        <h2 className="font-bold">로그인 후 {purpose}을 확인할 수 있습니다.</h2>
        <p className="mt-2 text-sm text-slate-500">수강신청에 사용한 카카오·구글 계정으로 로그인해 주세요.</p>
        <button type="button" onClick={() => setOpen(true)} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">로그인하고 내역 확인</button>
      </>}
    </section>}
    <AuthModal open={open && !lmsMember} onOpenChange={setOpen} memberPurpose={purpose}/>
  </>;
}
