'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  BookOpen,
  Sliders,
  ChevronDown,
  ChevronUp,
  Tag,
  Loader2,
  FileCode,
  PenLine,
  Layers,
  Globe,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BLOG_SKILLS,
  getSkillById,
  type BlogSkillId,
  type BlogSkill,
  type BlogPlatform,
} from '@/lib/blog-automation/blog-skills';
import type { BlogCopyFormula, BlogTone } from '@/lib/blog-automation/types';
import type { BlogProfile } from '@/lib/blog-automation/profile-storage';

import type { UploadedPhoto } from './PhotoUploadPanel';

interface PromptControlPanelProps {
  skillId: BlogSkillId;
  onSkillChange: (skillId: BlogSkillId) => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  platform: BlogPlatform;
  onPlatformChange: (platform: BlogPlatform) => void;
  targetAudience: string;
  onTargetAudienceChange: (audience: string) => void;
  copyFormula: BlogCopyFormula;
  onCopyFormulaChange: (formula: BlogCopyFormula) => void;
  tone: BlogTone;
  onToneChange: (tone: BlogTone) => void;
  requiredKeywords: string;
  onRequiredKeywordsChange: (keywords: string) => void;
  customFields: Record<string, string>;
  onCustomFieldsChange: (fields: Record<string, string>) => void;
  customInstructions: string;
  onCustomInstructionsChange: (instructions: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  photosCount: number;
  photos?: UploadedPhoto[];
  onOpenAutoPilot?: () => void;
  currentProfile?: BlogProfile | null;
  allProfiles?: BlogProfile[];
  onSwitchProfile?: (profile: BlogProfile) => void;
  onGoToDrive?: () => void;
  onSaveAsProfileTemplate?: () => void;
}

const TONE_OPTIONS: { value: BlogTone; label: string; emoji: string }[] = [
  { value: 'friendly', label: '친근한 (~해요, 이모지)', emoji: '😊' },
  { value: 'professional', label: '전문적 (정중한 경어, 신뢰)', emoji: '👔' },
  { value: 'casual', label: '캐주얼 (편안한 대화체)', emoji: '✌️' },
  { value: 'informative', label: '정보형 (구조적 핵심 요약)', emoji: '📖' },
  { value: 'persuasive', label: '설득형 (공감 유도, 강한 CTA)', emoji: '💡' },
];

const COPY_FORMULA_OPTIONS: { value: BlogCopyFormula; label: string; desc: string }[] = [
  { value: 'auto', label: '자동 (추천)', desc: '유형 기본 공식 적용' },
  { value: 'PAS', label: 'PAS 공식', desc: '문제 → 자극 → 해결' },
  { value: 'AIDA', label: 'AIDA 공식', desc: '주의 → 관심 → 욕구 → 행동' },
  { value: 'BAB', label: 'BAB 공식', desc: '이전 → 이후 → 연결' },
  { value: 'FAB', label: 'FAB 공식', desc: '기능 → 장점 → 혜택' },
];

const AUDIENCE_PRESETS = [
  '20대 직장인',
  '30대 자기개발러',
  '수출입/무역 실무자',
  '해외직구/셀러',
  '외화 투자자/재테크',
  '자영업/소상공인',
  '대학생/취준생',
  '육아맘/학부모',
  'MZ세대',
  '시니어',
];

/** 주제 텍스트로부터 최적의 블로그 스킬 자동 감지 */
function detectSkillFromTopic(text: string): BlogSkillId | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (/사주|운세|타로|명리|신년운세|궁합|손금|관상|일진|토정비결|오행|천간|지지|별자리|점성|점괘|대운|세운|사주팔자/.test(lower)) {
    return 'saju';
  }
  if (/환율|외환|달러|엔화|유로|금리|연준|관세|무역|fomc|통화/.test(lower)) {
    return 'exchange';
  }
  if (/맛집|식당|카페|메뉴|디저트|베이커리|고기|파스타|커피|음식|요리|브런치|술집|이자카야/.test(lower)) {
    return 'restaurant';
  }
  if (/부동산|인테리어|아파트|오피스텔|빌라|매매|전세|월세|분양|시공|리모델링/.test(lower)) {
    return 'realestate';
  }
  if (/병원|의원|치과|피부과|성형|한의원|치료|수술|증상|통증|건강|질환/.test(lower)) {
    return 'medical';
  }
  if (/학원|과외|수능|내신|입시|영어학원|수학학원|인강|공부|학습|수업/.test(lower)) {
    return 'education';
  }
  if (/여행|호텔|리조트|펜션|숙소|관광|제주도|해외여행|항공권|투어/.test(lower)) {
    return 'travel';
  }
  if (/화장품|스킨케어|네일|헤어|미용실|염색|메이크업|피부관리|뷰티/.test(lower)) {
    return 'beauty';
  }
  if (/소프트웨어|앱|app|it|클라우드|saas|플랫폼|ai도구/.test(lower)) {
    return 'itservice';
  }
  if (/세무|회계|법률|변호사|노무|법무|상속세|절세|자문|컨설팅/.test(lower)) {
    return 'consulting';
  }
  if (/이벤트|프로모션|할인|특가|기획전|박람회|페스티벌|축제/.test(lower)) {
    return 'event';
  }
  if (/채용|구인|공채|복지|기업문화|입사|면접/.test(lower)) {
    return 'recruiting';
  }
  if (/강사|강연|퍼스널브랜딩|포트폴리오|저자|출간/.test(lower)) {
    return 'personal';
  }
  if (/제품|리뷰|언박싱|개봉기|스펙|전자기기|신제품/.test(lower)) {
    return 'product';
  }
  return null;
}

export function PromptControlPanel({
  skillId,
  onSkillChange,
  topic,
  onTopicChange,
  platform,
  onPlatformChange,
  targetAudience,
  onTargetAudienceChange,
  copyFormula,
  onCopyFormulaChange,
  tone,
  onToneChange,
  requiredKeywords,
  onRequiredKeywordsChange,
  customFields,
  onCustomFieldsChange,
  customInstructions,
  onCustomInstructionsChange,
  isGenerating,
  onGenerate,
  photosCount,
  photos = [],
  onOpenAutoPilot,
  currentProfile,
  allProfiles = [],
  onSwitchProfile,
  onGoToDrive,
  onSaveAsProfileTemplate,
}: PromptControlPanelProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const selectedSkill = getSkillById(skillId);
  const hasManuallySelectedSkillRef = React.useRef(false);

  // 주제 입력 시 스마트 스킬 자동 추천/전환
  const handleTopicChange = (newTopic: string) => {
    onTopicChange(newTopic);
    if (!hasManuallySelectedSkillRef.current && (skillId === 'restaurant' || skillId === 'general')) {
      const detected = detectSkillFromTopic(newTopic);
      if (detected && detected !== skillId) {
        onSkillChange(detected);
        const targetSkill = getSkillById(detected);
        toast.info(`💡 주제에 맞춰 '${targetSkill.name}' 유형으로 자동 변경되었습니다.`);
      }
    }
  };

  const photoSuggestions = React.useMemo(() => {
    if (!photos || photos.length === 0) return [];
    const suggestions: string[] = [];
    photos.forEach((p) => {
      if (p.caption && p.caption.trim()) {
        suggestions.push(p.caption.replace(/^[✨📸\s]+/, '').trim());
      } else if (p.description && p.description.trim()) {
        suggestions.push(p.description.split(' - ')[0].trim());
      }
      if (p.keywords && Array.isArray(p.keywords)) {
        p.keywords.forEach((kw) => {
          if (kw && !suggestions.includes(`${kw} 추천 및 솔직 후기`)) {
            suggestions.push(`${kw} 추천 및 솔직 후기`);
          }
        });
      }
    });
    return Array.from(new Set(suggestions.filter(Boolean))).slice(0, 4);
  }, [photos]);

  const [isFetchingExchange, setIsFetchingExchange] = useState(false);

  const handleAutoFetchExchange = async () => {
    setIsFetchingExchange(true);
    try {
      const res = await fetch('/api/blog-auto/writer/fetch-exchange-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOrTopic: topic || customFields.period || '최근 이번 주',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        onCustomFieldsChange({
          ...customFields,
          period: json.data.period || customFields.period || '',
          exchangeRates: json.data.exchangeRates || '',
          globalIssues: json.data.globalIssues || '',
        });
        toast.success('✨ AI가 실시간 관세청 고시환율 및 최신 세계정세를 성공적으로 불러왔습니다!');
      } else {
        toast.error('환율 정보를 불러오지 못했습니다. 직접 입력하거나 비워두시면 AI가 생성 시 직접 탐색합니다.');
      }
    } catch (e: any) {
      toast.error('환율 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingExchange(false);
    }
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    onCustomFieldsChange({
      ...customFields,
      [key]: value,
    });
  };

  const handlePresetClick = (preset: string) => {
    if (!targetAudience) {
      onTargetAudienceChange(preset);
    } else if (!targetAudience.includes(preset)) {
      onTargetAudienceChange(`${targetAudience}, ${preset}`);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
      {/* ── Center Top Bar ── */}
      <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          {onGoToDrive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGoToDrive}
              className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border-slate-200 rounded-lg flex items-center gap-1.5"
              title="블로그 워크스페이스 드라이브 목록으로 이동"
            >
              <span>📂</span>
              <span>드라이브 허브</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>AI 세부 프롬프트 조정</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAutoPilot && (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenAutoPilot}
              disabled={isGenerating}
              className="h-9 px-3.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
              title="기본 세팅된 컨셉으로 양질의 글을 5개~10개씩 연속 자동 생성해 보관함에 채워 넣습니다"
            >
              <Sparkles className="size-3.5 text-purple-600" />
              <span>✨ 오토파일럿 대량 자동 생성</span>
            </Button>
          )}

          <Button
            onClick={onGenerate}
            disabled={isGenerating || !topic.trim()}
            className="h-9 px-5 bg-[#0A84FF] hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>작성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>AI 블로그 글 생성하기</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── 프로필 맞춤 템플릿 상단 네비게이션 바 ── */}
      {currentProfile && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/70 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{currentProfile.avatarEmoji || '📝'}</span>
            <span className="font-bold text-slate-800 truncate max-w-[220px]">
              {currentProfile.name}
            </span>
            {currentProfile.clientName && (
              <Badge variant="outline" className="bg-white/80 text-purple-700 border-purple-200 text-[10px] py-0 px-1.5 shrink-0">
                🏢 {currentProfile.clientName}
              </Badge>
            )}
            {currentProfile.ownerName && (
              <span className="text-slate-500 hidden sm:inline text-[11px] truncate">
                (담당: {currentProfile.ownerName})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {allProfiles.length > 1 && onSwitchProfile && (
              <Select
                value={currentProfile.id}
                onValueChange={(val) => {
                  const target = allProfiles.find((p) => p.id === val);
                  if (target) onSwitchProfile(target);
                }}
              >
                <SelectTrigger className="h-7 text-[11px] bg-white/90 border-slate-200 rounded-lg px-2.5 gap-1 shadow-2xs">
                  <SelectValue placeholder="프로필 전환" />
                </SelectTrigger>
                <SelectContent className="bg-white text-xs max-h-56">
                  {allProfiles.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.avatarEmoji} {p.name} {p.clientName ? `(${p.clientName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {onSaveAsProfileTemplate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSaveAsProfileTemplate}
                className="h-7 px-2.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100/70 rounded-lg transition-colors"
                title="현재 조정한 프롬프트/키워드/설정을 이 프로필의 기본 템플릿으로 저장합니다."
              >
                💾 템플릿에 저장
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Center Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* 1. 블로그 유형 (스킬) 선택 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="size-3.5 text-blue-600" />
              블로그 유형 ({BLOG_SKILLS.length}종 스킬)
            </Label>
            <span className="text-[11px] text-slate-400">
              선택한 유형에 최적화된 작성 공식과 톤이 적용됩니다
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {BLOG_SKILLS.map((skill) => {
              const isSelected = skill.id === skillId;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => {
                    hasManuallySelectedSkillRef.current = true;
                    onSkillChange(skill.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="text-xl mb-1">{skill.emoji}</div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {skill.copywritingFormula} 공식
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 메인 주제 & 키워드 */}
        <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <PenLine className="size-3.5 text-blue-600" />
            블로그 글 주제 / 메인 키워드 <span className="text-red-500">*</span>
          </Label>
          <Input
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            placeholder={
              skillId === 'saju'
                ? '예: 2026년 하반기 사주 대운 분석 및 갑목 일간 재물운 개운법'
                : skillId === 'restaurant'
                ? '예: 강남역 숙성 삼겹살 맛집 추천 모임 장소'
                : skillId === 'product'
                ? '예: 2026 최신 노이즈캔슬링 무선 헤드폰 실사용 리뷰'
                : skillId === 'exchange'
                ? '예: 2026년 8월 5주차 주요통화 과세환율 정보 및 미 금리인하 세계정세 분석'
                : '작성할 블로그 글의 핵심 주제나 검색 키워드를 입력하세요'
            }
            className="text-sm h-11 border-slate-200 focus-visible:ring-blue-500 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                onGenerate();
              }
            }}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Cmd/Ctrl + Enter를 누르면 즉시 글이 생성됩니다.</span>
            {photosCount > 0 && (
              <span className="text-blue-600 font-medium">
                📷 업로드된 사진 {photosCount}장이 본문에 자동 삽입됩니다.
              </span>
            )}
          </div>

          {/* 사진 AI Vision 분석 기반 추천 주제 빠른 입력 칩 */}
          {photoSuggestions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Sparkles className="size-3 text-purple-600" />
                  사진 분석 기반 추천 주제 (클릭 시 자동 입력):
                </span>
                {!topic.trim() && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                    주제를 선택하거나 직접 입력해주세요
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {photoSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onTopicChange(sug)}
                    className="text-[11px] text-left bg-purple-50/80 hover:bg-purple-100 text-purple-800 px-2 py-1 rounded-lg border border-purple-200/70 transition-all font-medium flex items-center gap-1 hover:border-purple-300 active:scale-95"
                    title="이 추천 주제로 본문 글 작성하기"
                  >
                    <span>👉 {sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. 마케팅 타겟팅 및 플랫폼 설정 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <Target className="size-3.5 text-purple-600" />
            발행 플랫폼 & 카피라이팅 스타일
          </h3>

          {/* 발행 플랫폼 스타일 선택 */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600 flex items-center justify-between">
              <span>발행 플랫폼 전용 스타일</span>
              <span className="text-[11px] text-blue-600 font-normal">
                {platform === 'naver' && '🟢 모바일 1~2줄 호흡 + 말풍선 + 찐후기'}
                {platform === 'tstory' && '🟠 매거진 에세이 + 칼럼형 문단 구조'}
                {platform === 'wordpress' && '🔵 구글 AEO 즉답 + 비교표 & 통계'}
              </span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onPlatformChange('naver')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  platform === 'naver'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500 font-bold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  네이버 블로그
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  말풍선 인용구 + 찐후기 구어체
                </p>
              </button>

              <button
                type="button"
                onClick={() => onPlatformChange('tstory')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  platform === 'tstory'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-1 ring-amber-500 font-bold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  티스토리/브런치
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  매거진 칼럼 & 정돈된 문단
                </p>
              </button>

              <button
                type="button"
                onClick={() => onPlatformChange('wordpress')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  platform === 'wordpress'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500 font-bold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  워드프레스/SEO
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  AEO 스니펫 + 비교표/근거
                </p>
              </button>
            </div>
          </div>

          {/* 타겟 오디언스 */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              타겟 독자 (오디언스)
            </Label>
            <Input
              value={targetAudience}
              onChange={(e) => onTargetAudienceChange(e.target.value)}
              placeholder="예: 30대 직장인 남성, 주말 데이트 코스를 찾는 연인"
              className="text-xs h-9"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {AUDIENCE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 border border-slate-200 transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 카피라이팅 공식 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Zap className="size-3 text-amber-500" />
                카피라이팅 공식
              </Label>
              {mounted ? (
                <Select
                  value={copyFormula}
                  onValueChange={(v) => onCopyFormulaChange(v as BlogCopyFormula)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COPY_FORMULA_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="font-semibold">{opt.label}</span> -{' '}
                        <span className="text-slate-500 text-[11px]">{opt.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 rounded-md border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-500">
                  자동 (추천)
                </div>
              )}
            </div>

            {/* 톤앤매너 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <BookOpen className="size-3 text-blue-500" />
                톤앤매너 (말투)
              </Label>
              {mounted ? (
                <Select
                  value={tone}
                  onValueChange={(v) => onToneChange(v as BlogTone)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.emoji} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 rounded-md border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-500">
                  😊 친근한
                </div>
              )}
            </div>
          </div>

          {/* 필수 포함 키워드 */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Tag className="size-3 text-emerald-500" />
              필수 포함 키워드 (쉼표 구분)
            </Label>
            <Input
              value={requiredKeywords}
              onChange={(e) => onRequiredKeywordsChange(e.target.value)}
              placeholder="예: 주차 가능, 콜키지 프리, 가성비 세트, 단체 룸"
              className="text-xs h-9"
            />
          </div>
        </div>

        {/* 4. 유형별 추가 정보 입력 필드 */}
        {selectedSkill.optionalFields &&
          selectedSkill.optionalFields.filter((f) => f.type !== 'images').length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    {selectedSkill.name} 맞춤 세부 정보
                    {skillId === 'exchange' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        ⚡ 실시간 웹검색 지원
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {skillId === 'exchange'
                      ? '💡 비워두셔도 AI가 Google Search로 최신 관세청 고시환율과 세계정세를 웹에서 실시간 직접 찾아 작성합니다.'
                      : '입력하면 글의 사실성과 디테일이 크게 향상됩니다'}
                  </p>
                </div>

                {skillId === 'exchange' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isFetchingExchange}
                    onClick={handleAutoFetchExchange}
                    className="h-7 px-2.5 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 shadow-2xs transition-all"
                  >
                    {isFetchingExchange ? (
                      <>
                        <Loader2 className="size-3 animate-spin text-blue-600" />
                        <span>AI 실시간 탐색 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3 text-blue-600" />
                        <span>🔍 최신 환율·세계정세 AI 자동 채우기</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {selectedSkill.optionalFields
                  .filter((f) => f.type !== 'images')
                  .map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs text-slate-600">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={customFields[field.key] || ''}
                          onChange={(e) =>
                            handleCustomFieldChange(field.key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          rows={2}
                          className="text-xs resize-none"
                        />
                      ) : (
                        <Input
                          value={customFields[field.key] || ''}
                          onChange={(e) =>
                            handleCustomFieldChange(field.key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          className="text-xs h-9"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* 5. 고급: 사용자 직접 추가 지시사항 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <FileCode className="size-3.5 text-slate-500" />
              AI 세부 추가 지시사항 / 커스텀 프롬프트
            </span>
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              {showAdvanced ? '접기' : '펼치기'}
              {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </span>
          </button>

          {showAdvanced && (
            <div className="p-4 pt-0 border-t border-slate-100 space-y-2">
              <p className="text-[11px] text-slate-400">
                AI에게 전달할 특별한 작성 조건, 제외할 단어, 특정 구성 요구사항 등을 자유롭게 작성하세요.
              </p>
              <Textarea
                value={customInstructions}
                onChange={(e) => onCustomInstructionsChange(e.target.value)}
                placeholder="예: 결론 부분에 네이버 예약 링크 클릭을 유도하는 CTA 문구를 자연스럽게 넣어줘. 이모지를 많이 사용하고 문장을 짧게 끊어 써줘."
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
