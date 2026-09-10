'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Bot,
  Layers,
  Play,
  CheckCircle2,
  Loader2,
  ListPlus,
  RefreshCw,
  Clock,
  ArrowRight,
  Flame,
  Shuffle,
  Users,
  KeyRound,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { saveBlogPostRecord } from '@/lib/blog-automation/storage';
import { toast } from 'sonner';
import type { BlogSkillId, BlogPlatform } from '@/lib/blog-automation/blog-skills';
import type { BlogCopyFormula, BlogTone } from '@/lib/blog-automation/types';
import type { UploadedPhoto } from './PhotoUploadPanel';

interface AutoPilotBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: BlogSkillId;
  platform: BlogPlatform;
  targetAudience: string;
  copyFormula: BlogCopyFormula;
  tone: BlogTone;
  requiredKeywords: string;
  photos: UploadedPhoto[];
  onBatchComplete: () => void;
}

interface BatchItem {
  topic: string;
  audience: string;
  keywords: string;
}

const DEFAULT_AUDIENCES = [
  '20대 직장인',
  '30대 자기개발러',
  '육아맘/학부모',
  '시니어/은퇴자',
  '자영업/소상공인',
  '대학생/취준생',
];

const DEFAULT_KEYWORD_SETS: Record<string, string[]> = {
  senior_health: ['아침 산책', '무릎 관절 건강', '혈당 혈압 조절', '치매 예방', '바른 걷기 자세'],
  restaurant: ['골목 맛집', '가성비 세트', '가족 외식', '분위기 좋은 데이트', '직장인 점심'],
  realestate: ['내 집 마련', '상권 분석', '인테리어 리모델링', '전월세 꿀팁', '교통 호재'],
  travel: ['당일치기 힐링', '가성비 감성 숙소', '부모님 효도 여행', '숨은 포토존', '드라이브 코스'],
  diet: ['체지방 감량', '식단 관리', '홈트레이닝', '유산소 루틴', '요요 방지'],
};

const DEFAULT_ANGLES = [
  '실전 꿀팁 5가지',
  '초보자 필수 입문 가이드',
  '실제 경험 기반 솔직 후기',
  '전문가가 알려주는 주의사항',
  '가장 많이 묻는 질문 BEST 3',
];

export function AutoPilotBatchModal({
  open,
  onOpenChange,
  skillId,
  platform,
  targetAudience,
  copyFormula,
  tone,
  requiredKeywords,
  photos,
  onBatchComplete,
}: AutoPilotBatchModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'matrix' | 'manual'>('matrix');

  // 1. 매트릭스 조합 파라미터
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(
    targetAudience ? [targetAudience] : ['시니어/은퇴자', '20대 직장인', '육아맘/학부모']
  );
  const [keywordPool, setKeywordPool] = useState(
    requiredKeywords || (DEFAULT_KEYWORD_SETS[skillId] || DEFAULT_KEYWORD_SETS.senior_health).join(', ')
  );
  const [selectedAngles, setSelectedAngles] = useState<string[]>([
    '실전 꿀팁 5가지',
    '초보자 필수 입문 가이드',
    '전문가가 알려주는 주의사항',
  ]);

  // 2. 생성 대상 큐 (아이템 목록)
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([
    {
      topic: '시니어 건강 지키는 30분 아침 산책의 기적, 5가지 놀라운 효과',
      audience: '시니어/은퇴자',
      keywords: '아침 산책, 무릎 관절 건강',
    },
    {
      topic: '바쁜 20대 직장인을 위한 출퇴근 걷기 루틴과 활력 회복 꿀팁',
      audience: '20대 직장인',
      keywords: '출퇴근 걷기, 피로 회복',
    },
    {
      topic: '무릎 관절 보호하며 걷는 바른 자세와 워킹화 고르는 법',
      audience: '시니어/은퇴자',
      keywords: '바른 걷기 자세, 무릎 관절',
    },
    {
      topic: '육아맘의 스트레스를 날려주는 15분 아침 산책 명상 가이드',
      audience: '육아맘/학부모',
      keywords: '산책 명상, 스트레스 완화',
    },
    {
      topic: '혈당과 혈압을 안정시키는 식후 산책 골든타임 비결',
      audience: '시니어/은퇴자',
      keywords: '혈당 조절, 식후 산책',
    },
  ]);

  // 직접 입력 모드용 텍스트
  const [manualText, setManualText] = useState(
    `1. 시니어 건강 지키는 30분 아침 산책의 기적, 5가지 놀라운 효과\n2. 무릎 관절 보호하며 걷는 바른 자세와 워킹화 고르는 법\n3. 치매 예방과 뇌 활력을 깨우는 아침 걷기 명상 실천 가이드\n4. 혈당과 혈압을 낮추는 식후 15분 산책의 골든타임 비결\n5. 계절별 안전 산책 팁과 부상 없이 근력 키우는 스트레칭`
  );

  // 진행 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [completedTitles, setCompletedTitles] = useState<string[]>([]);

  // 타겟 고객 토글
  const toggleAudience = (aud: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(aud) ? (prev.length > 1 ? prev.filter((a) => a !== aud) : prev) : [...prev, aud]
    );
  };

  // 앵글 토글
  const toggleAngle = (ang: string) => {
    setSelectedAngles((prev) =>
      prev.includes(ang) ? (prev.length > 1 ? prev.filter((a) => a !== ang) : prev) : [...prev, ang]
    );
  };

  // 🎲 매트릭스 다차원 교차 조합 생성 알고리즘
  const handleGenerateMatrix = () => {
    const kList = keywordPool
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (kList.length === 0) {
      toast.error('키워드를 1개 이상 입력해주세요.');
      return;
    }

    const generated: BatchItem[] = [];
    const audiences = selectedAudiences.length > 0 ? selectedAudiences : ['일반 독자'];
    const angles = selectedAngles.length > 0 ? selectedAngles : ['실전 가이드'];

    // 타겟 × 키워드 × 앵글의 스마트 크로스 매칭 (최대 6~10개 엄선)
    let comboCount = 0;
    for (const aud of audiences) {
      for (const kw of kList) {
        const angle = angles[comboCount % angles.length];
        
        let topicTitle = '';
        if (aud.includes('시니어') || aud.includes('은퇴')) {
          topicTitle = `${aud} 맞춤 ${kw} 관리법과 ${angle}`;
        } else if (aud.includes('직장인')) {
          topicTitle = `바쁜 ${aud}을 위한 실전 ${kw} 노하우, ${angle}`;
        } else if (aud.includes('육아')) {
          topicTitle = `${aud}의 힐링을 돕는 ${kw} 루틴과 ${angle}`;
        } else {
          topicTitle = `${aud}을 위한 ${kw} 완벽 분석 및 ${angle}`;
        }

        generated.push({
          topic: topicTitle,
          audience: aud,
          keywords: `${kw}, ${aud}`,
        });

        comboCount++;
        if (generated.length >= 8) break;
      }
      if (generated.length >= 8) break;
    }

    setBatchQueue(generated);
    toast.success(`🎲 [고객 ${audiences.length}종 × 키워드 ${kList.length}종] 매트릭스 조합으로 ${generated.length}개 주제가 생성되었습니다!`);
  };

  // 배치 자동 생성 실행
  const handleStartBatch = async () => {
    let itemsToProcess: BatchItem[] = [];

    if (activeTab === 'matrix') {
      itemsToProcess = batchQueue;
    } else {
      itemsToProcess = manualText
        .split('\n')
        .map((l) => l.replace(/^\d+[\.\)\s]+/, '').trim())
        .filter(Boolean)
        .map((t) => ({
          topic: t,
          audience: targetAudience || '일반 독자',
          keywords: requiredKeywords || '',
        }));
    }

    if (itemsToProcess.length === 0) {
      toast.error('생성할 글 목록이 비어있습니다.');
      return;
    }

    setIsGenerating(true);
    setProgressIndex(0);
    setCompletedTitles([]);

    const imagesPayload = photos.map((p) => ({
      id: p.id,
      name: p.name,
      url: p.url,
      description: p.description,
      caption: p.caption,
    }));

    try {
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        setProgressIndex(i + 1);

        const res = await fetch('/api/blog-auto/writer/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: item.topic,
            skillId,
            platform,
            targetAudience: item.audience,
            copyFormula,
            tone,
            requiredKeywords: item.keywords,
            images: imagesPayload,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          const postWithImages = {
            ...data.post,
            images: photos.map((p, idx) => ({
              url: p.url,
              name: p.name || `사진 ${idx + 1}`,
              caption: p.caption,
              description: p.description,
            })),
            updatedAt: Date.now(),
          };

          await saveBlogPostRecord(user, postWithImages, {
            skillId,
            platform,
            targetAudience: item.audience,
          });

          setCompletedTitles((prev) => [...prev, data.post.title || item.topic]);
        }

        await new Promise((r) => setTimeout(r, 600));
      }

      toast.success(`🎉 총 ${itemsToProcess.length}개의 맞춤 블로그 글이 자동 생성되어 보관함에 저장되었습니다!`);
      onBatchComplete();
    } catch (err: any) {
      console.error(err);
      toast.error(`자동 생성 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-950 via-indigo-900 to-blue-950 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
                <Shuffle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>다차원 키워드 & 고객 매트릭스 자동 생성기</span>
                  <Badge className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5">
                    Matrix Combinator
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-purple-200 mt-0.5">
                  타겟 고객 × 핵심 키워드 × 콘텐츠 앵글을 다채롭게 조합하여 양질의 글을 대량 생성합니다.
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {isGenerating ? (
            <div className="py-8 space-y-5 text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 animate-pulse">
                  <Bot className="size-10" />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                  {progressIndex} / {activeTab === 'matrix' ? batchQueue.length : manualText.split('\n').filter(Boolean).length}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI가 매트릭스 조합에 맞춰 양질의 블로그 글을 연속 생성 중입니다...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  각 타겟 고객의 니즈에 최적화된 글들이 내 보관함에 실시간으로 차곡차곡 축적됩니다.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${(progressIndex / (activeTab === 'matrix' ? batchQueue.length : 5)) * 100}%`,
                  }}
                />
              </div>

              {/* Completed List preview */}
              {completedTitles.length > 0 && (
                <div className="max-w-md mx-auto text-left bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
                  <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                    ✓ 생성 완료된 글 목록 ({completedTitles.length}개):
                  </span>
                  {completedTitles.map((t, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-2 h-9 p-1 bg-slate-100 rounded-lg">
                  <TabsTrigger value="matrix" className="text-xs font-bold flex items-center gap-1.5">
                    <Shuffle className="size-3.5" />
                    <span>다차원 매트릭스 조합 모드 (추천)</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs font-bold flex items-center gap-1.5">
                    <ListPlus className="size-3.5" />
                    <span>직접 주제 리스트 입력 모드</span>
                  </TabsTrigger>
                </TabsList>

                {/* 1. Matrix Combinator Tab */}
                <TabsContent value="matrix" className="space-y-4 mt-3">
                  {/* Step A. 타겟 고객 풀 */}
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="size-3.5 text-blue-600" />
                      <span>1. 타겟 고객 풀 (교차 조합할 대상을 선택하세요):</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DEFAULT_AUDIENCES.map((aud) => {
                        const isSelected = selectedAudiences.includes(aud);
                        return (
                          <button
                            key={aud}
                            type="button"
                            onClick={() => toggleAudience(aud)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {aud}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step B. 핵심 키워드 풀 */}
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="size-3.5 text-emerald-600" />
                      <span>2. 핵심 키워드/상황 풀 (쉼표로 구분):</span>
                    </label>
                    <Input
                      value={keywordPool}
                      onChange={(e) => setKeywordPool(e.target.value)}
                      placeholder="예: 아침 산책, 무릎 관절, 혈당 조절, 피로 회복, 다이어트"
                      className="text-xs bg-white border-slate-200"
                    />
                  </div>

                  {/* Step C. 콘텐츠 앵글 풀 */}
                  <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="size-3.5 text-purple-600" />
                      <span>3. 콘텐츠 앵글 / 목적:</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DEFAULT_ANGLES.map((ang) => {
                        const isSelected = selectedAngles.includes(ang);
                        return (
                          <button
                            key={ang}
                            type="button"
                            onClick={() => toggleAngle(ang)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {ang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Matrix Generate Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-500">
                      💡 클릭 시 고객 × 키워드 × 앵글이 교차 매칭되어 최적의 주제 조합이 빌드됩니다.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateMatrix}
                      className="h-8 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 flex items-center gap-1"
                    >
                      <Shuffle className="size-3.5" />
                      <span>🎲 매트릭스 조합 리셋/생성</span>
                    </Button>
                  </div>

                  {/* Preview Queue List */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>자동 생성될 다채로운 주제 큐 ({batchQueue.length}개):</span>
                      <span className="text-[11px] text-slate-400 font-normal">각 글마다 타겟 독자와 키워드가 개별 적용됩니다</span>
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/60 p-2 space-y-1.5">
                      {batchQueue.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{item.topic}</h5>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                              <span className="text-blue-600 font-semibold">👤 {item.audience}</span>
                              <span>• 🔑 {item.keywords}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-200 shrink-0">
                            #{idx + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* 2. Manual Text Input Tab */}
                <TabsContent value="manual" className="space-y-3 mt-3">
                  <Textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={8}
                    placeholder="1. 주제 1&#10;2. 주제 2&#10;3. 주제 3"
                    className="text-xs leading-relaxed bg-slate-50/50 border-slate-200 font-medium resize-none"
                  />
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  📷 등록된 사진 {photos.length}장이 각 글의 스토리라인에 맞게 자동 배치됩니다.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-9 text-xs text-slate-600"
                  >
                    닫기
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStartBatch}
                    className="h-9 px-5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center gap-1.5 shadow-md"
                  >
                    <Play className="size-3.5" />
                    <span>🚀 매트릭스 조합 글 {activeTab === 'matrix' ? batchQueue.length : 5}개 자동 생성 시작</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
