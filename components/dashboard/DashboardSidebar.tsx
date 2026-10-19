'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BookOpen, GraduationCap, Cpu, ShieldCheck, CreditCard, Sparkles, ChevronDown, ChevronRight, PanelLeftClose, X } from 'lucide-react';

interface DashboardSidebarProps { onCloseMobile?: () => void; onToggleCollapse?: () => void; }
const mainLinks = [
  { href: '/', label: '홈', icon: Home },
  { href: '/courses', label: '교육과정', icon: BookOpen },
  { href: '/apply', label: '온라인 수강신청', icon: Sparkles },
  { href: '/calendar', label: '일정', icon: Calendar },
  { href: '/materials', label: '강의실 & 자료실', icon: BookOpen },
  { href: '/my-applications', label: '내 신청·결제 목록', icon: CreditCard },
  { href: '/my-learning', label: '내 강의실·학습 현황', icon: GraduationCap },
];
const practiceLinks = [
  { href: '/tools/work-automation', label: '업무자동화 실습' },
  { href: '/tools/blog', label: '블로그 실습' },
  { href: '/tools/shorts', label: '숏폼 실습' },
  { href: '/tools/routine-calendar', label: 'AI 루틴 캘린더' },
  { href: '/drive', label: '사진 드라이브' },
  { href: '/guides/prep', label: '실습 준비 안내' },
];


export function DashboardSidebar({ onCloseMobile, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [labsOpen, setLabsOpen] = useState(pathname.startsWith('/tools') || pathname === '/drive');
  const active = (href: string) => pathname === href || (href === '/courses' && pathname.startsWith('/courses/')) || (href === '/calendar' && pathname.startsWith('/calendar/'));
  const linkClass = (href: string) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active(href) ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`;
  return <aside className="flex h-full w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-6">
    <div className="mb-8 flex items-start justify-between gap-2 px-2">
      <Link href="/" onClick={onCloseMobile} aria-label="네오앤피터 에듀플랫폼 홈" className="block min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <Image src="/logos/neonpeter-logo-horizontal.png" alt="neoNpeter 로고" width={576} height={105} sizes="168px" preload className="h-auto w-[168px] max-w-full"/>
        <span className="mt-3 block text-xs font-semibold tracking-tight text-slate-600">네오앤피터 에듀플랫폼</span>
      </Link>
      {onToggleCollapse && <button onClick={onToggleCollapse} aria-label="사이드바 접기" className="rounded p-1 text-slate-400 hover:bg-slate-50"><PanelLeftClose className="size-5" /></button>}
      {onCloseMobile && <button onClick={onCloseMobile} aria-label="메뉴 닫기" className="rounded p-1 text-slate-400"><X className="size-5" /></button>}
    </div>
    <nav aria-label="학습 메뉴" className="space-y-1">{mainLinks.map(({href,label,icon:Icon}) => <Link key={href} href={href} onClick={onCloseMobile} className={linkClass(href)} aria-current={active(href)?'page':undefined}><Icon className="size-4 shrink-0" />{label}</Link>)}</nav>
    <div className="mt-6 border-t border-slate-100 pt-4">
      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600" aria-expanded={labsOpen} aria-controls="practice-links" onClick={()=>setLabsOpen(!labsOpen)}><span className="flex items-center gap-3"><Cpu className="size-4" />실습 도구</span>{labsOpen?<ChevronDown className="size-4" />:<ChevronRight className="size-4" />}</button>
      {labsOpen && <nav id="practice-links" aria-label="실습 도구" className="ml-3 border-l border-slate-100 pl-3">{practiceLinks.map(({href,label})=><Link key={href} href={href} onClick={onCloseMobile} className={linkClass(href)}>{label}</Link>)}</nav>}
    </div>
    <nav aria-label="플랫폼 안내" className="mt-4 space-y-1 border-t border-slate-100 pt-4">{[{href:'/education',label:'플랫폼 소개'},{href:'/reviews',label:'수강후기'},{href:'/gallery',label:'수강생 갤러리'}].map(({href,label})=><Link key={href} href={href} onClick={onCloseMobile} className={linkClass(href)}>{label}</Link>)}</nav>
    <div className="mt-5 space-y-1 border-t border-slate-100 pt-4">
      <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400">관리 및 ERP</p>
      <Link href="/admin" onClick={onCloseMobile} className={linkClass('/admin')}><ShieldCheck className="size-4 shrink-0 text-slate-500" />ERP 종합 상황실</Link>
      <Link href="/admin/courses" onClick={onCloseMobile} className={linkClass('/admin/courses')}><BookOpen className="size-4 shrink-0"/>교육과정 관리</Link>
      <Link href="/admin/learning" onClick={onCloseMobile} className={linkClass('/admin/learning')}><GraduationCap className="size-4 shrink-0"/>수강·출결·진도 관리</Link>
      <Link href="/admin/shorts" onClick={onCloseMobile} className={linkClass('/admin/shorts')}><Sparkles className="size-4 shrink-0"/>쇼츠 영상 관리</Link>
      <Link href="/admin/cohorts" onClick={onCloseMobile} className={linkClass('/admin/cohorts')}><Calendar className="size-4 shrink-0"/>기수·일정 관리</Link>
      <Link href="/admin/members" onClick={onCloseMobile} className={linkClass('/admin/members')}><ShieldCheck className="size-4 shrink-0"/>회원·권한 관리</Link>
      <Link href="/admin/finance" onClick={onCloseMobile} className={linkClass('/admin/finance')}><CreditCard className="size-4 shrink-0 text-indigo-600" /><span className="flex items-center gap-1.5">결제·환불·정산</span></Link>
      <Link href="/admin/ledger" onClick={onCloseMobile} className={linkClass('/admin/ledger')}><Cpu className="size-4 shrink-0 text-emerald-600" /><span className="flex items-center gap-1.5">통장 입출금 장부<span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">실시간</span></span></Link>
    </div>
  </aside>;
}
