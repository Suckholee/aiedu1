'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Download,
  Copy,
  Check,
  Sparkles,
  FileText,
  UploadCloud,
  Plus,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  Laptop,
  CheckCircle2,
  Eye,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import { SmartDocumentViewer } from '@/components/classroom/SmartDocumentViewer';
import { toast } from 'sonner';

interface MaterialItem {
  id: string;
  name: string;
  type: 'pptx' | 'pdf' | 'link';
  size?: string;
  date: string;
  isPublic: boolean;
  url?: string;
}

interface ChapterMaterials {
  chapterNumber: number;
  title: string;
  items: MaterialItem[];
}

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<'by-chapter' | 'all'>('by-chapter');
  const [linkInput, setLinkInput] = useState('');
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<string | null>(null);
  const [openChapterNums, setOpenChapterNums] = useState<number[]>([1, 2]);

  const [chapters, setChapters] = useState<ChapterMaterials[]>([
    {
      chapterNumber: 1,
      title: '01. AI 업무자동화의 이해 & 클로드 지식베이스 구축',
      items: [
        {
          id: 'm-1',
          name: '01_AI_업무자동화_개요_및_클로드_지식베이스.pptx',
          type: 'pptx',
          size: '12.4 MB',
          date: '2025.05.20 14:30',
          isPublic: true,
        },
        {
          id: 'm-2',
          name: '클로드_실무_프롬프트_5단구조_템플릿.pdf',
          type: 'pdf',
          size: '3.6 MB',
          date: '2025.05.20 14:31',
          isPublic: true,
        },
        {
          id: 'm-3',
          name: '조영빈 대표 말로한 회의 실시간 변환 시연 영상 (YouTube)',
          type: 'link',
          date: '2025.05.20 14:32',
          isPublic: true,
          url: 'https://youtube.com',
        },
      ],
    },
    {
      chapterNumber: 2,
      title: '02. 네이버 블로그 스마트 옮겨쓰기 & 사진 드라이브',
      items: [
        {
          id: 'm-4',
          name: '02_네이버_스마트에디터ONE_서식_변환_가이드.pptx',
          type: 'pptx',
          size: '15.8 MB',
          date: '2025.05.21 10:15',
          isPublic: true,
        },
        {
          id: 'm-5',
          name: '이석호_대표_HTML_인라인_스타일_치트시트.pdf',
          type: 'pdf',
          size: '4.2 MB',
          date: '2025.05.21 10:20',
          isPublic: true,
        },
      ],
    },
    {
      chapterNumber: 3,
      title: '03. VisKits 숏폼 영상 제작 & SNS 바이럴',
      items: [
        {
          id: 'm-6',
          name: '03_VisKits_AI_숏폼_대본_및_TTS_자동화.pptx',
          type: 'pptx',
          size: '18.2 MB',
          date: '2025.05.22 09:40',
          isPublic: true,
        },
        {
          id: 'm-7',
          name: '박재범_대표_30초_바이럴_숏폼_템플릿.pdf',
          type: 'pdf',
          size: '2.9 MB',
          date: '2025.05.22 09:45',
          isPublic: true,
        },
      ],
    },
    {
      chapterNumber: 4,
      title: '04. AI 루틴 캘린더 & CEO 모바일 1초 승인 콕핏',
      items: [
        {
          id: 'm-8',
          name: '04_AI_루틴_캘린더_비즈니스_워크플로우.pptx',
          type: 'pptx',
          size: '8.7 MB',
          date: '2025.05.23 15:00',
          isPublic: true,
        },
      ],
    },
  ]);

  const toggleChapter = (num: number) => {
    if (openChapterNums.includes(num)) {
      setOpenChapterNums(openChapterNums.filter((n) => n !== num));
    } else {
      setOpenChapterNums([...openChapterNums, num]);
    }
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) {
      toast.error('링크 URL을 입력해주세요.');
      return;
    }
    toast.success('학습 링크가 성공적으로 추가되었습니다!');
    setLinkInput('');
  };

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* Top Header matching Slide 45 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">홈</Link>
            <span>&gt;</span>
            <span className="text-slate-800">교육 자료실 &amp; 강의실</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            교육 자료 관리 및 온라인 강의실
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            차시별로 학습 자료를 업로드하거나 스마트 뷰어로 편리하게 열람할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDocForViewer('01_AI_업무자동화_개요_및_클로드_지식베이스.pptx')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
        >
          <Eye className="size-4" />
          <span>스마트 뷰어로 보기</span>
        </button>
      </div>

      {/* If a document is selected for Smart Viewer (Slide 46), display the viewer */}
      {selectedDocForViewer && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">
              📌 인터랙티브 교안 뷰어 모드 (Slide 46 규격)
            </span>
            <button
              type="button"
              onClick={() => setSelectedDocForViewer(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              목록으로 돌아가기
            </button>
          </div>
          <SmartDocumentViewer
            documentTitle={selectedDocForViewer}
            onClose={() => setSelectedDocForViewer(null)}
          />
        </div>
      )}

      {/* Tabs matching Slide 45 */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('by-chapter')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'by-chapter'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          차시별 관리
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          전체 자료 관리
        </button>
      </div>

      {/* Top 2-Column: Upload Dropzone & Link Addition matching Slide 45 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Dropzone */}
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-8 text-center flex flex-col items-center justify-center space-y-3 hover:bg-blue-50/70 transition">
          <div className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-600">
            <UploadCloud className="size-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              파일을 여기에 드롭하거나 클릭하여 업로드하세요
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              PPTX, PDF 파일만 업로드 가능 (최대 500MB)
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.info('파일 선택 창이 열립니다.')}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            파일 선택
          </button>
        </div>

        {/* Link Adder matching Slide 45 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800">외부 링크 추가</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                추가
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • http:// 또는 https://로 시작하는 유효한 URL을 입력하세요.<br />
              • YouTube, Vimeo 등 외부 영상 링크도 추가할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Materials Accordion matching Slide 45 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            차시 목록 <span className="text-xs text-slate-400 font-normal">(총 {chapters.length}개 차시)</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info('차시 순서 변경 모드입니다.')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              ⇅ 순서 변경
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter) => {
            const isOpen = openChapterNums.includes(chapter.chapterNumber);

            return (
              <div
                key={chapter.chapterNumber}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs"
              >
                {/* Chapter header */}
                <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-lg bg-slate-200 text-slate-700 font-bold text-xs">
                      {chapter.chapterNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{chapter.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toast.info('자료 업로드 창이 열립니다.')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Plus className="size-3.5" />
                      <span>자료 추가</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.chapterNumber)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                      {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Items Table inside Chapter matching Slide 45 */}
                {isOpen && (
                  <div className="divide-y divide-slate-100">
                    {chapter.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/40 transition text-xs"
                      >
                        {/* Title and Icon */}
                        <div className="flex items-center gap-3 min-w-0">
                          {item.type === 'pptx' ? (
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-orange-500 text-white font-black text-[10px]">
                              P
                            </span>
                          ) : item.type === 'pdf' ? (
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-red-500 text-white font-black text-[10px]">
                              PDF
                            </span>
                          ) : (
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-500 text-white font-black text-[10px]">
                              <LinkIcon className="size-3.5" />
                            </span>
                          )}

                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.name}</p>
                            {item.url && (
                              <p className="text-[10px] text-slate-400 truncate">{item.url}</p>
                            )}
                          </div>
                        </div>

                        {/* Meta & Actions */}
                        <div className="flex items-center gap-4 shrink-0 text-slate-500 text-[11px]">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-bold uppercase text-slate-600">
                            {item.type}
                          </span>
                          <span className="font-mono">{item.size || '-'}</span>
                          <span className="text-slate-400 hidden md:inline">{item.date}</span>

                          <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold text-[10px] border border-emerald-200">
                            공개
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDocForViewer(item.name)}
                              className="p-1 rounded hover:bg-slate-200 text-blue-600 font-bold"
                              title="스마트 뷰어로 열기"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.success(`${item.name} 다운로드`)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500"
                              title="다운로드"
                            >
                              <Download className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
