'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReferralCodeField } from '@/components/auth/ReferralCodeField';
import { PhoneInput } from '@/components/ui/phone-input';
import { BankTransferNotice } from '@/components/course/BankTransferNotice';
import { BANK_TRANSFER_PAYMENT_METHOD } from '@/lib/lms/payment-channel';
import { RefundPolicyNotice } from './RefundPolicyNotice';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {useAuth} from '@/contexts/AuthContext';
import {AuthModal} from '@/components/auth/AuthModal';
import { usePlatform } from '@/contexts/PlatformContext';


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
  const router = useRouter();
  const {lmsMember,lmsLoading}=useAuth();
  const [login,setLogin]=useState(false);
  const { mutate, ready } = usePlatform();

  // Step 1: Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode,setReferralCode]=useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  // Agreements
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);

  // Status state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    id: string;
    appliedAt: string;
    amount: number;
    paymentStatus: string;
  } | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);
  useEffect(()=>{setEmail(lmsMember?.email??'');setName(lmsMember?.display_name??'');setPhone(lmsMember?.phone??'');setCompany(lmsMember?.company??'');setCompletedOrder(null);setAgreePrivacy(false);setAgreeRefund(false);setNotes('');},[lmsMember?.id,open,courseId]);


  const discountAmount = Math.max(0, originalPrice - price);

  const handleCopyOrder = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderId);
    setCopiedOrder(true);
    toast.success('주문번호가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedOrder(false), 2000);
  };



  const resetForm = () => {
    setCompletedOrder(null);
    setName('');
    setEmail('');
    setPhone('');setReferralCode('');
    setCompany('');
    setNotes('');
    setAgreePrivacy(false);setAgreeRefund(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    if(!lmsMember){onOpenChange(false);router.push(`/apply?course=${encodeURIComponent(courseId)}`);return;}

    if (!name.trim()) {
      toast.error('신청자 성함을 입력해주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      toast.error('올바른 휴대전화 번호를 입력해주세요.');
      return;
    }
    if (!agreePrivacy || !agreeRefund) {
      toast.error('필수 이용 약관 및 환불 규정에 동의해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      const accepted = await mutate({ action: 'enroll', courseId: courseId, name, email, phone, company, notes, referralCode, paymentMethod: BANK_TRANSFER_PAYMENT_METHOD });

      // Display the order created in the same transaction as the application.
      const enrollment=accepted.enrollments.find(e=>e.courseId===courseId&&e.learnerId===lmsMember.id);
      if(!enrollment?.orderId)throw Error('신청은 접수되었지만 주문을 확인하지 못했습니다. 내 신청 목록을 새로고침해주세요.');
      const record={orderId:enrollment?.orderNumber??enrollment?.id??'',paymentStatus:enrollment?.paymentStatus??'미결제'};

      setCompletedOrder({
        id:enrollment.orderId,
        orderId: record.orderId,
        appliedAt: new Date().toLocaleString('ko-KR'),
        amount: enrollment?.amount??price,
        paymentStatus: record.paymentStatus,
      });

      toast.success('수강 신청 및 접수가 정상 완료되었습니다!', {
        description: `주문번호: ${record.orderId}`,
      });

      onPaymentSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수강 신청 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <><AuthModal open={login} onOpenChange={setLogin}/><Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div>
            <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-600" />
              {completedOrder ? '수강 신청 완료 확인서' : '수강 신청 및 결제'}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedOrder
                ? '정상적으로 접수되었습니다. 아래 안내 사항을 확인해주세요.'
                : '신청자 정보와 수강료를 확인하고 수강신청을 접수하세요.'}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* VIEW A: ORDER COMPLETED */}
          {completedOrder ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center space-y-3">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-200">
                  <CheckCircle2 className="size-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    수강 신청이 접수되었습니다!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    신청 상태와 결제 안내는 내 신청·결제 목록에서 확인하세요.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-emerald-200 px-3.5 py-1.5 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500">주문번호</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {completedOrder.orderId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrder}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                    title="주문번호 복사"
                  >
                    {copiedOrder ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Info Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 tracking-wider">
                  신청 및 결제 내역 요약
                </h4>
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">신청 과정명</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs truncate">
                      {courseTitle}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-slate-500">신청자 성함</span>
                    <span className="font-semibold text-slate-800">{name} ({phone})</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-slate-500">안내 이메일</span>
                    <span className="font-semibold text-slate-800">{email}</span>
                  </div>

                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-slate-500">결제 상태</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        completedOrder.paymentStatus === '결제완료'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {completedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-2.5 text-sm font-extrabold">
                    <span className="text-slate-900">최종 신청 금액</span>
                    <span className="text-indigo-600 font-black">
                      ₩ {completedOrder.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application and payment have separate statuses. */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">신청 접수와 결제 완료는 구분됩니다. 주문 상세에서 현재 결제 상태를 확인해주세요.</div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="size-4" />
                  <span>접수 확인서 인쇄</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/checkout/${completedOrder.id}`);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                >
                  <span>결제 안내·신청 내역 확인</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: APPLICATION & PAYMENT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">{!lmsMember&&<div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">회원가입 없이 신청할 수 있습니다.<button type="button" className="ml-3 font-bold underline" onClick={()=>{onOpenChange(false);router.push(`/apply?course=${encodeURIComponent(courseId)}`);}}>비회원 수강신청</button></div>}
              {/* Selected Course Summary Banner */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
                  <Sparkles className="size-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="rounded bg-indigo-100 text-indigo-700 font-bold text-[10px] px-1.5 py-0.5">
                    교육 과정
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
                    {courseTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-black text-slate-950">
                      ₩ {price.toLocaleString()}
                    </span>
                    {originalPrice > price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₩ {originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 1: Applicant Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  1. 수강생 정보 입력 (필수)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      신청자 성함 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      휴대전화 번호 <span className="text-rose-500">*</span>
                    </label>
                    <PhoneInput
                      aria-label="휴대전화 번호"
                      required
                      placeholder="010-1234-5678"
                      value={phone}
                      onValueChange={setPhone}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    이메일 주소 <span className="text-rose-500">*</span> (수강 링크 및 영수증 발송)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    readOnly={!!lmsMember}
                value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      소속 회사 / 기관명 (선택)
                    </label>
                    <input
                      type="text"
                      placeholder="네오앤피터 / 프리랜서 등"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      수강 목적 또는 문의사항 (선택)
                    </label>
                    <input
                      type="text"
                      placeholder="업무자동화 적용 희망 등"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <ReferralCodeField value={referralCode} onValueChange={setReferralCode}/>
                </div>
              </div>

              <section className="space-y-3 border-t border-slate-100 pt-4" aria-label="결제 안내">
                <h4 className="text-xs font-bold text-slate-500">2. 결제 안내</h4>
                {price > 0 ? <BankTransferNotice /> : <p className="text-sm text-slate-600">무료 과정으로 입금이 필요하지 않습니다.</p>}
              </section>

              {/* Order Pricing Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>정상 수강료</span>
                  <span>₩ {originalPrice.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-600 font-medium">
                    <span>특별 할인 혜택</span>
                    <span>- ₩ {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-slate-950">
                  <span>수강료</span>
                  <span className="text-lg font-black text-indigo-600">
                    ₩ {price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>[필수] 개인정보 수집 및 강의 안내를 위한 이용에 동의합니다.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeRefund}
                    onChange={(e) => setAgreeRefund(e.target.checked)}
                    className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>[필수] 취소·환불 정책을 확인하고 동의합니다.</span>
                </label>
                <RefundPolicyNotice />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    isProcessing || lmsLoading || !lmsMember ||
                    !name.trim() ||
                    !email.trim() ||
                    phone.length < 8 ||
                    !agreePrivacy ||
                    !agreeRefund
                  }
                  className="flex-[2] rounded-xl bg-indigo-600 py-3.5 text-xs sm:text-sm font-extrabold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-98 transition disabled:opacity-50"
                >
                  {isProcessing
                    ? '신청 처리 중...'
                    : `₩ ${price.toLocaleString()} 수강신청 접수`}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>신청 접수 후 내 신청·결제 목록에서 상태를 확인할 수 있습니다.</span>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog></>
  );
}
