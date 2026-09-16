'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Calendar as CalendarIcon,
  Tag,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';
import { RoutineTask, AI_AGENT_TEAMS } from '@/types/routine-calendar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoogleCalendarEventModalProps {
  task: RoutineTask | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (taskId: string) => Promise<void>;
  onRevise: (taskId: string, feedback: string) => Promise<void>;
  onDelete?: (taskId: string) => void;
}

export function GoogleCalendarEventModal({
  task,
  isOpen,
  onClose,
  onApprove,
  onRevise,
  onDelete,
}: GoogleCalendarEventModalProps) {
  const [copied, setCopied] = useState(false);
  const [showFullDraft, setShowFullDraft] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const team = AI_AGENT_TEAMS[task.agentRole];

  const handleCopy = () => {
    navigator.clipboard.writeText(task.draftContent);
    setCopied(true);
    toast.success('AI 초안 내용이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveClick = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(task.id);
      toast.success('👍 1초 원터치 승인이 완료되었습니다! 즉시 실행 파이프라인으로 전송됩니다.');
      onClose();
    } catch {
      toast.error('승인 처리에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      await onRevise(task.id, feedbackText.trim());
      toast.info('✍️ 수정 지시가 전달되었습니다. AI 에이전트가 재작업합니다.');
      setIsRevising(false);
      setFeedbackText('');
      onClose();
    } catch {
      toast.error('수정 지시 전달에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Calendar format date string
  const formatEventDate = () => {
    const [y, m, d] = task.date.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    const dayName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][dateObj.getDay()];

    const [h, min] = task.time.split(':');
    const hourNum = Number(h);
    const ampm = hourNum >= 12 ? '오후' : '오전';
    const displayH = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    const endH = hourNum + 1 > 12 ? hourNum + 1 - 12 : hourNum + 1;

    return `${y}년 ${m}월 ${d}일 ${dayName} · ${ampm} ${displayH}:${min} ~ ${ampm} ${endH}:${min}`;
  };

  const TEAM_COLORS: Record<string, string> = {
    chief: 'bg-[#6355f6]',
    winefit: 'bg-[#e11d48]',
    le_verre: 'bg-[#059669]',
    growth: 'bg-[#d97706]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Google Calendar Event Card Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Top Colored Bar matching Google Calendar Event color */}
        <div className={`h-2.5 w-full ${TEAM_COLORS[task.agentRole] || 'bg-[#1a73e8]'}`} />

        {/* Top Header Icons (Delete, Studio link, Close) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              <CalendarIcon className="size-3 text-slate-500" />
              AI 루틴 일정
            </span>
            {task.status === 'draft_ready' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 animate-pulse">
                ⏳ 결재 대기
              </span>
            )}
            {task.status === 'approved' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                <CheckCircle2 className="size-3" /> 승인 완료
              </span>
            )}
            {task.status === 'revised' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800">
                ✍️ 수정 요청됨
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            {task.studioUrl && (
              <a
                href={task.studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="전문 실습실 스튜디오로 이동"
                className="grid size-8 place-items-center rounded-full hover:bg-slate-100 transition"
              >
                <ExternalLink className="size-4 text-indigo-600" />
              </a>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('이 AI 루틴 일정을 삭제하시겠습니까?')) {
                    onDelete(task.id);
                    toast.info('일정이 삭제되었습니다.');
                    onClose();
                  }
                }}
                title="삭제"
                className="grid size-8 place-items-center rounded-full hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <Trash2 className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="닫기"
              className="grid size-8 place-items-center rounded-full hover:bg-slate-100 text-slate-600 transition"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title & Agent Avatar */}
          <div className="flex items-start gap-3">
            <div className="text-2xl pt-0.5">{task.agentAvatar}</div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {task.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {formatEventDate()}
              </p>
              <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                🔁 매주 반복되는 AI 자동 루틴
              </p>
            </div>
          </div>

          {/* Calendar & Details Info Rows */}
          <div className="space-y-2.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Tag className="size-3.5" /> 캘린더 / 담당팀:
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <span
                  className={`size-2 rounded-full ${TEAM_COLORS[task.agentRole] || 'bg-blue-600'}`}
                />
                {team?.name || task.agentName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> 발행 대상 채널:
              </span>
              <span className="font-bold text-indigo-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                {task.targetPlatform}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="size-3.5" /> 대표 예상 절약 시간:
              </span>
              <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                약 {task.estimatedSavedMinutes}분 절약
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800">📋 AI 보고 요약</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              {task.summary}
            </p>
          </div>

          {/* Full Draft Section Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFullDraft(!showFullDraft)}
                className="text-xs font-bold text-[#1a73e8] hover:underline"
              >
                {showFullDraft ? '▲ 초안 원문 접기' : '▼ AI 작성 초안 전문 보기'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>초안 복사</span>
                  </>
                )}
              </button>
            </div>

            {showFullDraft && (
              <pre className="mt-2 max-h-56 overflow-y-auto rounded-xl bg-slate-900 p-3.5 text-xs text-slate-100 font-mono whitespace-pre-wrap leading-relaxed">
                {task.draftContent}
              </pre>
            )}
          </div>

          {/* Revision Input if Open */}
          {isRevising && (
            <form onSubmit={handleReviseSubmit} className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <AlertCircle className="size-3.5 text-amber-600" />
                대표 1줄 수정 지시 입력
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="예: 조금 더 위트있는 말투로 3문장 추가해줘"
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl"
                >
                  <Send className="size-3.5 mr-1" /> 전송
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <button
            type="button"
            onClick={() => setIsRevising(!isRevising)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            {isRevising ? '지시 취소' : '✍️ 1줄 수정 지시'}
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-600"
            >
              닫기
            </Button>

            {task.status !== 'approved' && (
              <Button
                type="button"
                onClick={handleApproveClick}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#1a73e8] to-indigo-600 hover:brightness-105 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <ThumbsUp className="size-3.5" />
                <span>1초 승인 &amp; 즉시 실행</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
