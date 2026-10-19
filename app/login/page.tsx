'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';
import { AuthModal } from '@/components/auth/AuthModal';

export default function EmailLoginPage() {
  const [social, setSocial] = useState(false);
  return <section className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
    <header className="space-y-3"><Link href="/" className="text-sm font-semibold text-indigo-700">← 네오앤피터 홈</Link><h1 className="pt-2 text-2xl font-bold">이메일 로그인</h1><p className="text-sm text-slate-500">수강신청과 결제 내역을 확인하세요.</p></header>
    <EmailLoginForm onSuccess={() => window.location.replace('/my-applications')}/>
    <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={() => setSocial(true)}>카카오·구글로 회원가입·로그인</button>
    <AuthModal open={social} onOpenChange={setSocial}/>
  </section>;
}
