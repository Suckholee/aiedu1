'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Clock,
  Coins,
  Send,
  MessageSquarePlus,
  Share2,
} from 'lucide-react';
import { RoutineTask, AI_AGENT_TEAMS } from '@/types/routine-calendar';
import { toast } from 'sonner';
import Link from 'next/link';

interface TaskDetailModalProps {
  task: RoutineTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (taskId: string) => void;
  onRevise: (taskId: string, feedback: string) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onApprove,
  onRevise,
}: TaskDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  if (!task) return null;

  const team = AI_AGENT_TEAMS[task.agentRole];
  const isPending = task.status === 'draft_ready';
  const isApproved = task.status === 'approved';

  const handleCopyDraft = async () => {
    await navigator.clipboard.writeText(task.draftContent);
    setCopied(true);
    toast.success('📋 AI 작성 초안이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-5 sm:p-6 bg-white rounded-3xl space-y-4">
        <DialogHeader className="pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-xl">{task.agentAvatar}</span>
              <span className={`font-black ${team.color}`}>{task.agentName}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-semibold">{task.time}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold">
                {task.targetPlatform}
              </span>
              {isApproved ? (
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 text-[11px]">
                  ✓ 승인 완료
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 text-amber-800 font-black px-2.5 py-0.5 text-[11px]">
                  승인 대기
                </span>
              )}
            </div>
          </div>

          <DialogTitle className="text-base sm:text-lg font-black text-slate-900 leading-snug">
            {task.title}
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">{task.summary}</p>
        </DialogHeader>

        {/* ── 성능 & 효율 지표 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <Clock className="size-3.5" />
              <span>절약된 시간</span>
            </div>
            <p className="text-base font-black mt-0.5">{task.estimatedSavedMinutes}분</p>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-purple-950">
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600">
              <Coins className="size-3.5" />
              <span>토큰 비용 효율</span>
            </div>
            <p className="text-base font-black mt-0.5">{task.tokenEfficiencyScore}점 (최상)</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-slate-500">배정된 에이전트</div>
            <p className="text-xs font-black mt-1 truncate">{team.title}</p>
          </div>
        </div>

        {/* ── AI 작성 초안 본문 ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-indigo-600" />
              <span>AI 직원팀 작성 결과물</span>
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyDraft}
              className="h-7 px-2.5 text-xs font-bold bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 rounded-lg gap-1"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              <span>{copied ? '복사 완료' : '전체 복사'}</span>
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto shadow-inner">
            {task.draftContent}
          </div>
        </div>

        {/* ── 1줄 수정 지시 영역 ── */}
        {showFeedbackInput && (
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
            <label className="text-xs font-bold text-purple-950 flex items-center gap-1">
              <MessageSquarePlus className="size-3.5 text-purple-600" />
              <span>AI 팀에 1줄 수정 피드백 지시</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="예: 와인 가격대 언급을 추가하고, 도입부를 조금 더 경쾌하게 바꿔줘"
                className="text-xs h-9 bg-white"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => {
                  if (feedback.trim()) {
                    onRevise(task.id, feedback.trim());
                    setShowFeedbackInput(false);
                    setFeedback('');
                    toast.success('✍️ 수정 지시가 반영되었습니다.');
                  }
                }}
                className="h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                <Send className="size-3 mr-1" />
                지시
              </Button>
            </div>
          </div>
        )}

        {/* ── 하단 액션 버튼 ── */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {task.studioUrl ? (
            <Link
              href={task.studioUrl}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600"
            >
              <span>전문 스튜디오에서 더 정밀 편집하기</span>
              <ExternalLink className="size-3" />
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isPending && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                className="h-10 rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex-1 sm:flex-initial"
              >
                <MessageSquarePlus className="size-3.5 mr-1" />
                <span>1줄 수정 지시</span>
              </Button>
            )}

            {isPending ? (
              <Button
                type="button"
                onClick={() => {
                  onApprove(task.id);
                  onOpenChange(false);
                  toast.success(`🎉 '${task.title}' 승인 완료!`);
                }}
                className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-5 shadow-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>👍 승인 &amp; 즉시 실행</span>
              </Button>
            ) : (
              <Button
                disabled
                className="h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs px-5"
              >
                ✓ 이미 승인된 업무입니다
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
