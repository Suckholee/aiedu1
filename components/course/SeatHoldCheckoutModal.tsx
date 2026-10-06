'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Clock, CheckCircle2, ShieldCheck, X, Sparkles, CreditCard, Building } from 'lucide-react';
import { toast } from 'sonner';

interface SeatHoldCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  price: number;
  originalPrice: number;
  onPaymentSuccess?: () => void;
}

export function SeatHoldCheckoutModal({
  open,
  onOpenChange,
  courseTitle,
  price,
  originalPrice,
  onPaymentSuccess,
}: SeatHoldCheckoutModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(598); // ~9:58
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'kakao' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!open) {
      setSecondsLeft(598);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const discountAmount = originalPrice - price;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      toast.success('수강 신청 및 결제가 성공적으로 완료되었습니다!', {
        description: '강의실에서 바로 학습을 시작할 수 있습니다.',
      });
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <DialogTitle className="text-lg font-bold text-slate-900">결제하기</DialogTitle>
        </div>

        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Selected Course Card */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white font-bold text-xs">
              <Sparkles className="size-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">{courseTitle}</h4>
              <p className="text-base font-extrabold text-slate-950 mt-0.5">
                ₩ {price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Seat Hold Banner matching Slide 32 */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
                  <Lock className="size-4" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                    좌석을 선점했어요!
                  </h5>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    현재 회원님의 좌석을 임시로 확보했어요.<br />
                    결제 완료 전까지 다른 사용자가 해당 좌석을 신청할 수 없어요.
                  </p>
                </div>
              </div>

              {/* Countdown timer */}
              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-400 block">남은 결제 시간</span>
                <span className="text-lg font-black text-emerald-600 font-mono tracking-tight block">
                  {timeFormatted}
                </span>
                <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-200 ml-auto">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${(secondsLeft / 600) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-700">주문 정보</h5>
            <div className="flex justify-between text-xs text-slate-600">
              <span>상품 금액</span>
              <span className="font-semibold text-slate-800">₩ {originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-rose-600">
              <span>할인 금액</span>
              <span className="font-semibold">- ₩ {discountAmount.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>총 결제 금액</span>
              <span className="text-lg font-black text-blue-600">₩ {price.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 block">결제 수단 선택</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className="size-5 mb-1.5" />
                <span>신용카드</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('kakao')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedMethod === 'kakao'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="size-5 mb-1.5 rounded-full bg-[#FEE500] text-slate-900 text-[10px] font-black grid place-items-center">
                  pay
                </div>
                <span>카카오페이</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedMethod === 'bank'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building className="size-5 mb-1.5" />
                <span>무통장 입금</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              취소하고 돌아가기
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-98 transition disabled:opacity-50"
            >
              {isProcessing ? '결제 승인 중...' : `₩ ${price.toLocaleString()} 결제하기`}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="size-3.5 text-slate-400" />
            <span>SSL로 안전하게 보호된 결제입니다.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
