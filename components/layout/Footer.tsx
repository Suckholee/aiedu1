import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="font-extrabold text-slate-900 text-sm">
              AI 업무자동화 실전 마스터 클래스
            </p>
            <p className="mt-1 text-slate-500">
              어니스톤(조영빈 대표) &amp; neoNpeter(이석호 대표 · 박재범 대표)
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              본 사이트는 수강생 실습 및 강의 온보딩 전용 플랫폼입니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition">홈</Link>
            <Link href="/gallery" className="hover:text-indigo-600 transition">얼리버드 갤러리</Link>
            <Link href="/materials" className="hover:text-indigo-600 transition">강의 자료실</Link>
            <Link href="/tools/work-automation" className="hover:text-indigo-600 transition">업무자동화 실습</Link>
            <Link href="/tools/blog" className="hover:text-indigo-600 transition">블로그 실습</Link>
            <Link href="/tools/shorts" className="hover:text-indigo-600 transition">숏폼 실습 (VisKits)</Link>
            <Link href="/guides/prep" className="hover:text-indigo-600 transition">사전 준비</Link>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          © 2026 honestone &amp; neoNpeter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
