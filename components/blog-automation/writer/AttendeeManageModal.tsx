'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  User,
  Building2,
  Target,
  Award,
  FileText,
  Save,
  Trash2,
  Loader2,
  Wand2,
  ClipboardPaste,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  X,
  File,
  FileSpreadsheet,
  ImageIcon,
  Maximize2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  BniAttendee,
  saveBniAttendee,
  deleteBniAttendee,
} from '@/lib/blog-automation/bni-attendee-storage';

// 🌟 브라우저 동적 PDF.js 로더 (10MB+ 대용량 PDF도 텍스트로 즉시 경량 추출)
export const loadPdfJs = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('PDF.js 로드 실패'));
      }
    };
    script.onerror = () => reject(new Error('PDF.js 스크립트 로드 실패'));
    document.head.appendChild(script);
  });
};

// 🌟 이미지 압축 (10MB 사진도 300KB로 압축하여 413 페이로드 에러 방지)
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface AttendeeManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendee?: BniAttendee | null;
  userId?: string;
  onSaved: (attendee: BniAttendee) => void;
  onDeleted?: (attendeeId: string) => void;
  onAddPhotos?: (photos: { name: string; url: string; caption?: string }[]) => void;
}

export function AttendeeManageModal({
  open,
  onOpenChange,
  attendee,
  userId,
  onSaved,
  onDeleted,
  onAddPhotos,
}: AttendeeManageModalProps) {
  // 기본 입력 정보
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [chapter, setChapter] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [targetReferral, setTargetReferral] = useState('');
  const [partnerStrength, setPartnerStrength] = useState('');
  const [sheetSummary, setSheetSummary] = useState('');
  const [preferredPlace, setPreferredPlace] = useState('');

  // 📷 양식지 추출 이미지 및 미리보기 라이트박스 상태
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 양식지 입력 방식: 'file' (사진/PDF 파일 업로드) | 'text' (카톡/텍스트 붙여넣기)
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [rawSheetText, setRawSheetText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isParsedSuccess, setIsParsedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (attendee) {
      setName(attendee.name || '');
      setCompany(attendee.company || '');
      setChapter(attendee.chapter || '');
      setSpecialty(attendee.specialty || '');
      setTargetReferral(attendee.targetReferral || '');
      setPartnerStrength(attendee.partnerStrength || '');
      setSheetSummary(attendee.sheetSummary || '');
      setPreferredPlace(attendee.preferredPlace || '');
      setExtractedImages(attendee.sheetImages || []);
      setPreviewImage(null);
      setRawSheetText('');
      setUploadedFile(null);
      setIsParsedSuccess(false);
    } else {
      setName('');
      setCompany('');
      setChapter('');
      setSpecialty('');
      setTargetReferral('');
      setPartnerStrength('');
      setSheetSummary('');
      setPreferredPlace('');
      setExtractedImages([]);
      setPreviewImage(null);
      setRawSheetText('');
      setUploadedFile(null);
      setIsParsedSuccess(false);
    }
  }, [attendee, open]);

  // AI 양식지 스마트 파싱 공통 함수
  const executeParse = async (params: {
    sheetText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setIsParsing(true);
    setIsParsedSuccess(false);

    try {
      const res = await fetch('/api/blog-auto/writer/parse-121-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetText: params.sheetText,
          fileBase64: params.fileBase64,
          mimeType: params.mimeType,
          partnerName: name,
        }),
      });

      const resText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(resText);
      } catch {
        if (res.status === 413 || resText.includes('Request Entity Too Large')) {
          throw new Error('파일 크기가 서버 전송 한도를 초과했습니다. PDF의 텍스트를 복사하여 [📋 텍스트 붙여넣기]에 넣어주세요.');
        }
        throw new Error(`서버 처리 실패 (${res.status}): ${resText.slice(0, 100)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || '양식지 분석에 실패했습니다.');
      }

      const parsed = data.data;

      // 성함: 사용자가 비워뒀거나 직함 보강이 가능한 경우 반영
      if (parsed.partnerName) {
        if (!name.trim()) {
          setName(parsed.partnerName);
        }
      }

      // 회사명 및 챕터 자동 분리
      if (parsed.partnerCompany) {
        const comp = parsed.partnerCompany;
        if (comp.includes('(') && comp.includes(')')) {
          const parts = comp.split('(');
          setCompany(parts[0].trim());
          if (!chapter.trim()) {
            setChapter(parts[1].replace(')', '').trim());
          }
        } else {
          setCompany(comp);
        }
      }

      if (parsed.partnerChapter && !chapter.trim()) {
        setChapter(parsed.partnerChapter);
      }

      if (parsed.partnerField) setSpecialty(parsed.partnerField);
      if (parsed.targetReferral) setTargetReferral(parsed.targetReferral);
      if (parsed.partnerStrength) setPartnerStrength(parsed.partnerStrength);
      if (parsed.sheetSummary) setSheetSummary(parsed.sheetSummary);
      if (parsed.preferredPlace) setPreferredPlace(parsed.preferredPlace);

      setIsParsedSuccess(true);
      toast.success('✨ 양식지 내용이 분석되어 항목별로 자동 입력되었습니다!');
    } catch (e: any) {
      toast.error(e.message || '양식지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsParsing(false);
    }
  };

  // 🌟 파일 선택 처리 (대용량 PDF / 이미지 자동 최적화 후 AI 분석 트리거)
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(lowerName);
    const isText = file.type.startsWith('text/') || lowerName.endsWith('.txt');

    if (!isPdf && !isImage && !isText) {
      toast.error('지원 형식: 이미지 (JPG, PNG, WebP), PDF, TXT 파일만 가능합니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('파일 크기는 최대 50MB까지 업로드할 수 있습니다.');
      return;
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
      base64: '',
    });

    // 1) 텍스트 파일 (.txt)
    if (isText) {
      try {
        const textContent = await file.text();
        executeParse({ sheetText: textContent, fileName: file.name });
      } catch (err: any) {
        toast.error('텍스트 파일 읽기 실패: ' + err.message);
      }
      return;
    }

    // 2) 이미지 파일 (JPG, PNG, WebP) -> Canvas 경량 압축
    if (isImage) {
      try {
        const compressedBase64 = await compressImage(file);
        setUploadedFile((prev) => (prev ? { ...prev, base64: compressedBase64 } : null));
        setExtractedImages([compressedBase64]);
        onAddPhotos?.([
          {
            name: file.name,
            url: compressedBase64,
            caption: `${name.trim() || '파트너'} 원투원 양식지`,
          },
        ]);
        executeParse({
          fileBase64: compressedBase64,
          mimeType: 'image/jpeg',
          fileName: file.name,
        });
      } catch (err: any) {
        toast.error('이미지 처리 실패: ' + err.message);
      }
      return;
    }

    // 3) PDF 파일 (13.8MB 등 대용량 PDF 포함)
    if (isPdf) {
      setIsParsing(true);
      try {
        // PDF.js를 통해 브라우저에서 텍스트 직접 추출
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        // 🌟 1. PDF의 모든 페이지를 이미지(JPEG DataURL)로 일괄 추출 (모달 갤러리 및 좌측 블로그 사진 패널 등록)
        const renderedImages: string[] = [];
        const maxImgPages = Math.min(pdf.numPages, 6);
        for (let p = 1; p <= maxImgPages; p++) {
          try {
            const page = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              await page.render({ canvasContext: ctx, viewport }).promise;
              renderedImages.push(canvas.toDataURL('image/jpeg', 0.85));
            }
          } catch (pErr) {
            console.warn(`PDF ${p}페이지 이미지 렌더링 실패:`, pErr);
          }
        }

        if (renderedImages.length > 0) {
          setExtractedImages(renderedImages);
          onAddPhotos?.(
            renderedImages.map((imgUrl, idx) => ({
              name: `${file.name.replace(/\.pdf$/i, '')}_p${idx + 1}.jpg`,
              url: imgUrl,
              caption: `${name.trim() || '파트너'} 원투원 양식지 (${idx + 1}p)`,
            }))
          );
          toast.success(
            `📄 PDF에서 ${renderedImages.length}장의 페이지 이미지를 추출하여 블로그 사진 목록에 등록했습니다.`
          );
        }

        // 🌟 2. 텍스트 추출 및 AI 파싱
        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 10);

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageStrings = content.items
            .map((it: any) => it.str)
            .filter(Boolean);
          if (pageStrings.length > 0) {
            fullText += `\n[${i}페이지]\n` + pageStrings.join(' ');
          }
        }

        // 텍스트가 풍부한 일반 PDF인 경우 -> 텍스트로 즉시 분석 전송 (용량 수 KB로 극적 축소!)
        if (fullText.trim().length >= 30) {
          executeParse({ sheetText: fullText.trim(), fileName: file.name });
          return;
        }

        // 텍스트가 없는 스캔형 이미지 PDF인 경우 -> 추출된 1페이지 이미지로 파싱 전송
        if (renderedImages.length > 0) {
          executeParse({
            fileBase64: renderedImages[0],
            mimeType: 'image/jpeg',
            fileName: file.name,
          });
          return;
        }

        // 폴백 (3MB 이하인 경우 직접 Base64 전송)
        if (file.size <= 3 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const b64 = e.target?.result as string;
            executeParse({ fileBase64: b64, mimeType: 'application/pdf', fileName: file.name });
          };
          reader.readAsDataURL(file);
        } else {
          throw new Error('PDF 텍스트 추출에 실패했습니다. 내용을 복사하여 [📋 텍스트 붙여넣기]로 입력해주세요.');
        }
      } catch (pdfErr: any) {
        console.error('PDF parsing error:', pdfErr);
        setIsParsing(false);
        // 만약 3MB 이하 파일이면 직접 base64 전송 시도
        if (file.size <= 3 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const b64 = e.target?.result as string;
            executeParse({ fileBase64: b64, mimeType: 'application/pdf', fileName: file.name });
          };
          reader.readAsDataURL(file);
        } else {
          toast.error(
            '대용량 PDF 처리 안내: 파일 크기가 커서 텍스트 복사 후 [📋 텍스트 붙여넣기]로 넣어주시면 가장 빠르고 정확하게 분석됩니다.'
          );
        }
      }
      return;
    }
  };

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // 텍스트 붙여넣기 분석
  const handleParseText = () => {
    if (!rawSheetText.trim()) {
      toast.error('분석할 양식지 또는 카카오톡 소개글 텍스트를 입력해주세요.');
      return;
    }
    executeParse({ sheetText: rawSheetText });
  };

  // 저장
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('참석자(대표님) 성함을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const itemToSave: BniAttendee = {
        id: attendee?.id || `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        company: company.trim() || '회사명 미등록',
        chapter: chapter.trim() || 'BNI 챕터',
        specialty: specialty.trim(),
        targetReferral: targetReferral.trim(),
        partnerStrength: partnerStrength.trim(),
        sheetSummary: sheetSummary.trim(),
        preferredPlace: preferredPlace.trim(),
        sheetImages: extractedImages.length > 0 ? extractedImages : (attendee?.sheetImages || []),
        createdAt: attendee?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      const saved = await saveBniAttendee(itemToSave, userId);
      toast.success(`🤝 '${saved.name}' 파트너 정보가 저장되었습니다.`);
      onSaved(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attendee?.id) return;
    if (!confirm(`'${attendee.name}' 파트너 정보를 삭제하시겠습니까?`)) return;

    try {
      await deleteBniAttendee(attendee.id, userId);
      toast.info('파트너 정보가 삭제되었습니다.');
      onDeleted?.(attendee.id);
      onOpenChange(false);
    } catch (e) {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[92vh] overflow-y-auto bg-white p-5 sm:p-6 rounded-3xl border-slate-200 shadow-2xl transition-all duration-200 ${
          extractedImages.length > 0 ? 'max-w-5xl w-[95vw]' : 'sm:max-w-xl'
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                {attendee ? '회의 참석자(파트너) 정보 수정' : '새 BNI 파트너 및 원투원 양식지 등록'}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                대표님 성함과 양식지만 업로드하면 회사, 사업, 리퍼럴 정보가 AI로 즉시 자동 파싱됩니다.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div
          className={`grid gap-6 ${
            extractedImages.length > 0 ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* 좌측: 파트너 정보 입력 폼 */}
          <div className={extractedImages.length > 0 ? 'lg:col-span-7' : ''}>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              {/* 🌟 1. 참석자 성함 & 121 양식지 업로드 (핵심 2단계 입력) */}
          <div className="rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-4 space-y-3.5 shadow-xs">
            {/* 1단계: 대표님 성함 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <User className="size-3.5 text-indigo-600" />
                  <span>참석자(대표님) 성함</span>
                  <span className="text-rose-500 font-black">*</span>
                </Label>
                <span className="text-[10.5px] text-slate-400">
                  (비워두시면 양식지에서 자동 추출됩니다)
                </span>
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김성훈 대표 (비워두고 양식지만 올려도 AI가 성함을 찾아냅니다)"
                className="h-9 text-xs bg-white border-indigo-200 focus-visible:ring-indigo-500 font-semibold"
              />
            </div>

            {/* 2단계: 양식지 업로드 방식 탭 */}
            <div className="space-y-2 pt-1 border-t border-indigo-100/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <FileSpreadsheet className="size-3.5 text-indigo-600" />
                  <span>원투원 양식지 업로드 / 입력</span>
                </span>

                <div className="flex items-center gap-1 bg-indigo-100/70 p-0.5 rounded-lg text-[10.5px] font-bold">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      uploadMode === 'file'
                        ? 'bg-white text-indigo-700 shadow-2xs font-black'
                        : 'text-indigo-600/80 hover:text-indigo-900'
                    }`}
                  >
                    📁 파일 업로드 (사진/PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('text')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      uploadMode === 'text'
                        ? 'bg-white text-indigo-700 shadow-2xs font-black'
                        : 'text-indigo-600/80 hover:text-indigo-900'
                    }`}
                  >
                    📋 텍스트 붙여넣기
                  </button>
                </div>
              </div>

              {/* A. 파일 업로드 모드 (이미지 캡처/사진, PDF, TXT) */}
              {uploadMode === 'file' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadedFile ? (
                    <div className="rounded-xl border border-indigo-300 bg-white p-3 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <FileCheck className="size-5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {uploadedFile.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • 업로드 완료
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isParsing}
                          onClick={() =>
                            executeParse({
                              fileBase64: uploadedFile.base64,
                              mimeType: uploadedFile.type,
                              fileName: uploadedFile.name,
                            })
                          }
                          className="h-7 text-[11px] font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <RefreshCw className={`size-3 mr-1 ${isParsing ? 'animate-spin' : ''}`} />
                          재분석
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isParsing}
                          onClick={() => {
                            setUploadedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="h-7 px-1.5 text-slate-400 hover:text-rose-600"
                          title="파일 제거"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all bg-white hover:bg-indigo-50/40 ${
                        isDragging
                          ? 'border-indigo-600 bg-indigo-50 scale-[1.01]'
                          : 'border-indigo-200 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="size-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <UploadCloud className="size-5" />
                        </div>
                        <div className="text-xs font-black text-indigo-950">
                          121 양식지 파일(사진 캡처본 / PDF / 텍스트)을 드래그하거나 클릭하여 업로드
                        </div>
                        <p className="text-[10.5px] text-slate-500">
                          스마트폰 양식지 캡처 사진, 스캔본, PDF 문서 등 파일을 올리면 <span className="text-indigo-600 font-bold">즉시 AI가 내용을 자동 파싱</span>합니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* B. 텍스트 직접 붙여넣기 모드 */
                <div className="space-y-2">
                  <Textarea
                    value={rawSheetText}
                    onChange={(e) => setRawSheetText(e.target.value)}
                    placeholder="상대방 대표님이 보내주신 BNI 121 양식지 전문, 카카오톡 소개글 또는 메일 내용을 그대로 붙여넣으세요."
                    rows={4}
                    className="text-xs bg-white resize-none border-indigo-200 focus-visible:ring-indigo-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isParsing || !rawSheetText.trim()}
                      onClick={handleParseText}
                      className="h-7 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs gap-1"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          <span>AI 분석 중...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="size-3" />
                          <span>텍스트 AI 자동 분석 채우기</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 🌟 파싱 상태 알림 배너 */}
              {isParsing && (
                <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 flex items-center gap-2 text-indigo-900 text-xs font-bold animate-pulse">
                  <Loader2 className="size-4 animate-spin text-indigo-600 shrink-0" />
                  <span>AI가 양식지를 정밀 분석하여 회사명, 챕터, 주력사업, 리퍼럴 정보를 추출하고 있습니다...</span>
                </div>
              )}

              {isParsedSuccess && !isParsing && (
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 flex items-center justify-between gap-2 text-emerald-900 text-xs font-bold animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>양식지 파싱 완료! 아래 추출된 세부 정보를 확인해주세요.</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-normal">
                    (필요 시 직접 수정 가능)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. 자동 추출 및 세부 정보 ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-0.5">
              <span>📋 자동 추출된 파트너 상세 프로필</span>
              <span className="text-[10px] text-slate-400">수정이 필요하면 언제든 직접 고치실 수 있습니다</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="size-3 text-indigo-600" />
                  회사명
                </Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="예: 알파브랜딩"
                  className="h-8 text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">소속 BNI 챕터</Label>
                <Input
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="예: BNI 마스터 챕터"
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">전문분야 / 주력 사업</Label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="예: 기업 브랜딩 및 공간 디자인"
                className="h-8 text-xs bg-white"
              />
            </div>

            {/* ── 3. 비즈니스 리퍼럴 프로필 (GAINS) ── */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Target className="size-3.5 text-rose-500" />
                  이상적인 추천 고객 (소개 희망 리퍼럴)
                </Label>
                <Input
                  value={targetReferral}
                  onChange={(e) => setTargetReferral(e.target.value)}
                  placeholder="어떤 고객을 만났을 때 대표님께 연결해드리면 가장 좋을까요?"
                  className="h-8 text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Award className="size-3.5 text-amber-500" />
                  차별화된 핵심 강점 &amp; 경쟁력
                </Label>
                <Input
                  value={partnerStrength}
                  onChange={(e) => setPartnerStrength(e.target.value)}
                  placeholder="경쟁사와 다른 대표님만의 독보적인 강점"
                  className="h-8 text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="size-3.5 text-slate-500" />
                  121 사전 양식지 메모 요약
                </Label>
                <Textarea
                  value={sheetSummary}
                  onChange={(e) => setSheetSummary(e.target.value)}
                  placeholder="파트너의 가업/경력 배경, 주력 서비스 요약 등 기억해 둘 핵심 메모"
                  rows={2}
                  className="text-xs bg-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">선호 미팅 장소 (선택)</Label>
                <Input
                  value={preferredPlace}
                  onChange={(e) => setPreferredPlace(e.target.value)}
                  placeholder="예: 압구정 로데오 카페, 르글라스 압구정"
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* ── 액션 버튼 ── */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {attendee ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
              >
                <Trash2 className="size-3.5" />
                <span>삭제</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || isParsing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1 shadow-xs"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>파트너 정보 저장 및 등록</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 우측: 추출된 양식지 이미지 갤러리 */}
      {extractedImages.length > 0 && (
        <div className="lg:col-span-5 flex flex-col gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/20 p-4 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <ImageIcon className="size-4 text-indigo-600" />
              <span>추출된 양식지 갤러리</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">
                {extractedImages.length}장
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                onAddPhotos?.(
                  extractedImages.map((imgUrl, idx) => ({
                    name: `${name.trim() || '양식지'}_p${idx + 1}.jpg`,
                    url: imgUrl,
                    caption: `${name.trim() || '파트너'} 원투원 양식지 (${idx + 1}p)`,
                  }))
                );
                toast.success('📸 좌측 블로그 사진 목록에 다시 추가되었습니다.');
              }}
              className="h-7 text-[11px] font-bold text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 gap-1"
            >
              <Plus className="size-3" />
              블로그 사진에 추가
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            양식지에서 추출된 페이지 이미지입니다. 블로그 좌측 사진 목록에 자동 반영되어 본문 이미지 및 비전 분석에 활용됩니다.
          </p>

          {/* 갤러리 썸네일 그리드 */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {extractedImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer aspect-[3/4]"
                onClick={() => setPreviewImage(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt={`양식지 ${idx + 1}페이지`}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-800 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                    <Maximize2 className="size-3" />
                    확대보기
                  </span>
                </div>
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {idx + 1}페이지
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExtractedImages((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="이 페이지 제거"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* ── 이미지 확대 라이트박스 ── */}
    {previewImage && (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={() => setPreviewImage(null)}
      >
        <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl flex flex-col items-center">
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute -top-3 -right-3 size-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-700"
          >
            <X className="size-4.5" />
          </button>
          <img
            src={previewImage}
            alt="양식지 미리보기"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
);
}
