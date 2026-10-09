'use client';

import Link from 'next/link';
import { ArrowUpRight, BookOpen, Puzzle } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

const sessions = [
    { period: '0교시', title: '함께 만드는 사람들 · 강사 소개', instructor: '어니스톤 × neoNpeter', href: '/00.html' },
    { period: '1교시', title: '클로드 입문 50분 · 문서 자동화', instructor: '조영빈 대표 · 어니스톤', href: '/01.html' },
    { period: '2교시', title: 'IT 정보화 · AEO·GEO와 블로그 콘텐츠', instructor: '이석호 대표 · neoNpeter', href: '/02.html' },
    { period: '3교시', title: '비스킷AI로 영상 숏폼 만들기', instructor: '박재범 대표 · neoNpeter', href: '/03.html' },
    { period: '4교시 · 심화', title: '나만의 플랫폼 만들기', instructor: '어니스톤 × neoNpeter', href: '/04.html' },
];

export default function MaterialsPage() {
    const { data, ready } = usePlatform();
    const courses = data.courses.filter(c => c.published && data.materials.some(m => m.courseId === c.id));

    return (
        <div className="mx-auto max-w-5xl space-y-10 pb-12">
            <header className="border-b border-slate-200 pb-6">
                <p className="mb-2 text-xs font-semibold tracking-widest text-blue-600">LEARNING LIBRARY</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">강의실 &amp; 자료실</h1>
                <p className="mt-3 text-sm text-slate-500">강의자료를 선택해 바로 시작하세요. 로그인 없이 이용할 수 있습니다.</p>
            </header>

            <section aria-labelledby="lecture-materials-heading">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <h2 id="lecture-materials-heading" className="text-xl font-bold text-slate-900">10월 9일 강의자료</h2>
                    <span className="text-sm text-slate-500">2026.10.09</span>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    {sessions.map(session => (
                        <a key={session.period} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" href={session.href} target="_blank" rel="noopener noreferrer">
                            <div className="flex items-center justify-between"><span className="text-sm font-bold text-blue-600">{session.period}</span><BookOpen className="size-5 text-slate-400" /></div>
                            <h3 className="mt-5 text-lg font-bold leading-relaxed text-slate-900">{session.title}</h3>
                            <p className="mt-2 text-sm text-slate-500">{session.instructor}</p>
                            <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">강의자료 열기 <ArrowUpRight className="size-4" /></span>
                        </a>
                    ))}
                </div>
            </section>

            <section aria-labelledby="manual-heading">
                <h2 id="manual-heading" className="mb-4 text-lg font-bold text-slate-900">실습 준비</h2>
                <a className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-400" href="/extension-manual.html" target="_blank" rel="noopener noreferrer">
                    <Puzzle className="size-6 shrink-0 text-blue-600" />
                    <div className="flex-1"><h3 className="font-semibold text-slate-900">크롬 확장 프로그램 설치 매뉴얼</h3><p className="mt-1 text-sm text-slate-500">설치 순서 · 첫 글 수신 · 문제 해결</p></div>
                    <ArrowUpRight className="size-5 shrink-0 text-slate-400" />
                </a>
            </section>

            {ready && courses.length > 0 && <section aria-labelledby="course-materials-heading">
                <h2 id="course-materials-heading" className="mb-4 text-lg font-bold">다른 과정 자료</h2>
                <div className="space-y-4">{courses.map(c => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={c.id}>
                    <h3 className="font-semibold">{c.title}</h3><p className="mt-1 text-sm text-slate-500">{c.startDate} · {c.instructor.name}</p>
                    <div className="mt-4 space-y-2">{data.materials.filter(m => m.courseId === c.id).map(m => <a key={m.id} className="block text-sm font-semibold text-blue-600" href={m.url} target="_blank" rel="noopener noreferrer">{m.title} ↗</a>)}</div>
                </article>)}</div>
            </section>}

            <footer className="border-t border-slate-200 pt-5 text-sm text-slate-500">개인 신청 내역과 학습 기록은 <Link className="font-semibold text-blue-600" href="/my-learning">내 신청·학습 현황</Link>에서 확인하세요.</footer>
        </div>
    );
}
