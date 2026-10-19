'use client';

import { useId, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function EmailLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const id = useId();
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const field = 'mt-1 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

  return <form className="space-y-4 text-left" onSubmit={async event => {
    event.preventDefault();
    if (busy || loading) return;
    setBusy(true); setError('');
    try { await signInWithEmail(email.trim(), password); onSuccess(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '로그인을 다시 시도해 주세요.'); }
    finally { setPassword(''); setBusy(false); }
  }}>
    <p className="text-xs leading-relaxed text-slate-500">등록된 이메일 계정으로 로그인합니다. 처음 방문한 분은 카카오·구글로 가입해 주세요.</p>
    <label htmlFor={`${id}-email`} className="block text-sm font-semibold">이메일<input id={`${id}-email`} className={field} type="email" autoComplete="username" maxLength={320} value={email} onChange={event => setEmail(event.target.value)} required placeholder="name@example.com" disabled={busy || loading}/></label>
    <div><label htmlFor={`${id}-password`} className="block text-sm font-semibold">비밀번호</label><div className="relative"><input id={`${id}-password`} className={`${field} pr-16`} type={visible ? 'text' : 'password'} autoComplete="current-password" maxLength={128} value={password} onChange={event => setPassword(event.target.value)} required disabled={busy || loading}/><button type="button" className="absolute inset-y-0 right-3 text-xs text-slate-500" aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'} onClick={() => setVisible(!visible)}>{visible ? '숨기기' : '보기'}</button></div></div>
    {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    <button type="submit" disabled={busy || loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy || loading ? '확인 중…' : '이메일로 로그인'}</button>
    <p className="text-xs text-slate-500">등록된 계정의 비밀번호 재설정은 운영 담당자에게 요청해 주세요.</p>
  </form>;
}
