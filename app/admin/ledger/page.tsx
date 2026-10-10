'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Printer,
  Download,
  Plus,
  Filter,
  Search,
  FileText,
  X,
  ShieldCheck,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getLedgerTransactions,
  saveLedgerTransactions,
  addLedgerTransaction,
  subscribeLedgerChanges,
  getLedgerSummary,
  BankTransactionRecord,
  TransactionType,
  TransactionCategory,
} from '@/lib/ledger-store';

export default function AdminLedgerPage() {
  const [transactions, setTransactions] = useState<BankTransactionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  // New transaction modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('입금');
  const [category, setCategory] = useState<TransactionCategory>('수강료');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [courseTitle, setCourseTitle] = useState('AI 업무자동화 실전 마스터 클래스 (10/9 특강)');

  useEffect(() => {
    setTransactions(getLedgerTransactions());
    const unsub = subscribeLedgerChanges((updated) => {
      setTransactions(updated);
    });
    return unsub;
  }, []);

  const summary = getLedgerSummary(transactions);

  const handleCopyBank = () => {
    navigator.clipboard.writeText('기업은행 123-456789-01-012 네오앤피터');
    setCopiedBank(true);
    toast.success('기업은행 계좌번호가 복사되었습니다.');
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'income') return t.type === '입금';
    if (activeTab === 'expense') return t.type === '출금';
    return true;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterparty.trim()) {
      toast.error('거래처 또는 입금자명을 입력해주세요.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('올바른 금액을 입력해주세요.');
      return;
    }

    addLedgerTransaction({
      type,
      category,
      account: '기업은행 123-456789-01-012',
      counterparty,
      amount: Number(amount),
      note,
      status: '확인완료',
      courseTitle,
    });

    toast.success(`${type} 전표(₩${Number(amount).toLocaleString()})가 등록되었습니다.`);
    setModalOpen(false);
    setCounterparty('');
    setAmount('');
    setNote('');
  };

  const handleExportCSV = () => {
    const headers = ['전표번호', '일시', '구분', '과목', '거래처', '금액', '비고', '상태'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `${t.date} ${t.time}`,
      t.type,
      t.category,
      t.counterparty,
      t.type === '출금' ? -t.amount : t.amount,
      `"${t.note || ''}"`,
      t.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `교육ERP_통장입출금대장_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('통장 입출금 대장이 CSV 파일로 다운로드되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      {/* ── 1. Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
              EDUCATION ERP
            </span>
            <span className="rounded bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 text-xs font-bold">
              회계 &amp; 자금 관리
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            통장 입출금 &amp; 수납·지출 회계 장부
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            수강생 입금 내역, 강의장 대관료, 교재 출력비 등 교육 운영 실시간 입출금 전표를 통합 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
          >
            <Plus className="size-4" />
            <span>새 전표 등록</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            <Download className="size-4 text-slate-500" />
            <span>CSV 엑셀</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            <Printer className="size-4 text-slate-500" />
            <span>장부 인쇄</span>
          </button>
        </div>
      </div>

      {/* ── 2. Bank Account Bar ── */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white font-bold">
            <Building className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-indigo-700 uppercase">
              교육비 수납 관리 계좌
            </span>
            <p className="font-mono text-base font-extrabold text-slate-900">
              기업은행 123-456789-01-012
            </p>
            <p className="text-xs text-slate-500">
              예금주: 주식회사 네오앤피터 (10/9 실무 마스터 특강 계좌)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyBank}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 shadow-2xs transition shrink-0"
        >
          {copiedBank ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          <span>계좌번호 복사</span>
        </button>
      </div>

      {/* ── 3. 3-Column Financial KPI Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Income Card */}
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ArrowDownLeft className="size-4 text-blue-600" />
              총 수강료 입금액
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 text-[10px]">
              {summary.incomeCount}건 확인
            </span>
          </div>
          <div className="text-3xl font-black text-blue-600">
            ₩ {summary.totalIncome.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">
            황선도, 이보배, 조보겸, 임영미, 옥리안, 지미란, 김해리 입금 확인
          </p>
        </div>

        {/* Expense Card */}
        <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="size-4 text-rose-600" />
              총 운영비 지출액
            </span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 text-[10px]">
              {summary.expenseCount}건 출금
            </span>
          </div>
          <div className="text-3xl font-black text-rose-600">
            ₩ {summary.totalExpense.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">
            대관료(220,000원) + 교재비(175,500원) + 저녁식사비(257,000원)
          </p>
        </div>

        {/* Net Balance Card */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-600" />
              당기 순 운영 수지 (잔액)
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
              흑자 운영
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700">
            + ₩ {summary.netBalance.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-700 font-medium">
            현재 통장 가용 자금 잔액
          </p>
        </div>
      </div>

      {/* ── 4. Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 sm:border-0 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            전체 거래 내역 ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'income'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>입금 (수강료)</span>
            <span className="text-[10px] opacity-80">({summary.incomeCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>출금 (대관·교재비)</span>
            <span className="text-[10px] opacity-80">({summary.expenseCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="입금자명, 거래처, 비고 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* ── 5. Ledger Transactions Table ── */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">전표 번호</th>
                <th className="p-3.5">거래 일시</th>
                <th className="p-3.5 text-center">구분</th>
                <th className="p-3.5">계정 과목</th>
                <th className="p-3.5">거래처 / 입금자명</th>
                <th className="p-3.5">적요 및 비고 (추천인/대납/지출사유)</th>
                <th className="p-3.5 text-right">거래 금액</th>
                <th className="p-3.5 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono text-slate-400 font-bold">{tx.id}</td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {tx.date} <span className="text-slate-400">{tx.time}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        tx.type === '입금'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {tx.type === '입금' ? (
                        <ArrowDownLeft className="size-3 text-blue-600" />
                      ) : (
                        <ArrowUpRight className="size-3 text-rose-600" />
                      )}
                      <span>{tx.type}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">{tx.category}</td>
                  <td className="p-3.5 font-extrabold text-slate-900 text-sm">{tx.counterparty}</td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate">
                    {tx.note ? (
                      <span className="inline-flex items-center gap-1">
                        {tx.note.includes('추천') && (
                          <span className="rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-bold border border-amber-200">
                            추천할인
                          </span>
                        )}
                        {tx.note.includes('대납') && (
                          <span className="rounded bg-purple-50 text-purple-700 px-1.5 py-0.5 text-[10px] font-bold border border-purple-200">
                            대납
                          </span>
                        )}
                        {tx.note}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td
                    className={`p-3.5 text-right font-black text-sm ${
                      tx.type === '입금' ? 'text-blue-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === '입금' ? '+' : '-'} ₩ {tx.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="rounded bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 text-[10px] border border-emerald-200">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Navigation Link back to ERP Console ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <p>통장 입출금 내역은 수강생 결제 및 강사료 정산 회계 모듈과 실시간 연동됩니다.</p>
        <div className="flex items-center gap-3">
          <Link href="/admin/settlements" className="font-bold text-indigo-600 hover:underline">
            강의별 결제 &amp; 강사료 정산 관리 &rarr;
          </Link>
          <Link href="/admin" className="font-bold text-slate-700 hover:underline">
            ERP 종합 상황실 &rarr;
          </Link>
        </div>
      </div>

      {/* ── 7. New Transaction Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="size-5 text-indigo-600" />
                새 입출금 전표 등록
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">구분 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('입금');
                      setCategory('수강료');
                    }}
                    className={`py-2.5 rounded-xl font-bold transition ${
                      type === '입금'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    + 입금 (수강료/지원금)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('출금');
                      setCategory('강의장대관');
                    }}
                    className={`py-2.5 rounded-xl font-bold transition ${
                      type === '출금'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    - 출금 (대관료/교재/경비)
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">계정 과목</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                >
                  {type === '입금' ? (
                    <>
                      <option value="수강료">수강료 (학생/기업 입금)</option>
                      <option value="기타경비">기타 입금</option>
                    </>
                  ) : (
                    <>
                      <option value="강의장대관">강의장 대관료</option>
                      <option value="교재교구">교재 및 교구/문구 소모품비</option>
                      <option value="식대">식대 및 저녁식사비</option>
                      <option value="강사료">강사료 지급</option>
                      <option value="다과비">수강생 다과 및 음료비</option>
                      <option value="마케팅비">광고 및 홍보비</option>
                      <option value="기타경비">기타 일반 운영비</option>
                    </>
                  )}
                </select>
              </div>

              {/* Counterparty */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  거래처 / 입금자명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동, (대관처), (알파문구)"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  금액 (원) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="예: 150000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || '')}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  적요 및 비고 (추천인/대납자/지출 목적)
                </label>
                <input
                  type="text"
                  placeholder="예: 이주빈추천 특별할인, 한선희 대납, 교재 제본 인쇄비 등"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              {/* Course Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">관련 교육과정</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                >
                  전표 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
