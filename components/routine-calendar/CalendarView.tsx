'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { RoutineTask, AgentRole, AI_AGENT_TEAMS } from '@/types/routine-calendar';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  tasks: RoutineTask[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectTask: (task: RoutineTask) => void;
  selectedAgentFilter: AgentRole | 'all';
  onSelectAgentFilter: (filter: AgentRole | 'all') => void;
}

export function CalendarView({
  tasks,
  selectedDate,
  onSelectDate,
  onSelectTask,
  selectedAgentFilter,
  onSelectAgentFilter,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // 오늘 날짜 문자열 YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 주간 날짜 배열 계산 (일~토)
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

  // 필터링된 태스크 목록
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedAgentFilter === 'all') return true;
      return t.agentRole === selectedAgentFilter;
    });
  }, [tasks, selectedAgentFilter]);

  // 특정 날짜의 태스크 가져오기
  const getTasksForDate = (dateStr: string) => {
    return filteredTasks.filter((t) => t.date === dateStr);
  };

  // 주/월 이동
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onSelectDate(todayStr);
  };

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* ── 캘린더 상단 네비게이션 & 필터 ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              4대 AI 직원팀의 일별 루틴 &amp; 콘텐츠 타임라인
            </p>
          </div>
        </div>

        {/* 컨트롤 버튼 & 주/월 토글 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'week' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              주간 뷰
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'month' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              월간 뷰
            </button>
          </div>

          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-white">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="size-8 p-0 rounded-lg text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              오늘
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="size-8 p-0 rounded-lg text-slate-600 hover:text-slate-900"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── AI 팀 필터 칩 ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
          <Filter className="size-3" /> 팀별:
        </span>
        <button
          type="button"
          onClick={() => onSelectAgentFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
            selectedAgentFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          전체 보기
        </button>
        {(Object.keys(AI_AGENT_TEAMS) as AgentRole[]).map((role) => {
          const team = AI_AGENT_TEAMS[role];
          const isSelected = selectedAgentFilter === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelectAgentFilter(role)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 border ${
                isSelected
                  ? `${team.bgLight} ${team.color} ring-2 ring-indigo-500/20 shadow-xs`
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {team.title}
            </button>
          );
        })}
      </div>

      {/* ── 주간 캘린더 그리드 (Weekly Grid) ── */}
      {viewMode === 'week' ? (
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map((date, idx) => {
            const dateStr = date.toISOString().slice(0, 10);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayTasks = getTasksForDate(dateStr);
            const pendingCount = dayTasks.filter((t) => t.status === 'draft_ready').length;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-[220px] rounded-2xl border p-2 sm:p-2.5 flex flex-col justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                    : isToday
                    ? 'border-amber-400/80 bg-amber-50/20'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span
                      className={`text-xs font-black ${
                        idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'
                      }`}
                    >
                      {DAY_LABELS[idx]}
                    </span>
                    <span
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isToday
                          ? 'bg-amber-500 text-white shadow-xs'
                          : isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-800'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-2 space-y-1.5">
                    {dayTasks.map((task) => {
                      const isPending = task.status === 'draft_ready';
                      const isApproved = task.status === 'approved';

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className={`group rounded-xl p-1.5 border text-left transition hover:scale-[1.02] shadow-2xs ${
                            isPending
                              ? 'bg-amber-50 border-amber-200 text-amber-950'
                              : isApproved
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="font-black truncate">
                              {task.agentAvatar} {task.categoryName}
                            </span>
                            {isPending ? (
                              <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
                            ) : isApproved ? (
                              <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                            ) : null}
                          </div>
                          <p className="text-[11px] font-bold line-clamp-2 mt-0.5 leading-tight">
                            {task.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day Footer Summary */}
                <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{dayTasks.length}건</span>
                  {pendingCount > 0 && (
                    <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-md">
                      대기 {pendingCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 월간 캘린더 간이 그리드 (Monthly Overview) ── */
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="font-bold text-sm text-slate-800">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 전체 루틴 로드맵
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            주간 뷰에서 각 일자별 AI 에이전트의 구체적인 작성물과 모바일 원터치 승인 카드를 확인하실 수 있습니다.
          </p>
          <Button
            size="sm"
            onClick={() => setViewMode('week')}
            className="mt-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
          >
            주간 타임라인으로 돌아가기
          </Button>
        </div>
      )}
    </div>
  );
}
