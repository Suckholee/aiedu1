'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Flame,
  ChevronRight,
  Calendar,
  MapPin,
  ExternalLink,
  Laptop,
  BookOpen,
  Award,
  Bot,
  PenTool,
  Video,
  FileText,
} from 'lucide-react';
import { QuickLabLauncher } from '@/components/dashboard/QuickLabLauncher';
import { ParticipantRosterSection } from '@/components/course/ParticipantRosterSection';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';
const CLAUDE_UPGRADE_URL = 'https://claude.ai/upgrade?from=menu';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* ── 1. Top Welcome Banner & Weekly Stats matching reference ── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Personalized Greeting */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            김수강님, 오늘도 함께 성장해요! 👋
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            AI의 힘으로 더 스마트하게, 더 빠르게 목표에 도달하세요.
          </p>
        </div>

        {/* Right: 이번 주 학습 현황 Card matching reference */}
        <div className="w-full lg:w-auto shrink-0 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700">이번 주 학습 현황</span>
            <Link
              href="/materials"
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition"
            >
              <span>자세히 보기</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-6 text-xs sm:text-sm">
            {/* 1. 학습 시간 */}
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Clock className="size-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium leading-none">학습 시간</p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900 leading-none">12시간 45분</p>
              </div>
            </div>

            {/* 2. 완료 강의 */}
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium leading-none">완료 강의</p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900 leading-none">8 / 12개</p>
              </div>
            </div>

            {/* 3. 연속 학습 */}
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-rose-50 text-rose-500">
                <Flame className="size-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium leading-none">연속 학습</p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900 leading-none">7일</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1.5 🍷 곽성진 대표 AI 루틴 캘린더 & 모바일 1초 승인 콕핏 배너 ── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-5 sm:p-6 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-black text-amber-700">
                <Sparkles className="size-3 text-amber-600" />
                CEO 전용 AI 에이전트 콕핏
              </span>
              <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
                곽성진 대표 맞춤형
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                AI Proposes, CEO Disposes
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
              반복은 AI 직원팀에게, 최종 결정은 나에게 — AI 루틴 캘린더
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              비서팀(네오) · 마케팅팀(와인핏) · 매장운영팀(르글라스) · 영업팀(B2B)이 준비한 업무 초안을
              모바일에서 1초 만에 확인하고 바로 승인하세요!
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="/tools/routine-calendar"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Calendar className="size-4.5" />
              <span>AI 루틴 캘린더 입장하기</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. ⚡ 3대 실습실 퀵 런처 (Core Highlight) ── */}
      <QuickLabLauncher />

      {/* ── 3. Main 2-Column Content Grid matching reference ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left Column: 내 학습 현황 + 강의 상세 + 신청 명단 */}
        <div className="space-y-8 min-w-0">
          {/* 내 학습 현황 Section matching reference */}
          <section className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4.5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  내 학습 현황
                </h3>
              </div>
              <Link
                href="/materials"
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition"
              >
                <span>전체 보기</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {/* 3 Course Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Course 1 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-600">
                      <Bot className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">
                        Part 1 · 조영빈
                      </span>
                      <h4 className="mt-1 text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        상담이 보고서가 되기까지
                      </h4>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>진도율</span>
                      <span className="text-purple-600">75%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href="/01.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center rounded-lg border border-purple-200 bg-purple-50/60 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition"
                  >
                    교재 보기 📖
                  </a>
                  <Link
                    href="/tools/work-automation"
                    className="block text-center rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-purple-600 hover:text-white transition"
                  >
                    실습실 →
                  </Link>
                </div>
              </div>

              {/* Course 2 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                      <PenTool className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
                        Part 2 · 이석호
                      </span>
                      <h4 className="mt-1 text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        AI 블로그 &amp; 티스토리 스마트 옮겨쓰기
                      </h4>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>진도율</span>
                      <span className="text-emerald-600">60%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href="/02.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center rounded-lg border border-emerald-200 bg-emerald-50/60 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    교재 보기 📖
                  </a>
                  <Link
                    href="/tools/blog"
                    className="block text-center rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-600 hover:text-white transition"
                  >
                    실습실 →
                  </Link>
                </div>
              </div>

              {/* Course 3 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
                      <Video className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">
                        Part 3 · 박재범
                      </span>
                      <h4 className="mt-1 text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        VisKits 숏폼 마스터
                      </h4>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>진도율</span>
                      <span className="text-rose-600">40%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
                <Link
                  href="/tools/shorts"
                  className="mt-4 block text-center rounded-lg bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition"
                >
                  실습 이어하기 →
                </Link>
              </div>
            </div>
          </section>

          {/* 강의 핵심 정보 & 얼리버드 혜택 카드 */}
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-black text-white">
                  <Sparkles className="size-3.5" />
                  1day Learn AI · 오프라인 실전 마스터 클래스
                </span>
                <h3 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  AI 업무자동화 실전 마스터 클래스
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  3시간 동안 3인의 실무 전문가와 함께 기획서, 네이버 블로그 포스팅, 그리고 VisKits 숏폼 영상 결과물을 직접 완성합니다.
                </p>
              </div>

              <div className="shrink-0 flex sm:flex-col gap-2">
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <span>수강 신청하기</span>
                  <ExternalLink className="size-3.5" />
                </a>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Flame className="size-3.5 text-rose-500" />
                  <span>제작 샘플 보기</span>
                </Link>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-indigo-100/80">
              {[
                { label: '일시', value: '9월 22일 (화)', sub: '17:00 ~ 20:00 (3시간)' },
                { label: '장소', value: '서초구 오프라인', sub: '강의장 개별 안내' },
                { label: '수강료', value: '150,000원', sub: '얼리버드 특별가' },
                { label: '특전 혜택', value: '20만원 상당', sub: 'VisKits 1개월+블로그' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/90 p-3 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">{item.label}</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{item.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3인 강사진 소개 */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              실전 마스터 클래스 3인 강사진
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  name: '조영빈 대표',
                  role: 'Part 1 · 어니스톤',
                  desc: '말로 한 상담이 보고서가 되기까지 & 클로드 스킬 자동화',
                  color: 'text-purple-600 bg-purple-50',
                },
                {
                  name: '이석호 대표',
                  role: 'Part 2 · neoNpeter',
                  desc: 'AI 블로그 & 티스토리 스마트 옮겨쓰기 & SEO/GEO 공략',
                  color: 'text-emerald-600 bg-emerald-50',
                },
                {
                  name: '박재범 대표',
                  role: 'Part 3 · neoNpeter',
                  desc: '대한민국 대표 AI 숏폼 솔루션 VisKits 기반 영상 파이프라인',
                  color: 'text-rose-600 bg-rose-50',
                },
              ].map((inst) => (
                <div key={inst.name} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${inst.color}`}>
                    {inst.role}
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-slate-900">{inst.name}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{inst.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 실시간 신청자 명단 위젯 */}
          <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <ParticipantRosterSection googleFormUrl={GOOGLE_FORM_URL} />
          </div>
        </div>

        {/* Right Column: 공지사항 + VisKits AI 추천 학습 + 안내 배너 */}
        <div className="space-y-6">
          {/* 1. 공지사항 Card matching reference */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-900">공지사항</span>
              <span className="text-[11px] font-semibold text-slate-400 cursor-pointer hover:text-indigo-600">더보기 &gt;</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {[
                { title: '[안내] 9.22(화) 17~20시 오프라인 실습 강의 안내', date: '2024.09.10' },
                { title: '[특전] 참석자 전원 20만원 상당 VisKits & 블로그 이용권', date: '2024.09.08' },
                { title: '[준비물] 개인 노트북 & Claude Pro 구독 준비 안내', date: '2024.09.07' },
                { title: '[이벤트] 지인 2명 초대 시 본인 5만원 즉시 페이백!', date: '2024.09.05' },
              ].map((notice) => (
                <div key={notice.title} className="py-2.5 first:pt-1 last:pb-0">
                  <p className="text-xs font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer line-clamp-1">
                    {notice.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{notice.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. AI 추천 학습 Beta (VisKits Special) matching reference */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-pink-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">AI 추천 학습</span>
              <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                Beta
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-indigo-600">초급 · 1분 완성</span>
              <h4 className="mt-1 text-sm font-bold text-slate-900">
                VisKits 숏폼 완전 자동화
              </h4>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                사진 한 장으로 바이럴 영상·자막·음성을 원클릭으로 완성하세요.
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                  98% 매칭
                </span>
                <a
                  href="https://viskits.ai/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <span>VisKits 시작</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {/* 3. 사전 준비 체크리스트 배너 */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Laptop className="size-4 text-amber-700" />
              <span>수강 전 필수 준비물</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-amber-800 font-medium">
              <li>• 개인 노트북 &amp; 충전기 지참 필수</li>
              <li>• Claude Pro 결제 및 사전 로그인</li>
              <li>• 크롬 브라우저 최신 버전 설치</li>
            </ul>
            <Link
              href="/guides/prep"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
            >
              <span>준비 가이드 상세 보기 →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
