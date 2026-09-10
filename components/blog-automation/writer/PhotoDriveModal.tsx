'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FolderArchive,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Sparkles,
  Plus,
  Loader2,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  getDrivePhotos,
  saveDrivePhotos,
  deleteDrivePhoto,
  type DrivePhotoItem,
} from '@/lib/blog-automation/photo-drive-storage';
import type { UploadedPhoto } from './PhotoUploadPanel';
import { toast } from 'sonner';

interface PhotoDriveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPhotos: (selectedPhotos: UploadedPhoto[]) => void;
  currentlySelectedCount?: number;
}

const CATEGORIES = [
  '전체',
  '음식/맛집',
  '여행/풍경',
  '시니어/건강',
  '부동산/인테리어',
  '제품/리뷰',
  '기타',
];

export function PhotoDriveModal({
  open,
  onOpenChange,
  onSelectPhotos,
  currentlySelectedCount = 0,
}: PhotoDriveModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [drivePhotos, setDrivePhotos] = useState<DrivePhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 드라이브 사진 로드
  const loadDrivePhotos = async () => {
    setLoading(true);
    try {
      const list = await getDrivePhotos(user);
      setDrivePhotos(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDrivePhotos();
      setSelectedIds([]);
    }
  }, [open, user]);

  // 카테고리 및 검색 필터링
  const filteredPhotos = drivePhotos.filter((p) => {
    const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // 다중 선택 토글
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map((p) => p.id));
    }
  };

  // 로컬 파일 드라이브로 업로드 & AI Vision 분석
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    toast.info(`${files.length}장의 사진을 내 드라이브에 업로드 및 AI 분석 중...`);

    try {
      const readPhotos: { name: string; url: string; category?: string; description?: string; caption?: string; keywords?: string[] }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // AI Vision 분석
        let desc = '';
        let caption = '';
        let keywords: string[] = [];

        try {
          const res = await fetch('/api/blog-auto/writer/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: dataUrl }),
          });
          const data = await res.json();
          if (data && data.analysis) {
            desc = `${data.analysis.summary} - ${data.analysis.details}`;
            caption = data.analysis.suggestedCaption;
            keywords = data.analysis.keywords || [];
          }
        } catch (e) {}

        readPhotos.push({
          name: file.name,
          url: dataUrl,
          category: selectedCategory === '전체' ? '기타' : selectedCategory,
          description: desc,
          caption: caption,
          keywords: keywords,
        });
      }

      const saved = await saveDrivePhotos(user, readPhotos);
      setDrivePhotos((prev) => [...saved, ...prev]);
      toast.success(`🎉 ${saved.length}장의 사진이 내 드라이브에 저장되었습니다!`);
    } catch (err: any) {
      toast.error('드라이브 업로드 실패: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 개별 삭제
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('이 사진을 내 드라이브에서 삭제하시겠습니까?')) return;

    try {
      await deleteDrivePhoto(user?.uid || 'guest', id);
      setDrivePhotos((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast.success('사진이 삭제되었습니다.');
    } catch (e) {
      toast.error('삭제 실패');
    }
  };

  // 선택한 사진들을 현재 글 작성 패널로 적용
  const handleApplySelected = () => {
    const selectedItems = drivePhotos.filter((p) => selectedIds.includes(p.id));
    if (selectedItems.length === 0) {
      toast.error('적용할 사진을 1장 이상 선택해주세요.');
      return;
    }

    const convertedPhotos: UploadedPhoto[] = selectedItems.map((p, idx) => ({
      id: `photo_from_drive_${Date.now()}_${idx}`,
      name: p.name,
      url: p.url,
      description: p.description,
      caption: p.caption,
      keywords: p.keywords,
      analyzing: false,
    }));

    onSelectPhotos(convertedPhotos);
    onOpenChange(false);
    toast.success(`🎉 내 드라이브에서 사진 ${convertedPhotos.length}장을 성공적으로 불러왔습니다!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden bg-white flex flex-col rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <FolderArchive className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>계정별 내 사진 드라이브</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-bold text-xs">
                  {drivePhotos.length}장 보관 중
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                <span>👤 {user?.email || '게스트 사용자'}</span>
                <span> • 평소 찍어둔 사진을 미리 올려두고 글 쓸 때 콕 집어 사용하세요</span>
              </p>
            </div>
          </div>

          {/* Upload Button & Search */}
          <div className="flex items-center gap-2 mr-6">
            <div className="relative w-48">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사진 검색..."
                className="h-8 pl-8 text-xs bg-white border-slate-200"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>업로드/분석 중...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" />
                  <span>드라이브에 사진 추가</span>
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Category Filter Bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {selectedIds.length === filteredPhotos.length && filteredPhotos.length > 0
                ? '선택 해제'
                : '전체 선택'}
            </button>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {selectedIds.length}장 선택됨
            </span>
          </div>
        </div>

        {/* Photos Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="size-8 animate-spin text-amber-500" />
              <span className="text-xs font-medium">내 사진 드라이브를 불러오는 중...</span>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-20 px-4">
              <FolderArchive className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">드라이브에 저장된 사진이 없습니다</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                상단의 [드라이브에 사진 추가] 버튼을 눌러 사진들을 미리 올려두시면 언제든 꺼내 쓰실 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
              {filteredPhotos.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`group relative rounded-xl border-2 overflow-hidden bg-white cursor-pointer transition-all shadow-xs ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/30'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div
                      className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center z-10 transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Check className="size-3 stroke-[3]" />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/50 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="드라이브에서 삭제"
                    >
                      <Trash2 className="size-3" />
                    </button>

                    {/* Image Thumbnail */}
                    <div className="aspect-square bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>

                    {/* Caption / Description Info */}
                    <div className="p-2 bg-white">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.caption || item.description || '분석 중...'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>선택한 사진들은 AI가 블로그 스토리라인에 맞춰 자동으로 최적의 위치에 배치합니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs text-slate-600"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleApplySelected}
              disabled={selectedIds.length === 0}
              className="h-9 px-5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <span>⚡ 선택한 사진 ({selectedIds.length}장) 글 작성에 즉시 적용</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
