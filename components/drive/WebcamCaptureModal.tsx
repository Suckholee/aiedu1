'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Camera,
  RefreshCw,
  Clock,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Share2,
  Lock,
  Globe,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { saveDrivePhotos, type DrivePhotoItem } from '@/lib/blog-automation/photo-drive-storage';
import { toast } from 'sonner';

interface WebcamCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoSaved?: (savedPhoto: DrivePhotoItem) => void;
  defaultCategory?: string;
}

const CATEGORIES = [
  '제품/리뷰',
  '매장/인테리어',
  '인물/셀카',
  '음식/맛집',
  '일상/기타',
];

export function WebcamCaptureModal({
  open,
  onOpenChange,
  onPhotoSaved,
  defaultCategory = '제품/리뷰',
}: WebcamCaptureModalProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [isPublic, setIsPublic] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerDuration, setTimerDuration] = useState<number>(0); // 0 = 즉시, 3 = 3초
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState(false);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? '카메라 권한이 차단되었습니다. 브라우저 주소창 왼쪽의 카메라 권한을 허용해 주세요.'
          : '카메라를 시작할 수 없습니다. 웹캠이 연결되어 있는지 확인해 주세요.';
      setCameraError(errorMsg);
    }
  }, [facingMode]);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // 모달 열림/닫힘 감지
  useEffect(() => {
    if (open) {
      setCapturedImage(null);
      setPhotoName(`촬영사진_${new Date().toISOString().slice(2, 10).replace(/-/g, '')}_${Math.floor(Math.random() * 900 + 100)}`);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  // 카메라 전환 (전면/후면)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // 셔터 촬영 실행
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 플래시 효과
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    // 전면 카메라 좌우 반전 보정
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // 타이머 촬영 트리거
  const handleShutterClick = () => {
    if (timerDuration > 0) {
      let count = timerDuration;
      setCountdown(count);
      const timer = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(timer);
          setCountdown(null);
          takeSnapshot();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  // 다시 촬영
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // 드라이브에 저장
  const handleSaveToDrive = async () => {
    if (!capturedImage) return;
    setIsSaving(true);
    try {
      const fileName = photoName.trim() ? `${photoName.trim()}.jpg` : `촬영사진_${Date.now()}.jpg`;
      const savedItems = await saveDrivePhotos(
        user,
        [
          {
            name: fileName,
            url: capturedImage,
            category,
            caption: `${category} 관련 웹카메라 촬영 실습 사진입니다.`,
            keywords: [category, '웹캠촬영', '실습사진'],
          },
        ],
        isPublic
      );

      toast.success(
        isPublic
          ? '🎉 사진이 개인 사진첩 및 회원 공유 갤러리에 저장되었습니다!'
          : '✅ 사진이 내 개인 사진첩에 안전하게 저장되었습니다!'
      );

      if (savedItems.length > 0 && onPhotoSaved) {
        onPhotoSaved(savedItems[0]);
      }
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('사진 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white text-slate-900 border-slate-200 p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Camera className="size-5 text-indigo-600" />
              <span>웹카메라 실시간 촬영</span>
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              제품, 매장, 인물 등을 직접 찍어 블로그 글과 숏폼 영상에 바로 활용하세요.
            </p>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* 1. Camera Live View or Preview */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
            {flash && (
              <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-2xs">
                <span className="text-7xl font-black text-white drop-shadow-lg animate-ping">
                  {countdown}
                </span>
              </div>
            )}

            {/* Live Video Feed */}
            {!capturedImage && !cameraError && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
            )}

            {/* Captured Image Preview */}
            {capturedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain bg-slate-900"
              />
            )}

            {/* Camera Error Message */}
            {cameraError && (
              <div className="p-6 text-center text-rose-300 space-y-3 max-w-sm">
                <AlertCircle className="size-10 mx-auto text-rose-400" />
                <p className="text-xs leading-relaxed">{cameraError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  카메라 다시 시도
                </Button>
              </div>
            )}

            {/* Live Camera Controls Overlay (When not captured) */}
            {!capturedImage && !cameraError && (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {/* Timer Toggle */}
                <button
                  type="button"
                  onClick={() => setTimerDuration((prev) => (prev === 0 ? 3 : 0))}
                  className={`rounded-full p-2 text-xs font-bold transition backdrop-blur-md ${
                    timerDuration === 3
                      ? 'bg-amber-500 text-white'
                      : 'bg-black/50 text-white/90 hover:bg-black/70'
                  }`}
                  title="3초 타이머 설정"
                >
                  <Clock className="size-4" />
                </button>

                {/* Switch Camera (Front / Back) */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="rounded-full bg-black/50 p-2 text-white/90 hover:bg-black/70 transition backdrop-blur-md"
                  title="카메라 전환"
                >
                  <RefreshCw className="size-4" />
                </button>
              </div>
            )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* 2. Controls & Form */}
          {!capturedImage ? (
            /* Live Camera Shutter Button */
            <div className="flex flex-col items-center justify-center pt-2">
              <button
                type="button"
                disabled={Boolean(cameraError) || countdown !== null}
                onClick={handleShutterClick}
                className="group relative flex size-18 items-center justify-center rounded-full border-4 border-indigo-600 bg-white shadow-lg transition-transform active:scale-95 hover:scale-105 disabled:opacity-50"
              >
                <div className="size-14 rounded-full bg-indigo-600 group-hover:bg-indigo-700 transition" />
              </button>
              <p className="mt-2 text-xs text-slate-500 font-medium">
                {timerDuration > 0 ? '3초 타이머 촬영' : '클릭하여 즉시 촬영'}
              </p>
            </div>
          ) : (
            /* Post-capture Save Options */
            <div className="space-y-4 pt-1">
              {/* Photo Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    사진 이름
                  </label>
                  <Input
                    value={photoName}
                    onChange={(e) => setPhotoName(e.target.value)}
                    placeholder="사진 이름을 입력하세요"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    카테고리 선택
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Privacy Setting Box (Private vs Shared) */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  저장 공간 선택
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex items-start gap-2 rounded-xl p-2.5 text-left border transition text-xs ${
                      !isPublic
                        ? 'bg-white border-indigo-500 text-indigo-950 font-bold shadow-xs'
                        : 'border-transparent text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <Lock className="size-4 shrink-0 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="leading-tight">내 개인 사진첩</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        나만 볼 수 있는 비공개 보관
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex items-start gap-2 rounded-xl p-2.5 text-left border transition text-xs ${
                      isPublic
                        ? 'bg-white border-purple-500 text-purple-950 font-bold shadow-xs'
                        : 'border-transparent text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <Globe className="size-4 shrink-0 text-purple-600 mt-0.5" />
                    <div>
                      <p className="leading-tight">회원 전체 공유 갤러리</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        동료 수강생들과 실습 사진 공유
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  className="rounded-xl border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  다시 찍기
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl text-slate-500 text-xs"
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveToDrive}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 shadow-xs"
                  >
                    {isSaving ? '저장 중...' : '드라이브에 저장하기'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
