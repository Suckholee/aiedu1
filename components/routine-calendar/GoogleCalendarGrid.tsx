'use client';

import React, { useMemo } from 'react';
import { RoutineTask, AgentRole, AI_AGENT_TEAMS } from '@/types/routine-calendar';
import { CalendarViewType } from './GoogleCalendarHeader';
import { Clock, CheckCircle2, AlertCircle, ChevronRight, Zap } from 'lucide-react';

interface GoogleCalendarGridProps {
  currentDate: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  viewType: CalendarViewType;
  tasks: RoutineTask[];
  onSelectTask: (task: RoutineTask) => void;
}

export function GoogleCalendarGrid({
  currentDate,
  selectedDate,
  onSelectDate,
  viewType,
  tasks,
  onSelectTask,
}: GoogleCalendarGridProps) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 팀별 컬러 매핑 (Google Calendar 팔레트 스타일)
  const TEAM_STYLES: Record<
    AgentRole,
    {
      pillBg: string;
      pillText: string;
      pillBorder: string;
      dotColor: string;
      blockBg: string;
      blockBorder: string;
      blockText: string;
    }
  > = {
    chief: {
      pillBg: 'bg-indigo-50 hover:bg-indigo-100',
      pillText: 'text-indigo-800',
      pillBorder: 'border-l-4 border-indigo-600',
      dotColor: 'bg-indigo-600',
      blockBg: 'bg-indigo-50/90 hover:bg-indigo-100/90',
      blockBorder: 'border-l-4 border-indigo-600',
      blockText: 'text-indigo-900',
    },
    winefit: {
      pillBg: 'bg-rose-50 hover:bg-rose-100',
      pillText: 'text-rose-800',
      pillBorder: 'border-l-4 border-rose-600',
      dotColor: 'bg-rose-600',
      blockBg: 'bg-rose-50/90 hover:bg-rose-100/90',
      blockBorder: 'border-l-4 border-rose-600',
      blockText: 'text-rose-900',
    },
    le_verre: {
      pillBg: 'bg-emerald-50 hover:bg-emerald-100',
      pillText: 'text-emerald-800',
      pillBorder: 'border-l-4 border-emerald-600',
      dotColor: 'bg-emerald-600',
      blockBg: 'bg-emerald-50/90 hover:bg-emerald-100/90',
      blockBorder: 'border-l-4 border-emerald-600',
      blockText: 'text-emerald-900',
    },
    growth: {
      pillBg: 'bg-amber-50 hover:bg-amber-100',
      pillText: 'text-amber-800',
      pillBorder: 'border-l-4 border-amber-600',
      dotColor: 'bg-amber-600',
      blockBg: 'bg-amber-50/90 hover:bg-amber-100/90',
      blockBorder: 'border-l-4 border-amber-600',
      blockText: 'text-amber-900',
    },
  };

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  // ── 1. 월간 뷰 그리드 계산 (Full Month Calendar Matrix) ──
  const monthMatrix = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // 이전 달
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().slice(0, 10);
      cells.push({
        date: prevDate,
        dateStr,
        dayNum,
        isCurrentMonth: false,
      });
    }

    // 이번 달
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const thisDate = new Date(year, month, day);
      const dateStr = thisDate.toISOString().slice(0, 10);
      cells.push({
        date: thisDate,
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
      });
    }

    // 다음 달 (35셀 또는 42셀로 정렬)
    const totalTarget = cells.length > 35 ? 42 : 35;
    const remaining = totalTarget - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = nextDate.toISOString().slice(0, 10);
      cells.push({
        date: nextDate,
        dateStr,
        dayNum: day,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  // ── 2. 주간 뷰 날짜 계산 (일~토 7일) ──
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0(일) ~ 6(토)
    const firstDay = new Date(curr);
    firstDay.setDate(curr.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // 현재 시각 계산 (주간 뷰 Live Red Line용)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 표시할 시간대 목록 (07:00 ~ 23:00)
  const HOURS = useMemo(() => {
    const arr = [];
    for (let h = 7; h <= 23; h++) {
      arr.push(h);
    }
    return arr;
  }, []);

  // 특정 날짜의 태스크 필터링
  const getDayTasks = (dateStr: string) => {
    return tasks.filter((t) => t.date === dateStr);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. 월간 뷰 (Google Calendar Classic Month Grid)
  // ─────────────────────────────────────────────────────────────
  if (viewType === 'month') {
    return (
      <div className="flex h-full flex-col bg-white select-none">
        {/* Day of Week Header Row */}
        <div className="grid grid-cols-7 border-b border-[#dadce0] text-center text-xs font-semibold text-slate-500 py-2 bg-slate-50/50">
          {DAY_LABELS.map((label, idx) => (
            <div
              key={label}
              className={idx === 0 ? 'text-rose-500 font-bold' : idx === 6 ? 'text-blue-500 font-bold' : ''}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 7 x 5 or 7 x 6 Matrix */}
        <div className="grid flex-1 grid-cols-7 grid-rows-5 sm:grid-rows-5 divide-x divide-y divide-[#dadce0] border-b border-[#dadce0] overflow-y-auto">
          {monthMatrix.map((cell) => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;
            const dayTasks = getDayTasks(cell.dateStr);

            return (
              <div
                key={cell.dateStr}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 transition flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/40'
                    : isToday
                    ? 'bg-amber-50/20'
                    : cell.isCurrentMonth
                    ? 'bg-white hover:bg-slate-50/60'
                    : 'bg-slate-50/40'
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition ${
                      isToday
                        ? 'bg-[#1a73e8] text-white shadow-xs'
                        : isSelected
                        ? 'border border-[#1a73e8] text-[#1a73e8]'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {dayTasks.some((t) => t.status === 'draft_ready') && (
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" title="결재 대기 안건 있음" />
                  )}
                </div>

                {/* Event Pills List */}
                <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => {
                    const style = TEAM_STYLES[task.agentRole] || TEAM_STYLES.chief;

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className={`w-full text-left rounded px-1.5 py-0.5 text-[11px] font-semibold transition truncate flex items-center gap-1 shadow-2xs ${style.pillBg} ${style.pillText} ${style.pillBorder}`}
                        title={`${task.time} ${task.title}`}
                      >
                        <span className="text-[10px] font-bold opacity-80 shrink-0">
                          {task.time}
                        </span>
                        <span className="truncate flex-1 font-medium">
                          {task.title}
                        </span>
                        {task.status === 'draft_ready' && (
                          <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                        )}
                        {task.status === 'approved' && (
                          <span className="text-[9px] text-emerald-600 font-bold shrink-0">✓</span>
                        )}
                      </button>
                    );
                  })}

                  {dayTasks.length > 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(cell.dateStr);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-[#1a73e8] pl-1 transition"
                    >
                      +{dayTasks.length - 3}개 더보기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. 주간 뷰 (Google Calendar Time Grid with Live Red Line)
  // ─────────────────────────────────────────────────────────────
  if (viewType === 'week') {
    return (
      <div className="flex h-full flex-col bg-white select-none overflow-hidden">
        {/* Top Days Header Row */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-[#dadce0] bg-white sticky top-0 z-20">
          {/* Timezone label */}
          <div className="flex items-center justify-center border-r border-[#dadce0] text-[10px] font-bold text-slate-400">
            GMT+09
          </div>

          {/* 7 Days Columns */}
          {weekDays.map((date, idx) => {
            const dateStr = date.toISOString().slice(0, 10);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`py-2 text-center border-r border-[#dadce0] last:border-r-0 cursor-pointer transition ${
                  isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase ${
                    idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-slate-500'
                  }`}
                >
                  {DAY_LABELS[idx]}
                </p>
                <div className="flex justify-center mt-0.5">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-sm font-black transition ${
                      isToday
                        ? 'bg-[#1a73e8] text-white shadow-xs'
                        : isSelected
                        ? 'border-2 border-[#1a73e8] text-[#1a73e8]'
                        : 'text-slate-800'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 24-Hour Scrollable Time Grid */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] relative min-h-[900px]">
            {/* Left Time Labels */}
            <div className="border-r border-[#dadce0] bg-white">
              {HOURS.map((hour) => {
                const ampm = hour >= 12 ? '오후' : '오전';
                const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

                return (
                  <div
                    key={hour}
                    className="h-14 border-b border-[#dadce0] pr-2 text-right text-[11px] font-medium text-slate-400 -mt-2.5 flex items-start justify-end"
                  >
                    {displayH === 12 && ampm === '오후' ? '오후 12시' : `${ampm} ${displayH}시`}
                  </div>
                );
              })}
            </div>

            {/* 7 Columns for Week */}
            {weekDays.map((dayDate, dayIdx) => {
              const dateStr = dayDate.toISOString().slice(0, 10);
              const isToday = dateStr === todayStr;
              const dayTasks = getDayTasks(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className="relative border-r border-[#dadce0] last:border-r-0 bg-white"
                >
                  {/* Hour horizontal dividers */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-14 border-b border-[#dadce0] hover:bg-slate-50/40 transition"
                    />
                  ))}

                  {/* Google Calendar Iconic LIVE RED LINE indicator (if today) */}
                  {isToday && currentHour >= 7 && currentHour <= 23 && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                      style={{
                        top: `${((currentHour - 7) * 60 + currentMinute) * (56 / 60)}px`,
                      }}
                    >
                      <div className="-ml-1.5 size-3 rounded-full bg-[#ea4335] shadow-xs" />
                      <div className="h-[2px] w-full bg-[#ea4335]" />
                    </div>
                  )}

                  {/* Render Events in this column */}
                  {dayTasks.map((task) => {
                    const [hStr, mStr] = task.time.split(':');
                    const h = Number(hStr);
                    const m = Number(mStr);
                    if (h < 7 || h > 23) return null;

                    const topPx = ((h - 7) * 60 + m) * (56 / 60);
                    const heightPx = 52; // roughly 1 hour block
                    const style = TEAM_STYLES[task.agentRole] || TEAM_STYLES.chief;

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                        }}
                        className={`absolute inset-x-1 z-10 cursor-pointer rounded-lg p-1.5 text-xs transition-all shadow-xs hover:shadow-md hover:z-20 overflow-hidden flex flex-col justify-between ${style.blockBg} ${style.blockBorder} ${style.blockText}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-[11px] truncate leading-tight">
                            {task.time} {task.title}
                          </span>
                          {task.status === 'draft_ready' && (
                            <span className="size-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                          )}
                          {task.status === 'approved' && (
                            <span className="text-[10px] text-emerald-700 font-bold shrink-0">✓</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="truncate">{task.agentName.split(' (')[0]}</span>
                          <span className="font-bold text-indigo-700 bg-white/80 rounded px-1 text-[9px]">
                            {task.estimatedSavedMinutes}분 절약
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. 일간 뷰 (Day View)
  // ─────────────────────────────────────────────────────────────
  const dayTasks = getDayTasks(selectedDate);

  return (
    <div className="flex h-full flex-col bg-white select-none overflow-hidden">
      {/* Top Day Header */}
      <div className="border-b border-[#dadce0] bg-slate-50/50 p-4 text-center">
        <h3 className="text-base font-bold text-slate-900">
          {selectedDate} 오늘의 AI 스케줄 ({dayTasks.length}건)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          시간대별 AI 에이전트 사전 보고 초안 및 실행 일정
        </p>
      </div>

      {/* 24-Hour Timeline Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[80px_1fr] min-h-[900px]">
          {/* Time Labels */}
          <div className="border-r border-[#dadce0] bg-white">
            {HOURS.map((hour) => {
              const ampm = hour >= 12 ? '오후' : '오전';
              const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

              return (
                <div
                  key={hour}
                  className="h-16 border-b border-[#dadce0] pr-3 text-right text-xs font-semibold text-slate-400 flex items-start justify-end pt-1"
                >
                  {ampm} {displayH}시
                </div>
              );
            })}
          </div>

          {/* Day column with cards */}
          <div className="relative bg-white">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-[#dadce0] hover:bg-slate-50/50 transition"
              />
            ))}

            {/* Events */}
            {dayTasks.map((task) => {
              const [hStr, mStr] = task.time.split(':');
              const h = Number(hStr);
              const m = Number(mStr);
              const topPx = ((h - 7) * 60 + m) * (64 / 60);
              const style = TEAM_STYLES[task.agentRole] || TEAM_STYLES.chief;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  style={{
                    top: `${topPx}px`,
                    height: '58px',
                  }}
                  className={`absolute inset-x-3 z-10 cursor-pointer rounded-xl p-2.5 transition-all shadow-xs hover:shadow-md flex items-center justify-between ${style.blockBg} ${style.blockBorder} ${style.blockText}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.agentAvatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {task.time} · {task.title}
                        </span>
                        <span className="rounded-md bg-white/80 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold">
                          {task.targetPlatform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {task.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'draft_ready' ? (
                      <span className="rounded-full bg-amber-500 text-white text-[11px] font-black px-2.5 py-1 flex items-center gap-1">
                        <Zap className="size-3 fill-white" /> 1초 승인 필요
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> 완료
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
