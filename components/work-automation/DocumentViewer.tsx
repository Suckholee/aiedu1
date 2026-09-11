'use client';

import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Copy,
  Check,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface DocumentViewerProps {
  fileName: string;
  fileType: 'image' | 'pdf' | 'docx' | 'doc' | 'hwp' | 'hwpx' | 'pptx' | 'text' | 'excel' | 'other';
  fileSize?: number;
  fileUrl: string | null;
  extractedText?: string;
  onOpenFullscreen?: () => void;
  height?: string;
}

export function DocumentViewer({
  fileName,
  fileType,
  fileSize,
  fileUrl,
  extractedText,
  onOpenFullscreen,
  height = 'h-[650px]',
}: DocumentViewerProps) {
  // 이미지 뷰어 확대/축소 및 회전 상태
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedText, setCopiedText] = useState(false);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopyExtracted = async () => {
    if (!extractedText) return;
    await navigator.clipboard.writeText(extractedText);
    setCopiedText(true);
    toast.success('📋 원문 텍스트가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isPdf = fileType === 'pdf' || fileName.toLowerCase().endsWith('.pdf');
  const isImage = fileType === 'image' || (!fileType && fileUrl?.startsWith('data:image/'));

  return (
    <div className={`flex flex-col ${height} rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-sm`}>
      {/* ── 상단 툴바 (Top Toolbar) ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/95 backdrop-blur-xs border-b border-slate-700 text-xs shrink-0 text-white">
        <div className="flex items-center gap-2 truncate">
          {/* 타입 뱃지 */}
          {isPdf ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shrink-0">
              PDF 뷰어
            </span>
          ) : isImage ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white shrink-0">
              이미지 뷰어
            </span>
          ) : fileType === 'hwp' || fileType === 'hwpx' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white shrink-0">
              한글 {fileType.toUpperCase()}
            </span>
          ) : fileType === 'docx' || fileType === 'doc' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-600 text-white shrink-0">
              워드 DOCX
            </span>
          ) : fileType === 'pptx' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-600 text-white shrink-0">
              PPTX 슬라이드
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-600 text-white shrink-0">
              문서 뷰어
            </span>
          )}

          <span className="font-bold truncate text-slate-100 max-w-[200px] sm:max-w-[280px]">
            {fileName || '문서 미리보기'}
          </span>

          {fileSize ? (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              ({formatFileSize(fileSize)})
            </span>
          ) : null}
        </div>

        {/* 우측 조작 버튼 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isImage && (
            <div className="flex items-center gap-1 mr-2 border-r border-slate-700 pr-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                title="확대"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                title="축소"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                title="90도 회전"
              >
                <RotateCw className="size-3.5" />
              </button>
            </div>
          )}

          {fileUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => window.open(fileUrl, '_blank')}
              className="h-7 px-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg gap-1"
            >
              <ExternalLink className="size-3" />
              <span className="hidden sm:inline">새 창에서 열기</span>
            </Button>
          )}

          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              className="inline-flex items-center gap-1 h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
              title="파일 다운로드"
            >
              <Download className="size-3" />
              <span className="hidden md:inline">다운로드</span>
            </a>
          )}

          {onOpenFullscreen && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onOpenFullscreen}
              className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg gap-1"
              title="전체화면으로 크게 보기"
            >
              <Maximize2 className="size-3" />
              <span className="hidden sm:inline">전체화면</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 뷰어 본체 영역 (Viewer Body) ── */}
      <div className="flex-1 relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* 1. PDF 뷰어 (브라우저 네이티브 고화질 PDF 렌더링) */}
        {isPdf ? (
          fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="size-full border-0 bg-white"
              title="PDF 문서 뷰어"
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
              <FileText className="size-10 mx-auto mb-2 text-rose-500 opacity-80" />
              <p className="font-bold text-sm">PDF 파일을 불러오는 중입니다...</p>
            </div>
          )
        ) : isImage ? (
          /* 2. 이미지 뷰어 (줌 / 회전 인터랙션 지원) */
          <div className="size-full overflow-auto flex items-center justify-center p-4">
            {fileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-full max-w-full object-contain rounded shadow-lg origin-center"
              />
            ) : (
              <p className="text-xs text-slate-500">이미지가 없습니다.</p>
            )}
          </div>
        ) : (
          /* 3. 한글(HWP/HWPX), 워드(DOCX), PPTX, 텍스트 문서 리더기 */
          <div className="size-full bg-slate-50 overflow-y-auto p-6 text-slate-800">
            {/* 문서 안내 헤더 */}
            <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="size-4 text-indigo-600" />
                <span className="font-bold text-indigo-950">
                  {fileType === 'hwp' || fileType === 'hwpx'
                    ? '한컴오피스 본문 텍스트 추출 완료'
                    : fileType === 'docx'
                    ? 'MS Word 본문 및 표 구조 추출 완료'
                    : '문서 원문 텍스트 뷰어'}
                </span>
              </div>
              {extractedText && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyExtracted}
                  className="h-7 px-2.5 text-xs font-bold bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 rounded-lg gap-1"
                >
                  {copiedText ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>{copiedText ? '복사됨' : '원문 복사'}</span>
                </Button>
              )}
            </div>

            {/* 본문 내용 */}
            {extractedText ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap shadow-xs">
                {extractedText}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-slate-200">
                <FileCode className="size-10 text-indigo-500 mb-2 opacity-70" />
                <h4 className="font-bold text-sm text-slate-800">{fileName}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  바이너리 파일 서식입니다. AI가 파일의 목차와 표 구조를 정밀 분석하여 우측의 [복원된 편집 가능 양식]에 완벽히 복원해 두었습니다.
                </p>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    download={fileName}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <Download className="size-3.5" /> 원본 파일 PC에 저장
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
