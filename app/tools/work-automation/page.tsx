'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ListTodo,
  Camera,
  UploadCloud,
  FolderArchive,
  ScanLine,
  RefreshCw,
  FileCode,
  FileCheck2,
  Lock,
  Globe,
  Eye,
  Columns2,
  Maximize2,
  FileDown,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WebcamCaptureModal } from '@/components/drive/WebcamCaptureModal';
import { PhotoDriveModal } from '@/components/blog-automation/writer/PhotoDriveModal';
import { DocumentViewer } from '@/components/work-automation/DocumentViewer';
import { saveDrivePhotos } from '@/lib/blog-automation/photo-drive-storage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type DocType = 'proposal' | 'meeting' | 'bizplan' | 'summary';

const DOC_PRESETS = [
  {
    id: 'proposal',
    title: '신규 프로젝트 기획안 초안',
    desc: '키워드 몇 개로 임원 보고 수준의 목차와 세부 실행안 생성',
    icon: FileText,
  },
  {
    id: 'meeting',
    title: '회의록 3분 핵심 요약 & Action Item',
    desc: '난잡한 메모나 녹취록을 경영진 보고용 1페이지 브리핑으로 변환',
    icon: ListTodo,
  },
  {
    id: 'bizplan',
    title: '사업계획서 / 제안서 구조화',
    desc: '시장 분석, 3대 추진 전략, 리스크 대응 방안 체계화',
    icon: Briefcase,
  },
];

export default function WorkAutomationPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상위 모드 탭: 'template-gen' (표준 프롬프트 생성기) vs 'photo-extract' (사진 기반 양식 복원기)
  const [mainMode, setMainMode] = useState<'template-gen' | 'photo-extract'>('photo-extract');

  // ── 1. 표준 프롬프트 생성기 상태 ──
  const [selectedType, setSelectedType] = useState<DocType>('proposal');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');

  // ── 2. 문서/사진 기반 양식 복원기 상태 ──
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);
  const [docImageName, setDocImageName] = useState<string>('');
  const [docFileMeta, setDocFileMeta] = useState<{
    name: string;
    size: number;
    type: 'image' | 'pdf' | 'docx' | 'doc' | 'hwp' | 'hwpx' | 'pptx' | 'text' | 'excel' | 'other';
    ext: string;
  } | null>(null);
  const [extractedOriginalText, setExtractedOriginalText] = useState<string>('');
  const [workspaceViewMode, setWorkspaceViewMode] = useState<'split' | 'viewer' | 'editor'>('split');
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  // 파일 확장자 및 타입 분류 헬퍼
  const getDocFileType = (fileName: string): 'image' | 'pdf' | 'docx' | 'doc' | 'hwp' | 'hwpx' | 'pptx' | 'text' | 'excel' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    if (ext === 'doc') return 'doc';
    if (ext === 'hwp') return 'hwp';
    if (ext === 'hwpx') return 'hwpx';
    if (['pptx', 'ppt'].includes(ext)) return 'pptx';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    if (['txt', 'md', 'json'].includes(ext)) return 'text';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 복원된 양식 결과 상태
  const [extractedDocType, setExtractedDocType] = useState<string>('');
  const [extractedDocTitle, setExtractedDocTitle] = useState<string>('');
  const [editableTemplate, setEditableTemplate] = useState<string>('');
  const [extractedClaudePrompt, setExtractedClaudePrompt] = useState<string>('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedCustomPrompt, setCopiedCustomPrompt] = useState(false);

  // 사진 드라이브에서 '업무 양식 복원'을 통해 진입했을 때 자동 로드
  useEffect(() => {
    try {
      const pendingRaw = localStorage.getItem('pending_doc_analysis_photo');
      if (pendingRaw) {
        const photo = JSON.parse(pendingRaw);
        if (photo.url) {
          setMainMode('photo-extract');
          setDocImage(photo.url);
          setDocImageName(photo.name || '업무문서.jpg');
          setDocFileMeta({
            name: photo.name || '업무문서.jpg',
            size: 0,
            type: 'image',
            ext: 'jpg',
          });
          localStorage.removeItem('pending_doc_analysis_photo');
          toast.success(`📸 '${photo.name}' 사진을 불러왔습니다. 양식 분석을 시작합니다!`);
          // 자동 분석 실행
          setTimeout(() => {
            analyzeDocumentFile(photo.url, photo.name, 'image');
          }, 300);
        }
      }
    } catch (e) {}
  }, []);

  // ── 문서 파일(HWP, PDF, DOCX, PPTX, 이미지) 분석 API 호출 ──
  const analyzeDocumentFile = async (
    fileData: string,
    fileName: string,
    fileType?: string
  ) => {
    setIsAnalyzingDoc(true);
    setExtractedDocType('');
    setEditableTemplate('');
    setExtractedClaudePrompt('');

    try {
      const res = await fetch('/api/work-automation/analyze-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData,
          imageUrl: fileData, // 호환성 유지
          fileName: fileName || docImageName,
          docName: fileName || docImageName,
          fileType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '문서 분석에 실패했습니다.');
      }

      setExtractedDocType(data.docType);
      setExtractedDocTitle(data.detectedTitle);
      setEditableTemplate(data.templateMarkdown);
      setExtractedClaudePrompt(data.claudePrompt);
      if (data.extractedOriginalText) {
        setExtractedOriginalText(data.extractedOriginalText);
      }
      toast.success('🎉 AI가 문서의 목차, 표, 서식 틀을 성공적으로 복원했습니다!');
    } catch (err: any) {
      console.error(err);
      toast.error(`문서 분석 오류: ${err.message}`);
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // 공통 파일 처리 함수
  const processFile = (file: File) => {
    const fileType = getDocFileType(file.name);
    setDocFileMeta({
      name: file.name,
      size: file.size,
      type: fileType,
      ext: file.name.split('.').pop()?.toLowerCase() || '',
    });
    setDocImageName(file.name);

    if (docBlobUrl) {
      try {
        URL.revokeObjectURL(docBlobUrl);
      } catch (e) {}
    }
    const blobUrl = URL.createObjectURL(file);
    setDocBlobUrl(blobUrl);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDocImage(result);
      analyzeDocumentFile(result, file.name, fileType);
    };
    reader.readAsDataURL(file);
  };

  // 문서 등록 리셋 함수
  const handleResetDoc = () => {
    if (docBlobUrl) {
      try {
        URL.revokeObjectURL(docBlobUrl);
      } catch (e) {}
    }
    setDocBlobUrl(null);
    setDocImage(null);
    setDocFileMeta(null);
    setExtractedOriginalText('');
    setEditableTemplate('');
    setExtractedClaudePrompt('');
  };

  // 파일 직접 업로드 처리
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 양식 클립보드 복사
  const handleCopyTemplate = async () => {
    if (!editableTemplate) return;
    await navigator.clipboard.writeText(editableTemplate);
    setCopiedTemplate(true);
    toast.success('📋 편집 가능한 양식 마크다운이 복사되었습니다! 워드, 한글, 노션에 붙여넣으세요.');
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // Claude Pro 프롬프트 복사
  const handleCopyCustomPrompt = async () => {
    if (!extractedClaudePrompt && !editableTemplate) return;
    const finalPrompt = `${extractedClaudePrompt}\n\n[적용할 표준 서식 틀]\n${editableTemplate}`;
    await navigator.clipboard.writeText(finalPrompt);
    setCopiedCustomPrompt(true);
    toast.success('🚀 Claude 맞춤 프롬프트가 복사되었습니다! Claude.ai에 붙여넣으세요.');
    setTimeout(() => setCopiedCustomPrompt(false), 2000);
  };

  // ── 표준 프롬프트 빌더 ──
  const buildClaudePrompt = () => {
    if (selectedType === 'proposal') {
      return `당신은 15년 차 수석 비즈니스 기획 전문가입니다.
다음 정보를 바탕으로 즉시 실행 가능한 정밀 [신규 기획안 초안]을 작성해 주세요.

[프로젝트 정보]
- 프로젝트/기획 주제: ${topic || '(주제 미입력)'}
- 타깃 대상: ${targetAudience || '사내 경영진 및 실무팀'}
- 핵심 반영 사항: ${keyPoints || '효율성 극대화 및 빠른 실행 로드맵'}

[작성 요구사항]
1. Executive Summary: 3줄 핵심 요약
2. 추진 배경 및 시장 환경 분석
3. 3대 핵심 추진 전략 (Pillar 1, 2, 3)
4. 단계별 실행 로드맵 (Phase 1 준비 -> Phase 2 런칭 -> Phase 3 고도화)
5. 예상 리스크 및 해결 방안
6. 기대 효과 (정량적 KPI & 정성적 파급 효과)`;
    } else if (selectedType === 'meeting') {
      return `다음은 회의 메모입니다. 경영진 보고용 '1페이지 미팅 브리핑'으로 재구조화해 주세요.

[회의 정보]
- 회의 안건: ${topic || '(안건 미입력)'}
- 참석 대상: ${targetAudience || '관련 부서 담당자'}
- 회의 메모 원문:
${keyPoints || '논의된 주요 사항 및 의견 교환 내용'}

[출력 요구사항]
1. 💡 회의 목적 및 핵심 안건 (한 줄 정의)
2. 🎯 최종 합의 및 의사결정 사항 (3가지)
3. ⚠️ 후속 논의 필요 사항
4. 📋 Action Items 테이블 (담당자 / 과제 / 마감기한 / 우선순위)`;
    } else {
      return `당신은 전문 경영 컨설턴트입니다. 다음 사업/서비스의 전략 제안서를 작성해 주세요.

[사업 정보]
- 사업/아이템명: ${topic || '(아이템 미입력)'}
- 대상 클라이언트: ${targetAudience || '잠재 투자사 및 파트너사'}
- 핵심 특장점: ${keyPoints || '차별화된 기술력 및 빠른 시장 침투'}

[출력 요구사항]
1. 제안 개요 (Problem & Solution)
2. 시장 규모 및 성장 가능성 (TAM-SAM-SOM)
3. 수익 모델 및 비즈니스 구조
4. 마케팅 및 스케일업 전략
5. 제안 마무리 및 협업 기대 효과`;
    }
  };

  const handleCopyStandardPrompt = async () => {
    const prompt = buildClaudePrompt();
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    toast.success('프롬프트가 클립보드에 복사되었습니다!');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
              Part 1 · 박재범 대표
            </span>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              AI 비즈니스 문서 자동화
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Claude 업무자동화 스튜디오
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            업무 문서 사진을 찍어 <strong>편집 가능한 사내 서식으로 즉시 복원</strong>하거나,
            3분 만에 경영진 보고용 표준 기획서·회의록 프롬프트를 생성하세요.
          </p>
        </div>

        {/* External Link to Claude */}
        <a
          href="https://claude.ai/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition shrink-0"
        >
          <span>Claude.ai 새 창 열기</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* ── Top Mode Switcher (Tab 1: 사진 기반 양식 복원기 vs Tab 2: 표준 프롬프트 생성기) ── */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMainMode('photo-extract')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition ${
            mainMode === 'photo-extract'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="size-4" />
          <span>📷 내 업무 문서 사진 ➔ AI 양식 복원기</span>
          <span className="rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.2 text-[10px] font-black">
            NEW
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainMode('template-gen')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition ${
            mainMode === 'template-gen'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="size-4" />
          <span>✨ 표준 비즈니스 프롬프트 생성기</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODE 1: 내 업무 문서 사진 ➔ AI 양식 복원기 (User Requested!)
          ══════════════════════════════════════════════════════════════ */}
      {mainMode === 'photo-extract' && (
        <div className="space-y-6">
          {/* 1. 문서/사진 입력 카드 (HWP, DOCX, PDF, PPTX, 웹캠 촬영, 직접 업로드) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ScanLine className="size-4.5 text-indigo-600" />
                  <span>1단계: 업무 문서(파일 또는 사진) 등록</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  한글(HWP/HWPX), 워드(DOCX), PDF, PPTX 문서 파일이나 종이 보고서 사진을 올려주세요.
                </p>
              </div>

              {/* 3대 입력 버튼 */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.hwp,.hwpx,.ppt,.pptx,.txt,.csv,.xlsx,.xls"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  <UploadCloud className="size-3.5 mr-1 text-slate-500" />
                  파일 업로드
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDriveModalOpen(true)}
                  className="rounded-xl border-slate-200 text-indigo-700 bg-indigo-50/60 text-xs font-bold hover:bg-indigo-100"
                >
                  <FolderArchive className="size-3.5 mr-1" />
                  사진 드라이브에서 선택
                </Button>

                <Button
                  type="button"
                  onClick={() => setWebcamOpen(true)}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  <Camera className="size-3.5 mr-1" />
                  웹카메라로 즉시 촬영
                </Button>
              </div>
            </div>

            {/* Selected File/Image Preview & Scan Trigger */}
            {docImage ? (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-center">
                {/* Preview Thumbnail or Document Card */}
                {docFileMeta?.type === 'image' || (!docFileMeta && docImage.startsWith('data:image/')) ? (
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={docImage}
                      alt="Document Preview"
                      className="size-full object-contain"
                    />

                    {/* Laser Scan Line Animation when analyzing */}
                    {isAnalyzingDoc && (
                      <div className="absolute inset-0 bg-indigo-500/15 pointer-events-none">
                        <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full animate-bounce" />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white p-2 rounded-xl text-[11px] truncate flex items-center justify-between">
                      <span className="truncate">{docImageName || '선택된 문서 사진'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsViewerModalOpen(true)}
                          className="text-cyan-300 hover:text-white font-bold cursor-pointer flex items-center gap-0.5"
                        >
                          <Eye className="size-3" /> 뷰어
                        </button>
                        <button
                          type="button"
                          onClick={handleResetDoc}
                          className="text-slate-300 hover:text-white font-bold cursor-pointer"
                        >
                          변경
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Rich Document Card for HWP, DOCX, PDF, PPTX, etc. */
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100 p-4 flex flex-col justify-between shadow-inner">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1.5">
                      {docFileMeta?.type === 'hwp' || docFileMeta?.type === 'hwpx' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-xs">
                          <FileText className="size-3.5" />
                          한글 {docFileMeta?.type.toUpperCase()}
                        </span>
                      ) : docFileMeta?.type === 'pdf' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-600 text-white shadow-xs">
                          <FileText className="size-3.5" />
                          PDF 문서
                        </span>
                      ) : docFileMeta?.type === 'docx' || docFileMeta?.type === 'doc' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-sky-600 text-white shadow-xs">
                          <FileText className="size-3.5" />
                          Word {docFileMeta?.type.toUpperCase()}
                        </span>
                      ) : docFileMeta?.type === 'pptx' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-600 text-white shadow-xs">
                          <FileText className="size-3.5" />
                          PPTX 문서
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-slate-700 text-white shadow-xs">
                          <FileCode className="size-3.5" />
                          {docFileMeta?.ext.toUpperCase() || '문서'}
                        </span>
                      )}

                      {docFileMeta?.size ? (
                        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {formatFileSize(docFileMeta.size)}
                        </span>
                      ) : null}
                    </div>

                    {/* Center Document Info */}
                    <div className="my-auto py-1 text-center">
                      <div className="size-11 rounded-xl mx-auto mb-2 flex items-center justify-center bg-white shadow-xs border border-slate-200 text-indigo-600">
                        <FileText className="size-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 px-1">
                        {docImageName || '문서 파일'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {docFileMeta?.type === 'hwp' || docFileMeta?.type === 'hwpx'
                          ? '한컴오피스 표준 양식'
                          : docFileMeta?.type === 'pdf'
                          ? 'PDF 다단/표 구조 문서'
                          : docFileMeta?.type === 'docx' || docFileMeta?.type === 'doc'
                          ? 'MS 워드 보고서/기획서'
                          : '비즈니스 업무 서식'}
                      </p>
                    </div>

                    {/* Animated Laser Bar */}
                    {isAnalyzingDoc && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
                    )}

                    {/* Bottom Change Button & Viewer Trigger */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setIsViewerModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="size-3" /> 문서 뷰어로 보기
                      </button>
                      <button
                        type="button"
                        onClick={handleResetDoc}
                        className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        변경
                      </button>
                    </div>
                  </div>
                )}

                {/* Scan Action Box */}
                <div className="space-y-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-indigo-600" />
                      <span>업무 문서가 준비되었습니다!</span>
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      AI가 문서의 목차, 결재란, 표(Table) 구조, 글머리 기호(I, 1, 1))를 분석하여
                      <strong> 한글/워드/노션에 바로 쓸 수 있는 편집 가능한 양식</strong>으로 복원합니다.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      disabled={isAnalyzingDoc}
                      onClick={() => analyzeDocumentFile(docImage, docImageName, docFileMeta?.type)}
                      className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 shadow-sm flex items-center justify-center gap-2"
                    >
                      {isAnalyzingDoc ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>AI가 문서 서식과 틀을 분석하는 중...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          <span>AI 문서 틀 &amp; 서식 복원 시작하기</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsViewerModalOpen(true)}
                      className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 flex items-center gap-1.5"
                    >
                      <Eye className="size-3.5 text-indigo-600" />
                      <span>문서 뷰어로 원본 확인</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Dropzone State with Drag and Drop */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                className={`mt-5 rounded-2xl border-2 border-dashed p-9 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <FileCheck2 className="size-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  분석할 업무 문서(파일 또는 사진)를 등록하세요
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  한글(HWP/HWPX), 워드(DOCX), PDF, PPTX 문서 파일 및 인쇄물 사진을 드래그하거나 클릭하여 업로드하세요.
                </p>

                {/* Supported Formats Chips */}
                <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    HWP · HWPX (한글)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    PDF 문서
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    DOCX · DOC (워드)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    PPTX (파워포인트)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    JPG · PNG (사진)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. 복원된 편집 가능 양식 & 원본 문서 뷰어 워크스페이스 */}
          {(editableTemplate || isAnalyzingDoc) && (
            <div className="rounded-3xl border border-indigo-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5">
                      {extractedDocType || '문서 분석 중...'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {extractedDocTitle || '2단계: 복원된 편집 가능 문서 양식'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    사내 문서의 틀과 서식이 복원되었습니다. 원본 문서를 대조하며 <strong>실시간으로 수정</strong>하거나 Claude 맞춤 프롬프트로 활용하세요.
                  </p>
                </div>

                {/* Workspace View Mode Selector & Copy Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* View Mode Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setWorkspaceViewMode('split')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        workspaceViewMode === 'split' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Columns2 className="size-3.5" />
                      <span className="hidden sm:inline">좌우 분할 뷰</span>
                      <span className="sm:hidden">분할</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkspaceViewMode('viewer')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        workspaceViewMode === 'viewer' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="size-3.5" />
                      <span className="hidden sm:inline">원본 문서 뷰어</span>
                      <span className="sm:hidden">문서</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkspaceViewMode('editor')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        workspaceViewMode === 'editor' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="size-3.5" />
                      <span className="hidden sm:inline">양식 편집기</span>
                      <span className="sm:hidden">편집</span>
                    </button>
                  </div>

                  {/* Copy Buttons */}
                  <Button
                    type="button"
                    onClick={handleCopyTemplate}
                    disabled={!editableTemplate}
                    variant="outline"
                    className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="size-3.5 mr-1 text-emerald-600" />
                        <span>복사 완료</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 mr-1 text-indigo-600" />
                        <span>복원 서식 복사</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCopyCustomPrompt}
                    disabled={!editableTemplate}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                  >
                    {copiedCustomPrompt ? (
                      <>
                        <Check className="size-3.5 mr-1" />
                        <span>프롬프트 복사됨</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5 mr-1" />
                        <span>Claude 맞춤 프롬프트</span>
                      </>
                    )}
                  </Button>

                  <a
                    href="https://claude.ai/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-black px-3.5 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    <span>Claude 열기</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Dynamic Workspace: Split vs Viewer vs Editor */}
              <div
                className={`grid gap-6 items-start ${
                  workspaceViewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {/* ── [A] 원본 문서 뷰어 패널 ── */}
                {(workspaceViewMode === 'split' || workspaceViewMode === 'viewer') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Eye className="size-3.5 text-indigo-600" />
                        <span>📖 원본 문서 실시간 뷰어</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsViewerModalOpen(true)}
                        className="h-6 px-2 text-[11px] text-indigo-600 hover:text-indigo-800"
                      >
                        <Maximize2 className="size-3 mr-1" />
                        전체화면
                      </Button>
                    </div>
                    <DocumentViewer
                      fileName={docImageName}
                      fileType={docFileMeta?.type || 'other'}
                      fileSize={docFileMeta?.size}
                      fileUrl={docBlobUrl || docImage}
                      extractedText={extractedOriginalText}
                      onOpenFullscreen={() => setIsViewerModalOpen(true)}
                      height={workspaceViewMode === 'viewer' ? 'h-[750px]' : 'h-[680px]'}
                    />
                  </div>
                )}

                {/* ── [B] AI 복원 양식 실시간 편집기 패널 ── */}
                {(workspaceViewMode === 'split' || workspaceViewMode === 'editor') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <FileText className="size-3.5 text-purple-600" />
                        <span>✍️ 복원된 서식 실시간 편집창</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        마크다운 및 한글/워드 테이블 형식 지원
                      </span>
                    </div>
                    <textarea
                      value={editableTemplate}
                      onChange={(e) => setEditableTemplate(e.target.value)}
                      placeholder="AI가 분석한 문서 서식이 여기에 표시됩니다..."
                      className={`w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner resize-y ${
                        workspaceViewMode === 'editor' ? 'h-[750px]' : 'h-[680px]'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Claude Usage Tip Banner */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 flex items-start gap-3 text-xs">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-purple-600 text-white font-black text-xs">
                  💡
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-purple-950">
                    좌우 분할 뷰어를 활용한 10배 빠른 비즈니스 문서 작성법
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    좌측 <strong>[원본 문서 뷰어]</strong>에서 회사 기존 서식의 세부 수치나 목차를 대조하고,
                    우측 <strong>[편집창]</strong>에서 실시간으로 수정한 뒤 <strong>[Claude 맞춤 프롬프트 복사]</strong>를 눌러 Claude.ai에 넣으시면
                    3분 만에 완벽한 사내 보고서 및 사업계획서가 완성됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODE 2: 표준 비즈니스 프롬프트 생성기 (Existing Feature)
          ══════════════════════════════════════════════════════════════ */}
      {mainMode === 'template-gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Input Form */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">
                1. 작성할 비즈니스 문서 유형 선택
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {DOC_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedType === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedType(preset.id as DocType)}
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50 text-purple-950 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div
                        className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold leading-tight">{preset.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500 leading-normal">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                2. 기획 / 회의 / 사업 주제
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: AI 기반 신규 사내 업무 자동화 솔루션 도입 검토"
                className="rounded-xl text-xs sm:text-sm h-10 border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                3. 보고 대상 (타깃 독자)
              </label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="예: 사내 경영진, 팀장급 실무진, 외부 투자사"
                className="rounded-xl text-xs sm:text-sm h-10 border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                4. 필수 반영 핵심 키워드 &amp; 논의 메모
              </label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={4}
                placeholder="문서에 반드시 포함되어야 할 핵심 수치, 일정, 예산, 문제점 등을 메모 형태로 편하게 입력하세요."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Right: Assembled Prompt Output */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  완성된 Claude 최적화 프롬프트
                </h3>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCopyStandardPrompt}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold h-8"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="size-3.5 mr-1" />
                    <span>복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 mr-1" />
                    <span>프롬프트 복사</span>
                  </>
                )}
              </Button>
            </div>

            <pre className="max-h-[440px] overflow-y-auto rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {buildClaudePrompt()}
            </pre>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                복사 후 Claude.ai에 붙여넣으면 임원 보고용 정밀 문서가 즉시 작성됩니다.
              </p>
              <a
                href="https://claude.ai/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
              >
                <span>Claude로 이동</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Webcam Capture Modal ── */}
      <WebcamCaptureModal
        open={webcamOpen}
        onOpenChange={setWebcamOpen}
        defaultCategory="일상/기타"
        onPhotoSaved={(savedPhoto) => {
          setDocImage(savedPhoto.url);
          setDocImageName(savedPhoto.name);
          setDocFileMeta({
            name: savedPhoto.name,
            size: 0,
            type: 'image',
            ext: 'jpg',
          });
          analyzeDocumentFile(savedPhoto.url, savedPhoto.name, 'image');
        }}
      />

      {/* ── 4. Photo Drive Selection Modal ── */}
      <PhotoDriveModal
        open={driveModalOpen}
        onOpenChange={setDriveModalOpen}
        onSelectPhotos={(selectedPhotos) => {
          if (selectedPhotos.length > 0) {
            const first = selectedPhotos[0];
            setDocImage(first.url);
            setDocImageName(first.name);
            setDocFileMeta({
              name: first.name,
              size: 0,
              type: 'image',
              ext: 'jpg',
            });
            analyzeDocumentFile(first.url, first.name, 'image');
          }
        }}
      />

      {/* ── 5. 전체화면 문서 뷰어 모달 (Fullscreen Document Viewer Dialog) ── */}
      <Dialog open={isViewerModalOpen} onOpenChange={setIsViewerModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[92vh] p-4 sm:p-6 bg-slate-950 border-slate-800 text-white flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
            <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Eye className="size-4 text-indigo-400" />
              <span>원본 문서 뷰어: {docImageName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full overflow-hidden mt-2">
            <DocumentViewer
              fileName={docImageName}
              fileType={docFileMeta?.type || 'other'}
              fileSize={docFileMeta?.size}
              fileUrl={docBlobUrl || docImage}
              extractedText={extractedOriginalText}
              height="h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
