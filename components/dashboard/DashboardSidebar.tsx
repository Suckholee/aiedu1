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
} from 'lucide-react';

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export function DashboardSidebar({ onCloseMobile, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [labsOpen, setLabsOpen] = useState(true);

  const isHome = pathname === '/';
  const isMaterials = pathname === '/materials';
  const isGallery = pathname === '/gallery';
  const isDrive = pathname === '/drive';
  const isPrep = pathname === '/guides/prep';
  const isWorkAuto = pathname === '/tools/work-automation';
  const isBlog = pathname === '/tools/blog';
  const isShorts = pathname === '/tools/shorts';
  const isRoutineCalendar = pathname === '/tools/routine-calendar';
  const isAnyLab = isWorkAuto || isBlog || isShorts || isRoutineCalendar;

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-4 select-none">
      <div>
        {/* Brand Header matching reference: 💜 AI수강생 플랫폼 */}
        <div className="flex items-center justify-between px-2 py-3">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 transition hover:opacity-85"
          >
            <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-tr from-[#6355f6] to-[#ec4899] text-white shadow-xs">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900">
                AI수강생 플랫폼
              </span>
              <p className="text-[10px] font-semibold text-indigo-600 -mt-0.5">
                honestone &amp; neoNpeter
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
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

            {/* Mobile Close Button */}
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

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1 text-sm font-semibold">
          {/* 홈 */}
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isHome
                ? 'bg-[#f0edff] text-[#6355f6] font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="size-4.5" />
            <span>홈</span>
          </Link>

          {/* 내 강의실 */}
          <Link
            href="/materials"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isMaterials
                ? 'bg-[#f0edff] text-[#6355f6] font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Tv className="size-4.5" />
            <span>내 강의실</span>
          </Link>

          {/* 실습실 (Accordion) */}
          <div>
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
                <span>실습실</span>
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
                  <span className="rounded-md bg-gradient-to-r from-amber-500 to-indigo-600 text-white px-1.5 py-0.5 text-[9px] font-black">
                    CEO
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* 사진 드라이브 (웹캠 촬영 & 2중 공유) */}
          <Link
            href="/drive"
            onClick={onCloseMobile}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
              isDrive
                ? 'bg-[#f0edff] text-[#6355f6] font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Camera className="size-4.5 text-indigo-500" />
              <span>사진 드라이브</span>
            </div>
            <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black text-indigo-700">
              NEW
            </span>
          </Link>

          {/* 얼리버드 갤러리 */}
          <Link
            href="/gallery"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isGallery
                ? 'bg-[#f0edff] text-[#6355f6] font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Flame className="size-4.5 text-rose-500" />
            <span>얼리버드 갤러리</span>
          </Link>

          {/* 강의 자료실 */}
          <Link
            href="/materials"
            onClick={onCloseMobile}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <BookOpen className="size-4.5" />
            <span>강의 자료실</span>
          </Link>

          {/* 사전 준비 가이드 */}
          <Link
            href="/guides/prep"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              isPrep
                ? 'bg-[#f0edff] text-[#6355f6] font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Laptop className="size-4.5" />
            <span>사전 준비 가이드</span>
          </Link>

          {/* 수강 신청 (외주/구글폼) */}
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="size-4.5 text-indigo-500" />
              <span>수강 신청하기</span>
            </div>
            <ExternalLink className="size-3.5 text-slate-400" />
          </a>
        </nav>
      </div>

      {/* Bottom Promo Card matching reference: "AI 활용 전문가로 성장하는 여정" */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-[#f5f3ff] to-[#eff6ff] p-4 text-left">
        <div className="grid size-9 place-items-center rounded-xl bg-white text-[#6355f6] shadow-xs">
          <Sparkles className="size-4.5" />
        </div>
        <h3 className="mt-3 text-xs font-bold text-slate-900">
          AI 활용 전문가로<br />성장하는 여정
        </h3>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed font-medium">
          오늘의 배움이 내일의 커리어를 바꿉니다.
        </p>
        <Link
          href="/guides/prep"
          onClick={onCloseMobile}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#6355f6] hover:underline"
        >
          <span>학습 가이드 보기</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </aside>
  );
}
