'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  Cpu,
  Sparkles,
  FileCheck,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Laptop,
  Flame,
  Bot,
  PenTool,
  Video,
  X,
  Camera,
  Calendar,
  PanelLeftClose,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sliders,
  Megaphone,
} from 'lucide-react';

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export function DashboardSidebar({ onCloseMobile, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [labsOpen, setLabsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/admin'));

  const isHome = pathname === '/';
  const isCourses = pathname.startsWith('/courses');
  const isMaterials = pathname === '/materials';
  const isCalendar = pathname === '/calendar';
  const isReviews = pathname === '/reviews';
  const isGallery = pathname === '/gallery';
  const isDrive = pathname === '/drive';
  const isPrep = pathname === '/guides/prep';
  const isWorkAuto = pathname === '/tools/work-automation';
  const isBlog = pathname === '/tools/blog';
  const isShorts = pathname === '/tools/shorts';
  const isRoutineCalendar = pathname === '/tools/routine-calendar';
  const isAnyLab = isWorkAuto || isBlog || isShorts || isRoutineCalendar;
  const isAdmin = pathname.startsWith('/admin');

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-4 select-none overflow-y-auto">
      <div>
        {/* Brand Header matching standard specs: 🎓 에듀플랫폼 (AI수강생 플랫폼) */}
        <div className="flex items-center justify-between px-2 py-3">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 transition hover:opacity-85"
          >
            <div className="grid size-8 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900">
                에듀플랫폼
              </span>
              <p className="text-[10px] font-semibold text-blue-600 -mt-0.5">
                AI 교육플랫폼 표준 1차
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                title="사이드바 닫기 (Ctrl/Cmd + B)"
                aria-label="사이드바 닫기"
              >
                <PanelLeftClose className="size-4.5" />
              </button>
            )}

            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
                aria-label="메뉴 닫기"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section 1: 학습자 주요 메뉴 */}
        <nav className="mt-5 space-y-1 text-xs sm:text-sm font-semibold">
          {/* 홈 (포털) */}
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isHome
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="size-4.5" />
            <span>홈 (소개)</span>
          </Link>

          {/* 교육과정 탐색 */}
          <Link
            href="/courses"
            onClick={onCloseMobile}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
              isCourses
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="size-4.5" />
              <span>교육과정 탐색</span>
            </div>
            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-700">
              4개
            </span>
          </Link>

          {/* 통합 교육 캘린더 (Slide 24) */}
          <Link
            href="/calendar"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isCalendar
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="size-4.5" />
            <span>통합 교육 캘린더</span>
          </Link>

          {/* 강의 자료실 & 스마트 뷰어 (Slide 45, 46) */}
          <Link
            href="/materials"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isMaterials
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Tv className="size-4.5" />
            <span>강의실 &amp; 자료실</span>
          </Link>

          {/* 수강 후기 & 제휴사 (Slide 73, 76) */}
          <Link
            href="/reviews"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isReviews
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="size-4.5" />
            <span>수강 후기 &amp; 제휴사</span>
          </Link>

          {/* 실습 스튜디오 (Accordion) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setLabsOpen(!labsOpen)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                isAnyLab
                  ? 'bg-slate-100/80 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="size-4.5 text-slate-500" />
                <span>3대 실습 스튜디오</span>
              </div>
              {labsOpen ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
            </button>

            {labsOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                <Link
                  href="/tools/work-automation"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    isWorkAuto
                      ? 'bg-purple-100 text-purple-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Bot className="size-3.5 text-purple-600" />
                  <span>업무 자동화 실습</span>
                </Link>

                <Link
                  href="/tools/blog"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    isBlog
                      ? 'bg-emerald-100 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="size-3.5 text-emerald-600" />
                  <span>블로그 실습</span>
                </Link>

                <Link
                  href="/tools/shorts"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    isShorts
                      ? 'bg-rose-100 text-rose-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Video className="size-3.5 text-rose-600" />
                  <span>숏폼 실습 (VisKits)</span>
                </Link>

                <Link
                  href="/tools/routine-calendar"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    isRoutineCalendar
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-amber-600" />
                    <span>AI 루틴 캘린더</span>
                  </div>
                  <span className="rounded-md bg-slate-900 text-white px-1.5 py-0.5 text-[9px] font-black">
                    CEO
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* 사진 드라이브 & 얼리버드 갤러리 */}
          <Link
            href="/drive"
            onClick={onCloseMobile}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
              isDrive
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Camera className="size-4.5 text-indigo-500" />
              <span>사진 드라이브</span>
            </div>
            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-black text-indigo-600">
              NEW
            </span>
          </Link>

          <Link
            href="/gallery"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isGallery
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Flame className="size-4.5 text-rose-500" />
            <span>얼리버드 갤러리</span>
          </Link>

          {/* 관리자 운영 콘솔 (Accordion matching standard specs) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdminOpen(!adminOpen)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                isAdmin
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4.5 text-blue-500" />
                <span>관리자 콘솔</span>
              </div>
              {adminOpen ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
            </button>

            {adminOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                <Link
                  href="/admin"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    pathname === '/admin'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="size-3.5 text-blue-600" />
                  <span>운영 대시보드</span>
                </Link>

                <Link
                  href="/admin/courses"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    pathname === '/admin/courses'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="size-3.5 text-blue-600" />
                  <span>표준 과정 등록</span>
                </Link>

                <Link
                  href="/admin/promotions"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    pathname === '/admin/promotions'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Megaphone className="size-3.5 text-blue-600" />
                  <span>배너·홍보 관리</span>
                </Link>

                <Link
                  href="/admin/crm"
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    pathname === '/admin/crm'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="size-3.5 text-blue-600" />
                  <span>수강생 CRM</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Promo Card */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/60 p-4 text-left mt-6">
        <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
          <Sparkles className="size-4.5" />
        </div>
        <h3 className="mt-3 text-xs font-bold text-slate-900">
          AI 활용 전문가로<br />성장하는 교육 생태계
        </h3>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed font-medium">
          대한민국 표준 AI 교육플랫폼
        </p>
        <Link
          href="/courses"
          onClick={onCloseMobile}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
        >
          <span>교육과정 살펴보기</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </aside>
  );
}
