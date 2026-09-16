'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Repeat,
  Tag,
  Check,
} from 'lucide-react';
import { RoutineTask, AgentRole, AI_AGENT_TEAMS } from '@/types/routine-calendar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoogleCalendarCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: RoutineTask) => void;
  defaultDate?: string;
}

export function GoogleCalendarCreateModal({
  isOpen,
  onClose,
  onAddTask,
  defaultDate,
}: GoogleCalendarCreateModalProps) {
  const [title, setTitle] = useState('');
  const [agentRole, setAgentRole] = useState<AgentRole>('winefit');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [recurrence, setRecurrence] = useState<'weekly' | 'daily' | 'none'>('weekly');
  const [targetPlatform, setTargetPlatform] = useState('네이버 블로그');
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('일정 제목을 입력해 주세요.');
      return;
    }

    const team = AI_AGENT_TEAMS[agentRole];
    const avatars: Record<AgentRole, string> = {
      chief: '🤵',
      winefit: '🍷',
      le_verre: '🍾',
      growth: '📈',
    };

    const newTask: RoutineTask = {
      id: `task_custom_${Date.now()}`,
      agentRole,
      agentName: team.name,
      agentAvatar: avatars[agentRole],
      title: title.trim(),
      category: agentRole === 'chief' ? 'briefing' : agentRole === 'winefit' ? 'blog' : agentRole === 'le_verre' ? 'store_ops' : 'b2b',
      categoryName: team.title,
      date,
      time,
      status: 'draft_ready',
      summary: instructions.trim() || `${team.title}의 정기 루틴 업무로 AI가 자동으로 초안을 작성했습니다.`,
      draftContent: `[${team.name} 자동 보고서]\n제목: ${title.trim()}\n일시: ${date} ${time}\n지시사항: ${instructions.trim() || '사전 정의된 루틴에 따라 최적화된 결과물 생성 완료'}\n\n■ 상세 초안\n- 곽성진 대표님의 승인 대기 중입니다.\n- '1초 승인' 버튼을 누르면 연동 채널로 즉시 배포/실행됩니다.`,
      targetPlatform,
      estimatedSavedMinutes: 90,
      tokenEfficiencyScore: 92,
      actionNotes: `[새 루틴 등록됨] ${recurrence === 'weekly' ? '매주 반복' : recurrence === 'daily' ? '매일 반복' : '단발성'}`,
      studioUrl: agentRole === 'winefit' ? '/tools/blog' : agentRole === 'chief' ? '/tools/work-automation' : '/tools/work-automation',
    };

    onAddTask(newTask);
    toast.success('📅 새 AI 루틴 일정이 캘린더에 성공적으로 등록되었습니다!');
    onClose();
    setTitle('');
    setInstructions('');
  };

  const PLATFORMS = [
    '네이버 블로그',
    '한잔레터 뉴스레터',
    '유튜브 숏츠 (VisKits)',
    '르글라스 직원 단톡방',
    'B2B 기업 제안서',
    '구글 캘린더 리마인더',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Google Calendar Quick Event Creator */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#1a73e8] text-white">
              <CalendarIcon className="size-4" />
            </span>
            <span className="text-sm font-bold text-slate-800">
              새 AI 루틴 일정 만들기
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Title Input (Large Google Style) */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목 추가 (예: 와인핏 금요 칼럼 발행)"
              className="w-full border-b-2 border-slate-200 pb-2 text-base font-bold text-slate-900 placeholder-slate-400 focus:border-[#1a73e8] focus:outline-none transition"
              autoFocus
            />
          </div>

          {/* 담당 AI 직원팀 선택 */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Tag className="size-3.5 text-indigo-600" />
              담당 AI 직원팀
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(AI_AGENT_TEAMS) as AgentRole[]).map((role) => {
                const team = AI_AGENT_TEAMS[role];
                const isSelected = agentRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setAgentRole(role)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                      isSelected
                        ? 'border-[#1a73e8] bg-blue-50/50 text-[#1a73e8] font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-base">
                      {role === 'chief' ? '🤵' : role === 'winefit' ? '🍷' : role === 'le_verre' ? '🍾' : '📈'}
                    </span>
                    <span className="truncate text-xs font-semibold">
                      {team.name.split(' (')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="size-3.5 text-slate-500" />
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Clock className="size-3.5 text-slate-500" />
                시간
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30"
              />
            </div>
          </div>

          {/* 반복 주기 & 타깃 채널 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Repeat className="size-3.5 text-slate-500" />
                반복 주기
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 bg-white"
              >
                <option value="weekly">매주 반복 (루틴)</option>
                <option value="daily">매일 반복</option>
                <option value="none">반복 안 함 (1회성)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="size-3.5 text-indigo-600" />
                발행 대상 채널
              </label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI 지시사항 / 메모 */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              AI 사전 작성 지시사항 (선택)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="예: 이번 주는 가을 추천 내추럴 와인 3종을 주제로 작성해줘"
              rows={2}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-600"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs"
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
