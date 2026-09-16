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
  Target,
  Award,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

/** BNI 공식 원투원 양식 표준 가이드 샘플 (실제 개인 식별 정보 배제) */
export const BNI_STANDARD_SAMPLE = {
  partnerName: '김대표',
  partnerCompany: '알파브랜딩 (BNI 챕터)',
  partnerField: '기업 브랜딩 및 공간 디자인 디렉팅',
  targetReferral: '신규 사옥 이전 기업, 프리미엄 매장 오픈 준비 중인 F&B 브랜드 대표',
  partnerStrength: '15년 업력의 브랜드 정체성 분석과 감각적인 공간 연출 역량',
  meetingDate: new Date().toISOString().slice(0, 10),
  meetingPlace: '비즈니스 라운지 카페',
  conversationCore:
    '고객의 브랜드 경험을 극대화하는 공간 설계 철학과, 단순 인테리어를 넘어 매출로 연결되는 비즈니스 동선 설계의 노하우 공유.',
  myInsight:
    '공간과 제품이 고객에게 전달하는 일관된 메시지의 중요성을 절감함. 고객과의 첫 접점부터 사후 관리까지 신뢰를 주는 프로세스를 우리 사업에도 적극 반영하기로 함.',
  synergyPlan:
    '신규 오픈하는 프리미엄 고객사 프로젝트에 맞춤형 제휴 및 공동 프로모션 논의. 상호 고객 네트워킹 소개 및 분기별 비즈니스 협력 미팅 진행 약속.',
  topic: '[BNI 원투원] 알파브랜딩 김대표님과의 121 미팅 - 공간 브랜딩이 비즈니스 성장에 미치는 시너지',
  keywords: 'BNI원투원, 121미팅, 비즈니스네트워킹, 공간브랜딩, 비즈니스시너지, 대표인터뷰',
};

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
  // 블록 포함 토글 상태
  const [includePartnerIntro, setIncludePartnerIntro] = useState(true);
  const [includeStrength, setIncludeStrength] = useState(true);
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

  const applyStandardSample = () => {
    onCustomFieldsChange({
      ...customFields,
      partnerName: BNI_STANDARD_SAMPLE.partnerName,
      partnerCompany: BNI_STANDARD_SAMPLE.partnerCompany,
      partnerField: BNI_STANDARD_SAMPLE.partnerField,
      targetReferral: BNI_STANDARD_SAMPLE.targetReferral,
      partnerStrength: BNI_STANDARD_SAMPLE.partnerStrength,
      meetingDate: BNI_STANDARD_SAMPLE.meetingDate,
      meetingPlace: BNI_STANDARD_SAMPLE.meetingPlace,
      conversationCore: BNI_STANDARD_SAMPLE.conversationCore,
      myInsight: BNI_STANDARD_SAMPLE.myInsight,
      synergyPlan: BNI_STANDARD_SAMPLE.synergyPlan,
    });
    onTopicChange(BNI_STANDARD_SAMPLE.topic);
    onRequiredKeywordsChange(BNI_STANDARD_SAMPLE.keywords);
    if (onTargetAudienceChange) {
      onTargetAudienceChange('BNI 멤버, 기업 대표님 및 사업가, 비즈니스 네트워킹 관심자');
    }
    toast.success('🤝 BNI 원투원 표준 예시 데이터가 입력되었습니다.');
  };

  const resetFields = () => {
    onCustomFieldsChange({
      ...customFields,
      partnerName: '',
      partnerCompany: '',
      partnerField: '',
      targetReferral: '',
      partnerStrength: '',
      meetingDate: new Date().toISOString().slice(0, 10),
      meetingPlace: '',
      conversationCore: '',
      myInsight: '',
      synergyPlan: '',
    });
    toast.info('원투원 양식이 비워졌습니다. 실제 미팅 내용을 입력하세요.');
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-3.5 sm:p-5 shadow-xs">
      {/* ── 1. 헤더 (BNI 원투원 양식) & 표준 샘플 액션 ── */}
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
              공식 121 시트 구조
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={applyStandardSample}
              className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="size-3 text-indigo-500" />
              <span>표준 샘플 채우기</span>
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
          BNI 121 미팅 표준 질문 구조에 맞춰 대화 내용과 비즈니스 배움을 기록하면, 신뢰도 높은 네이버 블로그 글로 자동 완성됩니다.
        </p>
      </div>

      {/* ── 2. 파트너 기본 정보 ── */}
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

      {/* ── 3. 비즈니스 프로필 & 이상적인 리퍼럴 (GAINS) ── */}
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

      {/* ── 4. 미팅 일시 및 장소 ── */}
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

      {/* ── 5. 대화 내용 & 비즈니스 인사이트 (121 미팅 핵심 메모) ── */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <MessageSquareText className="size-3.5 text-blue-600" />
          <span>4. 대화 내용 및 비즈니스 인사이트 (핵심 메모)</span>
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

      {/* ── 6. 블로그 본문 포함 블록 선택 (토글) ── */}
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
    </div>
  );
}
