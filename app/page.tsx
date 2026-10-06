'use client';

import React, { useState } from 'react';
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
  Star,
  Users,
  ShieldCheck,
  Building,
  PlayCircle,
  Eye,
} from 'lucide-react';
import { QuickLabLauncher } from '@/components/dashboard/QuickLabLauncher';
import { ParticipantRosterSection } from '@/components/course/ParticipantRosterSection';
import { COURSES, Course } from '@/data/courses';
import { STUDENT_REVIEWS, PARTNERS } from '@/data/reviews-partners';
import { SeatHoldCheckoutModal } from '@/components/course/SeatHoldCheckoutModal';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export default function HomePage() {
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const heroBanners = [
    {
      badge: '2025 AI 특별 실전 워크숍',
      title: '배움으로 미래를 설계하는 교육 파트너',
      subtitle: '말로 한 회의가 기획서·블로그·숏폼으로! 3시간 실전 업무혁신 마스터 클래스',
      accent: 'from-blue-600 via-indigo-600 to-purple-600',
      courseId: 'ai-work-automation-master',
    },
    {
      badge: 'CEO 전용 AI 에이전트 콕핏',
      title: '반복은 AI 직원팀에게, 최종 결정은 나에게',
      subtitle: '비서팀·마케팅팀·매장운영팀이 준비한 초안을 모바일에서 1초 만에 확인하고 승인하세요.',
      accent: 'from-amber-600 via-purple-600 to-indigo-700',
      link: '/tools/routine-calendar',
    },
    {
      badge: '스마트에디터 ONE 서식 변환',
      title: 'AI 블로그 & 사진 드라이브 무제한 자동화',
      subtitle: '클립보드 스타일 깨짐 없이 사진 캡션과 네이버 본문을 15분 만에 완성하세요.',
      accent: 'from-emerald-600 via-teal-600 to-blue-700',
      link: '/tools/blog',
    },
  ];

  const currentBanner = heroBanners[activeBannerIdx];

  const openCheckout = (course: Course) => {
    setSelectedCourseForModal(course);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-24 text-left">
      {/* ── 1. Hero Showcase Carousel matching Slide 3 & Slide 2 ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-[#111827] to-blue-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-blue-300 backdrop-blur-md border border-white/10">
            <Sparkles className="size-3.5 text-blue-400" />
            <span>{currentBanner.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {currentBanner.title}
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-medium">
            {currentBanner.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {currentBanner.courseId ? (
              <button
                type="button"
                onClick={() => openCheckout(COURSES[0])}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs sm:text-sm font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30 active:scale-98 transition"
              >
                <span>수강 신청하기 (잔여 12석)</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <Link
                href={currentBanner.link || '/'}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs sm:text-sm font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30 active:scale-98 transition"
              >
                <span>바로 체험하기</span>
                <ArrowRight className="size-4" />
              </Link>
            )}

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 backdrop-blur-sm transition"
            >
              <BookOpen className="size-4 text-blue-300" />
              <span>전체 교육과정 보기</span>
            </Link>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="relative z-10 mt-8 flex items-center gap-2">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveBannerIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                activeBannerIdx === i ? 'w-8 bg-blue-400' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`배너 ${i + 1}`}
            />
          ))}
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-blue-500/20 blur-3xl" />
      </section>

      {/* ── 2. 에듀아카데미 4대 핵심 서비스 강점 matching Slide 3 ── */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            에듀플랫폼의 주요 서비스 &amp; 핵심 강점
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            학습자 중심의 혁신적인 교육 경험으로 이론과 실무를 빈틈없이 연결합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2 hover:border-blue-300 transition">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <Bot className="size-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">실무 중심 커리큘럼</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              현업 전문가가 설계한 실습 기반 교육으로 즉시 업무에 쓰이는 자동화 파이프라인 완성.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2 hover:border-blue-300 transition">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
              <Users className="size-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">검증된 전문 강사진</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              대기업·스타트업 150회 이상 컨설팅 경력의 3대 대표 강사진이 직접 코칭합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2 hover:border-blue-300 transition">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <Clock className="size-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">맞춤형 학습 지원</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              1:1 학습 상담, 실전 프롬프트 팩 평생 소장 및 질문 답변 게시판 무제한 지원.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2 hover:border-blue-300 transition">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Award className="size-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">수료 후 생태계 혜택</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              수료증 공식 발급 및 3대 실습 스튜디오 무제한 라이선스, 파트너사 취업 연계 혜택.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. 이번 주 학습 현황 & AI 루틴 캘린더 위젯 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-stretch">
        {/* Left: 이번 주 학습 현황 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-700">김수강님의 이번 주 학습 현황</span>
              <p className="text-[11px] text-slate-400 mt-0.5">매일 꾸준한 배움이 실무의 생산성을 바꿉니다.</p>
            </div>
            <Link
              href="/materials"
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              <span>강의실 바로가기</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-blue-50/60 p-3.5">
              <span className="text-[10px] text-slate-400 font-bold block">주간 학습 시간</span>
              <span className="text-lg sm:text-xl font-black text-blue-700 mt-1 block">12시간 45분</span>
            </div>
            <div className="rounded-xl bg-emerald-50/60 p-3.5">
              <span className="text-[10px] text-slate-400 font-bold block">완료 강의</span>
              <span className="text-lg sm:text-xl font-black text-emerald-700 mt-1 block">8 / 12개</span>
            </div>
            <div className="rounded-xl bg-rose-50/60 p-3.5">
              <span className="text-[10px] text-slate-400 font-bold block">연속 학습 일수</span>
              <span className="text-lg sm:text-xl font-black text-rose-600 mt-1 block">7일 달성</span>
            </div>
          </div>
        </div>

        {/* Right: CEO AI 루틴 캘린더 콕핏 링크 */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500/10 to-indigo-500/10 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-900">
              <Sparkles className="size-3 text-amber-700" />
              CEO 전용 AI 에이전트 콕핏
            </span>
            <h3 className="text-base font-black text-slate-900">AI 루틴 캘린더</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              모바일 1초 승인 덱으로 비서팀, 마케팅팀의 업무 초안을 즉시 결재하세요!
            </p>
          </div>

          <Link
            href="/tools/routine-calendar"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            <Calendar className="size-3.5 text-amber-400" />
            <span>AI 루틴 캘린더 입장</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 4. ⚡ 3대 실습 스튜디오 퀵 런처 (Core Labs) ── */}
      <QuickLabLauncher />

      {/* ── 5. 추천 강의 & 개강 임박 강의 큐레이션 matching Slide 4 ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              지금, 주목해야 할 추천 &amp; 개강 임박 강의
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>전체보기</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COURSES.map((course) => {
            const seatPercent = Math.round(
              ((course.totalSeats - course.remainingSeats) / course.totalSeats) * 100
            );

            return (
              <div
                key={course.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all group"
              >
                <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                    <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 text-[10px] font-black">
                      {course.dDay}
                    </span>
                    {course.badge && (
                      <span className="rounded-md bg-slate-900 text-white px-1.5 py-0.5 text-[10px] font-bold">
                        {course.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600">{course.category}</span>
                    <Link href={`/courses/${course.id}`}>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug hover:text-blue-600 transition line-clamp-2 mt-0.5">
                        {course.title}
                      </h4>
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-1">{course.instructor.name}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>잔여 좌석</span>
                      <span className="font-bold text-emerald-600">
                        {course.remainingSeats} / {course.totalSeats}석
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-950">
                        ₩ {course.price.toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => openCheckout(course)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        신청하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. 수강생 명단 및 실시간 커뮤니티 ── */}
      <ParticipantRosterSection googleFormUrl={GOOGLE_FORM_URL} />

      {/* ── 7. 수강생 생생 후기 & 제휴사 로고 롤링 배너 matching Slide 5 & Slide 76 ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              수강생 후기 &amp; 신뢰받는 파트너사
            </h2>
            <p className="text-xs text-slate-500">
              사회적 증거와 산학 협력 파트너십을 통해 교육의 품질을 보증합니다.
            </p>
          </div>
          <Link
            href="/reviews"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>전체보기</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Reviews snippet grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STUDENT_REVIEWS.slice(0, 2).map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                  <span className="text-[11px] text-slate-400">({rev.role})</span>
                  <span className="rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 border border-emerald-200">
                    수강 인증
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {rev.content}
              </p>
            </div>
          ))}
        </div>

        {/* Partners Logos Roll matching Slide 5 & Slide 76 */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6">
          <span className="text-xs font-bold text-slate-400 block text-center mb-4 uppercase tracking-wider">
            공식 교육 협력 및 채용 연계 파트너십
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center text-center">
            {PARTNERS.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-xs transition"
              >
                <span className="text-xs font-black text-slate-800 block truncate">
                  {p.logoText}
                </span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {p.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 32 Seat Hold Modal */}
      {selectedCourseForModal && (
        <SeatHoldCheckoutModal
          open={checkoutModalOpen}
          onOpenChange={setCheckoutModalOpen}
          courseTitle={selectedCourseForModal.title}
          price={selectedCourseForModal.price}
          originalPrice={selectedCourseForModal.originalPrice}
        />
      )}
    </div>
  );
}
