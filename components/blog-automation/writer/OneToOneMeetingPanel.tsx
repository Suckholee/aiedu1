'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Calendar as CalendarIcon,
  MapPin,
  MessageSquareText,
  Lightbulb,
  Handshake,
  Sparkles,
  CheckSquare,
  RotateCcw,
  Target,
  Award,
  FileText,
  UserPlus,
  Edit3,
  Check,
  Briefcase,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Mic,
  FileAudio,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  BniAttendee,
  getBniAttendees,
  DEFAULT_BNI_ATTENDEES,
} from '@/lib/blog-automation/bni-attendee-storage';
import { AttendeeManageModal } from './AttendeeManageModal';

interface OneToOneMeetingPanelProps {
  customFields: Record<string, string>;
  onCustomFieldsChange: (fields: Record<string, string>) => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  requiredKeywords: string;
  onRequiredKeywordsChange: (keywords: string) => void;
  onTargetAudienceChange?: (audience: string) => void;
}

export function OneToOneMeetingPanel({
  customFields,
  onCustomFieldsChange,
  topic,
  onTopicChange,
  requiredKeywords,
  onRequiredKeywordsChange,
  onTargetAudienceChange,
}: OneToOneMeetingPanelProps) {
  const { user } = useAuth();

  // 참석자 목록 및 선택 상태 (목업 배제, 사용자 등록 파트너만 관리)
  const [attendees, setAttendees] = useState<BniAttendee[]>([]);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<BniAttendee | null>(null);

  // 블록 포함 토글 상태
  const [includePartnerIntro, setIncludePartnerIntro] = useState(true);
  const [includeStrength, setIncludeStrength] = useState(true);
  const [includeConversation, setIncludeConversation] = useState(true);
  const [includeInsight, setIncludeInsight] = useState(true);
  const [includeSynergy, setIncludeSynergy] = useState(true);
  const [includeLocationMap, setIncludeLocationMap] = useState(true);

  // 🌟 세로 공간 절약용 접기/펼치기 상태
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isPreSheetExpanded, setIsPreSheetExpanded] = useState(false);

  // 🎙️ 녹음본 텍스트(클로바노트) AI 분석 상태
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState(false);

  const handleAnalyzeTranscript = async () => {
    const transcript = customFields.meetingTranscript;
    if (!transcript || !transcript.trim()) {
      toast.error('분석할 녹음본 대화 텍스트(클로바노트 전사본)를 먼저 입력해주세요.');
      return;
    }

    setIsAnalyzingTranscript(true);
    try {
      const res = await fetch('/api/blog-auto/writer/parse-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          partnerName: customFields.partnerName || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '녹음본 텍스트 분석에 실패했습니다.');
      }

      const { data } = await res.json();
      if (data) {
        onCustomFieldsChange({
          ...customFields,
          conversationCore: data.conversationCore || customFields.conversationCore || '',
          myInsight: data.myInsight || customFields.myInsight || '',
          synergyPlan: data.synergyPlan || customFields.synergyPlan || '',
          targetReferral: customFields.targetReferral || data.targetReferral || '',
          partnerStrength: customFields.partnerStrength || data.partnerStrength || '',
        });
        toast.success('🎙️ 녹음본 대화에서 핵심 이야기, 인사이트, 상생 협업 내용을 성공적으로 추출했습니다!');
      }
    } catch (e: any) {
      console.error('Transcript analyze error:', e);
      toast.error(e.message || '녹음본 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzingTranscript(false);
    }
  };

  // 1. 참석자 목록 로드
  useEffect(() => {
    const loadAttendees = async () => {
      try {
        const list = await getBniAttendees(user?.uid);
        if (list) {
          setAttendees(list);
          if (customFields.partnerName) {
            const found = list.find((a) => a.name === customFields.partnerName);
            if (found) setSelectedAttendeeId(found.id);
          }
        }
      } catch (e) {
        console.error('Error loading attendees:', e);
      }
    };
    loadAttendees();
  }, [user]);

  const handleField = (key: string, val: string) => {
    onCustomFieldsChange({
      ...customFields,
      [key]: val,
    });
  };

  // 2. 참석자 선택 시 모든 사전 양식지 정보 폼에 즉시 프리필(Pre-fill)
  const handleSelectAttendee = (att: BniAttendee) => {
    setSelectedAttendeeId(att.id);

    const fullCompany = att.chapter ? `${att.company} (${att.chapter})` : att.company;

    onCustomFieldsChange({
      ...customFields,
      partnerName: att.name,
      partnerCompany: fullCompany,
      partnerField: att.specialty,
      targetReferral: att.targetReferral,
      partnerStrength: att.partnerStrength,
      sheetSummary: att.sheetSummary || '',
      meetingPlace: att.preferredPlace || customFields.meetingPlace || '비즈니스 라운지 카페',
      meetingDate: customFields.meetingDate || new Date().toISOString().slice(0, 10),
    });

    // 추천 글 제목 및 키워드 자동 세팅
    if (!topic || topic.includes('[BNI 원투원]')) {
      const cleanName = att.name.replace(' 대표', '');
      onTopicChange(
        `[BNI 원투원] ${att.company} ${cleanName} 대표님과의 121 미팅 - 비즈니스 시너지와 인사이트`
      );
    }

    if (!requiredKeywords || requiredKeywords.includes('BNI원투원')) {
      const cleanName = att.name.replace(' 대표', '');
      onRequiredKeywordsChange(
        `BNI원투원, 121미팅, ${att.company}, ${cleanName}대표, 비즈니스네트워킹, 상생협업`
      );
    }

    if (onTargetAudienceChange) {
      onTargetAudienceChange('BNI 멤버, 기업 대표님 및 사업가, 비즈니스 네트워킹 관심자');
    }

    toast.success(`🤝 '${att.name}' 대표님의 사전 양식지 정보가 자동 적용되었습니다.`);
  };

  // 모달 열기 (신규 등록)
  const handleOpenAddModal = () => {
    setEditingAttendee(null);
    setModalOpen(true);
  };

  // 모달 열기 (수정)
  const handleOpenEditModal = (att: BniAttendee) => {
    setEditingAttendee(att);
    setModalOpen(true);
  };

  // 모달에서 저장 완료 후 콜백
  const handleAttendeeSaved = (saved: BniAttendee) => {
    setAttendees((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    handleSelectAttendee(saved);
  };

  // 모달에서 삭제 완료 후 콜백
  const handleAttendeeDeleted = (deletedId: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== deletedId));
    if (selectedAttendeeId === deletedId) {
      setSelectedAttendeeId(null);
      resetFields();
    }
  };

  const resetFields = () => {
    setSelectedAttendeeId(null);
    onCustomFieldsChange({
      ...customFields,
      partnerName: '',
      partnerCompany: '',
      partnerField: '',
      targetReferral: '',
      partnerStrength: '',
      sheetSummary: '',
      meetingDate: new Date().toISOString().slice(0, 10),
      meetingPlace: '',
      conversationCore: '',
      myInsight: '',
      synergyPlan: '',
    });
    toast.info('원투원 양식이 비워졌습니다. 새 참석자를 선택하거나 직접 입력하세요.');
  };

  const currentAttendee = attendees.find((a) => a.id === selectedAttendeeId);

  return (
    <div className="space-y-4 rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-3.5 sm:p-5 shadow-xs">
      {/* ── 1. 헤더 (BNI 원투원 양식) ── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-indigo-100 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shrink-0">
            <Handshake className="size-4" />
          </span>
          <h3 className="text-sm font-black text-slate-900 break-keep whitespace-nowrap">
            BNI 원투원 양식 (121 미팅)
          </h3>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 whitespace-nowrap shrink-0">
            실제 참석자 양식지 연동
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="size-3 text-indigo-500" />
            <span>+ 새 참석자/양식지 등록</span>
          </button>
          <button
            type="button"
            onClick={resetFields}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition whitespace-nowrap"
            title="양식 비우기"
          >
            <RotateCcw className="size-3 text-slate-400" />
            <span>양식 비우기</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. 회의 참석자(파트너) 선택 바 (실제 등록된 대표님만 표시) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-indigo-600" />
            <span>회의 참석자(파트너) 선택</span>
          </span>
          {attendees.length > 0 && (
            <span className="text-[10px] text-slate-400">
              총 {attendees.length}명의 파트너 등록됨
            </span>
          )}
        </div>

        {attendees.length === 0 ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-indigo-200/80 bg-indigo-50/30 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">
              아직 등록된 파트너가 없습니다.
            </span>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <UserPlus className="size-3" />
              <span>+ 실제 파트너 양식지 등록</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {attendees.map((att) => {
              const isSelected = selectedAttendeeId === att.id;
              return (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => handleSelectAttendee(att)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  {isSelected && <Check className="size-3 text-white" />}
                  <span>{att.name}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {att.company}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌟 3. 회의 참석자 요약 바 (컴팩트 접이식 - 세로 공간 절약) */}
      {currentAttendee && (
        <div className="rounded-xl border border-indigo-200 bg-white p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-2xs shrink-0">
                {currentAttendee.name.slice(0, 1)}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-slate-900">
                    {currentAttendee.name}
                  </h4>
                  <span className="rounded bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 text-[9.5px] font-bold text-indigo-700">
                    {currentAttendee.company}
                  </span>
                  {currentAttendee.chapter && (
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      ({currentAttendee.chapter})
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-indigo-900/80 font-medium truncate">
                  💼 {currentAttendee.specialty || '전문 분야'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 px-2 py-1 text-[10.5px] font-bold transition-all active:scale-95"
              >
                {isSummaryExpanded ? (
                  <>
                    <span>요약 접기</span>
                    <ChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    <span>양식지 확인</span>
                    <ChevronDown className="size-3" />
                  </>
                )}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEditModal(currentAttendee)}
                className="h-6 px-1.5 text-[10.5px] text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                title="참석자 양식지 직접 수정"
              >
                <Edit3 className="size-3 mr-0.5" />
                수정
              </Button>
            </div>
          </div>

          {/* 세부 양식지 펼침 영역 */}
          {isSummaryExpanded && (
            <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-rose-50/60 border border-rose-100 p-2 space-y-0.5">
                  <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                    <Target className="size-3 text-rose-600" />
                    <span>이상적인 리퍼럴 (소개 희망 고객)</span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                    {currentAttendee.targetReferral || '미등록'}
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50/60 border border-amber-100 p-2 space-y-0.5">
                  <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                    <Award className="size-3 text-amber-600" />
                    <span>차별화된 핵심 강점 &amp; 경쟁력</span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                    {currentAttendee.partnerStrength || '미등록'}
                  </p>
                </div>
              </div>

              {currentAttendee.sheetSummary && (
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700 mr-1">📄 사전 양식지 메모:</span>
                  <span>{currentAttendee.sheetSummary}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🌟 4. [핵심 입력] 오늘 대화 내용 & 비즈니스 인사이트 (최상단 전면 배치) ── */}
      <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-b from-indigo-50/60 via-white to-purple-50/20 p-3 sm:p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
            <MessageSquareText className="size-4 text-indigo-600" />
            <span>오늘 나눈 대화 내용 &amp; 비즈니스 인사이트 (121 미팅 메모)</span>
          </div>
          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
            실제 대화 메모 반영
          </span>
        </div>

        {/* 🎙️ 클로바노트 / 녹음본 텍스트 전문 입력 및 AI 자동 분석 박스 */}
        <div className="rounded-xl border border-indigo-200 bg-white p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
              <Mic className="size-3.5 text-rose-500 animate-pulse" />
              <span>🎙️ 녹음본 대화 전문 (클로바노트 / STT 텍스트)</span>
              <span className="text-[9.5px] font-normal text-slate-500">
                (원문 그대로 붙여넣기)
              </span>
            </Label>
            {customFields.meetingTranscript && (
              <button
                type="button"
                onClick={() => handleField('meetingTranscript', '')}
                className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
              >
                지우기
              </button>
            )}
          </div>

          <Textarea
            value={customFields.meetingTranscript || ''}
            onChange={(e) => handleField('meetingTranscript', e.target.value)}
            placeholder="클로바노트, 비토, 스마트폰 음성메모에서 복사한 대화 텍스트 전문을 여기에 그대로 붙여넣으세요. (AI가 자동으로 대화 핵심, 인사이트, 협업 약속을 분석해 드립니다)"
            rows={3}
            className="text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-colors resize-y leading-relaxed"
          />

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-[10px] text-slate-500 leading-tight">
              💡 붙여넣고 버튼을 누르면 아래 항목들이 자동 요약 입력됩니다.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={isAnalyzingTranscript || !customFields.meetingTranscript?.trim()}
              onClick={handleAnalyzeTranscript}
              className="h-7 text-xs px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-2xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              {isAnalyzingTranscript ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>대화 분석 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="size-3 text-yellow-300" />
                  <span>⚡ AI 대화 분석 &amp; 자동 채우기</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-800">
            오늘 나눈 대화의 핵심 &amp; 인상 깊었던 이야기
          </Label>
          <Textarea
            value={customFields.conversationCore || ''}
            onChange={(e) => handleField('conversationCore', e.target.value)}
            placeholder="오늘 어떤 주제로 이야기했는지, 대표님의 이야기 중 기억에 남는 실제 메모를 적어주세요."
            rows={2}
            className="text-xs bg-white resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Lightbulb className="size-3 text-amber-500" />
              나의 비즈니스 인사이트 (내 사업에 적용할 점)
            </Label>
            <Textarea
              value={customFields.myInsight || ''}
              onChange={(e) => handleField('myInsight', e.target.value)}
              placeholder="만남을 통해 얻은 깨달음이나 내 사업에 적용하고 싶은 점"
              rows={2}
              className="text-xs bg-white resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Handshake className="size-3 text-emerald-600" />
              상생 협업 / 다음 약속
            </Label>
            <Textarea
              value={customFields.synergyPlan || ''}
              onChange={(e) => handleField('synergyPlan', e.target.value)}
              placeholder="서로 주고받을 수 있는 비즈니스 소개, 시너지 프로젝트, 다음 약속한 일정"
              rows={2}
              className="text-xs bg-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── 5. 사전 양식지 세부 항목 직접 확인/수정 (선택 접이식 아코디언) ── */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPreSheetExpanded(!isPreSheetExpanded)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-slate-500" />
            <span>사전 양식지 기본 정보 직접 수정 (선택사항)</span>
            <span className="text-[10px] font-normal text-slate-400">
              (파트너 정보 · GAINS · 일시/장소)
            </span>
          </div>
          {isPreSheetExpanded ? (
            <ChevronUp className="size-4 text-slate-400" />
          ) : (
            <ChevronDown className="size-4 text-slate-400" />
          )}
        </button>

        {isPreSheetExpanded && (
          <div className="p-3.5 pt-1 space-y-3 border-t border-slate-200 bg-white animate-in fade-in duration-150">
            {/* 1. 파트너 기본 정보 */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">1. 파트너 대표님 기본 정보</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">성함 *</Label>
                  <Input
                    value={customFields.partnerName || ''}
                    onChange={(e) => handleField('partnerName', e.target.value)}
                    placeholder="예: 홍길동 대표"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">회사명/챕터</Label>
                  <Input
                    value={customFields.partnerCompany || ''}
                    onChange={(e) => handleField('partnerCompany', e.target.value)}
                    placeholder="예: OO솔루션 (BNI 챕터)"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">전문분야</Label>
                  <Input
                    value={customFields.partnerField || ''}
                    onChange={(e) => handleField('partnerField', e.target.value)}
                    placeholder="예: 기업 브랜딩"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* 2. GAINS 프로필 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">2. 비즈니스 프로필 &amp; GAINS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">이상적인 추천 고객 (타겟 리퍼럴)</Label>
                  <Input
                    value={customFields.targetReferral || ''}
                    onChange={(e) => handleField('targetReferral', e.target.value)}
                    placeholder="어떤 고객을 소개받길 원하는지"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">차별화된 핵심 강점 &amp; 경쟁력</Label>
                  <Input
                    value={customFields.partnerStrength || ''}
                    onChange={(e) => handleField('partnerStrength', e.target.value)}
                    placeholder="대표님만의 독보적인 강점"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* 3. 미팅 일시 및 장소 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">3. 미팅 일시 및 장소</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">미팅 일자</Label>
                  <Input
                    type="date"
                    value={customFields.meetingDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => handleField('meetingDate', e.target.value)}
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">미팅 장소</Label>
                  <Input
                    value={customFields.meetingPlace || ''}
                    onChange={(e) => handleField('meetingPlace', e.target.value)}
                    placeholder="예: 비즈니스 라운지 카페"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 8. 블로그 본문 포함 블록 선택 (토글) ── */}
      <div className="pt-2 border-t border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <CheckSquare className="size-3.5 text-indigo-600" />
            블로그 본문 포함 블록 선택
          </span>
          <span className="text-[10px] text-slate-400">
            체크된 항목 중심으로 6단계 서사가 완성됩니다
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includePartnerIntro}
              onChange={(e) => setIncludePartnerIntro(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">① 만남 배경 &amp; 대표님 소개</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeStrength}
              onChange={(e) => setIncludeStrength(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">② 차별화 강점 &amp; 주력 비즈니스</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeConversation}
              onChange={(e) => setIncludeConversation(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">③ 대화 핵심 &amp; 스토리</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeInsight}
              onChange={(e) => setIncludeInsight(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">④ 나의 비즈니스 인사이트</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeSynergy}
              onChange={(e) => setIncludeSynergy(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">⑤ 상생 협업 &amp; 리퍼럴 기회</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeLocationMap}
              onChange={(e) => setIncludeLocationMap(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">⑥ 미팅 장소 및 파트너사 정보 안내</span>
          </label>
        </div>
      </div>

      {/* ── 참석자 등록/수정 모달 ── */}
      <AttendeeManageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        attendee={editingAttendee}
        userId={user?.uid}
        onSaved={handleAttendeeSaved}
        onDeleted={handleAttendeeDeleted}
      />
    </div>
  );
}
