'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Sparkles,
  Send,
  SkipForward,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Coins,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoutineTask, AI_AGENT_TEAMS } from '@/types/routine-calendar';
import { toast } from 'sonner';
import Link from 'next/link';

interface MobileApprovalDeckProps {
  tasks: RoutineTask[];
  onApprove: (taskId: string) => void;
  onRevise: (taskId: string, feedback: string) => void;
  onSelectTask: (task: RoutineTask) => void;
}

export function MobileApprovalDeck({
  tasks,
  onApprove,
  onRevise,
  onSelectTask,
}: MobileApprovalDeckProps) {
  const pendingTasks = tasks.filter((t) => t.status === 'draft_ready');
  const [activeReviseId, setActiveReviseId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (pendingTasks.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 p-8 text-center shadow-xs">
        <div className="size-14 mx-auto mb-3 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="text-base font-black text-slate-900">
          오늘 대기 중인 모든 AI 업무 승인 완료!
        </h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
          곽성진 대표님의 4대 AI 직원팀이 작성한 모든 콘텐츠와 업무 서식이 성공적으로 발행·배포되었습니다.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <span>총 {tasks.filter((t) => t.status === 'approved').length}건 실행 완료</span>
          <span>·</span>
          <span>약 {tasks.filter((t) => t.status === 'approved').reduce((acc, c) => acc + c.estimatedSavedMinutes, 0)}분 시간 절약</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-sm font-black text-slate-900">
            모바일 원터치 승인 대기 ({pendingTasks.length}건)
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          1초 탭으로 즉시 실행
        </span>
      </div>

      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {pendingTasks.map((task) => {
            const team = AI_AGENT_TEAMS[task.agentRole];
            const isExpanded = expandedId === task.id;
            const isRevising = activeReviseId === task.id;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition space-y-3.5"
              >
                {/* Header: Team & Target Platform */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{task.agentAvatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black text-xs ${team.color}`}>
                          {task.agentName}
                        </span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {task.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                    {task.targetPlatform}
                  </span>
                </div>

                {/* Task Title & Summary */}
                <div>
                  <h4
                    onClick={() => onSelectTask(task)}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer leading-snug"
                  >
                    {task.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {task.summary}
                  </p>
                </div>

                {/* Efficiency Badges */}
                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5">
                    <Clock className="size-3" />
                    {task.estimatedSavedMinutes}분 절약
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 text-purple-700 font-semibold px-2 py-0.5">
                    <Coins className="size-3" />
                    효율 {task.tokenEfficiencyScore}점
                  </span>
                  {task.studioUrl && (
                    <Link
                      href={task.studioUrl}
                      className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-400 hover:text-indigo-600"
                    >
                      <span>스튜디오</span>
                      <ExternalLink className="size-2.5" />
                    </Link>
                  )}
                </div>

                {/* Expandable Draft Preview */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : task.id)}
                    className="w-full px-3.5 py-2 flex items-center justify-between text-[11px] font-bold text-slate-700 hover:bg-slate-100/80 transition"
                  >
                    <span>{isExpanded ? '초안 접기' : 'AI 작성 초안 미리보기'}</span>
                    {isExpanded ? (
                      <ChevronUp className="size-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="size-3.5 text-slate-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-3.5 border-t border-slate-200/60 bg-white font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {task.draftContent}
                    </div>
                  )}
                </div>

                {/* Revision Inline Input */}
                {isRevising && (
                  <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <label className="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                      <MessageSquarePlus className="size-3 text-purple-600" />
                      <span>AI 직원팀에 1줄 수정 지시</span>
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="예: 2번 와인 빈티지 2021년으로 바꾸고 글자수 조금 줄여줘"
                        className="text-xs h-9 bg-white"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (feedbackText.trim()) {
                            onRevise(task.id, feedbackText.trim());
                            setActiveReviseId(null);
                            setFeedbackText('');
                            toast.success('✍️ 수정 지시가 AI 직원팀에 전달되었습니다.');
                          }
                        }}
                        className="h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      >
                        <Send className="size-3 mr-1" />
                        전송
                      </Button>
                    </div>
                  </div>
                )}

                {/* 3 Main Action Buttons (Mobile First) */}
                <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto] gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => {
                      onApprove(task.id);
                      toast.success(`🎉 '${task.title}' 승인 완료! 즉시 발행/전송되었습니다.`);
                    }}
                    className="h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>👍 승인 &amp; 즉시 실행</span>
                  </Button>

                  <div className="flex gap-1.5 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setActiveReviseId(isRevising ? null : task.id);
                        setFeedbackText('');
                      }}
                      className={`h-11 px-3.5 rounded-2xl border-slate-200 text-xs font-bold ${
                        isRevising
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquarePlus className="size-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">1줄 수정</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onSelectTask(task)}
                      className="h-11 px-3 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 text-xs"
                      title="전체 상세 보기"
                    >
                      <Sparkles className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
