'use client';
import { MyReferralCode } from '@/components/auth/MyReferralCode';
import { useAuth } from '@/contexts/AuthContext';
import { MemberAccessPrompt } from '@/components/auth/MemberAccessPrompt';
import { MemberProfileForm } from '@/components/auth/MemberProfileForm';
export default function MyProfile() {
  const { lmsMember, lmsLoading } = useAuth();
  return <div className="mx-auto max-w-2xl space-y-6 pb-12"><header><p className="text-sm font-semibold text-indigo-600">나의 회원정보</p><h1 className="mt-2 text-3xl font-bold">회원 정보·연락 수신 설정</h1><p className="mt-3 text-sm text-slate-500">수강 안내를 받을 연락처와 업종을 등록하고 변경할 수 있습니다.</p></header>
    {lmsMember?.referral_code&&<MyReferralCode code={lmsMember.referral_code}/>}
    <MemberAccessPrompt purpose="회원 정보"/>
    {lmsLoading && <p role="status">회원 정보를 확인하고 있습니다.</p>}
    {lmsMember && <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"><MemberProfileForm key={lmsMember.id} member={lmsMember}/></section>}
  </div>;
}
