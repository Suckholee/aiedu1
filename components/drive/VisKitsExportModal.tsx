'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Video,
  Sparkles,
  ExternalLink,
  Download,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  PlaySquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DrivePhotoItem } from '@/lib/blog-automation/photo-drive-storage';
import { toast } from 'sonner';

interface VisKitsExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPhotos: DrivePhotoItem[];
}

export function VisKitsExportModal({
  open,
  onOpenChange,
  selectedPhotos,
}: VisKitsExportModalProps) {
  const downloadSinglePhoto = (photo: DrivePhotoItem) => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.name || `photo_${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    if (selectedPhotos.length === 0) return;
    selectedPhotos.forEach((photo, idx) => {
      setTimeout(() => downloadSinglePhoto(photo), idx * 200);
    });
    toast.success(`${selectedPhotos.length}장의 사진 다운로드를 시작했습니다!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white text-slate-900 border-slate-200 p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-rose-50 via-pink-50/40 to-indigo-50 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-black text-rose-600 border border-rose-200">
              👑 VisKits 숏폼 영상 연동
            </span>
            <span className="text-xs font-bold text-slate-500">
              {selectedPhotos.length}장의 사진 선택됨
            </span>
          </div>

          <DialogTitle className="text-xl font-black text-slate-900 mt-2">
            드라이브 사진으로 VisKits 숏폼 만들기
          </DialogTitle>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            선택한 사진들을 다운로드하고, 대한민국 대표 AI 숏폼 영상 플랫폼 <strong>VisKits</strong>에서 1분 만에 자막·음성·영상을 완성하세요.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Selected Photos Preview Scroll */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              선택된 사진 미리보기 ({selectedPhotos.length}장)
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {selectedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Step by Step Workflow Guide */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-indigo-600 text-white font-bold text-[10px] mt-0.5">
                1
              </span>
              <div>
                <p className="font-bold text-slate-900">사진 다운로드하기</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  아래 버튼을 눌러 선택한 사진들을 PC 또는 스마트폰에 저장합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-rose-600 text-white font-bold text-[10px] mt-0.5">
                2
              </span>
              <div>
                <p className="font-bold text-slate-900">VisKits 접속 후 이미지 업로드</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  VisKits 스튜디오에 다운로드한 사진을 등록하고 AI 숏폼 자동 완성을 클릭합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white font-bold text-[10px] mt-0.5">
                3
              </span>
              <div>
                <p className="font-bold text-slate-900">수강생 1개월 무료 혜택 적용</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  마스터 클래스 참석자에게 제공되는 20만원 상당 숏폼 이용권 혜택이 적용됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadAll}
              className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              <Download className="size-4 mr-1.5 text-indigo-600" />
              선택한 사진 다운로드
            </Button>

            <a
              href="https://viskits.ai/home"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:opacity-95 transition"
            >
              <span>VisKits에서 숏폼 만들기</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
