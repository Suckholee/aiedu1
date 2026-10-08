'use client';

import { usePlatform } from '@/contexts/PlatformContext';
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
  courseId: string;
  courseTitle: string;
  price: number;
  originalPrice: number;
  onPaymentSuccess?: () => void;
}

export function SeatHoldCheckoutModal({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  price,
  originalPrice,
  onPaymentSuccess,
}: SeatHoldCheckoutModalProps) {
  const { mutate, ready } = usePlatform();
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const discountAmount = originalPrice - price;
  const handlePay = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await mutate({ action: 'enroll', courseId, name, email, phone });
      localStorage.setItem('platform-learner-email', email.trim().toLowerCase());
      onOpenChange(false);
      toast.success('수강 신청을 접수했습니다.', { description: '관리자 승인 후 내 강의실에서 학습할 수 있습니다. 실제 결제는 발생하지 않습니다.' });
      onPaymentSuccess?.();
    } catch(e) { toast.error(e instanceof Error ? e.message : '신청 실패'); }
    finally { setIsProcessing(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <DialogTitle className="text-lg font-bold text-slate-900">수강 신청하기</DialogTitle>
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

          <div className="space-y-3">
            <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">로컬 테스트 신청 · 신청 즉시 정원에 반영되며 관리자 승인 후 강의실이 열립니다. 실제 결제는 발생하지 않습니다.</p>
            <label className="block text-sm">이름<input aria-label="신청자 이름" className="mt-1 w-full rounded-lg border p-2" value={name} onChange={e=>setName(e.target.value)}/></label>
            <label className="block text-sm">이메일<input aria-label="신청자 이메일" type="email" className="mt-1 w-full rounded-lg border p-2" value={email} onChange={e=>setEmail(e.target.value)}/></label>
            <label className="block text-sm">연락처<input aria-label="신청자 연락처" type="tel" className="mt-1 w-full rounded-lg border p-2" value={phone} onChange={e=>setPhone(e.target.value)}/></label>
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
              disabled={isProcessing || !ready || !name.trim() || !email.trim() || phone.trim().length < 8}
              onClick={handlePay}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-98 transition disabled:opacity-50"
            >
              {isProcessing ? '신청 접수 중...' : `₩ ${price.toLocaleString()} 수강 신청하기`}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="size-3.5 text-slate-400" />
            <span>로컬 테스트 신청 · 실제 결제 없음</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
