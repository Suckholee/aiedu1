'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  BookOpen,
  Cpu,
  ExternalLink,
} from 'lucide-react';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export function MobileBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isGallery = pathname === '/gallery';
  const isMaterials = pathname === '/materials';
  const isTools = pathname.startsWith('/tools');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe">
      {/* Floating blur container with clean modern styling */}
      <div className="mx-3 mb-2 rounded-2xl border border-slate-200/90 bg-white/95 px-2 py-2 shadow-xl backdrop-blur-xl">
        <nav className="flex items-center justify-around text-[11px] font-bold">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isHome
                ? 'text-[#6355f6] bg-[#f0edff] font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="size-4" />
            <span>홈</span>
          </Link>

          {/* 2. Gallery */}
          <Link
            href="/gallery"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isGallery
                ? 'text-[#6355f6] bg-[#f0edff] font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flame className="size-4 text-rose-500" />
            <span>갤러리</span>
          </Link>

          {/* 3. Tools Hub */}
          <Link
            href="/tools/shorts"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isTools
                ? 'text-[#6355f6] bg-[#f0edff] font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="size-4 text-indigo-600" />
            <span>실습실</span>
          </Link>

          {/* 4. Materials */}
          <Link
            href="/materials"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isMaterials
                ? 'text-[#6355f6] bg-[#f0edff] font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="size-4" />
            <span>자료실</span>
          </Link>

          {/* 5. Apply CTA Button */}
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-xl bg-[#6355f6] px-3.5 py-2 text-[11px] font-black text-white shadow-xs active:scale-95 transition"
          >
            <span>신청</span>
            <ExternalLink className="size-3" />
          </a>
        </nav>
      </div>
    </div>
  );
}
