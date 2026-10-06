'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  BookOpen,
  Award,
  Monitor,
  RefreshCw,
  Bell,
  HardDrive,
  Cpu,
  Wifi,
  Megaphone,
  Mail,
  ShieldAlert,
  Download,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('대시보드 지표가 최신 상태로 갱신되었습니다.');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Header matching Slide 83 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>관리자 콘솔</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">대시보드</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            관리자 대시보드
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            플랫폼 운영 현황 및 주요 지표를 실시간으로 확인합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <RefreshCw
              className={`size-3.5 cursor-pointer hover:text-blue-600 transition ${
                isRefreshing ? 'animate-spin text-blue-600' : ''
              }`}
              onClick={handleRefresh}
            />
            <span>최근 업데이트: 2025-05-20 10:30:45</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              href="/admin/courses"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              교육과정 등록
            </Link>
            <Link
              href="/admin/promotions"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              배너 관리
            </Link>
            <Link
              href="/admin/crm"
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
            >
              수강생 CRM
            </Link>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards matching Slide 83 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. 총 가입자 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="size-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold">ⓘ</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500">총 가입자</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">24,530</span>
              <span className="text-xs font-semibold text-slate-500">명</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>▲ 12.5%</span>
              <span className="text-slate-400 font-normal">(지난 7일 대비)</span>
            </div>
          </div>
        </div>

        {/* 2. 활성 학습자(주간) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="size-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold">ⓘ</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500">활성 학습자(주간)</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">8,932</span>
              <span className="text-xs font-semibold text-slate-500">명</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>▲ 8.3%</span>
              <span className="text-slate-400 font-normal">(지난 7일 대비)</span>
            </div>
          </div>
        </div>

        {/* 3. 강의 수 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <BookOpen className="size-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold">ⓘ</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500">개설 강의 수</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">1,245</span>
              <span className="text-xs font-semibold text-slate-500">개</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>▲ 3.1%</span>
              <span className="text-slate-400 font-normal">(지난 7일 대비)</span>
            </div>
          </div>
        </div>

        {/* 4. 총 수강 완료율 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Award className="size-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold">ⓘ</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500">총 수강 완료율</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">68.7</span>
              <span className="text-xs font-semibold text-slate-500">%</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>▲ 5.7%</span>
              <span className="text-slate-400 font-normal">(지난 7일 대비)</span>
            </div>
          </div>
        </div>

        {/* 5. 동시 접속자 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
              <Monitor className="size-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold">ⓘ</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500">실시간 동시 접속자</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">1,234</span>
              <span className="text-xs font-semibold text-slate-500">명</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>▲ 15.4%</span>
              <span className="text-slate-400 font-normal">(실시간)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Active Learners Chart + Device Donut + System Alerts matching Slide 83 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_320px] gap-6 items-start">
        {/* Active Learners Line Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">활성 학습자 추이</h3>
              <span className="text-[10px] text-slate-400">ⓘ</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-bold text-slate-600">
                {(['7d', '30d', '90d'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRange(r)}
                    className={`rounded-md px-2.5 py-1 transition ${
                      activeRange === r ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    {r === '7d' ? '7일' : r === '30d' ? '30일' : '90일'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-600" />
              <span>DAU</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>WAU</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-500" />
              <span>MAU</span>
            </div>
          </div>

          {/* Realistic SVG Line Chart matching Slide 83 */}
          <div className="relative h-64 w-full pt-4">
            <svg className="size-full overflow-visible" viewBox="0 0 500 200">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* MAU Purple Line */}
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                points="30,45 100,42 180,48 260,52 340,49 420,53 480,51"
              />
              {[
                [30, 45],
                [100, 42],
                [180, 48],
                [260, 52],
                [340, 49],
                [420, 53],
                [480, 51],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
              ))}

              {/* WAU Green Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points="30,85 100,83 180,84 260,86 340,82 420,85 480,84"
              />
              {[
                [30, 85],
                [100, 83],
                [180, 84],
                [260, 86],
                [340, 82],
                [420, 85],
                [480, 84],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              ))}

              {/* DAU Blue Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points="30,135 100,138 180,140 260,143 340,142 420,141 480,143"
              />
              {[
                [30, 135],
                [100, 138],
                [180, 140],
                [260, 143],
                [340, 142],
                [420, 141],
                [480, 143],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              ))}

              {/* Interactive Tooltip Callout at 05-18 matching Slide 83 */}
              <g transform="translate(320, 55)">
                <rect width="110" height="75" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
                <text x="10" y="18" fontSize="10" fontWeight="bold" fill="#0f172a">05-18</text>
                <circle cx="15" cy="32" r="3" fill="#2563eb" />
                <text x="24" y="35" fontSize="9" fill="#64748b">DAU</text>
                <text x="100" y="35" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="end">2,450</text>
                <circle cx="15" cy="48" r="3" fill="#10b981" />
                <text x="24" y="51" fontSize="9" fill="#64748b">WAU</text>
                <text x="100" y="51" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="end">8,120</text>
                <circle cx="15" cy="64" r="3" fill="#a855f7" />
                <text x="24" y="67" fontSize="9" fill="#64748b">MAU</text>
                <text x="100" y="67" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="end">12,430</text>
              </g>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-4 mt-2">
              <span>05-14</span>
              <span>05-15</span>
              <span>05-16</span>
              <span>05-17</span>
              <span>05-18</span>
              <span>05-19</span>
              <span>05-20</span>
            </div>
          </div>
        </div>

        {/* Device Ratio Donut Chart matching Slide 83 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">디바이스 비율</h3>
            <span className="text-xs text-slate-400">전체 v</span>
          </div>

          <div className="flex flex-col items-center justify-center py-3">
            <div className="relative size-36">
              {/* Donut representation */}
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                {/* PC 48.7% Blue */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeDasharray="42.8 100"
                  strokeDashoffset="0"
                />
                {/* Mobile 40.1% Green */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="35.2 100"
                  strokeDashoffset="-42.8"
                />
                {/* Tablet 11.2% Purple */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="4"
                  strokeDasharray="9.8 100"
                  strokeDashoffset="-78"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium">전체 세션</span>
                <span className="text-sm font-black text-slate-900">32,984</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 w-full space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-blue-600" />
                  <span className="font-semibold text-slate-700">PC</span>
                </div>
                <span className="font-mono font-bold text-slate-900">48.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Mobile</span>
                </div>
                <span className="font-mono font-bold text-slate-900">40.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-purple-500" />
                  <span className="font-semibold text-slate-700">Tablet</span>
                </div>
                <span className="font-mono font-bold text-slate-900">11.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Alerts Feed matching Slide 83 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">시스템 알림</h3>
            <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
              전체 보기 &gt;
            </span>
          </div>

          <div className="space-y-3 text-xs divide-y divide-slate-100">
            <div className="pt-2 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900">높은 CPU 사용률 감지</h5>
                <p className="text-[11px] text-slate-500">서버 #2의 CPU 사용률이 80%를 초과했습니다.</p>
                <span className="text-[10px] text-slate-400 font-mono">2025-05-20 10:21</span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900">메모리 사용량 주의</h5>
                <p className="text-[11px] text-slate-500">서버 #3의 메모리 사용률이 75%를 초과했습니다.</p>
                <span className="text-[10px] text-slate-400 font-mono">2025-05-20 10:15</span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900">디스크 사용량 주의</h5>
                <p className="text-[11px] text-slate-500">스토리지 사용률이 85%에 근접하고 있습니다.</p>
                <span className="text-[10px] text-slate-400 font-mono">2025-05-20 09:58</span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-blue-500 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900">신규 가입자 급증</h5>
                <p className="text-[11px] text-slate-500">최근 1시간 신규 가입자가 평소 대비 150% 증가.</p>
                <span className="text-[10px] text-slate-400 font-mono">2025-05-20 09:41</span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900">시스템 정상 운영 중</h5>
                <p className="text-[11px] text-slate-500">모든 교육 및 스트리밍 서비스 정상 가동 중.</p>
                <span className="text-[10px] text-slate-400 font-mono">2025-05-20 09:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: System Resources + Real-time Traffic + Quick Actions matching Slide 83 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-6 items-start">
        {/* System Resource Meters */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">시스템 자원 현황</h3>
            <span className="text-[10px] text-slate-400">ⓘ</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">CPU 사용률</span>
                <span className="font-black text-slate-900">32%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">메모리 사용률</span>
                <span className="font-black text-slate-900">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">디스크 사용률</span>
                <span className="font-black text-slate-900">48%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">네트워크 트래픽</span>
                <span className="font-black text-slate-900">1.2 Gbps</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '55%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Traffic graph */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">실시간 트래픽</h3>
            <span className="text-xs text-slate-400 font-semibold">분 단위 v</span>
          </div>

          <div className="h-36 w-full pt-2">
            <svg className="size-full overflow-visible" viewBox="0 0 300 100">
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,80 Q30,75 60,65 T120,40 T180,30 T240,45 T300,35 L300,100 L0,100 Z"
                fill="url(#trafficGradient)"
              />
              <path
                d="M0,80 Q30,75 60,65 T120,40 T180,30 T240,45 T300,35"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>09:30</span>
              <span>09:50</span>
              <span>10:10</span>
              <span>10:30</span>
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts matching Slide 83 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">빠른 실행</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => toast.info('공지사항 작성 화면을 엽니다.')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-blue-400 transition"
            >
              <Megaphone className="size-5 text-blue-600 mb-1.5" />
              <span className="font-bold">공지사항 작성</span>
            </button>

            <button
              type="button"
              onClick={() => toast.info('이벤트 알림 발송 모달을 엽니다.')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-blue-400 transition"
            >
              <Bell className="size-5 text-indigo-600 mb-1.5" />
              <span className="font-bold">이벤트 알림 발송</span>
            </button>

            <button
              type="button"
              onClick={() => toast.warning('시스템 점검 모드 설정 창을 엽니다.')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
            >
              <ShieldAlert className="size-5 text-amber-600 mb-1.5" />
              <span className="font-bold">시스템 점검 모드</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success('통계 리포트 다운로드를 시작합니다.')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-emerald-400 transition"
            >
              <Download className="size-5 text-emerald-600 mb-1.5" />
              <span className="font-bold">통계 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
