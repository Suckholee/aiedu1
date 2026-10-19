'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { normalizeReferralCode } from '@/lib/lms/referrals';
export function ReferralCodeField({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const [name, setName] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const inputId = useId();
  const version = useRef(0);
  useEffect(() => { version.current++; setName(''); setError(''); setBusy(false); }, [value]);
  async function check() {
    const run = ++version.current; setBusy(true); setError(''); setName('');
    try {
      const response = await fetch('/api/lms/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: value }), signal: AbortSignal.timeout(15000) });
      const body = await response.json();
      if (run !== version.current) return;
      if (!response.ok) throw Error(body.error ?? '추천코드를 확인해 주세요.');
      setName(body.referrer_name);
    } catch (e) { if (run === version.current) setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : '연결을 다시 확인해 주세요.'); }
    finally { if (run === version.current) setBusy(false); }
  }
  return <div className="space-y-2 sm:col-span-2"><label htmlFor={inputId} className="block text-sm font-semibold">추천코드 <span className="font-normal text-slate-400">(추천인이 있는 경우)</span></label><div className="mt-2 flex gap-2"><input id={inputId} aria-label="추천코드" autoCapitalize="characters" autoCorrect="off" spellCheck={false} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm" value={value} maxLength={30} onChange={e => { version.current++; onValueChange(normalizeReferralCode(e.target.value)); }} placeholder="NP-XXXXXXXXXXXX"/><button type="button" disabled={busy || !value} onClick={() => void check()} className="shrink-0 rounded-xl border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-600 disabled:opacity-50">{busy ? '확인 중' : '추천인 확인'}</button></div>
    {name ? <p role="status" className="text-sm font-semibold text-emerald-700">추천인: {name} · 확인되었습니다.</p> : <p className="text-xs text-slate-500">추천인의 개인 코드를 입력해 주세요. 추천인이 없으면 비워두셔도 됩니다.</p>}
    {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
  </div>;
}
