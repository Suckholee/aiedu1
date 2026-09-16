'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Coins,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Smartphone,
  Layers,
  Users,
  Store,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RoutineTask,
  AgentRole,
  AI_AGENT_TEAMS,
} from '@/types/routine-calendar';
import {
  getLocalRoutineTasks,
  approveRoutineTask,
  reviseRoutineTask,
  batchApproveToday,
  resetRoutineTasks,
} from '@/lib/routine-calendar/routine-storage';
import { CalendarView } from '@/components/routine-calendar/CalendarView';
import { MobileApprovalDeck } from '@/components/routine-calendar/MobileApprovalDeck';
import { TaskDetailModal } from '@/components/routine-calendar/TaskDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RoutineCalendarPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTask, setSelectedTask] = useState<RoutineTask | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<AgentRole | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'deck' | 'calendar' | 'teams'>('deck');

  // 데이터 로드
  useEffect(() => {
    const loaded = getLocalRoutineTasks();
    setTasks(loaded);
  }, []);

  // 통계 계산
  const todayStr = new Date().toISOString().slice(0, 10);
  const pendingTasks = tasks.filter((t) => t.status === 'draft_ready');
  const approvedTasks = tasks.filter((t) => t.status === 'approved');
  const totalSavedMinutes = approvedTasks.reduce((acc, c) => acc + c.estimatedSavedMinutes, 0);

  // 1초 승인 핸들러
  const handleApprove = async (taskId: string) => {
    const updated = await approveRoutineTask(taskId, user);
    setTasks(updated);
  };

  // 1줄 수정 지시 핸들러
  const handleRevise = async (taskId: string, feedback: string) => {
    const updated = await reviseRoutineTask(taskId, feedback, user);
    setTasks(updated);
  };

  // 오늘 업무 일괄 승인
  const handleBatchApprove = async () => {
    const updated = await batchApproveToday(user);
    setTasks(updated);
    toast.success('⚡ 오늘 대기 중이던 모든 AI 업무가 일괄 승인되었습니다!');
  };

  // 프리셋 초기화
  const handleResetPresets = () => {
    const restored = resetRoutineTasks();
    setTasks(restored);
    toast.info('곽성진 대표 기본 주간 루틴으로 복구되었습니다.');
  };

  const handleOpenTask = (task: RoutineTask) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── 1. CEO Cockpit Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 size-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-black px-3 py-0.5">
                AI 1인 기업 콕핏 시스템
              </span>
              <span className="rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-black px-3 py-0.5">
                곽성진 대표 (르글라스 · 와인핏)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              AI 업무 루틴 캘린더 &amp; 모바일 원터치 승인
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong>"반복은 AI 직원팀에게, 최종 결정은 나에게"</strong> — 밤새 준비된 콘텐츠와 매장 운영 서식을 모바일에서 1초 만에 승인·발행합니다.
            </p>
          </div>

          {/* 일괄 승인 액션 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {pendingTasks.length > 0 && (
              <Button
                type="button"
                onClick={handleBatchApprove}
                className="h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="size-4 fill-white" />
                <span>오늘 업무 일괄 승인 ({pendingTasks.length}건)</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetPresets}
              className="h-12 rounded-2xl border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              title="초기 루틴 프리셋으로 복원"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>기본 루틴 복구</span>
            </Button>
          </div>
        </div>

        {/* ── 4대 핵심 지표 바 ── */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              <span>승인 대기</span>
            </div>
            <p className="text-xl font-black text-white mt-0.5">{pendingTasks.length}건</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>실행 완료</span>
            </div>
            <p className="text-xl font-black text-white mt-0.5">{approvedTasks.length}건</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>절약된 대표 시간</span>
            </div>
            <p className="text-xl font-black text-white mt-0.5">
              {totalSavedMinutes > 60
                ? `${Math.floor(totalSavedMinutes / 60)}시간 ${totalSavedMinutes % 60}분`
                : `${totalSavedMinutes}분`}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
              <Coins className="size-3.5" />
              <span>토큰 비용 효율</span>
            </div>
            <p className="text-xl font-black text-white mt-0.5">87% 비용 절감</p>
          </div>
        </div>
      </div>

      {/* ── 2. 뷰 모드 탭 (모바일 1초 승인 vs 캘린더 전체 타임라인 vs 4대 AI팀) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('deck')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'deck'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="size-4" />
          <span>📱 모바일 원터치 승인 덱</span>
          {pendingTasks.length > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.2 text-[10px] font-black">
              {pendingTasks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="size-4" />
          <span>📅 주간/월간 캘린더 타임라인</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'teams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="size-4" />
          <span>🤖 4대 AI 직원팀 현황</span>
        </button>
      </div>

      {/* ── 3. 탭별 컨텐츠 ── */}

      {/* TAB 1: 모바일 원터치 승인 덱 */}
      {activeTab === 'deck' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <MobileApprovalDeck
            tasks={tasks}
            onApprove={handleApprove}
            onRevise={handleRevise}
            onSelectTask={handleOpenTask}
          />

          {/* 우측 보조 가이드 & 오늘 실행 완료 목록 */}
          <div className="space-y-4">
            {/* 완료된 업무 목록 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
                <span>✓ 오늘 승인 완료된 업무 ({approvedTasks.length}건)</span>
                <span className="text-[10px] text-emerald-600 font-bold">배포 완료</span>
              </h4>

              {approvedTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  아직 승인된 업무가 없습니다. 좌측 카드를 탭하여 승인해 보세요.
                </p>
              ) : (
                <div className="space-y-2">
                  {approvedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleOpenTask(task)}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <span className="text-slate-500 text-[10px] mr-1">{task.agentAvatar}</span>
                        <span className="font-bold text-slate-800 truncate">{task.title}</span>
                      </div>
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 대표 원칙 카드 */}
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 p-5 space-y-2 text-xs">
              <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-600" />
                <span>곽성진 대표 1인 회사 운영 원칙</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                매번 AI 툴을 켜서 프롬프트를 고민하지 마세요. 매일 정해진 시각에 4대 AI 직원이 초안을 등록해 두면, 대표님은 스마트폰에서 <strong>[승인]</strong> 또는 <strong>[1줄 수정]</strong>만 지시하시면 됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 주간/월간 캘린더 전체 타임라인 */}
      {activeTab === 'calendar' && (
        <CalendarView
          tasks={tasks}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onSelectTask={handleOpenTask}
          selectedAgentFilter={selectedAgentFilter}
          onSelectAgentFilter={setSelectedAgentFilter}
        />
      )}

      {/* TAB 3: 4대 AI 직원팀 현황 */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(Object.keys(AI_AGENT_TEAMS) as AgentRole[]).map((role) => {
            const team = AI_AGENT_TEAMS[role];
            const teamTasks = tasks.filter((t) => t.agentRole === role);
            const teamPending = teamTasks.filter((t) => t.status === 'draft_ready').length;

            return (
              <div
                key={role}
                className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className={`text-xs font-black ${team.color}`}>{team.title}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{team.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                    담당 업무 {teamTasks.length}건
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{team.desc}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">
                    대기 중인 초안: <strong className="text-amber-600">{teamPending}건</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgentFilter(role);
                      setActiveTab('calendar');
                    }}
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>이 팀의 주간 일정 보기</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Task 상세 모달 ── */}
      <TaskDetailModal
        task={selectedTask}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onApprove={handleApprove}
        onRevise={handleRevise}
      />
    </div>
  );
}
