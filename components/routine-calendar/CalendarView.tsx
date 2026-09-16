'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { RoutineTask, AgentRole } from '@/types/routine-calendar';
import {
  GoogleCalendarHeader,
  CalendarViewType,
} from './GoogleCalendarHeader';
import { GoogleCalendarSidebar } from './GoogleCalendarSidebar';
import { GoogleCalendarGrid } from './GoogleCalendarGrid';
import { GoogleCalendarEventModal } from './GoogleCalendarEventModal';
import { GoogleCalendarCreateModal } from './GoogleCalendarCreateModal';
import { MobileApprovalDeck } from './MobileApprovalDeck';
import { X } from 'lucide-react';

interface CalendarViewProps {
  tasks: RoutineTask[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectTask: (task: RoutineTask) => void;
  selectedAgentFilter: AgentRole | 'all';
  onSelectAgentFilter: (filter: AgentRole | 'all') => void;
  onApprove: (taskId: string) => Promise<void>;
  onRevise: (taskId: string, feedback: string) => Promise<void>;
  onBatchApprove?: () => Promise<void>;
  onAddTask?: (task: RoutineTask) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function CalendarView({
  tasks,
  selectedDate,
  onSelectDate,
  onSelectTask,
  onApprove,
  onRevise,
  onBatchApprove,
  onAddTask,
  onDeleteTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('week');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [eventModalTask, setEventModalTask] = useState<RoutineTask | null>(null);

  // 모바일 화면에서는 사이드바 기본 닫힘 (화면 찌그러짐 방지)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // 다중 캘린더 필터 체크리스트 (기본 전체 활성화)
  const [activeTeams, setActiveTeams] = useState<Set<AgentRole | 'pending_only'>>(
    new Set(['chief', 'winefit', 'le_verre', 'growth'])
  );

  const toggleTeam = (teamKey: AgentRole | 'pending_only') => {
    setActiveTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamKey)) {
        next.delete(teamKey);
      } else {
        next.add(teamKey);
      }
      return next;
    });
  };

  // 필터링된 태스크 목록 계산
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. 체크리스트 팀 필터
      if (!activeTeams.has(t.agentRole)) {
        return false;
      }
      // 2. CEO 결재 대기 전용 필터
      if (activeTeams.has('pending_only') && t.status !== 'draft_ready') {
        return false;
      }
      // 3. 검색 쿼리 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchSummary = t.summary.toLowerCase().includes(q);
        const matchAgent = t.agentName.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchAgent) return false;
      }
      return true;
    });
  }, [tasks, activeTeams, searchQuery]);

  // 통계
  const pendingTasks = tasks.filter((t) => t.status === 'draft_ready');
  const approvedTasks = tasks.filter((t) => t.status === 'approved');
  const totalSavedMinutes = approvedTasks.reduce(
    (acc, c) => acc + c.estimatedSavedMinutes,
    0
  );

  // 날짜 네비게이션
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewType === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewType === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewType === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewType === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onSelectDate(now.toISOString().slice(0, 10));
  };

  const handleDateSelect = (dateStr: string) => {
    onSelectDate(dateStr);
    const [y, m, d] = dateStr.split('-');
    setCurrentDate(new Date(Number(y), Number(m) - 1, Number(d)));
  };

  const handleOpenEvent = (task: RoutineTask) => {
    setEventModalTask(task);
    onSelectTask(task);
  };

  return (
    <div className="relative flex flex-col h-[700px] sm:h-[780px] lg:h-[820px] rounded-2xl border border-[#dadce0] bg-white shadow-md overflow-hidden whitespace-nowrap break-keep">
      {/* ── 1. Google Calendar Top Header Bar ── */}
      <GoogleCalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        onChangeViewType={setViewType}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingCount={pendingTasks.length}
        onBatchApprove={onBatchApprove}
      />

      {/* ── 2. Google Calendar Main Workspace (Sidebar + Grid) ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left Sidebar (Visible on desktop when sidebarOpen is true) */}
        {sidebarOpen && (
          <div className="hidden lg:block shrink-0 h-full border-r border-[#dadce0]">
            <GoogleCalendarSidebar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              activeTeams={activeTeams}
              onToggleTeam={toggleTeam}
              onOpenCreateModal={() => setCreateModalOpen(true)}
              pendingCount={pendingTasks.length}
              approvedCount={approvedTasks.length}
              savedMinutes={totalSavedMinutes}
            />
          </div>
        )}

        {/* Mobile Left Drawer (Below lg: slides out as overlay with dark backdrop so it never squeezes the calendar) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-50 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <span className="text-sm font-bold text-slate-800">Google 캘린더 메뉴</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <GoogleCalendarSidebar
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    handleDateSelect(d);
                    setSidebarOpen(false);
                  }}
                  activeTeams={activeTeams}
                  onToggleTeam={toggleTeam}
                  onOpenCreateModal={() => {
                    setCreateModalOpen(true);
                    setSidebarOpen(false);
                  }}
                  pendingCount={pendingTasks.length}
                  approvedCount={approvedTasks.length}
                  savedMinutes={totalSavedMinutes}
                />
              </div>
            </div>
          </div>
        )}

        {/* Calendar View Body (Gets 100% width on mobile) */}
        <main className="flex-1 overflow-hidden relative bg-white">
          {viewType === 'deck' ? (
            <div className="h-full overflow-y-auto p-3 sm:p-6 bg-slate-50">
              <MobileApprovalDeck
                tasks={filteredTasks}
                onApprove={onApprove}
                onRevise={onRevise}
                onSelectTask={handleOpenEvent}
              />
            </div>
          ) : (
            <GoogleCalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              viewType={viewType}
              tasks={filteredTasks}
              onSelectTask={handleOpenEvent}
            />
          )}
        </main>
      </div>

      {/* ── 3. Google Calendar Event Popover Modal ── */}
      <GoogleCalendarEventModal
        task={eventModalTask}
        isOpen={Boolean(eventModalTask)}
        onClose={() => setEventModalTask(null)}
        onApprove={onApprove}
        onRevise={onRevise}
        onDelete={onDeleteTask}
      />

      {/* ── 4. Google Calendar "+ 만들기" Quick Event Dialog ── */}
      <GoogleCalendarCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onAddTask={(newTask) => {
          if (onAddTask) onAddTask(newTask);
        }}
        defaultDate={selectedDate}
      />
    </div>
  );
}
