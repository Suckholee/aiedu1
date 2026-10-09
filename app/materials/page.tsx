'use client';

import Link from 'next/link';
import { usePlatform } from '@/contexts/PlatformContext';

export default function MaterialsPage() {
    const { data, ready } = usePlatform();
    const courses = data.courses.filter(c => c.published);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black">강의실 &amp; 자료실</h1>
            <p className="text-sm text-slate-600">로그인 없이 강의자료와 설치 매뉴얼을 열어볼 수 있습니다.</p>
            <div className="flex flex-wrap gap-3">
                <Link className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white" href="/my-learning">내 신청·학습 현황</Link>
                <Link className="rounded-lg border px-4 py-2" href="/admin/operations">학습 자료 등록</Link>
            </div>

            <section className="space-y-3" aria-labelledby="lecture-materials-heading">
                <h2 id="lecture-materials-heading" className="text-xl font-bold">강의자료 목록</h2>
                <article className="rounded-2xl border bg-white p-5">
                    <span className="text-xs font-bold text-blue-700">설치 실습 · 웹매뉴얼</span>
                    <h3 className="mt-2 text-lg font-bold">크롬 확장 프로그램 설치하고 첫 글 받아보기</h3>
                    <p className="mt-2 text-sm text-slate-600">네오앤피터 블로그 도우미 ZIP 설치, 단계별 완료 체크, 글 수신 확인과 문제 해결 안내입니다.</p>
                    <a className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-bold text-white" href="/extension-manual.html" target="_blank" rel="noopener noreferrer">설치 웹매뉴얼 열기 ↗</a>
                </article>
                <article className="rounded-2xl border bg-white p-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">1교시</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">HTML 웹교재</span>
                    </div>
                    <h3 className="text-lg font-bold">클로드 입문 50분 · 문서 자동화</h3>
                    <p className="mt-2 text-sm text-slate-500">2026년 10월 9일 · 조영빈 대표 (어니스톤)</p>
                    <p className="mt-3 text-sm text-slate-600">상담 메모를 문서로 만드는 실습과 프롬프트를 확인할 수 있는 1교시 강의 교재입니다.</p>
                    <a className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700" href="/01.html" target="_blank" rel="noopener noreferrer">강의자료 열기 ↗</a>
                </article>
            </section>

            <section className="space-y-3" aria-labelledby="course-materials-heading">
                <h2 id="course-materials-heading" className="text-xl font-bold">과정별 강의자료</h2>
                <p className="text-sm text-slate-600">과정별 자료는 바로 열 수 있습니다. 개인 신청 현황과 학습 완료 기록은 로그인 후 확인하세요.</p>
                {!ready ? <p>과정을 불러오는 중입니다.</p> : courses.length === 0 ? <p className="text-sm text-slate-500">등록된 교육과정이 없습니다.</p> : courses.map(c => (
                    <article className="rounded-2xl border bg-white p-5" key={c.id}>
                        <Link className="text-lg font-bold text-blue-700" href={`/courses/${c.id}`}>{c.title}</Link>
                        <p className="mt-2 text-sm text-slate-500">{c.startDate} · 학습 자료 {data.materials.filter(m => m.courseId === c.id).length}개 · {c.instructor.name}</p>
                        <div className="mt-3 space-y-2">{data.materials.filter(m => m.courseId === c.id).map(m => (
                            <a key={m.id} className="block text-sm font-bold text-blue-700" href={m.url} target="_blank" rel="noopener noreferrer">{m.title} 열기 ↗</a>
                        ))}{!data.materials.some(m => m.courseId === c.id) && <p className="text-sm text-slate-500">등록된 자료가 없습니다.</p>}</div>
                    </article>
                ))}
            </section>
        </div>
    );
}
