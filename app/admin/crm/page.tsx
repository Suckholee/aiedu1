'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Phone,
  Mail,
  Building,
  Search,
  Copy,
  Check,
  Download,
  Filter,
  RefreshCw,
  Plus,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  User,
  ShieldCheck,
  Send,
  FileSpreadsheet,
  BadgeCheck,
} from 'lucide-react';
import {
  COURSE_SETTLEMENT_METAS,
  ApplicantSettlementRecord,
  PaymentStatus,
  EnrollmentStatus,
} from '@/data/settlements';
import {
  getSettlementRecords,
  saveSettlementRecords,
  updateSettlementRecord,
  subscribeSettlementChanges,
  resetToRealSettlementRecords,
} from '@/lib/settlement-store';
import { toast } from 'sonner';

export default function StudentCrmPage() {
  const [records, setRecords] = useState<ApplicantSettlementRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<'all' | string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'retake' | 'auditor' | 'unpaid' | 'credit'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail / Edit modal
  const [selectedRecord, setSelectedRecord] = useState<ApplicantSettlementRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    phone: string;
    email: string;
    company: string;
    note: string;
    paymentStatus: PaymentStatus;
  }>({
    phone: '',
    email: '',
    company: '',
    note: '',
    paymentStatus: '결제완료',
  });

  // New Student modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    courseId: 'ai-work-automation-master',
    applicantName: '',
    phone: '',
    email: '',
    company: '',
    amount: 150000,
    paymentMethod: '무통장입금',
    paymentStatus: '결제완료' as PaymentStatus,
    note: '',
  });

  // Load records
  useEffect(() => {
    setMounted(true);
    setRecords(getSettlementRecords());

    const unsubscribe = subscribeSettlementChanges((updated) => {
      setRecords(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleCleanReset = () => {
    if (window.confirm('실제 수강생 명단으로 초기화하시겠습니까?')) {
      const clean = resetToRealSettlementRecords();
      setRecords(clean);
      toast.success('수강생 명단이 최신 상태로 동기화되었습니다.');
    }
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Course filter
      if (selectedCourseFilter !== 'all' && r.courseId !== selectedCourseFilter) {
        return false;
      }

      // Tab category filter
      if (activeTab === 'paid') {
        if (r.paymentStatus !== '결제완료' || r.amount === 0) return false;
      } else if (activeTab === 'retake') {
        if (r.paymentMethod !== '재수강(무료)' && !r.note?.includes('재수강')) return false;
      } else if (activeTab === 'auditor') {
        if (r.paymentMethod !== '청강(무료)' && !r.note?.includes('청강')) return false;
      } else if (activeTab === 'unpaid') {
        if (r.paymentStatus !== '미결제') return false;
      } else if (activeTab === 'credit') {
        if ((r.creditBalance ?? 0) <= 0) return false;
      }

      // Search query (Name, Phone, Company, Email, Recommender, Notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanPhone = r.phone.replace(/[^0-9]/g, '');
        const qPhone = q.replace(/[^0-9]/g, '');

        const matchName = r.applicantName.toLowerCase().includes(q);
        const matchPhone = (qPhone && cleanPhone.includes(qPhone)) || r.phone.includes(q);
        const matchCompany = r.company.toLowerCase().includes(q);
        const matchEmail = r.email.toLowerCase().includes(q);
        const matchNote = (r.note ?? '').toLowerCase().includes(q);

        return matchName || matchPhone || matchCompany || matchEmail || matchNote;
      }

      return true;
    });
  }, [records, selectedCourseFilter, activeTab, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const paidCount = records.filter((r) => r.paymentStatus === '결제완료' && r.amount > 0).length;
    const retakeCount = records.filter((r) => r.paymentMethod === '재수강(무료)' || r.note?.includes('재수강')).length;
    const auditorCount = records.filter((r) => r.paymentMethod === '청강(무료)' || r.note?.includes('청강')).length;
    const unpaidCount = records.filter((r) => r.paymentStatus === '미결제').length;
    const creditCount = records.filter((r) => (r.creditBalance ?? 0) > 0).length;

    return { total, paidCount, retakeCount, auditorCount, unpaidCount, creditCount };
  }, [records]);

  // Copy single phone
  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.success(`${phone} 번호가 복사되었습니다.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all filtered phones
  const handleCopyAllFilteredPhones = () => {
    const phones = filteredRecords
      .map((r) => r.phone.trim())
      .filter(Boolean);

    if (phones.length === 0) {
      toast.error('복사할 전화번호가 없습니다.');
      return;
    }

    const text = phones.join(', ');
    navigator.clipboard.writeText(text);
    toast.success(`현재 조회된 수강생 ${phones.length}명의 전화번호가 클립보드에 복사되었습니다! (단체 문자/알림톡 발송용)`);
  };

  // Copy selected phones
  const handleCopySelectedPhones = () => {
    const targets = records.filter((r) => selectedIds.includes(r.id));
    const phones = targets.map((r) => r.phone.trim()).filter(Boolean);

    if (phones.length === 0) {
      toast.error('선택한 수강생의 전화번호가 없습니다.');
      return;
    }

    const text = phones.join(', ');
    navigator.clipboard.writeText(text);
    toast.success(`선택된 수강생 ${phones.length}명의 전화번호가 복사되었습니다.`);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      '기수/과정',
      '신청번호',
      '성함',
      '전화번호',
      '이메일',
      '소속/회사',
      '수강구분',
      '결제상태',
      '수강료(원)',
      '결제방식',
      '신청일시',
      '특이사항/사전설문',
    ];

    const rows = filteredRecords.map((r) => [
      r.courseId === 'ai-work-automation-master' ? '10/9 1기 특강' : '10/27 2기 특강',
      r.orderId,
      r.applicantName,
      r.phone,
      r.email,
      `"${r.company.replace(/"/g, '""')}"`,
      r.amount === 0 ? (r.paymentMethod.includes('재수강') ? '재수강무료' : '청강무료') : '신규유료',
      r.paymentStatus,
      r.amount,
      r.paymentMethod,
      r.appliedAt,
      `"${(r.note ?? '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI교육_수강생_고객명부_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`수강생 명부 CSV 파일이 다운로드되었습니다. (총 ${rows.length}명)`);
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: ApplicantSettlementRecord) => {
    setSelectedRecord(rec);
    setEditForm({
      phone: rec.phone,
      email: rec.email,
      company: rec.company,
      note: rec.note || '',
      paymentStatus: rec.paymentStatus,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const updated = updateSettlementRecord(selectedRecord.id, {
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      company: editForm.company.trim(),
      note: editForm.note.trim(),
      paymentStatus: editForm.paymentStatus,
    });

    setRecords(updated);
    toast.success(`${selectedRecord.applicantName}님의 정보가 성공적으로 수정되었습니다.`);
    setIsEditModalOpen(false);
  };

  // Save New Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.applicantName.trim()) {
      toast.error('수강생 성함을 입력해주세요.');
      return;
    }
    if (!newStudentForm.phone.trim()) {
      toast.error('전화번호를 입력해주세요.');
      return;
    }

    const orderId = `ORD-${Date.now().toString().slice(-8)}`;
    const recordId = `rec-crm-${Date.now()}`;

    const newRecord: ApplicantSettlementRecord = {
      id: recordId,
      orderId,
      courseId: newStudentForm.courseId,
      applicantName: newStudentForm.applicantName.trim(),
      phone: newStudentForm.phone.trim(),
      email: newStudentForm.email.trim() || `${newStudentForm.phone.replace(/[^0-9]/g, '')}@student.aiedu.kr`,
      company: newStudentForm.company.trim() || '일반 수강생',
      appliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount: Number(newStudentForm.amount),
      paymentMethod: newStudentForm.paymentMethod,
      paymentStatus: newStudentForm.paymentStatus,
      enrollmentStatus: '승인',
      settlementStatus: '정산대기',
      instructorShare: Math.round(Number(newStudentForm.amount) * 0.7),
      taxDeducted: Math.round(Number(newStudentForm.amount) * 0.7 * 0.033),
      netToInstructor: Math.round(Number(newStudentForm.amount) * 0.7 * 0.967),
      taxInvoiceStatus: '미신청',
      note: newStudentForm.note.trim() ? `[CRM 등록] ${newStudentForm.note.trim()}` : '[CRM 직접 등록 수강생]',
    };

    const next = [newRecord, ...records];
    saveSettlementRecords(next);
    setRecords(next);
    toast.success(`${newRecord.applicantName} 수강생이 명부에 등록되었습니다.`);
    setIsNewModalOpen(false);
    setNewStudentForm({
      courseId: 'ai-work-automation-master',
      applicantName: '',
      phone: '',
      email: '',
      company: '',
      amount: 150000,
      paymentMethod: '무통장입금',
      paymentStatus: '결제완료',
      note: '',
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 text-slate-800 space-y-6">
      {/* ── 1. Top Breadcrumb & Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/admin" className="hover:text-blue-600 transition">관리자 콘솔</Link>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">수강생 CRM &amp; 고객 명부</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <Users className="size-7 text-blue-600" />
            <span>수강생 통합 고객관리 (CRM)</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            강의를 수강한 모든 수강생의 전화번호, 이메일, 소속, 수강 이력, 사전 설문 니즈를 한눈에 관리하고 단체 문자 발송용 연락처를 원클릭 추출합니다.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAllFilteredPhones}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition"
            title="현재 조회된 모든 수강생의 전화번호를 쉼표로 연결하여 클립보드에 복사합니다."
          >
            <Phone className="size-4" />
            <span>전화번호 일괄 복사 ({filteredRecords.length}명)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            <span>엑셀(CSV) 다운로드</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-100 shadow-2xs transition"
          >
            <Plus className="size-4" />
            <span>수강생 직접 등록</span>
          </button>

          <button
            type="button"
            onClick={handleCleanReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-2xs transition"
            title="목업 데이터 제거 및 최신 동기화"
          >
            <RefreshCw className="size-3.5" />
            <span>동기화</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            activeTab === 'all'
              ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 block">전체 수강생 명부</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-950">{stats.total}</span>
            <span className="text-xs text-slate-400 font-bold">명</span>
          </div>
          <span className="text-[10px] text-blue-600 font-bold block mt-1">1기 19명 + 2기 7명</span>
        </div>

        <div
          onClick={() => setActiveTab('paid')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            activeTab === 'paid'
              ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 block">정규 유료 완납자</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-800">{stats.paidCount}</span>
            <span className="text-xs text-emerald-600 font-bold">명</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">수강료 결제 완료</span>
        </div>

        <div
          onClick={() => setActiveTab('retake')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            activeTab === 'retake'
              ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-indigo-700 block">무료 재수강 동문</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-900">{stats.retakeCount}</span>
            <span className="text-xs text-indigo-600 font-bold">명</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold block mt-1">방은주·이현주·이주빈·박정희</span>
        </div>

        <div
          onClick={() => setActiveTab('auditor')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            activeTab === 'auditor'
              ? 'border-slate-500 bg-slate-100 ring-2 ring-slate-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-600 block">무료 청강생</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-800">{stats.auditorCount}</span>
            <span className="text-xs text-slate-400 font-bold">명</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold block mt-1">한상유·한선희·유상근</span>
        </div>

        <div
          onClick={() => setActiveTab('unpaid')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            activeTab === 'unpaid'
              ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-rose-700 block">미수금 관리 대상</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-800">{stats.unpaidCount}</span>
            <span className="text-xs text-rose-600 font-bold">명</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold block mt-1">정미희·양온정·김미균</span>
        </div>

        <div
          onClick={() => setActiveTab('credit')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            activeTab === 'credit'
              ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-800 block">예치금 잔액 보관</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-900">{stats.creditCount}</span>
            <span className="text-xs text-amber-700 font-bold">명</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-1">김형석 (150,000원 보관)</span>
        </div>
      </div>

      {/* ── 3. Filters & Real-time Search ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Left: Course Selection & Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Course filter select */}
          <div className="relative">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">전체 기수 과정 ({records.length}명)</option>
              <option value="ai-work-automation-master">10/9 AI 실전 마스터 1기 (19명)</option>
              <option value="ai-work-automation-1027">10/27 AI 실전 마스터 2기 (7명)</option>
            </select>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paid')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              유료완납
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('retake')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'retake'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              재수강
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unpaid')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'unpaid'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              미수금
            </button>
          </div>
        </div>

        {/* Right: Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="성함, 전화번호(뒷자리), 회사, 추천인 검색"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Selective Batch Bar (When checkboxes are checked) ── */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <CheckCircle2 className="size-4 text-blue-600" />
            <span>선택된 수강생: {selectedIds.length}명</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySelectedPhones}
              className="rounded-lg bg-blue-600 px-3 py-1 text-white font-bold hover:bg-blue-700 transition"
            >
              선택한 {selectedIds.length}명 전화번호 복사
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-800 underline px-1"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Main Customer & Student Directory Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-600">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                    onChange={handleToggleSelectAll}
                    className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">성함 / 기수</th>
                <th className="py-3 px-4">전화번호 (연락처)</th>
                <th className="py-3 px-3">이메일</th>
                <th className="py-3 px-4">소속 회사 / 직무</th>
                <th className="py-3 px-3">수강 구분</th>
                <th className="py-3 px-3 text-right">수강료</th>
                <th className="py-3 px-3 text-center">수납 상태</th>
                <th className="py-3 px-4">사전 설문 니즈 &amp; 상담 메모</th>
                <th className="py-3 px-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r, index) => {
                const is1009 = r.courseId === 'ai-work-automation-master';
                const isRetake = r.paymentMethod === '재수강(무료)' || r.note?.includes('재수강');
                const isAuditor = r.paymentMethod === '청강(무료)' || r.note?.includes('청강');
                const isCredit = (r.creditBalance ?? 0) > 0;
                const isUnpaid = r.paymentStatus === '미결제';

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Checkbox */}
                    <td className="py-3.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                          );
                        }}
                        className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Name & Cohort Badge */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-sm">{r.applicantName}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            is1009
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {is1009 ? '1기(10/9)' : '2기(10/27)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{r.orderId}</span>
                    </td>

                    {/* Phone Number with One-Click Actions */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                          {r.phone || '연락처 미등록'}
                        </span>

                        {r.phone && (
                          <div className="flex items-center gap-1">
                            {/* Copy button */}
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(r.id, r.phone)}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="전화번호 복사"
                            >
                              {copiedId === r.id ? (
                                <Check className="size-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>

                            {/* Call button */}
                            <a
                              href={`tel:${r.phone}`}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                              title="전화 걸기"
                            >
                              <Phone className="size-3.5" />
                            </a>

                            {/* SMS button */}
                            <a
                              href={`sms:${r.phone}`}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="문자 메시지 보내기"
                            >
                              <MessageSquare className="size-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-3">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-slate-600 hover:text-blue-600 hover:underline font-mono text-[11px] block truncate max-w-[160px]"
                        title={r.email}
                      >
                        {r.email}
                      </a>
                    </td>

                    {/* Company / Role */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 text-xs block">{r.company}</span>
                    </td>

                    {/* Student Type */}
                    <td className="py-3.5 px-3">
                      {isRetake ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          재수강
                        </span>
                      ) : isAuditor ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                          청강생
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                          신규 유료
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                      ₩ {r.amount.toLocaleString()}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {isCredit ? (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                          예치금보관
                        </span>
                      ) : isUnpaid ? (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-extrabold text-rose-700 border border-rose-200">
                          미수
                        </span>
                      ) : (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                          결제완료
                        </span>
                      )}
                    </td>

                    {/* Survey Goals & Notes */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[280px] text-[11px] text-slate-600 line-clamp-2" title={r.note}>
                        {r.note || '-'}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <Edit3 className="size-3" />
                        <span>관리/메모</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">조건에 맞는 수강생이 없습니다.</p>
                    <p className="text-xs mt-1">검색어를 변경하거나 필터를 초기화해보세요.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Edit & Note Modal ── */}
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  <span>{selectedRecord.applicantName} 님 수강생 정보 관리</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedRecord.orderId}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">성함</label>
                  <input
                    type="text"
                    disabled
                    value={selectedRecord.applicantName}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">수납 결제 상태</label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="결제완료">결제완료</option>
                    <option value="미결제">미결제 (미수)</option>
                    <option value="결제실패">결제실패</option>
                    <option value="환불">환불</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  전화번호 (휴대폰) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">이메일 주소</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">소속 회사 / 직책</label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="예: 오투아이 안경원, 교보생명 FP 등"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">사전 설문 니즈 &amp; 상담 업무 메모</label>
                <textarea
                  rows={4}
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="수강생과의 상담 내역, 문의사항, 요청사항 등을 자유롭게 기록하세요."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 leading-relaxed focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. New Student Registration Modal ── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Plus className="size-5 text-indigo-600" />
                  <span>신규 수강생 직접 등록</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">현장 접수나 전화 등록된 수강생을 고객 명부에 추가합니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">등록 과정 (기수)</label>
                <select
                  value={newStudentForm.courseId}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, courseId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800"
                >
                  <option value="ai-work-automation-master">10월 9일 AI 실전 마스터 특강 (1기)</option>
                  <option value="ai-work-automation-1027">10월 27일 AI 실전 마스터 특강 (2기)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    수강생 성함 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.applicantName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, applicantName: e.target.value })}
                    placeholder="홍길동"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    전화번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">소속 회사 / 직종</label>
                  <input
                    type="text"
                    value={newStudentForm.company}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, company: e.target.value })}
                    placeholder="회사명, 직책"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">수강료 (원)</label>
                  <input
                    type="number"
                    value={newStudentForm.amount}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, amount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">결제 상태</label>
                  <select
                    value={newStudentForm.paymentStatus}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800"
                  >
                    <option value="결제완료">결제완료</option>
                    <option value="미결제">미결제 (미수)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">추천인 및 비고 메모</label>
                <textarea
                  rows={2}
                  value={newStudentForm.note}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, note: e.target.value })}
                  placeholder="추천인, 접수 경로, 특별 요구사항 등"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                >
                  수강생 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
