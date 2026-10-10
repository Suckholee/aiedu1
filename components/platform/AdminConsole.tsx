'use client';

import { auth } from '@/lib/firebase';
import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/contexts/PlatformContext';
import { toast } from 'sonner';
import type { PlatformCourse, Banner } from '@/lib/platform-types';
import {
  getSettlementRecords,
  getDynamicCourseMetas,
  ApplicantSettlementRecord,
} from '@/lib/settlement-store';
import { getLedgerTransactions, getLedgerSummary } from '@/lib/ledger-store';
import { COURSE_SETTLEMENT_METAS } from '@/data/settlements';
import {
  GraduationCap,
  Users,
  CreditCard,
  FileText,
  Calendar,
  Building,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';

const input = 'w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm';
const button = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50';
const section = 'rounded-2xl border border-slate-200 bg-white p-5 space-y-4';

export function AdminConsole({ view }: {
    view: 'dashboard' | 'courses' | 'banners' | 'crm' | 'operations';
}) {
    const { data, ready, mutate, refresh } = usePlatform();
    const [busy, setBusy] = useState(false);
    const [editCourse, setEditCourse] = useState<PlatformCourse | null>(null);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);
    const [query, setQuery] = useState('');
    const [settlementRecords, setSettlementRecords] = useState<ApplicantSettlementRecord[]>([]);

    useEffect(() => {
        setSettlementRecords(getSettlementRecords());
    }, []);

    const run = async (command: object) => { setBusy(true); try {
        await mutate(command);
        toast.success('저장했습니다. 연결된 화면에 반영됩니다.');
        return true;
    }
    catch (e) {
        toast.error(e instanceof Error ? e.message : '저장 실패');
        return false;
    }
    finally {
        setBusy(false);
    } };
    const submitCourse = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const value = Object.fromEntries(f); if (await run({ ...value, action: 'course', id: editCourse?.id, price: Number(value.price), totalSeats: Number(value.totalSeats), published: f.has('published') }))
        setEditCourse(null); };
    const submitBanner = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const value = Object.fromEntries(f); if (await run({ ...value, action: 'banner', id: editBanner?.id, order: Number(value.order), active: f.has('active') }))
        setEditBanner(null); };

    const titles = {
        dashboard: '교육 ERP 종합 상황실 (Executive ERP)',
        courses: '과정·기수·일정 관리 (학사 ERP)',
        banners: '배너·홍보 관리 (마케팅 ERP)',
        crm: '신청·상담 CRM (원생 ERP)',
        operations: '수업·교안 자료 관리 (강의실 ERP)',
    };

    const erpNavItems = [
        { href: '/admin', label: '📊 ERP 종합 상황실', key: 'dashboard' },
        { href: '/admin/courses', label: '🎓 과정·기수 관리', key: 'courses' },
        { href: '/admin/crm', label: '👥 원생·신청 CRM', key: 'crm' },
        { href: '/admin/settlements', label: '💳 결제 & 정산 회계', key: 'settlements' },
        { href: '/admin/ledger', label: '📑 통장 입출금 대장', key: 'ledger' },
        { href: '/admin/operations', label: '📁 수업·교안 관리', key: 'operations' },
        { href: '/admin/promotions', label: '📢 홍보 & 배너', key: 'banners' },
    ];

    const [ledgerSummary, setLedgerSummary] = useState({ totalIncome: 950000, totalExpense: 652500, netBalance: 297500 });
    useEffect(() => {
        setLedgerSummary(getLedgerSummary(getLedgerTransactions()));
    }, []);

    // ERP Metrics Calculations
    const dynamicMetas = getDynamicCourseMetas(COURSE_SETTLEMENT_METAS, settlementRecords);
    const totalRevenue = settlementRecords.reduce((sum, r) => sum + r.amount, 0);
    const settledRevenue = settlementRecords
        .filter((r) => r.settlementStatus === '정산완료')
        .reduce((sum, r) => sum + r.amount, 0);
    const unsettledRevenue = settlementRecords
        .filter((r) => r.settlementStatus === '정산대기')
        .reduce((sum, r) => sum + r.amount, 0);
    const totalWithholdingTax = settlementRecords.reduce((sum, r) => sum + r.taxDeducted, 0);
    const pendingApplicantsCount = settlementRecords.filter((r) => r.enrollmentStatus === '신청').length;
    const unpaidOrdersCount = settlementRecords.filter((r) => r.paymentStatus === '미결제').length;

    const field = (label: string, name: string, defaultValue: string | number, type = 'text') => <label className="block text-sm font-semibold">{label}<input className={input} name={name} type={type} defaultValue={defaultValue} required min={type === 'number' ? 0 : undefined}/></label>;
    if (!ready)
        return <p>운영 데이터를 불러오는 중입니다.</p>;

    return <div className="space-y-6 pb-16 text-left">
    {/* ERP Header Banner */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">EDUCATION ERP</span>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            실시간 운영 정상
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{titles[view]}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">네오앤피터 교육플랫폼 학사·원생·수납·정산·콘텐츠 통합 관리 시스템</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/apply" target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs">
          <ArrowUpRight className="size-3.5" />
          <span>온라인 수강신청 폼</span>
        </Link>
        <Link href="/calendar" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs">
          <Calendar className="size-3.5" />
          <span>홍보 캘린더</span>
        </Link>
      </div>
    </div>

    {/* ERP Global Module Navigation Bar */}
    <nav className="flex flex-wrap gap-2 text-xs sm:text-sm font-bold border-b border-slate-100 pb-3">
      {erpNavItems.map((item) => {
        const isActive = (view === item.key) || (item.key === 'settlements' && typeof window !== 'undefined' && window.location.pathname === '/admin/settlements');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3.5 py-2 transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>

    {view === 'dashboard' && <>
      {/* 1. Executive Financial & Enrollment Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>총 누적 수납 매출</span>
            <TrendingUp className="size-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₩ {totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            전체 {settlementRecords.length}건 등록 기준
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>정산 완료액 (지급완료)</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            ₩ {settledRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            강사료 실지급 완료 금액
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>정산 대기액 (미지급 부채)</span>
            <Clock className="size-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ₩ {unsettledRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            정산 대기 {settlementRecords.filter(r => r.settlementStatus === '정산대기').length}건
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>원천징수(3.3%) 세액</span>
            <ShieldCheck className="size-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800">
            ₩ {totalWithholdingTax.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            국세청 납부 예정 예수금
          </p>
        </div>
      </div>

      {/* 2. Core ERP Operations Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/settlements" className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-5 hover:border-indigo-400 transition shadow-xs space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white font-bold">
              <CreditCard className="size-5" />
            </div>
            <span className="rounded-full bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 text-xs">
              미정산 {settlementRecords.filter(r => r.settlementStatus === '정산대기').length}건
            </span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition">
              결제 &amp; 강사료 정산 관리
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              강의별 신청자·미정산자·정산자 분류, 70% 강사료 산출 및 일괄 정산 확정
            </p>
          </div>
        </Link>

        <Link href="/admin/ledger" className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white p-5 hover:border-emerald-400 transition shadow-xs space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white font-bold">
              <Building className="size-5" />
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-xs">
              잔액 +₩{ledgerSummary.netBalance.toLocaleString()}
            </span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
              통장 입출금 &amp; 수납·지출 장부
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              수강료 입금(95만), 대관료(서강대 22만), 교재비(17.5만), 식사비(25.7만)
            </p>
          </div>
        </Link>

        <Link href="/admin/crm" className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-white p-5 hover:border-blue-400 transition shadow-xs space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white font-bold">
              <Users className="size-5" />
            </div>
            <span className="rounded-full bg-blue-100 text-blue-700 font-bold px-2 py-0.5 text-xs">
              대기 {pendingApplicantsCount}명
            </span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition">
              원생 신청 &amp; 상담 CRM
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              실시간 온라인 신청서 검토, 승인/반려 처리, 출석 확인 및 상담 일지
            </p>
          </div>
        </Link>

        <Link href="/admin/courses" className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 hover:border-slate-400 transition shadow-xs space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white font-bold">
              <GraduationCap className="size-5" />
            </div>
            <span className="rounded-full bg-slate-100 text-slate-700 font-bold px-2 py-0.5 text-xs">
              개설 {data.courses.length}개
            </span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition">
              과정·기수·일정 마스터
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              기수별 수강료, 정원, 강의 일정, Zoom 링크 및 커리큘럼 등록
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Course Enrollment & Revenue Progress Table */}
      <div className={section}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">과정별 모집 충원 및 수납 현황</h2>
            <p className="text-xs text-slate-400 mt-0.5">정원 대비 충원율과 수납액 실시간 집계</p>
          </div>
          <Link href="/admin/settlements" className="text-xs font-bold text-indigo-600 hover:underline">
            정산 대장 전체보기 &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3">과정명</th>
                <th className="p-3">담당 강사</th>
                <th className="p-3">일정</th>
                <th className="p-3 text-center">정원 충원율</th>
                <th className="p-3 text-right">총 수납액</th>
                <th className="p-3 text-right">정산 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dynamicMetas.map((c) => {
                const fillPercent = Math.min(100, Math.round((c.currentCount / c.capacity) * 100));
                return (
                  <tr key={c.courseId} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <Link href={`/admin/settlements`} className="hover:text-indigo-600">
                        {c.courseTitle}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-600">{c.instructorName}</td>
                    <td className="p-3 font-mono text-slate-500">{c.period}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="font-bold text-slate-800">{c.currentCount}/{c.capacity}명</span>
                        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${fillPercent}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600">{fillPercent}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      ₩ {c.totalRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {c.unsettledRevenue > 0 ? (
                        <span className="rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 text-[10px]">
                          미정산 ₩{c.unsettledRevenue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2 py-0.5 text-[10px]">
                          정산 완료
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Recent Applications & Activity Feed */}
      <div className={section}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">최근 실시간 수강 신청 및 수납 피드</h2>
            <p className="text-xs text-slate-400 mt-0.5">웹사이트에서 접수된 최신 신청 주문 건입니다.</p>
          </div>
          <Link href="/admin/crm" className="text-xs font-bold text-blue-600 hover:underline">
            원생 관리 CRM 바로가기 &rarr;
          </Link>
        </div>

        <div className="space-y-2.5">
          {settlementRecords.slice(0, 6).map((rec) => (
            <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">{rec.orderId}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rec.enrollmentStatus === '승인' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  rec.enrollmentStatus === '반려' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {rec.enrollmentStatus}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rec.paymentStatus === '결제완료' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {rec.paymentStatus} ({rec.paymentMethod})
                </span>
                <div>
                  <strong className="text-slate-900">{rec.applicantName}</strong>
                  <span className="text-slate-500 ml-1">({rec.email})</span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <span className="font-black text-slate-900">₩ {rec.amount.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 font-mono">{rec.appliedAt.slice(0, 10)}</span>
              </div>
            </div>
          ))}
          {settlementRecords.length === 0 && <p className="text-sm text-slate-500">접수된 수강 신청이 없습니다.</p>}
        </div>
      </div>

      {/* 5. System Logs */}
      <div className={section}>
        <h2 className="font-bold text-sm text-slate-700">ERP 최근 변경 이력</h2>
        {data.logs.slice(0, 10).map(l => <p key={l.id} className="text-xs text-slate-600">{new Date(l.at).toLocaleString('ko-KR')} · {l.message}</p>)}
        {!data.logs.length && <p className="text-xs text-slate-400">과정 등록 또는 수강 신청 후 이력이 표시됩니다.</p>}
      </div>
    </>}
    {view === 'courses' && <><form key={editCourse?.id ?? 'new'} onSubmit={submitCourse} className={section}><h2 className="font-bold">{editCourse ? '과정 수정' : '새 과정 등록'}</h2><div className="grid gap-4 sm:grid-cols-2">{field('과정명', 'title', editCourse?.title ?? '')}{field('소개', 'subtitle', editCourse?.subtitle ?? '')}<label>분야<select name="category" defaultValue={editCourse?.category ?? '업무자동화'} className={input}>{['AI·데이터', '업무자동화', '개발·백엔드', '비즈니스·마케팅'].map(v => <option key={v}>{v}</option>)}</select></label><label>난이도<select name="level" className={input} defaultValue={editCourse?.level ?? '입문'}>{['입문', '초급', '중급', '고급'].map(v => <option key={v}>{v}</option>)}</select></label>{field('수강료 (원)', 'price', editCourse?.price ?? 0, 'number')}{field('정원', 'totalSeats', editCourse?.totalSeats ?? 20, 'number')}{field('교육일', 'startDate', editCourse?.startDate ?? '2026-10-09', 'date')}{field('장소 / 온라인 접속 안내', 'location', editCourse?.location ?? '')}{field('시작', 'startTime', editCourse?.startTime ?? '14:00', 'time')}{field('종료', 'endTime', editCourse?.endTime ?? '17:00', 'time')}{field('담당 강사', 'instructor', editCourse?.instructor.name ?? '')}</div><label className="block text-sm font-semibold">커리큘럼 (한 줄에 한 차시)<textarea name="curriculumText" className={input} rows={5} defaultValue={editCourse?.curriculum.flatMap(ch => ch.lessons.map(l => l.title)).join('\n') ?? ''} placeholder="과정 소개 및 학습 목표&#10;실습과 최종 프로젝트"/></label>
        <label className="flex gap-2"><input name="published" type="checkbox" defaultChecked={editCourse?.published ?? true}/>공개 (홈·교육과정·캘린더 노출)</label><button disabled={busy} className={button}>저장</button>{editCourse && <button type="button" className="ml-3" onClick={() => setEditCourse(null)}>새 과정 등록</button>}</form><div className={section}>{data.courses.map(c => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3"><div><Link className="font-bold text-blue-700" href={`/courses/${c.id}`}>{c.title}</Link><p className="text-sm">{c.startDate} {c.startTime} · {c.instructor.name} · 잔여 {c.remainingSeats}/{c.totalSeats}석 · {c.published ? '공개' : '비공개'}</p></div><button className={button} onClick={() => { setEditCourse(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>수정</button></div>)}</div></>}
    {view === 'banners' && <><form key={editBanner?.id ?? 'new'} className={section} onSubmit={submitBanner}><h2 className="font-bold">{editBanner ? '배너 수정' : '배너 등록'}</h2><div className="grid gap-4 sm:grid-cols-2">{field('제목', 'title', editBanner?.title ?? '')}{field('설명', 'subtitle', editBanner?.subtitle ?? '')}{field('상단 문구', 'badge', editBanner?.badge ?? '교육 안내')}{field('링크', 'link', editBanner?.link ?? '/courses')}{field('게시 시작', 'startDate', editBanner?.startDate ?? '2026-10-07', 'date')}{field('게시 종료', 'endDate', editBanner?.endDate ?? '2026-12-31', 'date')}{field('노출 순서', 'order', editBanner?.order ?? 1, 'number')}</div><label className="flex gap-2"><input type="checkbox" name="active" defaultChecked={editBanner?.active ?? true}/>공개</label><button className={button} disabled={busy}>저장</button><button type="button" className="ml-3" onClick={() => setEditBanner(null)}>입력 초기화</button></form><div className={section}>{data.banners.map(b => <div key={b.id} className="flex flex-wrap justify-between gap-3 border-b py-3"><div className="flex-1"><strong>{b.title}</strong><p>{b.startDate} ~ {b.endDate} · 순서 {b.order} · {b.active ? '공개' : '숨김'}</p></div><button onClick={() => setEditBanner(b)} className={button}>수정</button><button disabled={busy} onClick={() => void run({ ...b, action: 'banner', active: !b.active })}>공개 전환</button><button disabled={busy} onClick={() => { if (window.confirm('배너를 삭제할까요?'))
        void run({ action: 'deleteBanner', id: b.id }); }}>삭제</button></div>)}</div></>}
    {(view === 'crm' || view === 'operations') && <><input aria-label="신청자 검색" className={input} placeholder="이름, 이메일, 과정명 검색" value={query} onChange={e => setQuery(e.target.value)}/><div className="space-y-4">{data.enrollments.filter(e => `${e.name} ${e.email} ${data.courses.find(c => c.id === e.courseId)?.title}`.includes(query)).map(e => <div key={e.id} className={section}><div className="flex flex-wrap justify-between"><div><h2 className="font-bold">{e.name} · {e.status}</h2><p>{data.courses.find(c => c.id === e.courseId)?.title}</p><p className="text-sm">{e.email} · <a href={`tel:${e.phone}`}>{e.phone}</a> · ₩{e.amount.toLocaleString()} (테스트)</p><p className="text-xs text-slate-500">신청번호 {e.id}</p></div><div className="flex items-center gap-2">{(e.status === '신청' ? ['승인', '반려'] : ['승인', '수료'].includes(e.status) ? e.status === '승인' ? ['수료', '환불'] : ['환불'] : []).map(status => <button key={status} className={button} disabled={busy} onClick={() => { if (status !== '환불' || window.confirm('테스트 환불 처리하고 좌석을 반환할까요?'))
        void run({ action: 'status', id: e.id, status }); }}>{status}</button>)}</div></div><label className="flex gap-2"><input type="checkbox" checked={e.attendance} disabled={busy} onChange={v => void run({ action: 'attendance', id: e.id, attendance: v.target.checked })}/>출석 확인 · 학습 완료 자료 {e.progress.length}개</label><form className="flex gap-2" onSubmit={async (v) => { v.preventDefault(); const form = v.currentTarget; const f = new FormData(form); if (await run({ action: 'note', id: e.id, note: f.get('note') }))
        form.reset(); }}><input name="note" required placeholder="상담 내용 / 후속 업무 기록" className={input}/><button className={button} disabled={busy}>기록</button></form>{e.notes.map((n, i) => <p key={i} className="text-sm text-slate-600">{n}</p>)}</div>)}{!data.enrollments.length && <div className={section}>수강 신청이 없습니다. <Link className="text-blue-700" href="/courses">교육과정에서 테스트 신청하기</Link></div>}</div></>}
    {view === 'operations' && <><form className={section} onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; setBusy(true); try {
        const response = await fetch('/api/platform/files', { method: 'POST', headers: auth?.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : {}, body: new FormData(form) });
        const result = await response.json();
        if (!response.ok)
            throw Error(result.error);
        await refresh();
        toast.success('파일을 등록했습니다.');
        form.reset();
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : '업로드 실패');
    }
    finally {
        setBusy(false);
    } }}><h2 className="font-bold">자료 파일 업로드</h2><select aria-label="업로드 대상 과정" name="courseId" className={input}>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><input aria-label="자료 파일" name="file" type="file" required accept=".pdf,.ppt,.pptx,.docx,.xlsx,.txt"/><p className="text-sm text-slate-500">20MB 이하 · PDF는 브라우저에서 열람, PPT·Word·Excel은 원본 다운로드</p><button disabled={busy} className={button}>파일 등록</button></form><div className={section}><h2 className="font-bold">후기 검토·공개</h2>{data.reviews.map(r => <div className="border-b py-3" key={r.id}><p>{r.author} · {r.rating}점 · {r.content}</p><button disabled={busy} className={button} onClick={() => void run({ action: 'approveReview', id: r.id, approved: !r.approved })}>{r.approved ? '공개 취소' : '공개 승인'}</button></div>)}{!data.reviews.length && <p>접수된 후기가 없습니다.</p>}</div></>}
    {view === 'operations' && <form className={section} onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; if (await run({ ...Object.fromEntries(new FormData(form)), action: 'material' }))
        form.reset(); }}><h2 className="font-bold">과정에 학습 자료 연결</h2><label>교육과정<select name="courseId" className={input}>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>{field('자료 제목', 'title', '')}{field('자료 링크 (PDF/PPT/웹페이지)', 'url', '')}<button disabled={busy} className={button}>자료 등록</button><p className="text-sm">등록한 자료는 승인된 수강생의 내 강의실에 표시됩니다.</p>{data.materials.map(m => <p key={m.id}><a className="text-blue-700" href={m.url} target="_blank" rel="noreferrer">{m.title}</a> · {data.courses.find(c => c.id === m.courseId)?.title}</p>)}</form>}
  </div>;
}
