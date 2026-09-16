'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Mail,
  Menu,
  Sparkles,
  ExternalLink,
  LogOut,
  User as UserIcon,
  Camera,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  onOpenMobileMenu?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({
  onOpenMobileMenu,
  isSidebarOpen = true,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Sidebar Toggle (Desktop & Mobile) + Search bar */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
        {/* Mobile menu button */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="모바일 메뉴 열기"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Desktop Sidebar Toggle button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`hidden lg:grid size-9 place-items-center rounded-xl border transition-all ${
              !isSidebarOpen
                ? 'border-indigo-200 bg-indigo-50/90 text-indigo-600 hover:bg-indigo-100 shadow-xs'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title={isSidebarOpen ? '사이드바 닫기 (Ctrl/Cmd + B)' : '사이드바 열기 (Ctrl/Cmd + B)'}
            aria-label={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4.5" />
            ) : (
              <PanelLeftOpen className="size-4.5 text-indigo-600" />
            )}
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
          />
          <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Messages, User Profile / Sign In */}
      <div className="flex items-center gap-2 sm:gap-3.5">
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

        {/* User Profile or Google Sign In Button */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1 rounded-full outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
              <div className="relative size-9 overflow-hidden rounded-full border border-slate-200 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{(user.displayName || user.email || '수')[0]}</span>
                )}
              </div>
              <div className="hidden text-left sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {user.displayName || '수강생'}
                  </span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded px-1 font-semibold">
                    1기
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-none mt-1 truncate max-w-[120px]">
                  {user.email || 'Google 연동 회원'}
                </p>
              </div>
              <ChevronDown className="size-3.5 text-slate-400 hidden sm:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200">
              <DropdownMenuLabel className="p-2">
                <p className="text-xs font-bold text-slate-900">{user.displayName || '수강생'}</p>
                <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2 text-xs">
                <Link href="/drive" className="flex items-center gap-2 font-medium">
                  <Camera className="size-4 text-indigo-600" />
                  <span>내 사진 드라이브</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2 text-xs">
                <Link href="/materials" className="flex items-center gap-2 font-medium">
                  <UserIcon className="size-4 text-slate-500" />
                  <span>내 강의실 &amp; 자료실</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="rounded-xl cursor-pointer p-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 font-bold"
              >
                <LogOut className="size-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Sign In Button with Google Logo */
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white hover:bg-slate-50 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 shadow-2xs active:scale-95 transition"
          >
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google 로그인</span>
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
}
