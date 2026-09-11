'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, X, AlertTriangle } from 'lucide-react';

export function KakaoInAppHandler() {
  const [isKakao, setIsKakao] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const kakaoCheck = /KAKAOTALK/i.test(ua);
    const iosCheck = /iPhone|iPad|iPod/i.test(ua);
    const androidCheck = /Android/i.test(ua);

    if (kakaoCheck) {
      setIsKakao(true);
      setIsIOS(iosCheck);

      // 안드로이드(갤럭시): 크롬 인텐트로 자동 즉시 실행
      if (androidCheck) {
        const cleanUrl = window.location.href.replace(/https?:\/\//i, '');
        // 크롬 패키지 인텐트 호출
        window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, []);

  if (!isKakao || dismissed) return null;

  const handleOpenChromeIOS = () => {
    if (typeof window === 'undefined') return;
    const cleanUrl = window.location.href.replace(/https?:\/\//i, '');
    // iOS 크롬 딥링크 시도
    window.location.href = `googlechrome://${cleanUrl}`;
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs">
      <div className="flex items-center gap-2.5 max-w-[85%]">
        <AlertTriangle className="size-4 shrink-0 text-amber-100" />
        <p className="leading-tight font-medium">
          <strong>카카오톡 인앱 브라우저가 감지되었습니다.</strong><br className="sm:hidden" />
          <span className="opacity-90 ml-0 sm:ml-1">
            웹카메라 촬영 및 Google 로그인을 위해{' '}
            {isIOS ? '우측 하단 [···] 버튼 ➔ [다른 브라우저(Safari/Chrome)로 열기]' : 'Chrome 브라우저'}를 이용해 주세요.
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isIOS && (
          <button
            type="button"
            onClick={handleOpenChromeIOS}
            className="rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1"
          >
            <span>크롬 열기</span>
            <ExternalLink className="size-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-white/80 hover:text-white hover:bg-white/20"
          title="닫기"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
