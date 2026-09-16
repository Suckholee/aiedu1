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
  Info,
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

  // 참석자 목록 및 선택 상태
  const [attendees, setAttendees] = useState<BniAttendee[]>(DEFAULT_BNI_ATTENDEES);
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

  // 1. 참석자 목록 로드
  useEffect(() => {
    const loadAttendees = async () => {
      try {
        const list = await getBniAttendees(user?.uid);
        if (list && list.length > 0) {
          setAttendees(list);
          // 만약 폼에 이미 partnerName이 있으면 매칭 시도, 없으면 첫 번째 선택
          if (!customFields.partnerName && list.length > 0) {
            handleSelectAttendee(list[0]);
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
      <div className="flex flex-col gap-2 pb-3 border-b border-indigo-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
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
        <p className="text-[11px] text-slate-500 break-keep">
          회의 참석자를 선택하면 상대방 대표님의 121 양식지 정보가 자동으로 입력됩니다. 미팅 후 대화 메모와 나의 배움만 기록하면 완벽한 블로그 글이 완성됩니다.
        </p>
      </div>

      {/* 🌟 2. 회의 참석자(파트너) 선택 바 (Directory Pills) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-indigo-600" />
            <span>회의 참석자(파트너) 선택</span>
          </span>
          <span className="text-[10px] text-slate-400">
            총 {attendees.length}명의 파트너 등록됨
          </span>
        </div>

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
      </div>

      {/* 🌟 3. 회의 참석자 요약 카드 (Attendee Summary Card) */}
      {currentAttendee && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-3.5 sm:p-4 shadow-sm space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-xs shrink-0">
                {currentAttendee.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-slate-900">
                    {currentAttendee.name}
                  </h4>
                  <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {currentAttendee.company}
                  </span>
                  {currentAttendee.chapter && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {currentAttendee.chapter}
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-900/80 font-semibold mt-0.5">
                  💼 {currentAttendee.specialty || '전문 분야'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditModal(currentAttendee)}
              className="h-7 text-xs border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 gap-1 shrink-0"
            >
              <Edit3 className="size-3" />
              <span>양식지 수정</span>
            </Button>
          </div>

          {/* 사전 양식지 핵심 요약 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-2.5 space-y-0.5">
              <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                <Target className="size-3 text-rose-600" />
                <span>이상적인 리퍼럴 (소개 희망 고객)</span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {currentAttendee.targetReferral || '미등록 (양식지 수정에서 입력 가능)'}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-2.5 space-y-0.5">
              <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                <Award className="size-3 text-amber-600" />
                <span>차별화된 핵심 강점 &amp; 경쟁력</span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {currentAttendee.partnerStrength || '미등록 (양식지 수정에서 입력 가능)'}
              </p>
            </div>
          </div>

          {currentAttendee.sheetSummary && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-600">
              <span className="font-bold text-slate-700 mr-1">📄 사전 양식지 메모:</span>
              <span>{currentAttendee.sheetSummary}</span>
            </div>
          )}
        </div>
      )}

      {/* ── 4. 파트너 기본 정보 (자동 프리필 & 직접 수정 가능) ── */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Users className="size-3.5 text-indigo-600" />
          <span>1. 파트너 대표님 기본 정보</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              파트너 대표님 성함 <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={customFields.partnerName || ''}
              onChange={(e) => handleField('partnerName', e.target.value)}
              placeholder="예: 홍길동 대표"
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <Building2 className="size-3 text-slate-500" />
              회사명 / 소속 챕터
            </Label>
            <Input
              value={customFields.partnerCompany || ''}
              onChange={(e) => handleField('partnerCompany', e.target.value)}
              placeholder="예: OO솔루션 (BNI 챕터명)"
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <FileText className="size-3 text-slate-500" />
              전문분야 / 주력 사업
            </Label>
            <Input
              value={customFields.partnerField || ''}
              onChange={(e) => handleField('partnerField', e.target.value)}
              placeholder="예: 기업 브랜딩 및 공간 디자인"
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── 5. 비즈니스 프로필 & 이상적인 리퍼럴 (GAINS) ── */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Target className="size-3.5 text-rose-600" />
          <span>2. 비즈니스 프로필 &amp; 이상적인 리퍼럴 (소개 희망 고객)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              이상적인 추천 고객 (타겟 리퍼럴)
            </Label>
            <Input
              value={customFields.targetReferral || ''}
              onChange={(e) => handleField('targetReferral', e.target.value)}
              placeholder="어떤 고객을 만났을 때 연결해 드리면 가장 좋을까요?"
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <Award className="size-3 text-amber-500" />
              차별화된 핵심 강점 &amp; 경쟁력
            </Label>
            <Input
              value={customFields.partnerStrength || ''}
              onChange={(e) => handleField('partnerStrength', e.target.value)}
              placeholder="경쟁사와 차별화되는 대표님만의 독보적인 강점"
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── 6. 미팅 일시 및 장소 ── */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <CalendarIcon className="size-3.5 text-slate-600" />
          <span>3. 미팅 일시 및 장소</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              미팅 일자
            </Label>
            <Input
              type="date"
              value={customFields.meetingDate || new Date().toISOString().slice(0, 10)}
              onChange={(e) => handleField('meetingDate', e.target.value)}
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <MapPin className="size-3 text-rose-500" />
              미팅 장소
            </Label>
            <Input
              value={customFields.meetingPlace || ''}
              onChange={(e) => handleField('meetingPlace', e.target.value)}
              placeholder="예: 비즈니스 라운지 카페 (서울 강남구)"
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── 7. 대화 내용 & 비즈니스 인사이트 (사용자가 미팅 후 작성할 핵심 메모) ── */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <MessageSquareText className="size-3.5 text-blue-600" />
            <span>4. 대화 내용 및 비즈니스 인사이트 (121 미팅 핵심 메모)</span>
          </div>
          <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded-full">
            여기에 미팅 메모를 입력하세요
          </span>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700">
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
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
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
            <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
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
