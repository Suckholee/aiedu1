'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Building,
  ArrowUpRight,
  ShieldCheck,
  Send,
  X,
  FileCheck,
} from 'lucide-react';
import {
  COURSE_SETTLEMENT_METAS,
  INITIAL_SETTLEMENT_RECORDS,
  ApplicantSettlementRecord,
  CourseSettlementMeta,
  SettlementStatus,
  PaymentStatus,
  EnrollmentStatus,
} from '@/data/settlements';
import { toast } from 'sonner';

export default function AdminSettlementsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    COURSE_SETTLEMENT_METAS[0].courseId
  );
  const [records, setRecords] = useState<ApplicantSettlementRecord[]>(INITIAL_SETTLEMENT_RECORDS);
  const [activeTab, setActiveTab] = useState<
    'all' | 'unsettled' | 'settled' | 'unpaid' | 'refunded'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reject modal state matching Slide 33
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetRecord, setRejectTargetRecord] = useState<ApplicantSettlementRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settlement Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTargetRecord, setDetailTargetRecord] = useState<ApplicantSettlementRecord | null>(null);

  const currentCourse =
    COURSE_SETTLEMENT_METAS.find((c) => c.courseId === selectedCourseId) ||
    COURSE_SETTLEMENT_METAS[0];

  // Records for current selected course
  const courseRecords = records.filter((r) => r.courseId === selectedCourseId);

  // Filter tabs logic
  const filteredRecords = courseRecords.filter((r) => {
    const matchesSearch =
      r.applicantName.includes(searchQuery) ||
      r.email.includes(searchQuery) ||
      r.company.includes(searchQuery) ||
      r.orderId.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'unsettled') return r.settlementStatus === '정산대기';
    if (activeTab === 'settled') return r.settlementStatus === '정산완료';
    if (activeTab === 'unpaid') return r.paymentStatus === '미결제' || r.paymentStatus === '결제실패';
    if (activeTab === 'refunded') return r.paymentStatus === '환불';
    return true;
  });

  // KPI counts
  const totalApplicantsCount = courseRecords.length;
  const unsettledCount = courseRecords.filter((r) => r.settlementStatus === '정산대기').length;
  const settledCount = courseRecords.filter((r) => r.settlementStatus === '정산완료').length;
  const unpaidCount = courseRecords.filter(
    (r) => r.paymentStatus === '미결제' || r.paymentStatus === '결제실패'
  ).length;

  const totalSettledInstructorFee = courseRecords
    .filter((r) => r.settlementStatus === '정산완료')
    .reduce((sum, r) => sum + r.netToInstructor, 0);

  const totalUnsettledInstructorFee = courseRecords
    .filter((r) => r.settlementStatus === '정산대기')
    .reduce((sum, r) => sum + r.netToInstructor, 0);

  // Copy order id
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`주문번호 ${text}가 복사되었습니다.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Approve enrollment
  const handleApprove = (rec: ApplicantSettlementRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, enrollmentStatus: '승인' } : r))
    );
    toast.success(`${rec.applicantName}님의 수강 신청이 승인되었습니다.`);
  };

  // Open reject modal
  const openRejectModal = (rec: ApplicantSettlementRecord) => {
    setRejectTargetRecord(rec);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // Submit reject
  const handleConfirmReject = () => {
    if (!rejectTargetRecord) return;
    if (rejectReason.trim().length < 5) {
      toast.error('반려 사유를 5자 이상 입력해주세요.');
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.id === rejectTargetRecord.id
          ? {
              ...r,
              enrollmentStatus: '반려',
              settlementStatus: '미정산',
              rejectReason,
            }
          : r
      )
    );
    toast.info(`${rejectTargetRecord.applicantName}님의 신청이 반려 처리되었습니다.`);
    setRejectModalOpen(false);
  };

  // Settle single record
  const handleSettleRecord = (rec: ApplicantSettlementRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, settlementStatus: '정산완료' } : r))
    );
    toast.success(`${rec.applicantName}님의 강사료 정산이 확정되었습니다. (실지급: ₩${rec.netToInstructor.toLocaleString()})`);
  };

  // Batch settle selected
  const handleBatchSettle = () => {
    if (selectedRecordIds.length === 0) {
      toast.error('정산 처리할 신청자를 1명 이상 선택해주세요.');
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        selectedRecordIds.includes(r.id) ? { ...r, settlementStatus: '정산완료' } : r
      )
    );
    toast.success(`선택한 ${selectedRecordIds.length}건의 정산이 확정 완료되었습니다!`);
    setSelectedRecordIds([]);
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map((r) => r.id));
    }
  };

  // Toggle select one
  const handleToggleSelect = (id: string) => {
    if (selectedRecordIds.includes(id)) {
      setSelectedRecordIds(selectedRecordIds.filter((i) => i !== id));
    } else {
      setSelectedRecordIds([...selectedRecordIds, id]);
    }
  };

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* ── 1. Top Breadcrumb & Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/admin" className="hover:text-blue-600 transition">관리자 콘솔</Link>
            <ChevronRight className="size-3" />
            <span>수강·정산 관리</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">강의별 결제 &amp; 정산 관리</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            강의별 신청자 및 결제·정산 관리
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            강의 단위로 수강 신청자, 결제 현황, 미정산자, 정산 완료자를 분류하고 강사료를 정산합니다.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('신청자 및 정산 내역 엑셀 파일이 다운로드되었습니다.')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>엑셀 다운로드</span>
          </button>

          <button
            type="button"
            onClick={handleBatchSettle}
            disabled={selectedRecordIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition disabled:opacity-40"
          >
            <CheckCircle2 className="size-4" />
            <span>선택 건 정산 확정 ({selectedRecordIds.length})</span>
          </button>
        </div>
      </div>

      {/* ── 2. Course Selector Box matching Slide 33 & 64 ── */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white font-bold shadow-xs">
              <Building className="size-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700">관리 대상 강의 선택</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentCourse.period}
                </span>
              </div>

              {/* Course Dropdown */}
              <div className="relative inline-block">
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedRecordIds([]);
                  }}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-2 pr-10 text-sm font-extrabold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {COURSE_SETTLEMENT_METAS.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseTitle} (수강료 ₩{c.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-slate-600 font-medium pt-0.5">
                담당 강사: <strong className="text-slate-900">{currentCourse.instructorName}</strong>
              </p>
            </div>
          </div>

          {/* Right: Real-time Enrollment & Capacity badge matching Slide 33 */}
          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-3 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">수강 인원 / 정원</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-blue-600">
                  {currentCourse.currentCount}명
                </span>
                <span className="text-xs font-bold text-slate-400">
                  / {currentCourse.capacity}명 정원
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">
                (잔여 {currentCourse.capacity - currentCourse.currentCount}석)
              </span>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div>
              <span className="text-[11px] font-bold text-slate-400 block">총 수강료 매출</span>
              <span className="text-xl font-black text-slate-950 block mt-0.5">
                ₩ {currentCourse.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">100% 결제 확정 기준</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. 4 Settlement & Applicant Status KPI Cards matching Slide 64 & 40 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 전체 신청자 */}
        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
            activeTab === 'all'
              ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">전체 신청자</span>
            <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{totalApplicantsCount}</span>
              <span className="text-xs font-semibold text-slate-500">명</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              수강 신청 접수 총계
            </p>
          </div>
        </div>

        {/* Card 2: 미정산자 (정산 대기) */}
        <div
          onClick={() => setActiveTab('unsettled')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
            activeTab === 'unsettled'
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">미정산자 (정산 대기)</span>
            <div className="grid size-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-900">{unsettledCount}</span>
              <span className="text-xs font-semibold text-amber-700">명</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">
              미정산 강사료 ₩ {totalUnsettledInstructorFee.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 3: 정산 완료자 */}
        <div
          onClick={() => setActiveTab('settled')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
            activeTab === 'settled'
              ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">정산 완료자</span>
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-900">{settledCount}</span>
              <span className="text-xs font-semibold text-emerald-700">명</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
              지급 완료 ₩ {totalSettledInstructorFee.toLocaleString()} (3.3% 공제)
            </p>
          </div>
        </div>

        {/* Card 4: 미결제 / 결제 실패 */}
        <div
          onClick={() => setActiveTab('unpaid')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
            activeTab === 'unpaid'
              ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600">미결제 / 결제 실패</span>
            <div className="grid size-8 place-items-center rounded-lg bg-rose-100 text-rose-600">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-900">{unpaidCount}</span>
              <span className="text-xs font-semibold text-rose-600">명</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              가상계좌 입금 대기 &amp; 재시도 대상
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Filter Tabs and Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            전체 신청자 ({totalApplicantsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unsettled')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'unsettled'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            미정산자 ({unsettledCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settled')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'settled'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            정산 완료자 ({settledCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unpaid')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'unpaid'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            미결제자 ({unpaidCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refunded')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'refunded'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            환불/취소
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주문번호, 이름, 소속회사 검색"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ── 5. Main Management Table matching Slide 33, 40, 64 ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              신청 &amp; 정산 내역 목록
            </h3>
            <span className="text-blue-600 font-extrabold text-xs">
              (총 {filteredRecords.length}건)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>강사 배분율: <strong>70%</strong></span>
            <span>•</span>
            <span>원천징수: <strong>3.3%</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredRecords.length > 0 &&
                      selectedRecordIds.length === filteredRecords.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-3">주문번호</th>
                <th className="py-3 px-3">신청자 / 소속</th>
                <th className="py-3 px-3">결제 금액</th>
                <th className="py-3 px-3">결제 상태</th>
                <th className="py-3 px-3">수강 승인</th>
                <th className="py-3 px-3">정산 상태</th>
                <th className="py-3 px-3">강사 실지급액</th>
                <th className="py-3 px-3">세금계산서</th>
                <th className="py-3 px-3 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                    해당 조건의 신청 및 정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isChecked = selectedRecordIds.includes(rec.id);

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/50 transition ${
                        isChecked ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(rec.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Order ID with Copy button matching Slide 40 */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-blue-600 font-bold">
                          <span>{rec.orderId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(rec.id, rec.orderId)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700"
                            title="주문번호 복사"
                          >
                            {copiedId === rec.id ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{rec.appliedAt}</span>
                      </td>

                      {/* Applicant & Company */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rec.applicantName}</span>
                          <span className="text-[11px] text-slate-500">({rec.company})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {rec.phone} • {rec.email}
                        </span>
                      </td>

                      {/* Price & Method */}
                      <td className="py-3 px-3">
                        <span className="font-black text-slate-900 block">
                          ₩ {rec.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">{rec.paymentMethod}</span>
                      </td>

                      {/* Payment Status Badge matching Slide 40 */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                            rec.paymentStatus === '결제완료'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : rec.paymentStatus === '미결제'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : rec.paymentStatus === '환불'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {rec.paymentStatus}
                        </span>
                      </td>

                      {/* Enrollment Approval Status matching Slide 33 */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                            rec.enrollmentStatus === '승인'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.enrollmentStatus === '신청'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {rec.enrollmentStatus}
                        </span>
                      </td>

                      {/* Settlement Status (User's Core Requirement!) */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black ${
                            rec.settlementStatus === '정산완료'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.settlementStatus === '정산대기'
                              ? 'bg-amber-100 text-amber-900 animate-pulse'
                              : rec.settlementStatus === '환불정산'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rec.settlementStatus === '정산완료' && <CheckCircle2 className="size-3" />}
                          {rec.settlementStatus === '정산대기' && <Clock className="size-3" />}
                          <span>{rec.settlementStatus}</span>
                        </span>
                      </td>

                      {/* Instructor Net Fee matching Slide 64 */}
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-slate-900 block">
                          ₩ {rec.netToInstructor.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (세액 ₩{rec.taxDeducted.toLocaleString()})
                        </span>
                      </td>

                      {/* Tax Invoice Status matching Slide 66 */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            rec.taxInvoiceStatus === '발급완료'
                              ? 'text-emerald-700 bg-emerald-50'
                              : rec.taxInvoiceStatus === '신청접수'
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-slate-400'
                          }`}
                        >
                          {rec.taxInvoiceStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Settle Action */}
                          {rec.settlementStatus === '정산대기' && (
                            <button
                              type="button"
                              onClick={() => handleSettleRecord(rec)}
                              className="rounded-lg bg-blue-600 text-white px-2 py-1 text-[11px] font-bold hover:bg-blue-700 shadow-2xs"
                              title="강사료 정산 확정"
                            >
                              정산 확정
                            </button>
                          )}

                          {/* Approval Actions (Slide 33) */}
                          {rec.enrollmentStatus === '신청' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(rec)}
                                className="rounded-lg bg-emerald-600 text-white px-2 py-1 text-[11px] font-bold hover:bg-emerald-700 shadow-2xs"
                                title="수강 승인"
                              >
                                승인
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectModal(rec)}
                                className="rounded-lg border border-rose-300 text-rose-600 px-2 py-1 text-[11px] font-bold hover:bg-rose-50"
                                title="신청 반려"
                              >
                                반려
                              </button>
                            </>
                          )}

                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDetailTargetRecord(rec);
                              setDetailModalOpen(true);
                            }}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                          >
                            상세
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Applicant Reject Modal matching Slide 33 ── */}
      {rejectModalOpen && rejectTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">신청자 반려</h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              신청자 <strong>{rejectTargetRecord.applicantName}</strong> (
              {rejectTargetRecord.email}) 님을 반려하시겠습니까? 반려 사유를 입력해 주세요.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                반려 사유 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="반려 사유를 입력하세요. (최소 5자 이상)"
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                반려 처리
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Settlement & Payment Detail Modal matching Slide 64 & 66 ── */}
      {detailModalOpen && detailTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="size-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">결제 &amp; 정산 세부 명세</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">주문번호</span>
                <span className="font-mono font-bold text-slate-900">{detailTargetRecord.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">신청자명</span>
                <span className="font-bold text-slate-900">{detailTargetRecord.applicantName} ({detailTargetRecord.company})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">결제 수단</span>
                <span className="font-semibold text-slate-800">{detailTargetRecord.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">결제 일시</span>
                <span className="font-mono text-slate-700">{detailTargetRecord.paidAt || detailTargetRecord.appliedAt}</span>
              </div>
            </div>

            {/* Settlement breakdown */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <h5 className="font-bold text-slate-900 pb-1 border-b border-slate-100">
                수강료 및 강사료 배분 내역 (Slide 64)
              </h5>
              <div className="flex justify-between text-slate-600">
                <span>수강생 결제 원금</span>
                <span className="font-semibold">₩ {detailTargetRecord.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>플랫폼 운영 수수료 (30%)</span>
                <span>- ₩ {(detailTargetRecord.amount - detailTargetRecord.instructorShare).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>강사료 배분 기준액 (70%)</span>
                <span className="font-bold text-slate-900">₩ {detailTargetRecord.instructorShare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>원천징수 사업소득세 (3.3%)</span>
                <span>- ₩ {detailTargetRecord.taxDeducted.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black text-blue-600">
                <span>강사 최종 실지급액</span>
                <span className="text-base">₩ {detailTargetRecord.netToInstructor.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">정산 상태:</span>
              <span
                className={`font-black px-2 py-0.5 rounded-md ${
                  detailTargetRecord.settlementStatus === '정산완료'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {detailTargetRecord.settlementStatus}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success('정산 명세서 영수증이 출력되었습니다.');
                setDetailModalOpen(false);
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition"
            >
              정산 명세서 출력
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
