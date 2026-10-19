'use client';
import { useState } from 'react';
export function MyReferralCode({ code }: { code: string }) {
  const [status, setStatus] = useState('');
  async function copy(link = false) {
    try { await navigator.clipboard.writeText(link ? `${window.location.origin}/apply?ref=${encodeURIComponent(code)}` : code); setStatus(link ? '추천 링크를 복사했습니다.' : '추천코드를 복사했습니다.'); }
    catch { setStatus('아래 코드를 선택해 직접 복사해 주세요.'); }
  }
  return <section className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><h2 className="font-bold text-indigo-950">내 추천코드</h2><p className="text-sm text-slate-600">지인에게 공유하면 수강신청 시 나를 추천인으로 등록할 수 있습니다.</p><div className="flex flex-wrap items-center gap-3"><code className="select-all break-all rounded-lg bg-white px-3 py-2 text-lg font-bold tracking-wider text-indigo-700">{code}</code><button type="button" className="text-sm font-semibold text-indigo-700" onClick={() => void copy()}>코드 복사</button><button type="button" className="text-sm font-semibold text-indigo-700" onClick={() => void copy(true)}>추천 링크 복사</button></div>{status && <p role="status" className="text-xs text-indigo-700">{status}</p>}</section>;
}
