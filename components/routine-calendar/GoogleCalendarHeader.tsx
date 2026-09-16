'use client';

import React, { useState } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  HelpCircle,
  ChevronDown,
  Check,
  Zap,
} from 'lucide-react';

export type CalendarViewType = 'month' | 'week' | 'day' | 'deck';

interface GoogleCalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onChangeViewType: (view: CalendarViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingCount: number;
  onBatchApprove?: () => void;
}

export function GoogleCalendarHeader({
  currentDate,
  viewType,
  onChangeViewType,
  onPrev,
  onNext,
  onToday,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  pendingCount,
  onBatchApprove,
}: GoogleCalendarHeaderProps) {
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

  // 날짜 타이틀 포맷팅
  const getHeaderTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (viewType === 'month') {
      return `${year}년 ${month}월`;
    }

    if (viewType === 'week') {
      const curr = new Date(currentDate);
      const day = curr.getDay();
      const firstDay = new Date(curr);
      firstDay.setDate(curr.getDate() - day);
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);

      const firstMonth = firstDay.getMonth() + 1;
      const lastMonth = lastDay.getMonth() + 1;

      if (firstMonth === lastMonth) {
        return `${year}년 ${firstMonth}월 ${firstDay.getDate()}일–${lastDay.getDate()}일`;
      }
      return `${firstMonth}월 ${firstDay.getDate()}일–${lastMonth}월 ${lastDay.getDate()}일`;
    }

    if (viewType === 'day') {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return `${year}년 ${month}월 ${currentDate.getDate()}일 (${dayNames[currentDate.getDay()]})`;
    }

    return `${year}년 ${month}월 · 승인 덱`;
  };

  const VIEW_LABELS: Record<CalendarViewType, string> = {
    month: '월',
    week: '주',
    day: '일',
    deck: '📱 승인 덱',
  };

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-[#dadce0] bg-white px-2 sm:px-4 select-none whitespace-nowrap break-keep">
      {/* ── Left: Hamburger, Google Calendar Logo, Today, Chevrons, Date Title ── */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Hamburger Menu button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          title="기본 메뉴"
          className="grid size-9 sm:size-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition shrink-0"
        >
          <Menu className="size-5" />
        </button>

        {/* Google Calendar Logo (Iconic Blue Box with White Date + Text) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#1a73e8] text-white shadow-xs">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider absolute top-0.5 text-blue-100">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()]}
            </span>
            <span className="text-sm sm:text-base font-black leading-none mt-2 sm:mt-2.5">
              {new Date().getDate()}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-slate-800 whitespace-nowrap">
              Google 캘린더
            </span>
            <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black text-indigo-700 whitespace-nowrap shrink-0">
              AI 루틴
            </span>
          </div>
        </div>

        {/* "오늘" (Today) Button - No text wrap */}
        <button
          type="button"
          onClick={onToday}
          className="rounded-lg border border-[#dadce0] px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs whitespace-nowrap shrink-0"
        >
          오늘
        </button>

        {/* < > Chevrons */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrev}
            title="이전"
            className="grid size-8 sm:size-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            title="다음"
            className="grid size-8 sm:size-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>
        </div>

        {/* Date Title Header - No text wrap, clean truncate */}
        <h2 className="text-xs sm:text-base lg:text-lg font-bold sm:font-semibold tracking-tight text-slate-800 whitespace-nowrap truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* ── Right: Search, View Mode Dropdown, Batch Approve, Settings ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Search Bar (Hidden on mobile/tablet to avoid squeezing header) */}
        <div className="relative hidden xl:flex items-center">
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="일정 또는 AI 초안 검색"
            className="h-9 w-44 rounded-xl bg-slate-100 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] border border-transparent transition whitespace-nowrap"
          />
        </div>

        {/* 일괄 승인 배지 버튼 (대기 중인 안건이 있을 때) */}
        {pendingCount > 0 && onBatchApprove && (
          <button
            type="button"
            onClick={onBatchApprove}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-xs hover:brightness-105 transition whitespace-nowrap shrink-0"
            title="오늘 대기 중인 모든 AI 보고 즉시 일괄 승인"
          >
            <Zap className="size-3 sm:size-3.5 fill-white" />
            <span className="hidden sm:inline">오늘 일괄 승인 ({pendingCount})</span>
            <span className="sm:hidden font-black">승인({pendingCount})</span>
          </button>
        )}

        {/* View Switcher Dropdown (월 / 주 / 일 / 모바일 덱) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[#dadce0] bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs whitespace-nowrap shrink-0"
          >
            <span>{VIEW_LABELS[viewType]}</span>
            <ChevronDown className="size-3 sm:size-3.5 text-slate-500" />
          </button>

          {viewDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setViewDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 z-40 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                {(['month', 'week', 'day', 'deck'] as CalendarViewType[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      onChangeViewType(v);
                      setViewDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-semibold transition whitespace-nowrap ${
                      viewType === v
                        ? 'bg-blue-50 text-[#1a73e8] font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{VIEW_LABELS[v]}</span>
                    {viewType === v && <Check className="size-3.5 text-[#1a73e8]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Google Apps & Settings icons (Desktop only) */}
        <div className="hidden lg:flex items-center gap-0.5 text-slate-600 shrink-0">
          <button
            type="button"
            title="지원 및 도움말"
            className="grid size-8 place-items-center rounded-full hover:bg-slate-100 transition"
          >
            <HelpCircle className="size-4" />
          </button>
          <button
            type="button"
            title="설정"
            className="grid size-8 place-items-center rounded-full hover:bg-slate-100 transition"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
