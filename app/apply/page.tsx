'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  Check,
  Copy,
  Printer,
  ChevronRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePlatform } from '@/contexts/PlatformContext';
import { COURSE_SETTLEMENT_METAS } from '@/data/settlements';
import { addSettlementApplication } from '@/lib/settlement-store';

function ApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('course') || searchParams.get('id') || COURSE_SETTLEMENT_METAS[0].courseId;

  const { data, mutate } = usePlatform();

  // Combine static and platform courses
  const availableCourses = COURSE_SETTLEMENT_METAS.map((meta) => {
    const dynamicCourse = data.courses.find((c) => c.id === meta.courseId);
    return {
      id: meta.courseId,
      title: dynamicCourse?.title || meta.courseTitle,
      price: dynamicCourse?.price || meta.price,
      originalPrice: dynamicCourse?.originalPrice || Math.round(meta.price * 1.3),
      instructor: dynamicCourse?.instructor.name || meta.instructorName,
      period: meta.period,
      capacity: meta.capacity,
      remainingSeats: dynamicCourse?.remainingSeats ?? Math.max(2, meta.capacity - meta.currentCount),
      location: dynamicCourse?.location || '온라인 LIVE (Zoom) + 실시간 Q&A',
    };
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);

  useEffect(() => {
    if (initialCourseId && availableCourses.some((c) => c.id === initialCourseId)) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  const currentCourse =
    availableCourses.find((c) => c.id === selectedCourseId) || availableCourses[0];

  // Form Fields
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

  // Completed order state
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

  const handleCopyOrder = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderId);
    setCopiedOrder(true);
    toast.success('주문번호가 복사되었습니다.');
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText('기업은행 123-456789-01-012 네오앤피터');
    setCopiedBank(true);
    toast.success('입금 계좌번호가 복사되었습니다.');
    setTimeout(() => setCopiedBank(false), 2000);
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
        courseId: currentCourse.id,
        courseTitle: currentCourse.title,
        applicantName: name,
        email,
        phone,
        company: company || '개인 수강생',
        amount: currentCourse.price,
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
          courseId: currentCourse.id,
          name,
          email,
          phone,
        });
      } catch (backendErr) {
        console.info('Platform server record synced locally:', backendErr);
      }

      setCompletedOrder({
        orderId: record.orderId,
        appliedAt: new Date().toLocaleString('ko-KR'),
        amount: currentCourse.price,
        paymentMethod,
        paymentStatus: record.paymentStatus,
      });

      toast.success('수강 신청이 정상 접수되었습니다!', {
        description: `주문번호: ${record.orderId}`,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수강 신청 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 text-left">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 className="size-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              수강 신청 및 접수가 완료되었습니다!
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              신청 내역이 담당자 관리 콘솔에 정상 등록되었습니다.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-emerald-200 px-4 py-2 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">주문 접수 번호</span>
            <span className="font-mono text-base font-extrabold text-slate-900">
              {completedOrder.orderId}
            </span>
            <button
              type="button"
              onClick={handleCopyOrder}
              className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
              title="주문번호 복사"
            >
              {copiedOrder ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            신청 명세서
          </h2>
          <div className="divide-y divide-slate-100 text-sm">
            <div className="flex justify-between py-3">
              <span className="text-slate-500">과정명</span>
              <span className="font-bold text-slate-900 text-right">{currentCourse.title}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">교육 일정</span>
              <span className="font-medium text-slate-800">{currentCourse.period}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">신청자명</span>
              <span className="font-medium text-slate-800">{name} ({phone})</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">이메일</span>
              <span className="font-medium text-slate-800">{email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">결제 수단</span>
              <span className="font-medium text-slate-800">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">결제 상태</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                  completedOrder.paymentStatus === '결제완료'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {completedOrder.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between py-4 text-base font-black">
              <span className="text-slate-900">최종 납부 금액</span>
              <span className="text-indigo-600 text-xl font-black">
                ₩ {completedOrder.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Guide if bank transfer */}
        {completedOrder.paymentMethod === '무통장입금' && (
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-900">
                입금 전용 계좌 안내
              </span>
              <span className="text-xs font-semibold text-rose-600">
                24시간 이내 입금 요망
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-indigo-200 rounded-2xl p-4">
              <div>
                <p className="font-mono text-base font-extrabold text-slate-900">
                  기업은행 123-456789-01-012
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  예금주: (주)네오앤피터 (입금자명: {depositorName || name})
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyBank}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                {copiedBank ? <Check className="size-4" /> : <Copy className="size-4" />}
                <span>계좌번호 복사</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="size-4" />
            <span>접수 확인서 인쇄</span>
          </button>
          <Link
            href="/my-learning"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
          >
            <span>내 신청·학습 현황 바로가기</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-left">
      {/* Top Header */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="size-3.5" />
          <span>전체 교육과정 목록으로</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
            공식 수강 신청
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            실시간 좌석 선점
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          교육과정 온라인 수강 신청
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          네오앤피터 에듀플랫폼 공식 과정을 온라인에서 직접 신청하고 결제 및 정산 승인을 받으실 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Course Selection */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                1
              </span>
              수강 대상 과정 선택
            </h2>

            <div className="space-y-2.5">
              {availableCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    selectedCourseId === c.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 truncate">
                        {c.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      강사: {c.instructor} · {c.period} · 잔여 {c.remainingSeats}석
                    </p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <span className="text-base font-black text-indigo-700">
                      ₩ {c.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Applicant Information */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                2
              </span>
              신청자 정보 입력
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  신청자 성함 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  휴대전화 번호 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                이메일 주소 <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="example@company.com (수강 확정 및 강의실 링크 발송용)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  소속 회사 / 기관명 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: (주)네오앤피터 / 프리랜서"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  사전 문의 / 강사 전달 사항 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 실습 템플릿 문의 등"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                3
              </span>
              결제 및 납부 방식 선택
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: '신용카드', label: '신용/체크카드', desc: '전 카드사 무이자 할부' },
                { id: '카카오페이', label: '카카오페이', desc: '간편결제' },
                { id: '토스페이', label: '토스페이', desc: '간편결제' },
                { id: '무통장입금', label: '가상계좌 입금', desc: '무통장 입금' },
                { id: '법인계산서', label: '법인 계산서 후불', desc: '기업 세금계산서 청구' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition ${
                    paymentMethod === m.id
                      ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{m.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{m.desc}</span>
                </button>
              ))}
            </div>

            {paymentMethod === '무통장입금' && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-2">
                <p className="text-xs text-indigo-900 font-bold">
                  기업은행 123-456789-01-012 (주)네오앤피터
                </p>
                <label className="block text-xs font-medium text-slate-700">
                  입금자명 (미입력 시 신청자 성함으로 자동 매칭)
                  <input
                    type="text"
                    placeholder={name || '입금자명'}
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs"
                  />
                </label>
              </div>
            )}

            {paymentMethod === '법인계산서' && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-2">
                <p className="text-xs text-indigo-900 font-bold">
                  기업 후불 전자세금계산서 발행
                </p>
                <label className="block text-xs font-medium text-slate-700">
                  사업자등록번호 또는 세금계산서 담당자 이메일
                  <input
                    type="text"
                    placeholder="123-45-67890 / finance@company.com"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs"
                  />
                </label>
              </div>
            )}

            {/* Receipt Options */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">증빙 서류 발급</span>
                <div className="flex gap-1.5">
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
                      ? '현금영수증용 휴대폰 번호 (010-0000-0000)'
                      : '사업자등록번호 (000-00-00000)'
                  }
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* 4. Terms and Submit */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>[필수] 개인정보 수집 및 강의 안내, 수강 관리를 위한 이용에 동의합니다.</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={agreeRefund}
                  onChange={(e) => setAgreeRefund(e.target.checked)}
                  className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>[필수] 취소 및 환불 기준 (개강 3일 전 전액 환불, 1일 전 70%)에 동의합니다.</span>
              </label>
            </div>

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
              className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-98 transition disabled:opacity-50"
            >
              {isProcessing
                ? '신청 처리 중...'
                : `₩ ${currentCourse.price.toLocaleString()} 수강 신청 및 결제 완료`}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              신청 즉시 관리 콘솔(결제·정산 관리 및 CRM)에 자동 등록됩니다.
            </p>
          </div>
        </form>

        {/* Right Sticky Column: Course Summary Card */}
        <aside className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
              선택 과정 요약
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
              {currentCourse.title}
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-slate-400" />
                <span>{currentCourse.period}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-slate-400" />
                <span>{currentCourse.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-slate-400" />
                <span>잔여 {currentCourse.remainingSeats}석 / 정원 {currentCourse.capacity}명</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>수강료 정가</span>
              <span className="line-through">₩ {currentCourse.originalPrice.toLocaleString()}</span>
            </div>
            {currentCourse.originalPrice > currentCourse.price && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>프로모션 할인</span>
                <span>- ₩ {(currentCourse.originalPrice - currentCourse.price).toLocaleString()}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>최종 결제 금액</span>
              <span className="text-xl font-black text-indigo-600">
                ₩ {currentCourse.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Included Features */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <p className="font-bold text-slate-900 text-xs">포함 혜택</p>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="size-4 text-emerald-600" />
              <span>실시간 LIVE 강의 및 다시보기 VOD 제공</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="size-4 text-emerald-600" />
              <span>실습 교안 및 실전 프롬프트 팩 평생 소장</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="size-4 text-emerald-600" />
              <span>수료 기준 충족 시 공식 수료증 발급</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">신청 양식을 불러오는 중입니다...</div>}>
      <ApplyContent />
    </Suspense>
  );
}
