'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  FileText,
  MessageCircle,
  PlaySquare,
  BookOpen,
  Laptop,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Layers,
  Flame,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const isToolsActive = pathname.startsWith('/tools');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#13034d]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white transition-opacity hover:opacity-85">
            <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white shadow-sm font-black text-xs">
              AI
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-white">
                AI 업무자동화 <span className="text-fuchsia-300">캠프</span>
              </span>
              <p className="text-[10px] text-violet-300/80 -mt-1 font-medium">honestone &amp; neoNpeter</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-violet-200">
            <Link
              href="/"
              className={`rounded-lg px-3 py-2 transition ${
                isActive('/') ? 'bg-white/15 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              강의 소개
            </Link>

            <Link
              href="/gallery"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition ${
                isActive('/gallery') ? 'bg-fuchsia-500/25 text-fuchsia-200 font-bold border border-fuchsia-400/30' : 'hover:bg-white/10 hover:text-white text-fuchsia-300'
              }`}
            >
              <Flame className="size-3.5 text-fuchsia-400" />
              <span>얼리버드 갤러리</span>
            </Link>

            <Link
              href="/materials"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition ${
                isActive('/materials') ? 'bg-white/15 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen className="size-3.5 text-violet-300" />
              <span>강의 자료실</span>
            </Link>

            {/* 실습 스튜디오 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 outline-none transition ${
                  isToolsActive ? 'bg-violet-600/40 text-white font-bold border border-violet-400/30' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <Layers className="size-3.5" />
                <span>3대 실습 스튜디오</span>
                <ChevronDown className="size-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 border-violet-800 bg-[#1e075c] p-2 text-white shadow-2xl backdrop-blur-xl">
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white rounded-lg p-2.5">
                  <Link href="/tools/work-automation" className="flex items-start gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-600/30 text-violet-300 mt-0.5">
                      <FileText className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Part 1. 업무자동화</p>
                      <p className="text-[11px] text-violet-200/80">클로드 기획서·보고서 구조화</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white rounded-lg p-2.5">
                  <Link href="/tools/blog" className="flex items-start gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-fuchsia-600/30 text-fuchsia-300 mt-0.5">
                      <MessageCircle className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Part 2. AI 블로그</p>
                      <p className="text-[11px] text-violet-200/80">사진 기반 네이버 스마트에디터</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white rounded-lg p-2.5">
                  <Link href="/tools/shorts" className="flex items-start gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-pink-600/30 text-pink-300 mt-0.5">
                      <PlaySquare className="size-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white">Part 3. AI 숏폼</p>
                        <span className="rounded bg-pink-500/20 px-1 text-[9px] font-black text-pink-300">VisKits</span>
                      </div>
                      <p className="text-[11px] text-violet-200/80">30초 대본 &amp; VisKits 영상 자동화</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/guides/prep"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition ${
                isActive('/guides/prep') ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-400/30' : 'hover:bg-white/10 hover:text-white text-amber-300/90'
              }`}
            >
              <Laptop className="size-3.5" />
              <span>준비물 가이드</span>
            </Link>
          </nav>
        </div>

        {/* Action Button & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-black text-white shadow-md transition hover:scale-105"
          >
            <span>수강 신청하기</span>
            <ExternalLink className="size-3.5" />
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-9 place-items-center rounded-xl border border-white/15 bg-white/10 text-white md:hidden"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#160252] px-4 py-4 text-xs md:hidden">
          <div className="space-y-1.5 font-semibold text-violet-100">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg p-2 hover:bg-white/10"
            >
              강의 소개
            </Link>
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg p-2 text-fuchsia-300 hover:bg-white/10 font-bold"
            >
              <Flame className="size-4" />
              <span>얼리버드 갤러리 (숏폼 &amp; 블로그)</span>
            </Link>
            <Link
              href="/materials"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10"
            >
              <BookOpen className="size-4" />
              <span>강의 자료실 &amp; 프롬프트 팩</span>
            </Link>
            
            <div className="my-2 border-t border-white/10 pt-2">
              <p className="px-2 text-[11px] font-bold text-violet-400">3대 실습 스튜디오</p>
              <Link
                href="/tools/work-automation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10"
              >
                <FileText className="size-4 text-violet-400" />
                <span>Part 1. 클로드 업무자동화</span>
              </Link>
              <Link
                href="/tools/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10"
              >
                <MessageCircle className="size-4 text-fuchsia-400" />
                <span>Part 2. AI 네이버 블로그</span>
              </Link>
              <Link
                href="/tools/shorts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10"
              >
                <PlaySquare className="size-4 text-indigo-400" />
                <span>Part 3. AI 숏폼 영상 제작</span>
              </Link>
            </div>

            <div className="border-t border-white/10 pt-2">
              <Link
                href="/guides/prep"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg p-2 text-amber-300 hover:bg-white/10 font-bold"
              >
                <Laptop className="size-4" />
                <span>수강 필수 준비물 (Claude Pro 가이드)</span>
              </Link>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 font-black text-white"
              >
                <span>수강 신청하기 (구글 폼)</span>
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
