'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Lock,
  Globe,
  Camera,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithGoogle, signInQuick, loading } = useAuth();
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (e: any) {
      setLoginError(
        e.code === 'auth/unauthorized-domain'
          ? '현재 도메인(aiedu1.vercel.app)이 Firebase 승인 도메인에 등록 진행 중입니다. 아래 지메일 간편 입력을 통해 즉시 시작하세요!'
          : e.message || '구글 로그인 중 오류가 발생했습니다.'
      );
      setShowManualForm(true);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      toast.error('이름이나 닉네임을 입력해주세요.');
      return;
    }
    signInQuick(quickName, quickEmail);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200 p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50 border-b border-indigo-100/80 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md mb-2">
            <Sparkles className="size-6" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900">
            AI 수강생 플랫폼 간편 로그인
          </DialogTitle>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            구글(지메일) 계정으로 1초 만에 가입하고<br />
            개인 사진첩 보관 및 3대 실습 데이터를 클라우드에 안전하게 저장하세요.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Error notice if popup failed */}
          {loginError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{loginError}</p>
            </div>
          )}

          {/* Main Google 1-Touch Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white py-3.5 px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin text-indigo-600" />
            ) : (
              /* Google Official Colorful G Logo */
              <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Google 계정으로 원터치 로그인</span>
          </button>

          {/* Member Benefits List */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200/60">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>회원 혜택</span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="size-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>웹카메라로 찍은 사진을 <strong>내 개인 사진첩</strong>에 안전하게 영구 보관</span>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="size-3.5 text-purple-600 shrink-0 mt-0.5" />
              <span>수강생 공유 갤러리에서 동료들의 멋진 실습 사진을 블로그/숏폼에 자유롭게 활용</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>업무자동화·블로그·VisKits 숏폼 실습 산출물 클라우드 동기화</span>
            </div>
          </div>

          {/* Fallback Manual Name Form Toggle */}
          <div className="pt-1 text-center">
            {!showManualForm ? (
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                지메일(Gmail) 주소 직접 입력으로 로그인하기 &darr;
              </button>
            ) : (
              <form onSubmit={handleQuickSubmit} className="space-y-3 pt-2 text-left">
                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      수강생 성함 또는 닉네임
                    </label>
                    <Input
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="예: 김수강"
                      className="h-9 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      지메일(Gmail) 주소
                    </label>
                    <Input
                      type="email"
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      placeholder="예: student@gmail.com"
                      className="h-9 text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  지메일로 즉시 시작하기
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
