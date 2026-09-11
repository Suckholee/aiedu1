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
  Lock,
  Globe,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  getDrivePhotos,
  getSharedDrivePhotos,
  saveDrivePhotos,
  deleteDrivePhoto,
  type DrivePhotoItem,
} from '@/lib/blog-automation/photo-drive-storage';
import { WebcamCaptureModal } from '@/components/drive/WebcamCaptureModal';
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
  '제품/리뷰',
  '매장/인테리어',
  '인물/셀카',
  '음식/맛집',
  '일상/기타',
];

export function PhotoDriveModal({
  open,
  onOpenChange,
  onSelectPhotos,
  currentlySelectedCount = 0,
}: PhotoDriveModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 탭 상태: 'private' (내 개인 사진첩) vs 'shared' (회원 공유 갤러리)
  const [activeTab, setActiveTab] = useState<'private' | 'shared'>('private');
  const [privatePhotos, setPrivatePhotos] = useState<DrivePhotoItem[]>([]);
  const [sharedPhotos, setSharedPhotos] = useState<DrivePhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);

  // 드라이브 사진 로드
  const loadDrivePhotos = async () => {
    setLoading(true);
    try {
      const [privates, shareds] = await Promise.all([
        getDrivePhotos(user),
        getSharedDrivePhotos(),
      ]);
      setPrivatePhotos(privates);
      setSharedPhotos(shareds);
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

  const currentList = activeTab === 'private' ? privatePhotos : sharedPhotos;

  // 카테고리 및 검색 필터링
  const filteredPhotos = currentList.filter((p) => {
    const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // 로컬 파일 드라이브로 업로드
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    toast.info(`${files.length}장의 사진을 드라이브에 업로드 중...`);

    try {
      const readPhotos: { name: string; url: string; category?: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        readPhotos.push({
          name: file.name,
          url: dataUrl,
          category: selectedCategory === '전체' ? '제품/리뷰' : selectedCategory,
        });
      }

      const isPublic = activeTab === 'shared';
      await saveDrivePhotos(user, readPhotos, isPublic);
      toast.success(`${readPhotos.length}장의 사진이 드라이브에 저장되었습니다!`);
      loadDrivePhotos();
    } catch (e) {
      console.error(e);
      toast.error('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 삭제
  const handleDeletePhoto = async (e: React.MouseEvent, photo: DrivePhotoItem) => {
    e.stopPropagation();
    if (!confirm(`'${photo.name}' 사진을 삭제하시겠습니까?`)) return;

    try {
      await deleteDrivePhoto(user?.uid || 'guest', photo.id);
      toast.success('사진이 삭제되었습니다.');
      setSelectedIds((prev) => prev.filter((id) => id !== photo.id));
      loadDrivePhotos();
    } catch (e) {
      toast.error('삭제 실패');
    }
  };

  // 선택 완료 후 블로그 에디터로 반영
  const handleConfirmSelection = () => {
    const selectedItems = currentList.filter((p) => selectedIds.includes(p.id));
    if (selectedItems.length === 0) return;

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
    toast.success(`🎉 드라이브에서 사진 ${convertedPhotos.length}장을 블로그로 가져왔습니다!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden bg-white flex flex-col rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <FolderArchive className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>수강생 사진 드라이브에서 가져오기</span>
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                내 개인 사진 또는 전체 회원이 공유한 사진을 선택해 블로그에 삽입하세요.
              </p>
            </div>
          </div>

          {/* Top Actions: Webcam & Upload */}
          <div className="flex items-center gap-2 mr-6">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setWebcamOpen(true)}
              className="h-8 text-xs rounded-xl border-slate-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold"
            >
              <Camera className="size-3.5 mr-1" />
              웹카메라 촬영
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-xs rounded-xl border-slate-200"
            >
              <UploadCloud className="size-3.5 mr-1" />
              업로드
            </Button>
          </div>
        </DialogHeader>

        {/* Dual Tab Switcher & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Dual Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('private');
                setSelectedIds([]);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'private'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="size-3" />
              <span>🔒 내 개인 사진첩 ({privatePhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('shared');
                setSelectedIds([]);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'shared'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="size-3" />
              <span>👥 회원 공유 갤러리 ({sharedPhotos.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="사진 이름 검색..."
              className="h-8 pl-8 text-xs bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleSelectAll}
            className="text-[11px] h-7 text-slate-500 hover:text-slate-900 shrink-0"
          >
            {selectedIds.length === filteredPhotos.length && filteredPhotos.length > 0
              ? '선택 해제'
              : '전체 선택'}
          </Button>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="size-8 animate-spin mb-2 text-indigo-500" />
              <p className="text-xs">사진을 불러오는 중...</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <FolderArchive className="size-12 mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">보관된 사진이 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">웹카메라로 찍거나 사진을 업로드해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedIds.includes(photo.id);
                const isOwner = photo.userId === (user?.uid || 'guest');

                return (
                  <div
                    key={photo.id}
                    onClick={() => toggleSelect(photo.id)}
                    className={`group relative rounded-xl border bg-white overflow-hidden cursor-pointer transition shadow-2xs hover:shadow-md ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-4/3 relative bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="size-full object-cover group-hover:scale-105 transition duration-200"
                      />

                      {/* Select check badge */}
                      <div
                        className={`absolute top-2 left-2 size-5 rounded-md border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-black/30 border-white/60 text-transparent'
                        }`}
                      >
                        <Check className="size-3" />
                      </div>

                      {/* Category tag */}
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {photo.category}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {photo.name}
                      </p>
                      {activeTab === 'shared' && photo.userName && (
                        <p className="text-[10px] text-purple-700 font-semibold mt-0.5">
                          작성자: {photo.userName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-indigo-600">{selectedIds.length}장</span> 선택됨
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs h-9"
            >
              닫기
            </Button>
            <Button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleConfirmSelection}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9 px-4 shadow-sm"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              블로그에 삽입하기 ({selectedIds.length})
            </Button>
          </div>
        </div>

        {/* Webcam Capture Modal */}
        <WebcamCaptureModal
          open={webcamOpen}
          onOpenChange={setWebcamOpen}
          onPhotoSaved={() => loadDrivePhotos()}
        />
      </DialogContent>
    </Dialog>
  );
}
