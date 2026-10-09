'use client';

import { usePlatform } from '@/contexts/PlatformContext';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Course } from '@/data/courses';
import { SeatHoldCheckoutModal } from '@/components/course/SeatHoldCheckoutModal';

export default function CoursesPage() {
  const { data, ready } = usePlatform();
  const COURSES = data.courses.filter(c => c.published);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { const read = () => setSearchQuery(new URLSearchParams(window.location.search).get('q') ?? ''); read(); window.addEventListener('popstate', read); return () => window.removeEventListener('popstate', read); }, []);
  const categories = ['전체', 'AI·데이터', '업무자동화', '개발·백엔드', '비즈니스·마케팅'];

  const filteredCourses = COURSES.filter((c) => {
    const matchesCat = selectedCategory === '전체' || c.category === selectedCategory;
    const matchesQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const openCheckout = (course: Course) => {
    setSelectedCourseForModal(course);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16 text-left">
      <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="past-education-heading">
        <h2 id="past-education-heading" className="text-lg font-bold">지난 교육 이력</h2>
        <article className="mt-3 rounded-xl bg-slate-50 p-4">
          <span className="text-xs font-bold text-slate-500">교육 종료 · 2026년 9월 22일</span>
          <h3 className="mt-1 font-bold">AI 업무자동화</h3>
          <p className="mt-2 text-sm text-slate-600">17:00–20:00 · 가호스튜디오</p>
          <p className="mt-1 text-sm text-slate-600">문서·블로그·숏폼 콘텐츠 자동화 실습</p>
        </article>
      </section>
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">홈</Link>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">교육과정 탐색</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            전체 교육과정
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            현업 최고 전문가들이 설계한 실무 중심의 체계적인 커리큘럼을 만나보세요.
          </p>
        </div>

        {/* Search bar matching standard specs */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="강의명, 강사명, 키워드로 검색"
            className="h-10 w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {ready && filteredCourses.length === 0 && <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">{searchQuery || selectedCategory !== '전체' ? '조건에 맞는 교육과정이 없습니다.' : '등록된 교육과정이 없습니다.'}</p>}
      {/* Courses Grid matching standard platform card style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const seatPercent = Math.round(
            ((course.totalSeats - course.remainingSeats) / course.totalSeats) * 100
          );

          return (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all group"
            >
              {/* Thumbnail & Badges */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded-lg bg-blue-600 text-white px-2 py-0.5 text-[11px] font-black shadow-xs">
                    {course.dDay}
                  </span>
                  {course.badge && (
                    <span className="rounded-lg bg-slate-900 text-white px-2 py-0.5 text-[11px] font-bold">
                      {course.badge}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                  {course.durationText}
                </div>
              </div>

              {/* Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="text-blue-600 font-bold">{course.category}</span>
                    <span>•</span>
                    <span>난이도: {course.level}</span>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug hover:text-blue-600 transition">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.subtitle}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Instructor & Rating */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {course.instructor.name}
                    </span>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{course.rating}</span>
                      <span className="text-slate-400">({course.reviewCount})</span>
                    </div>
                  </div>

                  {/* Seat availability bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>실시간 잔여 좌석</span>
                      <span className="font-bold text-emerald-600">
                        {course.remainingSeats} / {course.totalSeats}석 남음
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${seatPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-rose-500 font-extrabold">
                          {course.discountRate}%
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₩{course.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-950">
                        ₩ {course.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCheckout(course)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
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

      {/* Seat Hold Checkout Modal */}
      {selectedCourseForModal && (
        <SeatHoldCheckoutModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          courseId={selectedCourseForModal.id}
          courseTitle={selectedCourseForModal.title}
          price={selectedCourseForModal.price}
          originalPrice={selectedCourseForModal.originalPrice}
        />
      )}
    </div>
  );
}
