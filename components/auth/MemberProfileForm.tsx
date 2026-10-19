'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { INDUSTRIES, PROFILE_PRIVACY_VERSION, memberProfileInput } from '@/lib/lms/profile';
import type { LmsMember } from '@/lib/lms/types';

const field = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal';
export function MemberProfileForm({ member, onSaved }: { member: LmsMember; onSaved?: () => void }) {
  const { reconnectLms } = useAuth();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const [privacy, setPrivacy] = useState(member.privacy_consent_version === PROFILE_PRIVACY_VERSION);
  const [alimtalk, setAlimtalk] = useState(member.service_alimtalk_opt_in ?? false);
  const [marketing, setMarketing] = useState(member.marketing_opt_in ?? false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(''); setSaved(false);
    const form = new FormData(event.currentTarget);
    const result = memberProfileInput.safeParse({
      display_name: form.get('display_name'), phone: form.get('phone'), industry: form.get('industry'),
      company: form.get('company'), job_title: form.get('job_title'),
      privacy_version: PROFILE_PRIVACY_VERSION, consent_to_privacy: privacy,
      service_alimtalk_opt_in: alimtalk, marketing_opt_in: marketing,
    });
    if (!result.success) { setError(result.error.issues[0].message); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/lms/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result.data), signal: AbortSignal.timeout(20000) });
      const body = await response.json();
      if (!response.ok) throw Error(body.error ?? '회원 정보를 저장하지 못했습니다.');
      await reconnectLms(); setSaved(true); onSaved?.();
    } catch (e) { setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : '연결이 지연되었습니다. 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="space-y-5">
    <p className="text-sm text-slate-500">로그인 계정 <span className="break-all font-medium text-slate-700">{member.email ?? '카카오 계정'}</span></p>
    <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2 disabled:opacity-60">
      <label className="text-sm font-semibold">이름 <span className="text-rose-600">*</span><input name="display_name" autoComplete="name" className={field} defaultValue={member.display_name} minLength={2} maxLength={100} required placeholder="수강하실 분의 이름"/></label>
      <label className="text-sm font-semibold">휴대전화 <span className="text-rose-600">*</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" className={field} defaultValue={member.phone ?? ''} maxLength={20} required placeholder="010-1234-5678"/><span className="mt-1 block text-xs font-normal text-slate-500">수강 안내를 받을 번호를 정확히 입력해 주세요.</span></label>
      <label className="text-sm font-semibold sm:col-span-2">업종·활동 분야 <span className="text-rose-600">*</span><select name="industry" className={field} defaultValue={member.industry ?? ''} required><option value="" disabled>업종을 선택해 주세요</option>{INDUSTRIES.map(industry => <option key={industry} value={industry}>{industry}</option>)}</select></label>
      <label className="text-sm font-semibold">회사·기관명 <span className="font-normal text-slate-400">(선택)</span><input name="company" autoComplete="organization" className={field} defaultValue={member.company ?? ''} maxLength={200} placeholder="회사명 또는 소속"/></label>
      <label className="text-sm font-semibold">직무·직책 <span className="font-normal text-slate-400">(선택)</span><input name="job_title" autoComplete="organization-title" className={field} defaultValue={member.job_title ?? ''} maxLength={100} placeholder="예: 대표, 마케터, 강사"/></label>
    </fieldset>
    <fieldset disabled={busy} className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
      <legend className="sr-only">개인정보와 연락 수신 설정</legend>
      <details className="text-xs leading-relaxed text-slate-600"><summary className="cursor-pointer font-semibold">개인정보 수집·이용 내용 보기</summary><dl className="mt-3 space-y-2"><div><dt className="font-semibold">수집 항목</dt><dd>필수: 이름, 로그인 계정 이메일(제공된 경우), 휴대전화, 업종. 선택: 회사·기관명, 직무·직책.</dd></div><div><dt className="font-semibold">이용 목적</dt><dd>회원 식별, 교육과정 운영·상담, 수강신청·결제·수업 일정 안내. 교육 소식·이벤트 안내는 별도 선택 동의 시에만 이용합니다.</dd></div><div><dt className="font-semibold">보유 기간 및 동의 거부</dt><dd>회원 탈퇴 시까지 보관하며, 법령에 따라 보존해야 하는 거래 기록은 해당 기간 보관합니다. 필수 항목 동의를 거부할 수 있으나 회원 정보 등록이 제한됩니다. 선택 항목을 입력하거나 선택 수신에 동의하지 않아도 수강 서비스를 이용할 수 있습니다.</dd></div></dl></details>
      <label className="flex items-start gap-2.5"><input className="mt-1 size-4 shrink-0" type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} required/><span>[필수] 개인정보 수집·이용에 동의합니다.</span></label>
      <label className="flex items-start gap-2.5"><input className="mt-1 size-4 shrink-0" type="checkbox" checked={alimtalk} onChange={e => setAlimtalk(e.target.checked)}/><span>[선택] 카카오 알림톡으로 수강신청·결제·수업 일정 안내를 받겠습니다.</span></label>
      <label className="flex items-start gap-2.5"><input className="mt-1 size-4 shrink-0" type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}/><span>[선택] 교육 소식·이벤트 등 광고성 정보 수신에 동의합니다.</span></label>
      <p className="text-xs text-slate-500">선택 수신 설정은 내 회원정보에서 언제든 변경할 수 있습니다.</p>
    </fieldset>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {saved && <p role="status" className="text-sm text-emerald-700">회원 정보를 저장했습니다.</p>}
    <button type="submit" disabled={busy} className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? '회원 정보 저장 중…' : member.profile_completed_at ? '회원 정보·수신 설정 저장' : '회원 정보 등록 완료'}</button>
  </form>;
}
