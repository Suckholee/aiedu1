'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Calendar,
  Tv,
  GraduationCap,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isCourses = pathname.startsWith('/courses');
  const isCalendar = pathname === '/calendar';
  const isMaterials = pathname === '/materials';
  const isLearning = pathname === '/my-learning';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe">
      {/* Floating blur container with standard educational platform styling */}
      <div className="mx-3 mb-2 rounded-2xl border border-slate-200/90 bg-white/95 px-2 py-2 shadow-xl backdrop-blur-xl">
        <nav className="flex items-center justify-around text-[10px] font-bold">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isHome
                ? 'text-blue-600 bg-blue-50 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="size-4" />
            <span>홈</span>
          </Link>

          {/* 2. Courses */}
          <Link
            href="/courses"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isCourses
                ? 'text-blue-600 bg-blue-50 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="size-4" />
            <span>교육과정</span>
          </Link>

          {/* 3. Calendar */}
          <Link
            href="/calendar"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isCalendar
                ? 'text-blue-600 bg-blue-50 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="size-4" />
            <span>일정</span>
          </Link>

          {/* 4. Classroom / Materials */}
          <Link
            href="/materials"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isMaterials
                ? 'text-blue-600 bg-blue-50 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tv className="size-4" />
            <span>자료실</span>
          </Link>

          {/* 5. Admin Console */}
          <Link
            href="/my-learning"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isLearning
                ? 'text-white bg-blue-600 font-extrabold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="size-4" />
            <span>내 학습</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
