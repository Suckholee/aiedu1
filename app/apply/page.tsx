'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { ReferralCodeField } from '@/components/auth/ReferralCodeField';
import { PhoneInput } from '@/components/ui/phone-input';
import { WorkAutomationSchedule } from '@/components/course/WorkAutomationSchedule';
import { CourseVenue } from '@/components/course/CourseVenue';
import { BankTransferNotice } from '@/components/course/BankTransferNotice';
import { BANK_TRANSFER_PAYMENT_METHOD } from '@/lib/lms/payment-channel';
import { RefundPolicyNotice } from '@/components/course/RefundPolicyNotice';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Calendar,
  Check,
  Copy,
  Printer,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {useAuth} from '@/contexts/AuthContext';
import {AuthModal} from '@/components/auth/AuthModal';
import { usePlatform } from '@/contexts/PlatformContext';
import { PLATFORM_BUILDING_WORKSHOP as workshop } from '@/lib/platform-building-workshop';


function ApplyContent() {
  const guestRequestId = useRef<string | null>(null);
  const {lmsMember,lmsLoading}=useAuth();
  const [login,setLogin]=useState(false);
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('course') || searchParams.get('id') || '';
  const initialReferralCode=searchParams.get('ref') || '';

  const { data, mutate, ready } = usePlatform();

  const availableCourses = data.courses.filter(c => c.published && c.enrollmentOpen !== false).map(c => ({
    id:c.id,title:c.title,price:c.price,originalPrice:c.originalPrice,instructor:c.instructor.name,
    period:c.id === workshop.slug ? workshop.schedule : c.startDate ? `${c.startDate} ${c.startTime} ~ ${c.endTime}` : '상시 온라인 학습',
    capacity:c.totalSeats,remainingSeats:c.remainingSeats,location:c.location,
  }));

  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);

  useEffect(() => {
    if (initialCourseId && availableCourses.some((c) => c.id === initialCourseId)) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  const currentCourse =
    availableCourses.find((c) => c.id === selectedCourseId) || (!selectedCourseId?availableCourses[0]:undefined);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode,setReferralCode]=useState(initialReferralCode);
  useEffect(()=>{if(initialReferralCode)setReferralCode(initialReferralCode);},[initialReferralCode]);
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  // Agreements
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);

  // Completed order state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    id: string;
    appliedAt: string;
    amount: number;
    paymentStatus: string;
  } | null>(null);

  const [copiedOrder, setCopiedOrder] = useState(false);
  useEffect(()=>{setEmail(lmsMember?.email??'');setName(lmsMember?.display_name??'');setPhone(lmsMember?.phone??'');setCompany(lmsMember?.company??'');setCompletedOrder(null);},[lmsMember?.id,lmsMember?.display_name,lmsMember?.phone,lmsMember?.company]);


  const handleCopyOrder = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderId);
    setCopiedOrder(true);
    toast.success('주문번호가 복사되었습니다.');
    setTimeout(() => setCopiedOrder(false), 2000);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing||!currentCourse) return;

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
      if (!lmsMember) {
        guestRequestId.current ??= crypto.randomUUID();
        const response = await fetch('/api/lms/guest-application', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:guestRequestId.current,courseId:currentCourse.id,name,email,phone,company,notes,referralCode,agreePrivacy,agreeRefund})});
        const receipt = await response.json();
        if (!response.ok) throw Error(receipt.error);
        setCompletedOrder({...receipt,appliedAt:new Date(receipt.appliedAt).toLocaleString('ko-KR')});
        toast.success('비회원 수강 신청이 접수되었습니다. 접수 확인서를 저장해주세요.');
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      const accepted = await mutate({ action: 'enroll', courseId: currentCourse.id, name, email, phone, company, notes, referralCode, paymentMethod: BANK_TRANSFER_PAYMENT_METHOD });

      // Display the order created in the same transaction as the application.
      const enrollment=accepted.enrollments.find(e=>e.courseId===currentCourse.id&&e.learnerId===lmsMember.id);
      if(!enrollment?.orderId)throw Error('신청은 접수되었지만 주문을 확인하지 못했습니다. 내 신청 목록을 새로고침해주세요.');
      const record={orderId:enrollment?.orderNumber??enrollment?.id??'',paymentStatus:enrollment?.paymentStatus??'미결제'};

      setCompletedOrder({
        id:enrollment.orderId,
        orderId: record.orderId,
        appliedAt: new Date().toLocaleString('ko-KR'),
        amount: enrollment?.amount??currentCourse.price,
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

  if (!ready) return <p>모집 중인 교육을 불러오고 있습니다.</p>;
  if (!currentCourse) return <div className="rounded-xl border bg-white p-6"><h1 className="font-bold">{selectedCourseId?'선택한 강의는 현재 신청할 수 없습니다.':'모집 중인 기수가 없습니다.'}</h1><Link href="/courses">교육과정 보기</Link></div>;

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
            <div className="py-3"><WorkAutomationSchedule courseId={currentCourse.id}/></div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">교육 장소</span>
              <CourseVenue location={currentCourse.location}/>
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
              <span className="text-slate-900">신청 금액</span>
              <span className="text-indigo-600 text-xl font-black">
                ₩ {completedOrder.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Application and payment have separate statuses. */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">{lmsMember ? "신청 접수와 결제 완료는 구분됩니다. 주문 상세에서 현재 결제 상태를 확인해주세요." : "비회원 신청이 접수되었습니다. 접수번호와 확인서를 저장해주세요. 아래 비회원 신청 조회에서 이메일 인증 후 신청·결제 상태를 다시 확인할 수 있습니다."}</div>{!lmsMember && <BankTransferNotice guest />}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="size-4" />
            <span>접수 확인서 인쇄</span>
          </button>
          {!lmsMember && <Link href="/guest-applications" className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 text-center text-sm font-bold text-white sm:flex-1">비회원 신청·결제 내역 조회</Link>}
          {lmsMember && <Link
            href={completedOrder?`/checkout/${completedOrder.id}`:"/my-applications"}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
          >
            <span>결제 안내·신청 내역 확인</span>
            <ChevronRight className="size-4" />
          </Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-left">
      <AuthModal open={login} onOpenChange={setLogin}/>{!lmsMember&&<div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">회원가입 없이 아래 정보를 입력해 신청할 수 있습니다. 회원은 로그인하면 신청 내역이 계정에 저장됩니다.<button type="button" className="ml-3 font-bold underline" onClick={()=>setLogin(true)}>로그인</button></div>}
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
            온라인 신청 접수
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          교육과정 온라인 수강 신청
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          강의를 신청하고 주문별 결제 안내와 신청 상태를 확인하세요.
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
                      강사: {c.instructor} · {c.period}
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

          <section className="space-y-4 rounded-3xl border border-indigo-200 bg-indigo-50/60 p-6 sm:p-7" aria-label="선택한 강의 일시와 장소">
            <h2 className="font-bold text-slate-900">선택한 강의 일시·장소</h2>
            <div className="flex items-start gap-2 text-sm text-slate-700"><Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true"/><div><p className="font-semibold">교육 일시</p><p className="mt-1">{currentCourse.period}</p></div></div>
            <div className="text-sm text-slate-700"><WorkAutomationSchedule courseId={currentCourse.id}/><CourseVenue location={currentCourse.location}/></div>
          </section>

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
                <PhoneInput
                  aria-label="휴대전화 번호"
                  required
                  placeholder="010-1234-5678"
                  value={phone}
                  onValueChange={setPhone}
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
                readOnly={!!lmsMember}
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
              <ReferralCodeField value={referralCode} onValueChange={setReferralCode}/>
            </div>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs" aria-label="결제 안내">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-indigo-600 text-[11px] font-black text-white">3</span>
              결제 안내
            </h2>
            {currentCourse.price > 0 ? <BankTransferNotice /> : <p className="text-sm text-slate-600">무료 과정으로 입금이 필요하지 않습니다.</p>}
          </section>

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
                <span>[필수] 취소·환불 정책을 확인하고 동의합니다.</span>
              </label>
              <RefundPolicyNotice />
            </div>

            <button
              type="submit"
              disabled={
                isProcessing || lmsLoading ||
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
                : `₩ ${currentCourse.price.toLocaleString()} 수강 신청 접수`}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              접수한 신청은 담당자의 수강·출결·진도 통합 관리 화면에 등록됩니다.
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
              <WorkAutomationSchedule courseId={currentCourse.id}/>
              <CourseVenue location={currentCourse.location}/>
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
              <span>수강료</span>
              <span className="text-xl font-black text-indigo-600">
                ₩ {currentCourse.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Included Features */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <p className="font-bold text-slate-900 text-xs">신청 안내</p>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="size-4 text-emerald-600" />
              <span>선택한 일정·장소에서 교육 진행</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="size-4 text-emerald-600" />
              <span>{lmsMember ? "내 신청·결제 목록에서 접수 상태 확인" : "접수 확인서 저장 및 담당자 안내"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="size-4 text-emerald-600" />
              <span>신청 확인 후 담당자가 수강 안내</span>
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
