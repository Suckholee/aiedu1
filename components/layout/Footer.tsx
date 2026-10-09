import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="font-extrabold text-slate-900 text-sm">
              네오앤피터 에듀플랫폼
            </p>
            <p className="mt-1 text-slate-500">
              어니스톤(조영빈 대표) &amp; neoNpeter(이석호 대표 · 박재범 대표)
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              강의자료에서 실습까지, 배움을 실제 업무로 연결합니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/calendar">일정</Link>
            <Link href="/courses">교육과정</Link>
            <Link href="/materials">강의실 &amp; 자료실</Link>
            <Link href="/education">플랫폼 소개</Link>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          © 2026 honestone &amp; neoNpeter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
