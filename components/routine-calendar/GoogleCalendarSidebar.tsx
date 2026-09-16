'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Zap,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AgentRole, AI_AGENT_TEAMS } from '@/types/routine-calendar';

interface GoogleCalendarSidebarProps {
  currentDate: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  activeTeams: Set<AgentRole | 'pending_only'>;
  onToggleTeam: (teamKey: AgentRole | 'pending_only') => void;
  onOpenCreateModal: () => void;
  pendingCount: number;
  approvedCount: number;
  savedMinutes: number;
}

export function GoogleCalendarSidebar({
  currentDate,
  selectedDate,
  onSelectDate,
  activeTeams,
  onToggleTeam,
  onOpenCreateModal,
  pendingCount,
  approvedCount,
  savedMinutes,
}: GoogleCalendarSidebarProps) {
  const [miniCalendarMonth, setMiniCalendarMonth] = useState<Date>(
    () => new Date(currentDate)
  );
  const [myCalendarsOpen, setMyCalendarsOpen] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  // 미니 달력 이전/다음 월
  const handleMiniPrev = () => {
    const next = new Date(miniCalendarMonth);
    next.setMonth(next.getMonth() - 1);
    setMiniCalendarMonth(next);
  };

  const handleMiniNext = () => {
    const next = new Date(miniCalendarMonth);
    next.setMonth(next.getMonth() + 1);
    setMiniCalendarMonth(next);
  };

  // 미니 달력 날짜 그리드 생성 (일~토, 35 or 42 셀)
  const miniGrid = React.useMemo(() => {
    const year = miniCalendarMonth.getFullYear();
    const month = miniCalendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. 이전 달 날짜 채우기
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      cells.push({
        date: prevDate,
        dateStr: prevDate.toISOString().slice(0, 10),
        dayNum,
        isCurrentMonth: false,
      });
    }

    // 2. 이번 달 날짜 채우기
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const thisDate = new Date(year, month, day);
      cells.push({
        date: thisDate,
        dateStr: thisDate.toISOString().slice(0, 10),
        dayNum: day,
        isCurrentMonth: true,
      });
    }

    // 3. 다음 달 날짜 채우기 (최대 42셀)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= (remaining >= 7 && cells.length <= 35 ? remaining - 7 : remaining); day++) {
      const nextDate = new Date(year, month + 1, day);
      cells.push({
        date: nextDate,
        dateStr: nextDate.toISOString().slice(0, 10),
        dayNum: day,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [miniCalendarMonth]);

  const MINI_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

  const CALENDAR_LIST: Array<{
    id: AgentRole | 'pending_only';
    label: string;
    sublabel: string;
    color: string;
    bgHex: string;
  }> = [
    {
      id: 'chief',
      label: '비서팀 네오',
      sublabel: '스케줄 & 데일리 브리핑',
      color: '#6355f6',
      bgHex: '#4f46e5',
    },
    {
      id: 'winefit',
      label: '마케팅팀 와인핏',
      sublabel: '블로그 · 뉴스레터 · 숏폼',
      color: '#e11d48',
      bgHex: '#e11d48',
    },
    {
      id: 'le_verre',
      label: '운영팀 르글라스',
      sublabel: '와인바 매장 체크리스트',
      color: '#059669',
      bgHex: '#059669',
    },
    {
      id: 'growth',
      label: '영업팀 그로스',
      sublabel: 'B2B 제안서 & 와인 특강',
      color: '#d97706',
      bgHex: '#d97706',
    },
    {
      id: 'pending_only',
      label: '⚡ CEO 결재 대기 전용',
      sublabel: '1초 승인 필요한 안건만',
      color: '#f59e0b',
      bgHex: '#f59e0b',
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#dadce0] bg-white p-3 space-y-5 select-none overflow-y-auto">
      {/* ── 1. Google Calendar Iconic "+ 만들기" Floating Pill Button ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="group flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg active:scale-95"
        >
          {/* Google 4-Color Styled Plus */}
          <div className="relative flex size-6 items-center justify-center">
            <span className="absolute h-4 w-1 rounded-full bg-[#1a73e8]" />
            <span className="absolute h-1 w-4 rounded-full bg-[#ea4335]" />
            <span className="absolute -bottom-0.5 size-1.5 rounded-full bg-[#fbbc05]" />
            <span className="absolute -left-0.5 size-1.5 rounded-full bg-[#34a853]" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-800">
            만들기
          </span>
          <ChevronDown className="size-3.5 text-slate-400 group-hover:text-slate-600 transition ml-1" />
        </button>
      </div>

      {/* ── 2. Google Calendar Left Mini Date Picker ── */}
      <div className="rounded-xl border border-transparent p-1">
        {/* Mini Month Header */}
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs font-bold text-slate-800">
            {miniCalendarMonth.getFullYear()}년 {miniCalendarMonth.getMonth() + 1}월
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleMiniPrev}
              title="이전 달"
              className="grid size-6 place-items-center rounded-full text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleMiniNext}
              title="다음 달"
              className="grid size-6 place-items-center rounded-full text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Day Name Header Row */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 pb-1">
          {MINI_DAY_NAMES.map((d, i) => (
            <div
              key={d}
              className={i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : ''}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Mini Calendar 7xN Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {miniGrid.map((cell) => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => onSelectDate(cell.dateStr)}
                className={`flex size-7 items-center justify-center rounded-full text-[11px] font-medium transition ${
                  isSelected
                    ? 'bg-[#1a73e8] text-white font-bold shadow-xs'
                    : isToday
                    ? 'border border-[#1a73e8] text-[#1a73e8] font-bold'
                    : cell.isCurrentMonth
                    ? 'text-slate-800 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Google Calendar "내 캘린더 (My Calendars)" Checklist ── */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex w-full items-center justify-between px-1 py-1 text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <span>내 AI 캘린더</span>
          {myCalendarsOpen ? (
            <ChevronUp className="size-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="size-3.5 text-slate-400" />
          )}
        </button>

        {myCalendarsOpen && (
          <div className="mt-2 space-y-1">
            {CALENDAR_LIST.map((cal) => {
              const isChecked = activeTeams.has(cal.id);

              return (
                <div
                  key={cal.id}
                  onClick={() => onToggleTeam(cal.id)}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                >
                  {/* Google Calendar Custom Square Checkbox */}
                  <div
                    className="flex size-4 shrink-0 items-center justify-center rounded transition"
                    style={{
                      backgroundColor: isChecked ? cal.bgHex : 'transparent',
                      border: `2px solid ${cal.bgHex}`,
                    }}
                  >
                    {isChecked && <Check className="size-3 stroke-[3] text-white" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {cal.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {cal.sublabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. CEO Cockpit Mini Summary Badge ── */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-black text-indigo-950 flex items-center gap-1 text-[11px]">
            <Zap className="size-3 text-indigo-600" /> 1초 승인 현황
          </span>
          <span className="rounded-md bg-amber-500 text-white font-black px-1.5 py-0.2 text-[10px]">
            {pendingCount}건 대기
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600" /> 완료된 보고:
            </span>
            <span className="font-bold text-slate-800">{approvedCount}건</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-indigo-600" /> 절약 시간:
            </span>
            <span className="font-bold text-slate-800">
              {savedMinutes > 60
                ? `${Math.floor(savedMinutes / 60)}h ${savedMinutes % 60}m`
                : `${savedMinutes}분`}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
