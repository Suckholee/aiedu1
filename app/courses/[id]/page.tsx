'use client';

import { usePlatform } from '@/contexts/PlatformContext';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Star,
  ChevronRight,
  Clock,
  Users,
  ShieldCheck,
  Award,
  Smartphone,
  MessageSquare,
  FileText,
  PlayCircle,
  Lock,
  Share2,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { SeatHoldCheckoutModal } from '@/components/course/SeatHoldCheckoutModal';
import { WriteReviewModal } from '@/components/reviews/WriteReviewModal';
import { toast } from 'sonner';
import { AiWorkAutomationView } from '@/components/course/AiWorkAutomationView';
import { courseInstructorProfiles, hasWorkAutomationLanding, publicCourseDescription } from '@/lib/course-presentation';
import { CourseInstructorProfiles } from '@/components/course/CourseInstructorProfiles';

export default function CourseDetailPage() {
  const { data, ready } = usePlatform();
  const COURSES = data.courses.filter(c => c.published);
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const course = COURSES.find((c) => c.id === courseId);

  const [activeTab, setActiveTab] = useState<'intro' | 'curriculum' | 'reviews'>('intro');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [openChapterId, setOpenChapterId] = useState<string>(course?.curriculum[0]?.id || 'c1');

  if (!ready) return <p>과정을 불러오는 중입니다.</p>;
  if (!course) return <p>과정을 찾을 수 없습니다. <Link href='/courses'>목록으로</Link></p>;

  const description = publicCourseDescription(course.description);
  const instructors = course.instructors ?? courseInstructorProfiles(course.instructor);
  const hasPreview = course.curriculum.some(chapter => chapter.lessons.some(lesson => lesson.isFreePreview));
  if (hasWorkAutomationLanding(course.id)) return <AiWorkAutomationView course={course}/>;

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* Breadcrumb matching Slide 32 */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/" className="hover:text-blue-600 transition">홈</Link>
        <ChevronRight className="size-3" />
        <Link href="/courses" className="hover:text-blue-600 transition">교육과정</Link>
        <ChevronRight className="size-3" />
        <span className="text-blue-600 font-bold">{course.category}</span>
        <ChevronRight className="size-3" />
        <span className="text-slate-800 truncate max-w-xs">{course.title}</span>
      </div>

      {/* Main 2-Column Content Layout matching Slide 32 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Column: Course Main Details */}
        <div className="space-y-8 min-w-0">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-black text-blue-700">
                {course.badge || 'BEST'}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {course.category}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                난이도: {course.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              {course.subtitle}
            </p>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-slate-900 text-sm">{course.rating}</span>
                <span>({course.reviewCount.toLocaleString()}개 수강평)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="size-3.5 text-slate-400" />
                <span>수강생 {course.studentCount.toLocaleString()}명</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="size-3.5 text-slate-400" />
                <span>{course.durationText}</span>
              </div>
            </div>
          </div>

          {/* Hero Video / Thumbnail preview matching Slide 32 */}
          <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-900 overflow-hidden shadow-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnail}
              alt={course.title}
              className="size-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
              {hasPreview && <button
                type="button"
                onClick={() => router.push('/materials')}
                className="grid size-16 place-items-center rounded-full bg-white/90 text-blue-600 shadow-2xl hover:scale-110 active:scale-95 transition-all"
              >
                <PlayCircle className="size-9 fill-blue-600 text-white" />
              </button>}
            </div>
            <div className="absolute bottom-4 left-4 text-white text-xs font-semibold drop-shadow-md">
              {hasPreview ? '무료 미리보기 자료 확인' : `${course.startDate} · ${course.location}`}
            </div>
          </div>

          {/* Navigation Tabs matching Slide 32 */}
          <div className="border-b border-slate-200 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('intro')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'intro'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              강의 소개
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'curriculum'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              커리큘럼 ({course.lectureCount}강)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              수강평 {course.reviewCount.toLocaleString()}
            </button>
          </div>

          {/* Tab 1: 강의 소개 */}
          {activeTab === 'intro' && (
            <div className="space-y-6">
              {description && <section className="rounded-2xl border bg-white p-6"><h3 className="mb-3 text-lg font-bold">과정 소개</h3><p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{description}</p></section>}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">이런 분들께 강력 추천합니다</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {course.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                        ✓
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Bio Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">강사 소개</h3>
                <CourseInstructorProfiles profiles={instructors}/>
              </div>
            </div>
          )}

          {/* Tab 2: 커리큘럼 아코디언 */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>총 {course.curriculum.length}개 챕터 • {course.lectureCount}개 차시</span>
                <button
                  type="button"
                  onClick={() => setOpenChapterId(openChapterId ? '' : 'c1')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {openChapterId ? '모두 접기' : '모두 펼치기'}
                </button>
              </div>

              <div className="space-y-3">
                {!course.curriculum.length && <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">세부 커리큘럼은 준비 중입니다. 일정과 장소는 강의 소개에서 확인해주세요.</p>}
                {course.curriculum.map((chapter) => {
                  const isOpen = openChapterId === chapter.id;
                  return (
                    <div
                      key={chapter.id}
                      className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenChapterId(isOpen ? '' : chapter.id)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/50 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-xl bg-blue-100 text-blue-700 font-black text-xs">
                            {chapter.chapterNumber}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{chapter.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {chapter.lessons.length}개 차시 • {chapter.durationMinutes}분
                            </p>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="size-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-400" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 px-5 py-2">
                          {chapter.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between py-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <PlayCircle className="size-4 text-slate-400" />
                                <span className="font-semibold text-slate-800">
                                  {lesson.lessonNumber}. {lesson.title}
                                </span>
                                {lesson.isFreePreview && (
                                  <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.2 text-[10px] font-bold">
                                    무료 체험
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-slate-400">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: 수강평 & 작성 모달 트리거 */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-4xl font-black text-slate-900">{course.rating}</span>
                    <span className="text-sm text-slate-400"> / 5.0</span>
                    <div className="flex items-center gap-1 mt-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
                >
                  수강평 작성하기
                </button>
              </div>

              <div className="space-y-4">{data.reviews.filter(r=>r.courseId===course.id && r.approved).map(r=><article key={r.id} className="rounded-xl border bg-white p-5"><strong>{r.author} {r.rating}/5</strong><p className="mt-2 whitespace-pre-wrap">{r.content}</p></article>)}</div>
            </div>
          )}
        </div>

        {/* Right Sticky Column: Seat Reservation Card matching Slide 32 */}
        <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md space-y-6">
          {/* Price & D-Day */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-0.5 text-xs font-black">
                {course.dDay}
              </span>
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className={`p-1.5 rounded-lg border transition ${
                  isLiked ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-400'
                }`}
                title="찜하기"
              >
                <Heart className={`size-4 ${isLiked ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950">
                ₩ {course.price.toLocaleString()}
              </span>
              <span className="rounded-md bg-rose-500 text-white px-1.5 py-0.5 text-xs font-black">
                {course.discountRate}% OFF
              </span>
            </div>
            <p className="text-xs text-slate-400 line-through mt-0.5">
              정가 ₩ {course.originalPrice.toLocaleString()}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setCheckoutModalOpen(true)}
              disabled={course.enrollmentOpen===false || course.remainingSeats<=0}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-extrabold text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-98 transition"
            >
              {course.enrollmentOpen===false?'모집 마감':course.remainingSeats<=0?'정원 마감':'신청하기'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/my-applications')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <ShoppingCart className="size-4" />
              <span>내 신청·결제 목록</span>
            </button>
          </div>

          {/* Benefits List matching Slide 32 */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
            <h5 className="font-bold text-slate-900 text-xs">수강 안내</h5>
            <div className="flex items-center gap-2">
              <Award className="size-4 text-blue-600" />
              <span>신청 접수와 수강 승인은 별도 처리</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-blue-600" />
              <span>모바일에서 신청 내역 확인</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-blue-600" />
              <span>문의 사항은 신청 메모로 전달</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-blue-600" />
              <span>주문별 납부 안내와 처리 상태 확인</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 32 Checkout Modal */}
      <SeatHoldCheckoutModal
        courseId={course.id}
        open={checkoutModalOpen}
        onOpenChange={setCheckoutModalOpen}
        courseTitle={course.title}
        price={course.price}
        originalPrice={course.originalPrice}
      />

      {/* Slide 73 Review Modal */}
      <WriteReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        courseTitle={course.title}
      />
    </div>
  );
}
