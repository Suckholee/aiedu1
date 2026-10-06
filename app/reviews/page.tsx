'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  ThumbsUp,
  Award,
  CheckCircle2,
  Building,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react';
import { STUDENT_REVIEWS, PARTNERS, StudentReview } from '@/data/reviews-partners';
import { WriteReviewModal } from '@/components/reviews/WriteReviewModal';
import { toast } from 'sonner';

export default function ReviewsAndPartnersPage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'partners'>('reviews');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<StudentReview[]>(STUDENT_REVIEWS);
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState<string>('전체');

  const partnerCategories = ['전체', '취업 연계 기업', 'SW·생산성 도구', '산학 협력 기관'];

  const filteredPartners = PARTNERS.filter(
    (p) => selectedPartnerCategory === '전체' || p.category === selectedPartnerCategory
  );

  const handleReviewAdded = (newReview: { rating: number; content: string; author: string }) => {
    const item: StudentReview = {
      id: `rev-${Date.now()}`,
      author: newReview.author,
      role: '실무 수강생',
      courseTitle: 'AI 업무자동화 실전 마스터 클래스',
      rating: newReview.rating,
      date: '2025.05.20',
      content: newReview.content,
      tags: ['신규 후기', '실전 적용'],
      helpfulCount: 0,
      isVerified: true,
    };
    setReviewsList([item, ...reviewsList]);
  };

  const handleHelpful = (id: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
    toast.success('도움이 되었다고 평가하셨습니다.');
  };

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* Top Header matching Slide 5 & 72 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">홈</Link>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">수강 후기 및 제휴사 생태계</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            수강 후기 및 제휴 파트너십
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            검증된 수강생들의 생생한 학습 후기와 신뢰할 수 있는 제휴 파트너사를 만나보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReviewModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
        >
          <Plus className="size-4" />
          <span>수강평 작성하기</span>
        </button>
      </div>

      {/* Tabs matching standard layout */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'reviews'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          수강생 후기 ({reviewsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('partners')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'partners'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          제휴 파트너사 ({PARTNERS.length})
        </button>
      </div>

      {/* Tab 1: 수강생 후기 matching Slide 73 */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          {/* Stats Overview Card matching Slide 73 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-center shadow-xs">
            {/* Left: Overall rating */}
            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
              <span className="text-xs font-bold text-slate-500 block mb-1">수강생 전체 평점</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">4.9</span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mt-2 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">전체 수강평 1,248개 기준</p>
            </div>

            {/* Right: Star bars */}
            <div className="space-y-2 text-xs">
              {[
                { stars: 5, pct: 88 },
                { stars: 4, pct: 9 },
                { stars: 3, pct: 2 },
                { stars: 2, pct: 1 },
                { stars: 1, pct: 0 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-8 font-bold text-slate-600">{row.stars}점</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-slate-400">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List matching Slide 73 */}
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4 hover:shadow-xs transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-slate-100 font-bold text-slate-700 text-sm">
                      {rev.author[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{rev.author}</span>
                        <span className="text-xs text-slate-500">
                          ({rev.role} {rev.company && `• ${rev.company}`})
                        </span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            수강 인증
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                        {rev.courseTitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-0.5 text-amber-400 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {rev.content}
                </p>

                {/* Tags and Helpful Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHelpful(rev.id)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition font-medium"
                  >
                    <ThumbsUp className="size-3.5" />
                    <span>도움돼요 {rev.helpfulCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: 제휴 파트너사 matching Slide 76 & 77 */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {partnerCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedPartnerCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  selectedPartnerCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-xl bg-gradient-to-tr ${partner.logoColor} text-white font-black text-xs grid place-items-center shadow-xs`}
                      >
                        {partner.name.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{partner.name}</h4>
                        <span className="text-[11px] font-semibold text-blue-600">
                          {partner.category}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold">
                      {partner.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {partner.description}
                  </p>

                  <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs">
                    <span className="font-bold text-blue-900 block mb-0.5">수강생 전용 혜택:</span>
                    <span className="text-blue-700">{partner.benefit}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                  >
                    <span>공식 웹사이트</span>
                    <ExternalLink className="size-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => toast.success('제휴 연계 혜택 신청이 접수되었습니다.')}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    혜택 적용하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <WriteReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        courseTitle="AI 업무자동화 실전 마스터 클래스"
        onReviewSubmitted={handleReviewAdded}
      />
    </div>
  );
}
