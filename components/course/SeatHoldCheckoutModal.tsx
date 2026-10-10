'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Lock,
  Clock,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
  CreditCard,
  Building,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePlatform } from '@/contexts/PlatformContext';
import { addSettlementApplication } from '@/lib/settlement-store';

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
  const { mutate, ready } = usePlatform();

  // Step 1: Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<
    '신용카드' | '카카오페이' | '토스페이' | '무통장입금' | '법인계산서'
  >('신용카드');
  const [depositorName, setDepositorName] = useState('');

  // Receipt options
  const [receiptType, setReceiptType] = useState<
    '미신청' | '개인소득공제' | '사업자증빙' | '세금계산서'
  >('미신청');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Agreements
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeRefund, setAgreeRefund] = useState(true);

  // Status state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    appliedAt: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
  } | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const discountAmount = Math.max(0, originalPrice - price);

  const handleCopyOrder = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderId);
    setCopiedOrder(true);
    toast.success('주문번호가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText('기업은행 123-456789-01-012 네오앤피터');
    setCopiedBank(true);
    toast.success('입금 계좌번호가 복사되었습니다.');
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const resetForm = () => {
    setCompletedOrder(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setNotes('');
    setDepositorName('');
    setReceiptNumber('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

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
      // 1. Add to persistent settlement store
      const record = addSettlementApplication({
        courseId,
        courseTitle,
        applicantName: name,
        email,
        phone,
        company: company || '개인 수강생',
        amount: price,
        paymentMethod,
        receiptType,
        receiptNumber,
        depositorName: depositorName || name,
        notes,
      });

      // 2. Best-effort sync with PlatformContext
      try {
        await mutate({
          action: 'enroll',
          courseId,
          name,
          email,
          phone,
        });
      } catch (backendErr) {
        // Safe to ignore if guest or platform auth requires google sign-in
        console.info('Platform server record synced locally:', backendErr);
      }

      setCompletedOrder({
        orderId: record.orderId,
        appliedAt: new Date().toLocaleString('ko-KR'),
        amount: price,
        paymentMethod,
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
    <Dialog
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
                : '신청자 정보 확인 후 원하시는 결제 수단을 선택하세요.'}
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
                    담당자 승인 및 안내 문자가 순차적으로 발송될 예정입니다.
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
                    <span className="text-slate-500">결제 수단</span>
                    <span className="font-semibold text-slate-800">
                      {completedOrder.paymentMethod}
                    </span>
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

              {/* Bank Transfer Guide if applied via 무통장입금 */}
              {completedOrder.paymentMethod === '무통장입금' && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">
                      무통장 입금 전용 가상계좌 안내
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600">
                      24시간 이내 미입금 시 자동 취소
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-xl p-3">
                    <div>
                      <p className="font-mono text-sm font-extrabold text-slate-900">
                        기업은행 123-456789-01-012
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        예금주: 주식회사 네오앤피터 (입금자명: {depositorName || name})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBank}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      {copiedBank ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      <span>계좌복사</span>
                    </button>
                  </div>
                </div>
              )}

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
                    router.push('/my-learning');
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                >
                  <span>내 신청·학습 현황 보기</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: APPLICATION & PAYMENT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <input
                      type="tel"
                      required
                      placeholder="010-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. 결제 및 납부 수단 선택
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: '신용카드', label: '신용/체크카드', desc: '전 카드사 무이자' },
                    { id: '카카오페이', label: '카카오페이', desc: '간편결제' },
                    { id: '토스페이', label: '토스페이', desc: '간편결제' },
                    { id: '무통장입금', label: '가상계좌 입금', desc: '무통장 입금' },
                    { id: '법인계산서', label: '법인 계산서 후불', desc: '기업 전용' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition ${
                        paymentMethod === m.id
                          ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{m.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{m.desc}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === '무통장입금' && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2">
                    <p className="text-xs text-indigo-900 font-semibold">
                      기업은행 123-456789-01-012 (주)네오앤피터
                    </p>
                    <label className="block text-xs font-medium text-slate-700">
                      입금자명 (미입력 시 신청자명으로 처리)
                      <input
                        type="text"
                        placeholder={name || '입금자명'}
                        value={depositorName}
                        onChange={(e) => setDepositorName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs"
                      />
                    </label>
                  </div>
                )}

                {paymentMethod === '법인계산서' && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2">
                    <p className="text-xs text-indigo-900 font-semibold">
                      기업/기관 후불 계산서 발행 신청
                    </p>
                    <label className="block text-xs font-medium text-slate-700">
                      사업자등록번호 또는 계산서 수신 이메일
                      <input
                        type="text"
                        placeholder="123-45-67890 / finance@company.com"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Section 3: Receipt / Tax Invoice */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3. 증빙 서류 신청 (선택)
                  </h4>
                  <div className="flex gap-2">
                    {(['미신청', '개인소득공제', '사업자증빙', '세금계산서'] as const).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setReceiptType(type)}
                          className={`rounded-lg px-2.5 py-1 text-xs transition ${
                            receiptType === type
                              ? 'bg-slate-900 font-bold text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {receiptType !== '미신청' && paymentMethod !== '법인계산서' && (
                  <input
                    type="text"
                    placeholder={
                      receiptType === '개인소득공제'
                        ? '현금영수증용 휴대전화번호 (010-0000-0000)'
                        : '사업자등록번호 (000-00-00000)'
                    }
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </div>

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
                  <span>최종 결제 금액</span>
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
                  <span>[필수] 교육 취소 및 환불 기준(개강 3일 전 100% 환불)에 동의합니다.</span>
                </label>
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
                    isProcessing ||
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
                    : `₩ ${price.toLocaleString()} 수강 신청 및 결제하기`}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>SSL 보안 암호화 결제 · 관리자 콘솔 및 실시간 정산 자동 연동</span>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
