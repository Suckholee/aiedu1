'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Flame,
  PlaySquare,
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  Volume2,
  Clock,
  Tag,
  ArrowRight,
  Eye,
  CheckCircle2,
  X,
  Share2,
} from 'lucide-react';
import { EARLY_BIRD_ITEMS, EarlyBirdContent } from '@/data/early-bird-gallery';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';

export default function EarlyBirdGalleryPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'shorts' | 'blog'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 모달 상태
  const [activeItem, setActiveItem] = useState<EarlyBirdContent | null>(null);
  const [modalTab, setModalTab] = useState<'shorts' | 'blog'>('shorts');

  // 업종 목록 추출
  const industries = useMemo(() => {
    const list = Array.from(new Set(EARLY_BIRD_ITEMS.map((item) => item.industry)));
    return ['all', ...list];
  }, []);

  // 필터링된 결과
  const filteredItems = useMemo(() => {
    return EARLY_BIRD_ITEMS.filter((item) => {
      // 1. 유형 필터
      if (selectedType === 'shorts' && !item.shortsData) return false;
      if (selectedType === 'blog' && !item.blogData) return false;

      // 2. 업종 필터
      if (selectedIndustry !== 'all' && item.industry !== selectedIndustry) return false;

      // 3. 검색어 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchApplicant = item.applicant.toLowerCase().includes(query);
        const matchIndustry = item.industry.toLowerCase().includes(query);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchApplicant && !matchIndustry && !matchTags) return false;
      }

      return true;
    });
  }, [selectedType, selectedIndustry, searchQuery]);

  const openModal = (item: EarlyBirdContent, defaultTab: 'shorts' | 'blog') => {
    setActiveItem(item);
    setModalTab(defaultTab);
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('갤러리 링크가 클립보드에 복사되었습니다.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#10024a] pb-24 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(168,85,247,.3),transparent_35%),radial-gradient(circle_at_80%_65%,rgba(236,72,153,.25),transparent_30%)]" />

      {/* Hero Banner */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-[#180055] to-transparent py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-4 py-1.5 text-xs font-bold text-fuchsia-200">
            <Flame className="size-4 text-fuchsia-400" />
            <span>얼리버드 신청자 전용 맞춤 콘텐츠 갤러리</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
            얼리버드 <span className="bg-gradient-to-r from-fuchsia-300 via-pink-200 to-violet-300 bg-clip-text text-transparent">AI 숏폼 &amp; 블로그</span> 쇼케이스
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-violet-200/80 leading-relaxed">
            9월 7일 ~ 9월 14일 얼리버드 기간 내 접수해 주신 수강생분들의 업종과 매장에 맞춰<br className="hidden sm:inline" />
            AI로 사전 제작된 <strong>30초 숏폼 영상</strong>과 <strong>네이버 블로그 글</strong>을 확인해 보세요.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-lg transition hover:scale-105"
            >
              <span>나도 얼리버드 혜택 신청하기</span>
              <ExternalLink className="size-4" />
            </a>

            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Share2 className="size-4" />
              <span>갤러리 공유</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          {/* Format tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-pan-x">
            {[
              { key: 'all', label: '전체 보기', icon: Sparkles },
              { key: 'shorts', label: '숏폼 영상 (Shorts)', icon: PlaySquare },
              { key: 'blog', label: '블로그 포스팅 (Blog)', icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as any)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition active:scale-95 ${
                  selectedType === key
                    ? 'bg-fuchsia-600 text-white shadow-md'
                    : 'bg-white/10 text-violet-200 hover:bg-white/15'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-full sm:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-violet-300" />
            <input
              type="text"
              placeholder="업종, 키워드, 신청자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-9 pr-4 text-xs text-white placeholder-violet-300/60 outline-none focus:border-fuchsia-400 focus:bg-white/15 transition"
            />
          </div>
        </div>

        {/* Industry filter tags */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto py-2 text-xs no-scrollbar touch-pan-x">
          <span className="shrink-0 text-violet-300/70 font-semibold text-[11px]">업종 분류:</span>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition active:scale-95 ${
                selectedIndustry === ind
                  ? 'bg-violet-500 text-white font-bold'
                  : 'bg-white/5 text-violet-200/80 hover:bg-white/10'
              }`}
            >
              {ind === 'all' ? '전체 업종' : ind}
            </button>
          ))}
        </div>

        {/* Gallery Cards Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-fuchsia-400/50 hover:bg-white/10 hover:shadow-2xl"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-fuchsia-500/20 px-2.5 py-1 text-[10px] font-black text-fuchsia-300">
                    {item.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-violet-300 font-bold">
                    <span>{item.applicant} 대표님</span>
                    <span className="text-white/20">•</span>
                    <span className="text-[11px] text-violet-400">{item.industry}</span>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-black text-white group-hover:text-fuchsia-300 transition leading-snug">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="mt-1 text-xs text-violet-200/80 leading-relaxed line-clamp-2">
                    {item.subtitle}
                  </p>
                )}

                {/* Shorts / Blog Mini Preview Chips */}
                <div className="mt-4 space-y-2">
                  {item.shortsData && (
                    <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/40 p-3 text-xs text-indigo-200">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-bold text-indigo-300">
                          <PlaySquare className="size-3.5" />
                          30초 숏폼 ({item.shortsData.duration})
                        </span>
                        <span className="text-[10px] text-indigo-400">{item.shortsData.hookStyle} 후킹</span>
                      </div>
                      <p className="mt-1.5 font-medium text-white/90 italic">
                        {item.shortsData.hookText}
                      </p>
                    </div>
                  )}

                  {item.blogData && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/40 p-3 text-xs text-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-bold text-emerald-300">
                          <FileText className="size-3.5" />
                          네이버 블로그 포스팅
                        </span>
                        <span className="text-[10px] text-emerald-400">SEO 최적화</span>
                      </div>
                      <p className="mt-1.5 text-slate-200 line-clamp-2">
                        {item.blogData.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-violet-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
                {item.shortsData && (
                  <button
                    onClick={() => openModal(item, 'shorts')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500"
                  >
                    <PlaySquare className="size-3.5" />
                    <span>숏폼 보기</span>
                  </button>
                )}

                {item.blogData && (
                  <button
                    onClick={() => openModal(item, 'blog')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                  >
                    <FileText className="size-3.5" />
                    <span>블로그 보기</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 py-16 text-center text-violet-300">
            <Sparkles className="mx-auto size-8 text-violet-400" />
            <p className="mt-3 text-base font-bold text-white">조건에 맞는 콘텐츠가 없습니다</p>
            <p className="mt-1 text-xs">다른 검색어나 업종 필터를 선택해 보세요.</p>
          </div>
        )}
      </section>

      {/* ── Detail Modal (Shorts & Blog Viewer) ── */}
      <Dialog open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="w-[94vw] sm:max-w-2xl border-violet-800 bg-[#17024e] p-4 sm:p-6 text-white max-h-[92vh] overflow-y-auto rounded-3xl">
          {activeItem && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-4">
                  <span className="rounded-lg bg-fuchsia-500/20 px-2.5 py-1 text-xs font-bold text-fuchsia-300">
                    {activeItem.industry} · {activeItem.applicant} 대표님 맞춤
                  </span>
                </div>
                <DialogTitle className="mt-3 text-xl sm:text-2xl font-black text-white leading-snug">
                  {activeItem.title}
                </DialogTitle>
              </DialogHeader>

              {/* Tab Selector if both exist */}
              {activeItem.shortsData && activeItem.blogData && (
                <div className="mt-4 flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setModalTab('shorts')}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      modalTab === 'shorts' ? 'bg-indigo-600 text-white shadow' : 'text-violet-200 hover:text-white'
                    }`}
                  >
                    <PlaySquare className="size-3.5" />
                    <span>30초 숏폼 영상 대본</span>
                  </button>
                  <button
                    onClick={() => setModalTab('blog')}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      modalTab === 'blog' ? 'bg-emerald-600 text-white shadow' : 'text-violet-200 hover:text-white'
                    }`}
                  >
                    <FileText className="size-3.5" />
                    <span>네이버 블로그 전문</span>
                  </button>
                </div>
              )}

              {/* Tab Content: Shorts */}
              {modalTab === 'shorts' && activeItem.shortsData && (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs">
                    <div>
                      <p className="text-[11px] text-violet-300">영상 분량</p>
                      <p className="font-bold text-white mt-0.5">{activeItem.shortsData.duration}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-violet-300">후킹 스타일</p>
                      <p className="font-bold text-fuchsia-300 mt-0.5">{activeItem.shortsData.hookStyle}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-violet-300">추천 음성</p>
                      <p className="font-bold text-indigo-300 mt-0.5">{activeItem.shortsData.voiceType}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs font-bold text-fuchsia-300 mb-2">🎬 씬별 나레이션 &amp; 화면 연출</p>
                    <div className="space-y-3">
                      {activeItem.shortsData.scriptScenes.map((scene) => (
                        <div key={scene.sceneNum} className="rounded-xl bg-white/5 p-3 text-xs">
                          <div className="flex items-center gap-2 font-bold text-indigo-300">
                            <span>Scene {scene.sceneNum}</span>
                            <span className="text-white/40">|</span>
                            <span className="text-slate-300 font-normal">{scene.caption}</span>
                          </div>
                          <p className="mt-1.5 text-sm font-medium text-white leading-relaxed">
                            🗣️ "{scene.narration}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                    <a
                      href="https://viskits.ai/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 py-3 text-xs font-black text-white shadow-md transition hover:opacity-95"
                    >
                      <Sparkles className="size-4" />
                      <span>VisKits에서 영상 바로 만들기</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                    <Link
                      href="/tools/shorts"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-violet-200 transition hover:bg-white/20"
                    >
                      <PlaySquare className="size-3.5" />
                      <span>대본 빌더</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab Content: Blog */}
              {modalTab === 'blog' && activeItem.blogData && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs">
                    <p className="text-violet-300 font-bold mb-1">🎯 타깃 독자</p>
                    <p className="text-white leading-relaxed">{activeItem.blogData.targetAudience}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {activeItem.blogData.keywords.map((kw) => (
                        <span key={kw} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm max-h-80 overflow-y-auto">
                    <div className="mb-4 border-b border-slate-100 pb-3">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {activeItem.blogData.platform}
                      </span>
                      <h4 className="mt-1.5 text-base font-black text-slate-900">{activeItem.title}</h4>
                    </div>

                    <div
                      className="prose prose-sm text-slate-700"
                      dangerouslySetInnerHTML={{ __html: activeItem.blogData.contentHtml }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                      href="/tools/blog"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-500"
                    >
                      <FileText className="size-4" />
                      <span>내 블로그 글 만들기 (블로그 스튜디오 바로가기)</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
