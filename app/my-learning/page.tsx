'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { toast } from 'sonner';
import {
  getUserApplications,
  getSettlementRecords,
  subscribeSettlementChanges,
  ApplicantSettlementRecord,
} from '@/lib/settlement-store';
import { COURSE_SETTLEMENT_METAS } from '@/data/settlements';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
  Printer,
  Copy,
  Check,
  Search,
  BookOpen,
} from 'lucide-react';

export default function MyLearning() {
  const { data, ready, mutate } = usePlatform();
  const { user } = useAuth();
  const authEmail = (user?.isGuest ? '' : user?.email ?? '').trim().toLowerCase();

  const [lookupQuery, setLookupQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [localApplications, setLocalApplications] = useState<ApplicantSettlementRecord[]>([]);
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    setLocalApplications(getUserApplications());
    const unsub = subscribeSettlementChanges(() => {
      setLocalApplications(getUserApplications());
    });
    return unsub;
  }, []);

  const handleCopyBank = () => {
    navigator.clipboard.writeText('기업은행 123-456789-01-012 네오앤피터');
    setCopiedBank(true);
    toast.success('입금 계좌번호가 복사되었습니다.');
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // 1. Backend enrollments matching auth email
  const backendEnrollments = data.enrollments.filter(
    (e) => e.email && authEmail && e.email === authEmail
  );

  // 2. Local settlement applications matching auth email OR stored order ids OR manual search query
  const queryLower = lookupQuery.trim().toLowerCase();
  const matchingSettlementApplications = (queryLower
    ? getSettlementRecords().filter(
        (r) =>
          r.email.toLowerCase().includes(queryLower) ||
          r.orderId.toLowerCase().includes(queryLower) ||
          r.phone.includes(queryLower)
      )
    : localApplications
  );

  const hasAnyItems = backendEnrollments.length > 0 || matchingSettlementApplications.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
              수강생 전용
            </span>
            <span className="text-xs font-medium text-slate-500">
              실시간 신청 &amp; 학습 관리
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            내 신청 및 강의실 현황
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            신청하신 과정의 승인 상태, 결제 영수증 확인, 수강 자료 학습을 관리합니다.
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
        >
          <BookOpen className="size-4" />
          <span>신규 교육과정 탐색</span>
        </Link>
      </div>

      {/* Guest or Cross-device Lookup Bar */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          신청 내역 조회 (비회원/다른 기기 신청 건)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="신청 시 입력한 이메일, 주문번호(ORD-...), 또는 휴대폰번호 입력"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {lookupQuery && (
            <button
              type="button"
              onClick={() => setLookupQuery('')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {!ready ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-sm">
          데이터를 불러오는 중입니다...
        </div>
      ) : !hasAnyItems ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lookupQuery ? '일치하는 수강 신청 내역이 없습니다.' : '아직 접수된 수강 신청 내역이 없습니다.'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              관심 있는 교육 과정을 선택하여 온라인에서 바로 신청해보세요.
            </p>
          </div>
          <div>
            <Link
              href="/apply"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
            >
              <span>온라인 수강 신청 바로가기</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION A: Newly placed site applications (from settlement-store) */}
          {matchingSettlementApplications.map((app) => {
            const courseMeta =
              COURSE_SETTLEMENT_METAS.find((c) => c.courseId === app.courseId) || {
                courseTitle: '네오앤피터 교육과정',
                period: app.appliedAt.slice(0, 10),
                instructorName: '전문 강사진',
              };
            const dynamicCourse = data.courses.find((c) => c.id === app.courseId);
            const title = dynamicCourse?.title || courseMeta.courseTitle;

            return (
              <section
                key={app.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-400">
                        {app.orderId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          app.enrollmentStatus === '승인'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.enrollmentStatus === '반려'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        신청 상태: {app.enrollmentStatus}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          app.paymentStatus === '결제완료'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        결제: {app.paymentStatus} ({app.paymentMethod})
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 pt-1">
                      <Link
                        href={`/courses/${app.courseId}`}
                        className="hover:text-indigo-600 transition"
                      >
                        {title}
                      </Link>
                    </h2>
                    <p className="text-xs text-slate-500">
                      신청일시: {new Date(app.appliedAt).toLocaleString('ko-KR')} · 신청자: {app.applicantName} ({app.company})
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block">수강료</span>
                    <span className="text-lg font-black text-indigo-600">
                      ₩ {app.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Body details & Next steps */}
                {app.paymentStatus === '미결제' && app.paymentMethod === '무통장입금' && (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-900">
                        무통장 입금 계좌 안내
                      </span>
                      <span className="text-rose-600 font-semibold">24시간 이내 입금 확인 시 자동 승인</span>
                    </div>
                    <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-xl p-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-slate-900">
                          기업은행 123-456789-01-012
                        </p>
                        <p className="text-[11px] text-slate-500">
                          예금주: (주)네오앤피터 (입금자명: {app.applicantName})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyBank}
                        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                      >
                        {copiedBank ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        <span>계좌복사</span>
                      </button>
                    </div>
                  </div>
                )}

                {app.enrollmentStatus === '반려' && app.rejectReason && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-1">
                    <strong className="block font-bold">신청 반려 사유 안내:</strong>
                    <p>{app.rejectReason}</p>
                    <p className="text-slate-500 pt-1">
                      문의사항은 고객센터(1588-0000) 또는 고객 상담 CRM으로 문의주세요.
                    </p>
                  </div>
                )}

                {app.enrollmentStatus === '승인' && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>관리자 승인이 완료되었습니다. 강의실 자료 및 LIVE 참여가 가능합니다.</span>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/courses/${app.courseId}`}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        강의실 입장하기
                      </Link>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        수강 확인서 / 영수증 인쇄
                      </button>
                    </div>
                  </div>
                )}

                {app.enrollmentStatus === '신청' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50 rounded-xl p-3.5">
                    <p>
                      현재 담당자가 수강 신청서를 확인 중입니다. 결제 확인 후 강의 안내 알림톡이 전송됩니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-slate-900"
                    >
                      <Printer className="size-3.5" />
                      <span>접수증 인쇄</span>
                    </button>
                  </div>
                )}
              </section>
            );
          })}

          {/* SECTION B: Backend enrollments (existing PlatformContext records) */}
          {backendEnrollments
            .filter((e) => !matchingSettlementApplications.some((a) => a.id === e.id))
            .map((e) => {
              const c = data.courses.find((course) => course.id === e.courseId);
              const materials = data.materials.filter((m) => m.courseId === e.courseId);
              return (
                <section
                  key={e.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700">
                        {e.status}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        <Link href={`/courses/${c?.id}`}>{c?.title || '교육과정'}</Link>
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">신청번호: {e.id}</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {c?.startDate} {c?.startTime} · {c?.location}
                  </p>

                  {['승인', '수료'].includes(e.status) ? (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-slate-600">
                        학습 진행: {e.progress.length}/{materials.length}개 완료 · 출석:{' '}
                        {e.attendance ? '확인됨' : '미확인'}
                      </p>
                      <div className="space-y-2">
                        {materials.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                          >
                            <a
                              className="font-bold text-blue-700 hover:underline"
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {m.title} 열기
                            </a>
                            <button
                              disabled={busy || e.progress.includes(m.id)}
                              className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                              onClick={async () => {
                                setBusy(true);
                                try {
                                  await mutate({
                                    action: 'progress',
                                    id: e.id,
                                    materialId: m.id,
                                  });
                                  toast.success('학습 완료를 기록했습니다.');
                                } catch (err) {
                                  toast.error(
                                    err instanceof Error ? err.message : '저장 실패'
                                  );
                                } finally {
                                  setBusy(false);
                                }
                              }}
                            >
                              {e.progress.includes(m.id) ? '학습 완료' : '완료 기록'}
                            </button>
                          </div>
                        ))}
                      </div>

                      {e.status === '수료' && (
                        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-8 text-center print:border-black space-y-2">
                          <h3 className="text-2xl font-black text-slate-900">수료 확인서</h3>
                          <p className="text-sm text-slate-700">
                            <strong>{e.name}</strong> 님은 {c?.title} 과정을 성실히 수료하였습니다.
                          </p>
                          <button
                            type="button"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white print:hidden mt-2"
                            onClick={() => window.print()}
                          >
                            확인서 인쇄하기
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      관리자 승인 후 학습 자료와 실시간 링크가 활성화됩니다.
                    </p>
                  )}
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
