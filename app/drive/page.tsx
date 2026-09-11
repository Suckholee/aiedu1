'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  UploadCloud,
  FolderArchive,
  Lock,
  Globe,
  Trash2,
  Download,
  Share2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  Video,
  PenTool,
  Check,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  getDrivePhotos,
  getSharedDrivePhotos,
  saveDrivePhotos,
  togglePhotoPublicShare,
  deleteDrivePhoto,
  type DrivePhotoItem,
} from '@/lib/blog-automation/photo-drive-storage';
import { WebcamCaptureModal } from '@/components/drive/WebcamCaptureModal';
import { VisKitsExportModal } from '@/components/drive/VisKitsExportModal';
import { toast } from 'sonner';

const CATEGORIES = [
  '전체',
  '제품/리뷰',
  '매장/인테리어',
  '인물/셀카',
  '음식/맛집',
  '일상/기타',
];

export default function PhotoDrivePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 탭 상태: 'private' (내 개인 사진첩) vs 'shared' (회원 공유 갤러리)
  const [activeTab, setActiveTab] = useState<'private' | 'shared'>('private');
  const [privatePhotos, setPrivatePhotos] = useState<DrivePhotoItem[]>([]);
  const [sharedPhotos, setSharedPhotos] = useState<DrivePhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 및 검색
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 모달 상태
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [viskitsModalOpen, setVisKitsModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<DrivePhotoItem | null>(null);

  // 사진 로드
  const loadPhotos = async () => {
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
    loadPhotos();
  }, [user]);

  // 현재 활성 탭 기준 사진 목록
  const currentList = activeTab === 'private' ? privatePhotos : sharedPhotos;

  // 필터링 적용
  const filteredPhotos = useMemo(() => {
    return currentList.filter((p) => {
      const matchCat = selectedCategory === '전체' || p.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [currentList, selectedCategory, searchQuery]);

  // 선택된 사진 객체들
  const selectedPhotoObjects = useMemo(() => {
    return currentList.filter((p) => selectedIds.includes(p.id));
  }, [currentList, selectedIds]);

  // 로컬 파일 업로드 처리
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    toast.info(`${files.length}장의 사진을 업로드하고 있습니다...`);
    const newItemsPayload: { name: string; url: string; category: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newItemsPayload.push({
        name: file.name,
        url: dataUrl,
        category: selectedCategory === '전체' ? '제품/리뷰' : selectedCategory,
      });
    }

    try {
      // 탭이 'shared'일 때는 업로드와 동시에 공유, 'private'일 때는 비공개 저장
      const isPublic = activeTab === 'shared';
      await saveDrivePhotos(user, newItemsPayload, isPublic);
      toast.success(
        isPublic
          ? '🎉 사진이 회원 공유 갤러리에 업로드되었습니다!'
          : '✅ 사진이 내 개인 사진첩에 저장되었습니다!'
      );
      loadPhotos();
    } catch (err) {
      toast.error('업로드 실패');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map((p) => p.id));
    }
  };

  // 개별 선택 토글
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 전체 공유 상태 토글
  const handleToggleShare = async (photo: DrivePhotoItem) => {
    const newState = !photo.isPublic;
    try {
      await togglePhotoPublicShare(user, photo.id, newState);
      toast.success(
        newState
          ? '🌐 회원 전체 공유 갤러리에 공개되었습니다!'
          : '🔒 공유가 취소되고 내 개인 사진첩으로 전환되었습니다.'
      );
      loadPhotos();
    } catch (e) {
      toast.error('공유 설정 변경에 실패했습니다.');
    }
  };

  // 사진 삭제
  const handleDeletePhoto = async (photo: DrivePhotoItem) => {
    if (!confirm(`'${photo.name}' 사진을 삭제하시겠습니까?`)) return;
    try {
      await deleteDrivePhoto(user?.uid || 'guest', photo.id);
      toast.success('사진이 삭제되었습니다.');
      setSelectedIds((prev) => prev.filter((id) => id !== photo.id));
      loadPhotos();
    } catch (e) {
      toast.error('삭제 실패');
    }
  };

  // 블로그 실습실로 전송
  const handleSendToBlog = (photosToSend: DrivePhotoItem[]) => {
    if (photosToSend.length === 0) return;
    try {
      const mapped = photosToSend.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        description: p.description || '',
        caption: p.caption || '',
        keywords: p.keywords || [],
      }));
      localStorage.setItem('pending_blog_import_photos', JSON.stringify(mapped));
      toast.success(`${photosToSend.length}장의 사진을 블로그 실습실로 전송합니다!`);
      router.push('/tools/blog');
    } catch (e) {
      toast.error('블로그 전송 실패');
    }
  };

  // 숏폼 실습실로 전송
  const handleSendToShorts = (photosToSend: DrivePhotoItem[]) => {
    if (photosToSend.length === 0) return;
    try {
      const mapped = photosToSend.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
      }));
      localStorage.setItem('pending_shorts_import_photos', JSON.stringify(mapped));
      toast.success(`${photosToSend.length}장의 사진을 숏폼 실습실로 전송합니다!`);
      router.push('/tools/shorts');
    } catch (e) {
      toast.error('숏폼 전송 실패');
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Camera className="size-4.5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              수강생 사진 드라이브
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            웹카메라로 직접 찍거나 업로드하여 <strong>내 개인 사진첩</strong>에 안전하게 보관하고,
            동료들과 <strong>회원 공유 갤러리</strong>에서 함께 나눠 블로그와 VisKits 숏폼에 활용하세요.
          </p>
        </div>

        {/* Top Action Buttons: Webcam & File Upload */}
        <div className="flex items-center gap-2.5 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
          >
            <UploadCloud className="size-4 mr-1.5 text-slate-500" />
            사진 파일 업로드
          </Button>

          <Button
            type="button"
            onClick={() => setWebcamOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
          >
            <Camera className="size-4 mr-1.5" />
            웹카메라 실시간 촬영
          </Button>
        </div>
      </div>

      {/* ── 2. Dual Tab Switcher (My Private Photos vs Shared Gallery) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('private');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'private'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="size-4" />
            <span>🔒 내 개인 사진첩</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 font-extrabold">
              {privatePhotos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('shared');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'shared'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="size-4" />
            <span>👥 회원 전체 공유 갤러리</span>
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] text-purple-700 font-extrabold">
              {sharedPhotos.length}
            </span>
          </button>
        </div>

        {/* Selected Photos Batch Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-1">
              {selectedIds.length}장 선택됨
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleSendToBlog(selectedPhotoObjects)}
              className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
            >
              <PenTool className="size-3.5 mr-1" />
              블로그로 보내기
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setVisKitsModalOpen(true)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs"
            >
              <Video className="size-3.5 mr-1" />
              VisKits 숏폼 만들기
            </Button>
          </div>
        )}
      </div>

      {/* ── 3. Filters & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input + Select All */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="사진 이름 또는 태그 검색..."
              className="h-8.5 pl-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="h-8.5 rounded-xl border-slate-200 text-xs shrink-0"
          >
            {selectedIds.length === filteredPhotos.length && filteredPhotos.length > 0
              ? '선택 해제'
              : '전체 선택'}
          </Button>
        </div>
      </div>

      {/* ── 4. Photos Grid ── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="size-8 mx-auto animate-spin mb-3 text-indigo-500" />
          <p className="text-xs font-medium">사진 드라이브를 불러오는 중입니다...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 py-16 px-4 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
            <Camera className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {activeTab === 'private' ? '보관된 개인 사진이 없습니다.' : '공유된 사진이 없습니다.'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {activeTab === 'private'
              ? '웹카메라로 실습할 제품이나 매장을 찍거나 스마트폰 사진을 업로드해 보세요.'
              : '수강생들이 촬영한 사진을 전체 공유하면 여기에 모여 함께 활용할 수 있습니다.'}
          </p>
          <div className="mt-6 flex justify-center gap-2.5">
            <Button
              type="button"
              onClick={() => setWebcamOpen(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              <Camera className="size-3.5 mr-1.5" />
              웹카메라로 첫 사진 찍기
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            const isOwner = photo.userId === (user?.uid || 'guest');

            return (
              <div
                key={photo.id}
                onClick={() => toggleSelect(photo.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white overflow-hidden transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Image Box */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Selection Checkbox Pill */}
                  <div
                    className={`absolute top-2.5 left-2.5 grid size-6 place-items-center rounded-lg border transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-black/30 border-white/40 text-transparent group-hover:text-white/60'
                    }`}
                  >
                    <Check className="size-3.5" />
                  </div>

                  {/* Category & Status Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                      {photo.category}
                    </span>
                    {activeTab === 'private' && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold backdrop-blur-xs ${
                          photo.isPublic
                            ? 'bg-purple-600/90 text-white'
                            : 'bg-slate-700/80 text-slate-200'
                        }`}
                      >
                        {photo.isPublic ? '공유 중' : '비공개'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {photo.name}
                      </h4>
                    </div>

                    {/* Owner Name (In Shared Tab) */}
                    {activeTab === 'shared' && photo.userName && (
                      <p className="text-[11px] font-semibold text-purple-700 mt-1 flex items-center gap-1">
                        <span>작성자: {photo.userName}</span>
                      </p>
                    )}

                    {photo.caption && (
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {photo.caption}
                      </p>
                    )}
                  </div>

                  {/* Quick Action Footer Buttons */}
                  <div
                    className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Share Toggle (If Owner) */}
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => handleToggleShare(photo)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold transition ${
                          photo.isPublic
                            ? 'text-purple-600 hover:text-purple-800'
                            : 'text-slate-500 hover:text-indigo-600'
                        }`}
                        title={photo.isPublic ? '공유 취소하기' : '회원 전체 공유하기'}
                      >
                        <Share2 className="size-3" />
                        <span>{photo.isPublic ? '공유 중' : '공유하기'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">공유된 사진</span>
                    )}

                    {/* Blog & Shorts Quick Action */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSendToBlog([photo])}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                        title="이 사진으로 블로그 작성"
                      >
                        <PenTool className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIds([photo.id]);
                          setVisKitsModalOpen(true);
                        }}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition"
                        title="VisKits 숏폼 영상 제작"
                      >
                        <Video className="size-3.5" />
                      </button>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="삭제"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Webcam Capture Modal ── */}
      <WebcamCaptureModal
        open={webcamOpen}
        onOpenChange={setWebcamOpen}
        onPhotoSaved={() => {
          loadPhotos();
        }}
      />

      {/* ── 6. VisKits Export Modal ── */}
      <VisKitsExportModal
        open={viskitsModalOpen}
        onOpenChange={setVisKitsModalOpen}
        selectedPhotos={selectedPhotoObjects}
      />
    </div>
  );
}
