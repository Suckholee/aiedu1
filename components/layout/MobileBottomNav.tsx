'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  BookOpen,
  Wand2,
  ExternalLink,
  Laptop,
} from 'lucide-react';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export function MobileBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isGallery = pathname === '/gallery';
  const isMaterials = pathname === '/materials';
  const isTools = pathname.startsWith('/tools');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      {/* Floating blur container */}
      <div className="mx-2 mb-2 rounded-2xl border border-white/15 bg-[#120245]/95 px-2 py-2 shadow-2xl backdrop-blur-2xl">
        <nav className="flex items-center justify-around text-[10px] font-bold">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isHome ? 'text-white bg-white/15 font-black' : 'text-violet-300/80 hover:text-white'
            }`}
          >
            <Home className="size-4" />
            <span>홈</span>
          </Link>

          {/* 2. Gallery */}
          <Link
            href="/gallery"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isGallery ? 'text-fuchsia-300 bg-fuchsia-500/20 font-black' : 'text-violet-300/80 hover:text-fuchsia-300'
            }`}
          >
            <Flame className="size-4 text-fuchsia-400" />
            <span>갤러리</span>
          </Link>

          {/* 3. Tools Hub */}
          <Link
            href="/tools/shorts"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isTools ? 'text-pink-300 bg-pink-500/20 font-black' : 'text-violet-300/80 hover:text-pink-300'
            }`}
          >
            <Wand2 className="size-4 text-pink-400" />
            <span>실습실</span>
          </Link>

          {/* 4. Materials */}
          <Link
            href="/materials"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isMaterials ? 'text-white bg-white/15 font-black' : 'text-violet-300/80 hover:text-white'
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
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-[11px] font-black text-white shadow-md active:scale-95 transition"
          >
            <span>신청</span>
            <ExternalLink className="size-3" />
          </a>
        </nav>
      </div>
    </div>
  );
}
