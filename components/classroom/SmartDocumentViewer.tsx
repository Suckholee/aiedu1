'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Printer,
  CheckCircle2,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  FileCheck,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartDocumentViewerProps {
  documentTitle?: string;
  courseTitle?: string;
  onClose?: () => void;
}

export function SmartDocumentViewer({
  documentTitle = '3. 데이터 전처리 및 AI 프롬프트 분석.pptx',
  courseTitle = 'AI 업무자동화 실전 마스터 클래스',
  onClose,
}: SmartDocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [thumbnailsVisible, setThumbnailsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  const totalPages = 25;

  const slidesData = [
    {
      page: 1,
      badge: 'Chapter 01',
      title: 'AI 업무자동화의 첫걸음',
      subtitle: '말로 한 3시간 상담이 보고서로 변환되는 프로세스 개요',
      content:
        '전통적인 업무 방식에서는 회의록 작성과 사후 정리에만 평균 2~3시간이 소요됩니다. 본 차시에서는 생성형 AI와 파이프라인 설계를 통해 회의 즉시 보고서 초안을 완성하는 핵심 원리를 학습합니다.',
      tags: ['클로드 지식베이스', '프롬프트 체이닝', '서식 자동화'],
    },
    {
      page: 2,
      badge: 'Chapter 02',
      title: '데이터 정제와 음성 전사 분석',
      subtitle: '비정형 음성 데이터에서 핵심 안건과 액션 아이템 추출',
      content:
        '회의 중 발생하는 사족과 반복 발언을 제거하고, 의사결정권자에게 꼭 필요한 5대 핵심 항목(배경, 현황, 문제점, 대안, 실행계획)으로 자동 재배치하는 방법을 실습합니다.',
      tags: ['Whisper STT', '노이즈 필터링', '액션아이템'],
    },
    {
      page: 3,
      badge: 'Chapter 03',
      title: '네이버 스마트에디터 ONE 서식 변환',
      subtitle: '클립보드 스타일 깨짐 없는 스마트 옮겨쓰기 파이프라인',
      content:
        '웹 브라우저의 DOM 구조와 네이버 블로그 에디터의 인라인 CSS 렌더링 특성을 이해하고, 카드형 박스, 소제목 하이라이트가 완벽하게 유지되는 클립보드 복사 엔진을 연동합니다.',
      tags: ['스마트에디터ONE', 'HTML 인라인스타일', 'SEO 최적화'],
    },
    {
      page: 4,
      badge: 'Chapter 04',
      title: 'VisKits 숏폼 영상 제작 및 자동 믹싱',
      subtitle: '텍스트에서 바이럴 영상까지 원스톱 미디어 파이프라인',
      content:
        '강의 또는 상담 요약 텍스트를 30초 내외의 숏폼 스크립트로 분할하고, ElevenLabs 및 Edge-TTS 음성 합성, 자막 싱크 배치, 배경음악 자동 페이드인/아웃을 구현합니다.',
      tags: ['AI 성우', 'BGM 자동 믹싱', '유튜브 쇼츠'],
    },
  ];

  const currentSlide = slidesData[(currentPage - 1) % slidesData.length];

  const handleDownload = (format: string) => {
    toast.success(`${documentTitle} (${format}) 다운로드를 시작합니다.`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden text-left">
      {/* Top action header matching Slide 46 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-500 text-white font-black text-xs shadow-xs">
            P
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {documentTitle}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              내 강의실 &gt; {courseTitle} &gt; 강의자료
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownload('PDF')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>PDF 다운로드</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownload('PPTX 원본')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>원본 파일(PPTX) 다운로드</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info('새 창에서 고화질 뷰어가 실행됩니다.')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
          >
            <ExternalLink className="size-3.5" />
            <span>새 창에서 열기</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              title="닫기"
            >
              닫기
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[560px]">
        {/* Left Thumbnails Strip matching Slide 46 */}
        {thumbnailsVisible && (
          <div className="w-full lg:w-56 shrink-0 border-r border-slate-200 bg-slate-50/50 p-3 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-[11px] text-emerald-800 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>PDF 및 미리보기 변환 완료</span>
              </div>

              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                페이지 미리보기
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-full text-left rounded-xl border p-2 transition-all group ${
                      currentPage === pNum
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="h-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                        {slidesData[(pNum - 1) % slidesData.length].badge}
                      </span>
                      <span className="text-[9px] text-slate-500 truncate w-full">
                        {slidesData[(pNum - 1) % slidesData.length].title}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
                      <span>슬라이드 {pNum}</span>
                      {currentPage === pNum && (
                        <span className="text-blue-600 font-bold">선택됨</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setThumbnailsVisible(false)}
              className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1.5 rounded-lg border border-slate-200 bg-white transition"
            >
              <PanelLeftClose className="size-3.5" />
              <span>썸네일 숨기기</span>
            </button>
          </div>
        )}

        {/* Main Viewer Canvas matching Slide 46 */}
        <div className="flex-1 flex flex-col bg-[#262A30] overflow-hidden">
          {/* Reader Top Dark Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-700/80 bg-[#1E2228] px-4 py-2 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              {!thumbnailsVisible && (
                <button
                  type="button"
                  onClick={() => setThumbnailsVisible(true)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="썸네일 보이기"
                >
                  <PanelLeftOpen className="size-4" />
                </button>
              )}

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 rounded text-slate-300 hover:bg-slate-700"
                title="축소"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="font-mono text-xs text-slate-300 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 rounded text-slate-300 hover:bg-slate-700"
                title="확대"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>

            {/* Utilities */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.info('회전되었습니다.')}
                className="p-1 rounded text-slate-300 hover:bg-slate-700"
                title="회전"
              >
                <RotateCw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => toast.info('전체화면으로 전환됩니다.')}
                className="p-1 rounded text-slate-300 hover:bg-slate-700"
                title="전체화면"
              >
                <Maximize2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1 rounded text-slate-300 hover:bg-slate-700"
                title="인쇄"
              >
                <Printer className="size-4" />
              </button>
            </div>
          </div>

          {/* Presentation Slide Canvas */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#2B3038]">
            <div
              className="w-full max-w-3xl aspect-[16/9] bg-white rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col justify-between transition-transform duration-200 border border-slate-200"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                    {currentSlide.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    AI Business Automation Curriculum
                  </span>
                </div>

                <h2 className="mt-6 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentSlide.title}
                </h2>
                <h3 className="mt-2 text-sm sm:text-base font-bold text-blue-600">
                  {currentSlide.subtitle}
                </h3>

                <p className="mt-6 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {currentSlide.content}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentSlide.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-400 font-mono">
                  Slide {currentPage} / {totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata & Version history matching Slide 46 */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`text-xs font-bold pb-1 transition-all ${
              activeTab === 'info'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            파일 정보
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`text-xs font-bold pb-1 transition-all ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            변환 이력
          </button>
        </div>

        {activeTab === 'info' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">파일명</span>
              <span className="font-semibold text-slate-800">{documentTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">파일 크기</span>
              <span className="font-semibold text-slate-800">12.4 MB</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">업로드 일시</span>
              <span className="font-semibold text-slate-800">2025.05.20 14:30</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">파일 형식</span>
              <span className="font-semibold text-slate-800">PPTX &rarr; PDF, 미리보기 생성 완료</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600 space-y-1">
            <p>• v1.2 (2025.05.20 14:30) - 3파트 숏폼 실습 프롬프트 및 예시 코드 갱신</p>
            <p>• v1.1 (2025.05.10 11:15) - 2파트 네이버 스마트에디터 ONE 서식 호환 가이드 추가</p>
            <p>• v1.0 (2025.05.01 09:00) - 초기 교안 업로드 및 PDF 변환 완료</p>
          </div>
        )}
      </div>
    </div>
  );
}
