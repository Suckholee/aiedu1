import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0c0133] py-10 text-violet-200/80 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="font-extrabold text-white text-sm">
              AI 업무자동화 마스터 클래스
            </p>
            <p className="mt-1 text-violet-300/70">
              어니스톤(조영빈 대표) &amp; neoNpeter(이석호 대표 · 박재범 대표)
            </p>
            <p className="mt-1 text-[11px] text-violet-400/60">
              본 사이트는 수강생 실습 및 온보딩 전용 플랫폼입니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link href="/" className="hover:text-white transition">강의 소개</Link>
            <Link href="/gallery" className="hover:text-white transition">얼리버드 갤러리</Link>
            <Link href="/materials" className="hover:text-white transition">강의 자료실</Link>
            <Link href="/tools/work-automation" className="hover:text-white transition">업무자동화 실습</Link>
            <Link href="/tools/blog" className="hover:text-white transition">블로그 실습</Link>
            <Link href="/tools/shorts" className="hover:text-white transition">숏폼 실습</Link>
            <Link href="/guides/prep" className="hover:text-white transition">준비물 가이드</Link>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-[11px] text-violet-400/60">
          © 2026 honestone &amp; neoNpeter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
