'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle2,
  Image as ImageIcon,
  Wand2,
  Plus,
  RefreshCw,
  ZoomIn,
  Download,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSkillById, type BlogSkillId } from '@/lib/blog-automation/blog-skills';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { PhotoDriveModal } from './PhotoDriveModal';
import { WebcamCaptureModal } from '@/components/drive/WebcamCaptureModal';
import { FolderArchive } from 'lucide-react';

export interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
  file?: File;
  analyzing?: boolean;
  description?: string;
  caption?: string;
  keywords?: string[];
  isAiGenerated?: boolean;
}

interface PhotoUploadPanelProps {
  photos: UploadedPhoto[];
  onPhotosChange: React.Dispatch<React.SetStateAction<UploadedPhoto[]>> | ((photos: UploadedPhoto[]) => void);
  onApplyTopic?: (topic: string) => void;
  skillId: BlogSkillId;
  topic?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function PhotoUploadPanel({
  photos,
  onPhotosChange,
  onApplyTopic,
  skillId,
  topic = '',
  collapsed,
  onToggleCollapse,
}: PhotoUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<UploadedPhoto[]>(photos);
  photosRef.current = photos;
  const isAnalyzingRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 안전한 상태 업데이트 헬퍼 (함수형 업데이트로 경쟁 상태 완벽 방지)
  const updatePhotos = (updater: (prev: UploadedPhoto[]) => UploadedPhoto[]) => {
    if (typeof onPhotosChange === 'function') {
      (onPhotosChange as any)((prev: any) => {
        const current = Array.isArray(prev) ? prev : photosRef.current;
        const next = updater(current);
        try {
          localStorage.setItem('latest_blog_photos', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ photo: UploadedPhoto; index: number } | null>(null);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [webcamModalOpen, setWebcamModalOpen] = useState(false);

  // 사진 드라이브에서 '블로그로 보내기'를 통해 진입한 사진 자동 로드
  useEffect(() => {
    try {
      const pendingRaw = localStorage.getItem('pending_blog_import_photos');
      if (pendingRaw) {
        const pendingList = JSON.parse(pendingRaw);
        if (Array.isArray(pendingList) && pendingList.length > 0) {
          updatePhotos((prev) => [...prev, ...pendingList]);
          localStorage.removeItem('pending_blog_import_photos');
          toast.success(`📸 사진 드라이브에서 ${pendingList.length}장의 사진을 불러왔습니다!`);
        }
      }
    } catch (e) {}
  }, []);

  // AI 이미지 생성 상태
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'realistic' | 'illustration'>('realistic');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const selectedSkill = getSkillById(skillId);

  // 추천 AI 이미지 프롬프트 생성
  const getSuggestedPrompts = () => {
    const baseTopic = topic.trim() || selectedSkill.name;
    switch (skillId) {
      case 'saju':
        return [
          `${baseTopic} 신비로운 동양 사주 명리학과 오행(목화토금수) 조화 일러스트`,
          `${baseTopic} 아늑한 촛불 조명 아래 고풍스러운 타로 카드와 원석`,
          `${baseTopic} 마음의 평온을 주는 단아한 동양풍 서재와 힐링 전통차`,
          `${baseTopic} 밤하늘의 은하수와 별자리, 신비로운 천문도 그래픽`,
        ];
      case 'restaurant':
        return [
          `${baseTopic} 대표 시그니처 요리 탑뷰 클로즈업, 먹음직스러운 비주얼`,
          `${baseTopic} 따뜻하고 아늑한 조명의 매장 내부 인테리어와 테이블`,
          `${baseTopic} 지글지글 끓거나 구워지는 생생한 요리 장면`,
        ];
      case 'product':
        return [
          `${baseTopic} 깔끔한 화이트 배경의 고급스러운 패키지 언박싱`,
          `${baseTopic} 실제 사용자가 손으로 들고 조작하는 디테일 컷`,
          `${baseTopic} 감각적인 데스크 환경에 놓인 라이프스타일 컷`,
        ];
      case 'beauty':
        return [
          `${baseTopic} 깨끗하고 환한 피부 톤의 클로즈업 뷰티 컷`,
          `${baseTopic} 정갈하게 정리된 전문 뷰티 샵 내부 인테리어`,
        ];
      case 'travel':
        return [
          `${baseTopic} 화창한 날씨의 아름다운 풍경과 랜드마크 전경`,
          `${baseTopic} 감성적인 오션뷰가 펼쳐진 숙소 테라스`,
          `${baseTopic} 현지 특색이 담긴 맛있는 로컬 음식`,
        ];
      case 'realestate':
        return [
          `${baseTopic} 햇살이 가득 들어오는 모던한 거실 인테리어 전경`,
          `${baseTopic} 깔끔하게 정돈된 주방 및 다이닝 공간 디테일`,
        ];
      case 'exchange':
        return [
          `${baseTopic} 글로벌 통화 환율(USD, JPY, EUR) 비교표 및 상승/하락 트렌드 인포그래픽`,
          `${baseTopic} 뉴욕 증시 월스트리트와 미국 연준(Fed) 거시경제 금융 분석 씬`,
          `${baseTopic} 국제 무역항 컨테이너선과 물류 수출입 통관 현장`,
        ];
      default:
        return [
          `${baseTopic} 관련 전문적이고 세련된 비즈니스 씬`,
          `${baseTopic} 핵심 주제를 직관적으로 보여주는 매력적인 메인 컷`,
        ];
    }
  };

  // 1. 파일 직접 업로드 처리 (고화질 DataURL Base64로 즉시 변환, Vision 분석 최적화 800px 리사이즈)
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // 캔버스로 리사이징 및 경량화 (최대 800px로 속도 및 AI Vision 정확도 극대화)
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
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
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: UploadedPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const dataUrl = await fileToDataUrl(file);
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      newPhotos.push({
        id: photoId,
        name: file.name,
        url: dataUrl,
        file,
        analyzing: false,
      });
    }

    updatePhotos((prev) => [...prev, ...newPhotos]);
    toast.success(`${newPhotos.length}장의 사진이 등록되었습니다. AI Vision 분석을 순차적으로 진행합니다!`);

    // 사진 등록 시 순차적으로 AI Vision 분석 실행
    setTimeout(() => {
      autoAnalyzeNewPhotos(newPhotos);
    }, 200);
  };

  const autoAnalyzeNewPhotos = async (currentPhotos: UploadedPhoto[]) => {
    const unanalyzed = currentPhotos.filter(
      (p) => !p.description && !p.analyzing && !isAnalyzingRef.current.has(p.id)
    );
    if (unanalyzed.length === 0) return;

    // 단일 큐로 순차 분석하여 Gemini API Rate Limit 및 타임아웃 완벽 방지
    for (const item of unanalyzed) {
      if (item && !isAnalyzingRef.current.has(item.id)) {
        try {
          await handleAnalyzePhoto(item.id, true);
        } catch (e) {}
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 2. AI 이미지 직접 생성 처리
  const handleGenerateAiImage = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || aiPrompt;
    if (!finalPrompt.trim() && !topic.trim()) {
      toast.error('생성할 이미지 설명을 입력해주세요.');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/blog-auto/writer/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt.trim() || topic.trim(),
          style: aiStyle,
          topic: topic.trim(),
          skillId,
          skillName: selectedSkill.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '이미지 생성 실패');
      }

      const photoId = `ai_photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newPhoto: UploadedPhoto = {
        id: photoId,
        name: `AI 생성: ${finalPrompt.slice(0, 16)}...`,
        url: data.imageUrl,
        isAiGenerated: true,
        description: data.koreanDescription,
        caption: `✨ ${data.koreanDescription}`,
        analyzing: false,
      };

      updatePhotos((prev) => [...prev, newPhoto]);
      toast.success(`AI 이미지가 생성되어 사진 목록에 추가되었습니다!`);
      if (!promptToUse) setAiPrompt('');
    } catch (err: any) {
      console.error(err);
      toast.error(`이미지 생성 실패: ${err.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 이미지 파일 클립보드 복사 (네이버 스마트에디터에 바로 붙여넣기 가능)
  const handleCopyImageToClipboard = async (photo: UploadedPhoto, index: number) => {
    try {
      toast.info(`[사진 #${index + 1}] 클립보드로 복사 중...`);
      let blob: Blob;

      if (photo.file) {
        blob = photo.file;
      } else if (photo.url.startsWith('data:')) {
        const res = await fetch(photo.url);
        blob = await res.blob();
      } else {
        const res = await fetch(photo.url);
        blob = await res.blob();
      }

      // PNG로 변환하여 클립보드 복사 (브라우저 ClipboardItem 지원)
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = photo.url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) throw new Error('Blob conversion failed');
        const item = new ClipboardItem({ 'image/png': pngBlob });
        await navigator.clipboard.write([item]);
        toast.success(`[사진 #${index + 1}] 이미지가 복사되었습니다! 네이버 에디터에서 Ctrl+V로 붙여넣으세요.`);
      }, 'image/png');
    } catch (err: any) {
      console.error(err);
      toast.error('이미지 복사 실패: 다운로드 버튼을 이용해주세요.');
    }
  };

  // 전체 사진 일괄 다운로드 (ZIP)
  const [isZipping, setIsZipping] = useState(false);
  const handleDownloadAllZip = async () => {
    if (photos.length === 0) {
      toast.error('다운로드할 사진이 없습니다.');
      return;
    }

    setIsZipping(true);
    toast.info(`사진 ${photos.length}장을 압축하는 중입니다...`);

    try {
      const zip = new JSZip();
      const folder = zip.folder('blog_photos') || zip;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        let blob: Blob;

        if (photo.file) {
          blob = photo.file;
        } else {
          const res = await fetch(photo.url);
          blob = await res.blob();
        }

        const safeName = (photo.name || `photo_${i + 1}`).replace(/[^가-힣a-zA-Z0-9_-]/g, '_');
        const fileName = `${String(i + 1).padStart(2, '0')}_${safeName.slice(0, 20)}.png`;
        folder.file(fileName, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blog_photos_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`🎉 사진 ${photos.length}장이 번호 순서대로 ZIP 다운로드되었습니다! 에디터로 드래그하여 한 번에 올리세요.`);
    } catch (err: any) {
      console.error(err);
      toast.error(`압축 다운로드 실패: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadPhoto = async (photo: UploadedPhoto, index: number) => {
    try {
      const a = document.createElement('a');
      a.href = photo.url;
      a.download = `blog_photo_${index + 1}.png`;
      a.target = '_blank';
      a.click();
      toast.success(`[사진 #${index + 1}] 다운로드되었습니다.`);
    } catch (e) {
      toast.error('다운로드 실패');
    }
  };

  const handleDeletePhoto = (id: string) => {
    isAnalyzingRef.current.delete(id);
    updatePhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    updatePhotos((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  // 단일 사진 AI Vision 분석
  const handleAnalyzePhoto = async (photoId: string, silent = false) => {
    if (isAnalyzingRef.current.has(photoId)) return;

    const currentList = photosRef.current;
    const photo = currentList.find((p) => p.id === photoId);
    if (!photo) return;

    isAnalyzingRef.current.add(photoId);

    const photoIndex = currentList.findIndex((p) => p.id === photoId) + 1;

    // 분석 중 상태 표시
    updatePhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, analyzing: true } : p))
    );

    try {
      // 압축된 data URL 우선 사용 (고용량 원본 파일 직렬화 오류 방지)
      let base64Image = photo.url;
      if (!base64Image && photo.file) {
        base64Image = await fileToDataUrl(photo.file);
      }

      const controller = new AbortController();
      abortControllersRef.current.set(photoId, controller);
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch('/api/blog-auto/writer/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || '사진 분석 응답이 올바르지 않습니다.');
      }

      const { summary, details, keywords, suggestedCaption } = data.analysis;
      updatePhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? {
                ...p,
                analyzing: false,
                description: `${summary} - ${details}`,
                caption: suggestedCaption || summary,
                keywords: keywords || [],
              }
            : p
        )
      );

      if (!silent) {
        toast.success(`[사진 #${photoIndex} 분석 완료] ${summary}`);
      }

      // 주제가 아직 비어있다면 첫 번째 분석 완료 사진의 캡션/요약으로 자동 추천
      if (!topic.trim() && onApplyTopic && photoIndex === 1 && (suggestedCaption || summary)) {
        onApplyTopic(suggestedCaption || summary);
      }
    } catch (err: any) {
      console.error(`Photo ${photoId} analysis error:`, err);
      updatePhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, analyzing: false } : p))
      );
      if (!silent) {
        toast.error(`[사진 #${photoIndex}] 분석 실패: ${err.name === 'AbortError' ? '응답 시간 초과 (다시 시도해주세요)' : err.message || '오류 발생'}`);
      }
    } finally {
      isAnalyzingRef.current.delete(photoId);
      abortControllersRef.current.delete(photoId);
    }
  };

  const handleAnalyzeAll = async () => {
    const unanalyzed = photosRef.current.filter(
      (p) => !p.description && !p.analyzing && !isAnalyzingRef.current.has(p.id)
    );
    if (unanalyzed.length === 0 || analyzingAll) {
      if (photosRef.current.length === 0) toast.error('등록된 사진이 없습니다.');
      else toast.info('이미 모든 사진의 분석이 완료되었습니다.');
      return;
    }

    setAnalyzingAll(true);
    toast.info(`총 ${unanalyzed.length}장의 사진을 AI Vision으로 고속 분석합니다...`);

    const concurrency = 2;
    const queue = [...unanalyzed];
    let successCount = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          try {
            await handleAnalyzePhoto(item.id, false);
            successCount++;
          } catch (e) {}
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => worker());
    await Promise.all(workers);

    setAnalyzingAll(false);
    toast.success(`🎉 ${successCount}장의 사진 분석이 완료되었습니다! 가운데에서 주제를 확인하고 [AI 블로그 글 생성하기]를 눌러주세요.`);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  // 접힌 상태 (Collapsed)
  if (collapsed) {
    return (
      <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 shrink-0 transition-all duration-300">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mb-4"
          title="사진 패널 펼치기"
        >
          <ChevronRight className="size-5" />
        </button>
        <div className="writing-mode-vertical text-xs font-semibold text-slate-500 tracking-wider flex items-center gap-2 py-4">
          <Camera className="size-4 text-blue-600 rotate-90" />
          <span>사진 ({photos.length})</span>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all duration-300 overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <Camera className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              사진 관리
              <Badge variant="secondary" className="text-[11px] px-1.5 py-0 bg-blue-100 text-blue-700 font-bold">
                {photos.length}장
              </Badge>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {photos.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('현재 등록된 사진을 모두 비우시겠습니까? (이전 글의 사진이 새 글에 섞이지 않도록 초기화합니다)')) {
                    updatePhotos(() => []);
                    toast.success('사진함이 초기화되었습니다. 새로운 글을 작성하실 수 있습니다.');
                  }
                }}
                className="h-8 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5"
                title="등록된 사진 전체 삭제 (새 글 작성 시 초기화)"
              >
                <Trash2 className="size-3.5 mr-1" />
                비우기
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAnalyzeAll}
                disabled={analyzingAll}
                className="h-8 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2"
                title="전체 사진 AI 분석"
              >
                {analyzingAll ? (
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                ) : (
                  <Sparkles className="size-3.5 mr-1" />
                )}
                AI 분석
              </Button>
            </>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="패널 접기"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── 사진 드라이브 & 웹카메라 실시간 촬영 퀵 액션 ── */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDriveModalOpen(true)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/80 hover:border-indigo-300 hover:bg-indigo-100/50 transition-all flex flex-col justify-between text-left shadow-2xs group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="size-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FolderArchive className="size-3.5" />
              </div>
              <ArrowRight className="size-3 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-bold text-slate-800 leading-tight">사진 드라이브</p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">개인·공유 갤러리</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setWebcamModalOpen(true)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 hover:border-purple-300 hover:bg-purple-100/50 transition-all flex flex-col justify-between text-left shadow-2xs group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="size-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Camera className="size-3.5" />
              </div>
              <ArrowRight className="size-3 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-bold text-slate-800 leading-tight">웹카메라 촬영</p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">실시간 찍어서 삽입</p>
            </div>
          </button>
        </div>

        {/* ── 2가지 사진 추가 방식 탭 (내 사진 업로드 vs AI 직접 생성) ── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-9 p-0.5 bg-slate-100 rounded-lg">
            <TabsTrigger value="upload" className="text-xs font-bold flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <UploadCloud className="size-3.5 text-blue-600" />
              직접 업로드
            </TabsTrigger>
            <TabsTrigger value="generate" className="text-xs font-bold flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Wand2 className="size-3.5 text-purple-600" />
              AI 이미지 생성
            </TabsTrigger>
          </TabsList>

          {/* 1. 직접 파일 업로드 탭 */}
          <TabsContent value="upload" className="mt-3">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <UploadCloud className="size-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                내 컴퓨터에서 사진 추가
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                JPG, PNG, WEBP (스토리 맥락에 맞게 유기적 배치)
              </p>
            </div>
          </TabsContent>

          {/* 2. AI 이미지 직접 생성 탭 */}
          <TabsContent value="generate" className="mt-3 space-y-3">
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  <Sparkles className="size-3 text-purple-600" />
                  원하는 이미지 묘사
                </Label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAiStyle('realistic')}
                    className={`px-1.5 py-0.5 rounded ${
                      aiStyle === 'realistic'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    실사
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiStyle('illustration')}
                    className={`px-1.5 py-0.5 rounded ${
                      aiStyle === 'illustration'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    일러스트
                  </button>
                </div>
              </div>

              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={
                  skillId === 'saju'
                    ? (topic ? `예: ${topic} 관련 신비로운 사주 오행/타로 일러스트` : '예: 신비로운 동양 사주 명리학과 오행(목화토금수) 일러스트')
                    : skillId === 'restaurant'
                    ? (topic ? `예: ${topic} 관련 먹음직스러운 대표 메뉴 클로즈업` : '예: 모던한 인테리어의 햇살 가득한 카페 테라스')
                    : skillId === 'exchange'
                    ? (topic ? `예: ${topic} 관련 글로벌 환율 통화 및 증시 그래픽` : '예: 뉴욕 증시와 주요 통화(USD, JPY) 인포그래픽')
                    : (topic ? `예: ${topic} 관련 감각적이고 신뢰감 있는 대표 이미지` : '예: 핵심 주제를 매력적으로 보여주는 고화질 대표 컷')
                }
                rows={2}
                className="text-xs bg-white resize-none"
              />

              <Button
                onClick={() => handleGenerateAiImage()}
                disabled={isGeneratingImage || (!aiPrompt.trim() && !topic.trim())}
                className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>AI 이미지 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="size-3.5" />
                    <span>AI 사진 생성하기</span>
                  </>
                )}
              </Button>

              {/* 추천 이미지 프롬프트 칩들 */}
              <div className="pt-1 border-t border-purple-100">
                <span className="text-[10px] font-semibold text-purple-700 block mb-1.5">
                  💡 {selectedSkill.name} 추천 프롬프트 (클릭 시 즉시 생성):
                </span>
                <div className="space-y-1">
                  {getSuggestedPrompts().map((pText, pi) => (
                    <button
                      key={pi}
                      type="button"
                      disabled={isGeneratingImage}
                      onClick={() => handleGenerateAiImage(pText)}
                      className="w-full text-left text-[11px] p-1.5 rounded-lg bg-white/90 hover:bg-purple-100/80 border border-purple-100 text-slate-700 hover:text-purple-800 transition-colors flex items-center justify-between group disabled:opacity-50"
                    >
                      <span className="truncate pr-1">• {pText}</span>
                      <Plus className="size-3 text-purple-400 group-hover:text-purple-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 업로드/생성된 사진 목록 */}
        {photos.length > 0 && (
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
              <span>등록된 사진 ({photos.length}장)</span>
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                title="네이버/티스토리 에디터에 한 번에 올릴 수 있도록 번호 순서대로 ZIP 압축 다운로드합니다"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>압축 중...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-3" />
                    <span>전체 사진 ZIP 다운로드</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2.5">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm hover:border-blue-300 transition-all"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail with Index Badge & Click to Zoom */}
                    <div
                      onClick={() => setPreviewPhoto({ photo, index })}
                      className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center cursor-pointer group/thumb hover:border-blue-400 transition-all"
                      title="클릭하여 사진 크게 보기"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('images.unsplash.com')) {
                            target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';
                          }
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm z-10">
                        #{index + 1}
                      </span>
                      {photo.isAiGenerated && (
                        <span className="absolute bottom-1 right-1 bg-purple-600 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow z-10">
                          AI
                        </span>
                      )}
                      {/* Hover Zoom Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <ZoomIn className="size-4 text-white drop-shadow" />
                      </div>
                    </div>

                    {/* Photo Info & Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p
                            onClick={() => setPreviewPhoto({ photo, index })}
                            className="text-xs font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                            title="클릭하여 사진 크게 보기"
                          >
                            [IMAGE_{index + 1}] {photo.name}
                          </p>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleMovePhoto(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                              title="위로 이동"
                            >
                              <ArrowUp className="size-3" />
                            </button>
                            <button
                              onClick={() => handleMovePhoto(index, 'down')}
                              disabled={index === photos.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                              title="아래로 이동"
                            >
                              <ArrowDown className="size-3" />
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="삭제"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>

                        {/* AI Vision Analysis Status / Result */}
                        {photo.analyzing ? (
                          <div className="flex items-center justify-between text-[11px] text-purple-600 mt-1.5 bg-purple-50 p-1.5 rounded-md border border-purple-100">
                            <div className="flex items-center gap-1.5">
                              <Loader2 className="size-3 animate-spin text-purple-600" />
                              <span className="font-medium">AI가 사진 분석 중...</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const ctrl = abortControllersRef.current.get(photo.id);
                                if (ctrl) ctrl.abort();
                                abortControllersRef.current.delete(photo.id);
                                isAnalyzingRef.current.delete(photo.id);
                                updatePhotos((prev) =>
                                  prev.map((p) =>
                                    p.id === photo.id ? { ...p, analyzing: false } : p
                                  )
                                );
                              }}
                              className="text-[10px] text-slate-500 hover:text-red-600 underline ml-2 font-medium"
                              title="분석 취소"
                            >
                              취소
                            </button>
                          </div>
                        ) : photo.description ? (
                          <div className="mt-1.5 space-y-1.5">
                            <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 leading-snug">
                              <p className="font-semibold text-purple-900 mb-0.5">
                                📸 {photo.caption || photo.description.split(' - ')[0]}
                              </p>
                              {photo.description.includes(' - ') && (
                                <p className="text-[10.5px] text-slate-500 mt-0.5">
                                  {photo.description.split(' - ').slice(1).join(' - ')}
                                </p>
                              )}
                            </div>

                            {photo.keywords && photo.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {photo.keywords.map((kw, ki) => (
                                  <button
                                    key={ki}
                                    type="button"
                                    onClick={() => onApplyTopic && onApplyTopic(`${kw} 후기`)}
                                    className="text-[9.5px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md border border-purple-200/60 transition-colors font-medium"
                                    title="이 키워드로 주제 설정"
                                  >
                                    #{kw}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              {onApplyTopic && (
                                <button
                                  type="button"
                                  onClick={() => onApplyTopic(photo.caption || photo.description || '')}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors flex items-center gap-1"
                                  title="이 사진의 분석 내용을 블로그 글 주제로 바로 적용합니다"
                                >
                                  <Sparkles className="size-2.5" />
                                  <span>이 사진으로 주제 설정</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleAnalyzePhoto(photo.id)}
                                className="text-[10px] text-slate-400 hover:text-purple-600 transition-colors ml-auto"
                                title="사진 다시 분석하기"
                              >
                                다시 분석
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => handleAnalyzePhoto(photo.id)}
                              className="text-[10.5px] font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                            >
                              <Sparkles className="size-3 text-purple-600" />
                              AI Vision 분석하기
                            </button>
                          </div>
                        )}

                        {/* 네이버 에디터 붙여넣기용 원클릭 사진 복사 액션바 */}
                        <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleCopyImageToClipboard(photo, index)}
                            className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors flex items-center gap-1"
                            title="네이버 에디터에 Ctrl+V로 바로 붙여넣을 수 있도록 이미지 파일 자체를 복사합니다"
                          >
                            <span>📋 네이버 붙여넣기용 사진 복사</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPhoto(photo, index)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors"
                            title="사진 다운로드"
                          >
                            <Download className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 촬영 구도 가이드 (선택된 스킬에 맞춤) */}
        {selectedSkill.photoGuides && selectedSkill.photoGuides.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Info className="size-3.5 text-amber-600" />
              <span>{selectedSkill.name} 추천 사진 구도 가이드</span>
            </div>
            <div className="space-y-2">
              {selectedSkill.photoGuides.map((guide, gi) => (
                <div key={gi} className="text-xs bg-white/80 p-2 rounded-lg border border-amber-100">
                  <span className="font-semibold text-amber-900 block mb-0.5">
                    • {guide.title}
                  </span>
                  <span className="text-[11px] text-slate-600 leading-snug">
                    {guide.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 사진 크게 보기 확대 모달 (Lightbox Dialog) ── */}
      <Dialog
        open={!!previewPhoto}
        onOpenChange={(open) => {
          if (!open) setPreviewPhoto(null);
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Badge className="bg-blue-600 text-white text-xs">
                #{previewPhoto ? previewPhoto.index + 1 : 1}
              </Badge>
              <span>[IMAGE_{previewPhoto ? previewPhoto.index + 1 : 1}]</span>
              <span className="text-xs text-slate-500 font-normal truncate max-w-sm">
                {previewPhoto?.photo.name}
              </span>
            </DialogTitle>
            {previewPhoto && (
              <a
                href={previewPhoto.photo.url}
                download={`image_${previewPhoto.index + 1}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                title="원본 이미지 보기/다운로드"
              >
                <Download className="size-4" />
              </a>
            )}
          </DialogHeader>

          {previewPhoto && (() => {
            const currentPhoto = photos[previewPhoto.index] || previewPhoto.photo;
            return (
              <div className="p-4 space-y-4">
                {/* Large Image Preview */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950/5 flex items-center justify-center p-3 border border-slate-200 min-h-[260px]">
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.name}
                    className="w-auto h-auto max-w-full max-h-[55vh] object-contain rounded-lg shadow-md mx-auto block"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('images.unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80';
                      }
                    }}
                  />
                </div>

                {/* Photo Details & Caption */}
                {(currentPhoto.caption || currentPhoto.description) && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-1 text-xs">
                    <span className="font-bold text-blue-900 block">
                      ✨ AI 사진 캡션 & 본문 설명
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {currentPhoto.caption || currentPhoto.description}
                    </p>
                    {currentPhoto.keywords && currentPhoto.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {currentPhoto.keywords.map((kw, ki) => (
                          <Badge key={ki} variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">
                            #{kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── 4. 계정별 내 사진 드라이브 모달 ── */}
      <PhotoDriveModal
        open={driveModalOpen}
        onOpenChange={setDriveModalOpen}
        onSelectPhotos={(selectedFromDrive) => {
          updatePhotos((prev) => [...prev, ...selectedFromDrive]);
        }}
        currentlySelectedCount={photos.length}
      />

      {/* ── 5. 웹카메라 실시간 촬영 모달 ── */}
      <WebcamCaptureModal
        open={webcamModalOpen}
        onOpenChange={setWebcamModalOpen}
        onPhotoSaved={(savedItem) => {
          updatePhotos((prev) => [
            ...prev,
            {
              id: savedItem.id,
              name: savedItem.name,
              url: savedItem.url,
              caption: savedItem.caption,
              keywords: savedItem.keywords,
              analyzing: false,
            },
          ]);
          toast.success('웹카메라 촬영 사진이 블로그에 즉시 추가되었습니다!');
        }}
      />
    </aside>
  );
}
