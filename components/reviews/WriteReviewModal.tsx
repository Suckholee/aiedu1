'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  X,
  Plus,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  isVerifiedStudent?: boolean;
  currentProgress?: number; // e.g. 23 or 85
  onReviewSubmitted?: (review: { rating: number; content: string; author: string }) => void;
}

export function WriteReviewModal({
  open,
  onOpenChange,
  courseTitle,
  isVerifiedStudent = true,
  currentProgress = 85,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([
    '/images/learning_dashboard.png',
    '/images/naver_smart_editor_preview.jpg',
  ]);

  const ratingLabels: Record<number, string> = {
    1: '1점 (매우 불만족)',
    2: '2점 (불만족)',
    3: '3점 (보통)',
    4: '4점 (만족)',
    5: '5점 (매우 만족)',
  };

  const isEligible = isVerifiedStudent && currentProgress >= 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) {
      toast.error('수강평을 최소 10자 이상 작성해주세요.');
      return;
    }

    if (onReviewSubmitted) {
      onReviewSubmitted({
        rating,
        content,
        author: '김수강',
      });
    }

    toast.success('수강평이 성공적으로 등록되었습니다!', {
      description: '소중한 피드백 감사드립니다.',
    });
    setContent('');
    onOpenChange(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl rounded-2xl">
        {!isEligible ? (
          /* Unverified / Low progress Guard Modal matching Slide 73 right dialog */
          <div className="p-8 text-center space-y-5">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50 text-amber-500">
              <AlertTriangle className="size-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">수강 인증이 필요합니다</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                수강평은 진도를 50% 이상 또는 수강 완료 후 작성할 수 있습니다.
              </p>
            </div>

            {/* Current progress box */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>현재 수강 현황</span>
                <span className="text-blue-600">진도율 {currentProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              조금만 더 힘내서 수강을 진행해주세요!<br />
              더 유익한 수강평을 남길 수 있습니다.
            </p>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition"
            >
              강의실로 이동
            </button>
          </div>
        ) : (
          /* Full Review Submission Form matching Slide 73 center dialog */
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <DialogTitle className="text-lg font-bold text-slate-900">수강평 작성하기</DialogTitle>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto text-left">
              {/* Verification Badge matching Slide 73 */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span className="font-bold">수강 인증 완료</span>
                <span className="text-emerald-300">|</span>
                <span className="text-emerald-700">김수강님은 본 강의를 수강 중입니다 (진도율 {currentProgress}%).</span>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">별점 선택</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`size-6 ${
                            (hoverRating || rating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-100 text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 ml-1">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Review Content Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">수강평 내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  maxLength={5000}
                  placeholder="강의의 장점, 실무 적용 사례, 추천하고 싶은 분 등 솔직한 후기를 남겨주세요."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>• 최소 10자 이상 작성해주세요.</span>
                  <span>{content.length} / 5,000자</span>
                </div>
              </div>

              {/* Image Attachments */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">이미지 첨부 (선택)</label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center">
                  <UploadCloud className="mx-auto size-6 text-slate-400" />
                  <p className="mt-1 text-xs text-slate-600 font-medium">
                    파일을 드래그하거나 클릭하여 첨부하세요
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    JPG, PNG 파일만 가능 (최대 5MB, 최대 5장까지)
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative size-16 rounded-lg border border-slate-200 overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="attachment" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => toast.info('이미지 파일 선택 창이 열립니다.')}
                        className="size-16 rounded-lg border border-dashed border-slate-300 grid place-items-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition"
                      >
                        <Plus className="size-4" />
                        <span className="text-[9px] font-bold">추가 첨부</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-98 transition"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
