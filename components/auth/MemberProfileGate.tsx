'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { profileComplete } from '@/lib/lms/profile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MemberProfileForm } from './MemberProfileForm';

export function MemberProfileGate() {
  const { lmsMember: member, signOut } = useAuth();
  const pathname = usePathname();
  if (!member || profileComplete(member) || pathname.startsWith('/auth/') || pathname === '/my-profile') return null;
  if (!member.onboarding_required) return <aside aria-label="회원 정보 등록 안내" className="flex flex-wrap items-center justify-center gap-2 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"><span>수강 안내를 받을 이름·연락처·업종을 등록해 주세요.</span><Link href="/my-profile" className="font-bold underline underline-offset-4">내 회원정보 등록</Link></aside>;
  return <Dialog open onOpenChange={() => {}}>
    <DialogContent onEscapeKeyDown={event => event.preventDefault()} onInteractOutside={event => event.preventDefault()} className="max-h-[90dvh] overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 sm:max-w-xl [&>button.absolute]:hidden">
      <DialogHeader><DialogTitle className="text-xl font-bold">가입을 마무리해 주세요</DialogTitle><DialogDescription>수강 안내와 교육 운영에 필요한 기본 정보를 입력해 주세요.</DialogDescription></DialogHeader>
      <MemberProfileForm key={member.id} member={member}/>
      <button type="button" onClick={() => void signOut()} className="text-sm text-slate-500 underline">로그아웃하고 나중에 등록하기</button>
    </DialogContent>
  </Dialog>;
}
