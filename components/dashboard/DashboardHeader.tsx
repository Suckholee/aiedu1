'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Mail,
  Menu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DashboardHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile menu button + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-12 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            readOnly
            onClick={() => {
              // Quick focus or modal placeholder
            }}
          />
          <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Messages, User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="알림"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Messages */}
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="메시지"
        >
          <Mail className="size-4.5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="relative size-9 overflow-hidden rounded-full border border-slate-200 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            <span>김</span>
          </div>
          <div className="hidden text-left sm:block">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900 leading-none">김수강</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded px-1 font-semibold">1기</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">수강생</p>
          </div>
        </div>
      </div>
    </header>
  );
}
