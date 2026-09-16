'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export interface OneToOnePreset {
  id: string;
  name: string;
  partnerName: string;
  partnerCompany: string;
  partnerField: string;
  meetingDate: string;
  meetingPlace: string;
  conversationCore: string;
  myInsight: string;
  synergyPlan: string;
  topic: string;
  keywords: string;
}

export const BNI_ONE_TO_ONE_PRESETS: OneToOnePreset[] = [
  {
    id: 'bangeunju',
    name: '방은주 대표 (금융·자산관리)',
    partnerName: '방은주 대표',
    partnerCompany: '미래에셋 금융서비스 (BNI 마스터 챕터)',
    partnerField: 'CEO 법인 자산관리, 가업승계 및 VIP 재무 컨설팅',
    meetingDate: new Date().toISOString().slice(0, 10),
    meetingPlace: '르글라스 압구정',
    conversationCore:
      '중소기업 CEO들의 가업승계 고민과 절세 플랜에 대한 심도 있는 대화. 단순 상품 판매가 아닌 고객의 생애 주기와 기업 가치를 함께 지키는 파트너십 철학 공유.',
    myInsight:
      '와인바 르글라스나 와인핏의 VIP 고객들에게도 결국 필요한 것은 "신뢰에 기반한 맞춤형 가치 제안"이라는 점을 다시금 절감함. 고객의 진짜 고민에 귀 기울이는 상담 프레임워크를 사업에 적용하기로 결심.',
    synergyPlan:
      '미래에셋 VIP 고객 대상 프라이빗 와인 클래스 및 CEO 비즈니스 살롱 공동 개최 논의. 르글라스 프라이빗 룸에서 법인 컨설팅과 와인 페어링을 결합한 세미나 기획.',
    topic: '[BNI 원투원] 미래에셋 방은주 대표님과의 만남 - CEO 법인 자산관리와 VIP 와인 페어링의 비즈니스 시너지',
    keywords: 'BNI원투원, 121미팅, 방은주대표, 미래에셋, 법인자산관리, 르글라스, 비즈니스네트워킹',
  },
  {
    id: 'anchanmin',
    name: '안찬민 대표 (인테리어·시공)',
    partnerName: '안찬민 대표',
    partnerCompany: '디자인스페이스 (BNI 마스터 챕터)',
    partnerField: '하이엔드 상업공간 및 주거 인테리어 설계·시공',
    meetingDate: new Date().toISOString().slice(0, 10),
    meetingPlace: '압구정 로데오 카페',
    conversationCore:
      '상업공간에서 고객의 체류 시간을 늘리고 객단가를 높이는 공간 브랜딩과 조명 설계의 디테일. 시공 이후에도 이어지는 철저한 하자보수와 고객 만족 원칙.',
    myInsight:
      '공간이 곧 브랜드의 메시지라는 점. 르글라스 매장 내부의 조도와 동선 하나하나가 손님들의 와인 경험에 미치는 영향을 공간 전문가의 시각에서 새롭게 배움.',
    synergyPlan:
      '신규 오픈하는 고급 와인바 및 레스토랑 인테리어 프로젝트에 와인 셀러 구성 및 글라스웨어 컨설팅 상생 협업 진행. 안 대표님 완공 현장에 오픈 축하 와인 선물 큐레이션 제휴.',
    topic: '[BNI 원투원] 디자인스페이스 안찬민 대표님과의 만남 - 공간의 디테일이 고객의 경험을 완성한다',
    keywords: 'BNI원투원, 121미팅, 안찬민대표, 상업인테리어, 공간브랜딩, 르글라스, 협업시너지',
  },
];

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
  // 블록 포함 토글
  const [includePartnerIntro, setIncludePartnerIntro] = useState(true);
  const [includeConversation, setIncludeConversation] = useState(true);
  const [includeInsight, setIncludeInsight] = useState(true);
  const [includeSynergy, setIncludeSynergy] = useState(true);
  const [includeLocationMap, setIncludeLocationMap] = useState(true);

  const handleField = (key: string, val: string) => {
    onCustomFieldsChange({
      ...customFields,
      [key]: val,
    });
  };

  const applyPreset = (preset: OneToOnePreset) => {
    onCustomFieldsChange({
      ...customFields,
      partnerName: preset.partnerName,
      partnerCompany: preset.partnerCompany,
      partnerField: preset.partnerField,
      meetingDate: preset.meetingDate,
      meetingPlace: preset.meetingPlace,
      conversationCore: preset.conversationCore,
      myInsight: preset.myInsight,
      synergyPlan: preset.synergyPlan,
    });
    onTopicChange(preset.topic);
    onRequiredKeywordsChange(preset.keywords);
    if (onTargetAudienceChange) {
      onTargetAudienceChange('BNI 멤버, 기업 대표님 및 사업가, 비즈니스 네트워킹 관심자');
    }
    toast.success(`🤝 '${preset.name}' 데이터가 원투원 폼에 자동 입력되었습니다!`);
  };

  const resetFields = () => {
    onCustomFieldsChange({
      ...customFields,
      partnerName: '',
      partnerCompany: '',
      partnerField: '',
      meetingDate: new Date().toISOString().slice(0, 10),
      meetingPlace: '',
      conversationCore: '',
      myInsight: '',
      synergyPlan: '',
    });
    toast.info('원투원 입력 필드가 초기화되었습니다.');
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-4 sm:p-5 shadow-xs">
      {/* ── 1. Header & Fast Presets ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-indigo-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Handshake className="size-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900">
              BNI 원투원 (121 미팅) 전용 워크스페이스
            </h3>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              P-S-I 스토리 공식
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            대표님과의 만남에서 나눈 대화와 배운 점을 기록하여 품격 있는 비즈니스 블로그 글로 완성합니다.
          </p>
        </div>

        {/* 빠른 프리셋 버튼들 */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {BNI_ONE_TO_ONE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95"
            >
              <Sparkles className="size-3 text-indigo-500" />
              <span>{preset.partnerName} 예시</span>
            </button>
          ))}
          <button
            type="button"
            onClick={resetFields}
            className="rounded-xl border border-slate-200 bg-white p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="초기화"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. 파트너 대표님 기본 정보 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Users className="size-3.5 text-indigo-600" />
            파트너 대표님 성함 <span className="text-rose-500">*</span>
          </Label>
          <Input
            value={customFields.partnerName || ''}
            onChange={(e) => handleField('partnerName', e.target.value)}
            placeholder="예: 방은주 대표"
            className="h-8 text-xs bg-white"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Building2 className="size-3.5 text-indigo-600" />
            회사명 / 챕터
          </Label>
          <Input
            value={customFields.partnerCompany || ''}
            onChange={(e) => handleField('partnerCompany', e.target.value)}
            placeholder="예: 미래에셋 (BNI 마스터 챕터)"
            className="h-8 text-xs bg-white"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Lightbulb className="size-3.5 text-amber-500" />
            전문분야 / 강점
          </Label>
          <Input
            value={customFields.partnerField || ''}
            onChange={(e) => handleField('partnerField', e.target.value)}
            placeholder="예: CEO 법인 자산관리 및 가업승계"
            className="h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* ── 3. 미팅 일시 및 장소 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-slate-500" />
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
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <MapPin className="size-3.5 text-rose-500" />
            미팅 장소
          </Label>
          <Input
            value={customFields.meetingPlace || ''}
            onChange={(e) => handleField('meetingPlace', e.target.value)}
            placeholder="예: 르글라스 압구정 (서울 강남구 압구정로)"
            className="h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* ── 4. 핵심 대화 & 비즈니스 인사이트 (원투원의 알맹이) ── */}
      <div className="space-y-2.5 pt-1">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MessageSquareText className="size-3.5 text-blue-600" />
            <span>오늘 나눈 대화의 핵심 &amp; 인상 깊었던 이야기</span>
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
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Lightbulb className="size-3.5 text-amber-600" />
              <span>나의 인사이트 (내 사업에 적용할 점)</span>
            </Label>
            <Textarea
              value={customFields.myInsight || ''}
              onChange={(e) => handleField('myInsight', e.target.value)}
              placeholder="만남을 통해 얻은 깨달음이나 내 사업(와인핏/르글라스)에 적용하고 싶은 점"
              rows={2}
              className="text-xs bg-white resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Handshake className="size-3.5 text-emerald-600" />
              <span>상생 협업 / 다음 약속</span>
            </Label>
            <Textarea
              value={customFields.synergyPlan || ''}
              onChange={(e) => handleField('synergyPlan', e.target.value)}
              placeholder="서로 주고받을 수 있는 비즈니스 도움, 추천 리퍼럴 또는 다음 약속한 일"
              rows={2}
              className="text-xs bg-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── 5. 원투원 블록 포함 체크리스트 (토글) ── */}
      <div className="pt-2 border-t border-indigo-100/80">
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
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includePartnerIntro}
              onChange={(e) => setIncludePartnerIntro(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">① 만남 배경 &amp; 대표님 소개</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeConversation}
              onChange={(e) => setIncludeConversation(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">② 대화 핵심 &amp; 스토리</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeInsight}
              onChange={(e) => setIncludeInsight(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">③ 나의 비즈니스 인사이트</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeSynergy}
              onChange={(e) => setIncludeSynergy(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">④ 상생 협업 &amp; 리퍼럴 기회</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeLocationMap}
              onChange={(e) => setIncludeLocationMap(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">⑤ 미팅 장소 및 파트너사 지도 안내</span>
          </label>
        </div>
      </div>
    </div>
  );
}
