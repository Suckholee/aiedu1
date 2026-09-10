'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { toast } from 'sonner';

type DocType = 'proposal' | 'meeting' | 'bizplan' | 'summary';

const DOC_PRESETS = [
  {
    id: 'proposal',
    title: '신규 프로젝트 기획안 초안',
    desc: '키워드 몇 개로 임원 보고 수준의 목차와 세부 실행안 생성',
    icon: FileText,
  },
  {
    id: 'meeting',
    title: '회의록 3분 핵심 요약 & Action Item',
    desc: '난잡한 메모나 녹취록을 경영진 보고용 1페이지 브리핑으로 변환',
    icon: ListTodo,
  },
  {
    id: 'bizplan',
    title: '사업계획서 / 제안서 구조화',
    desc: '시장 분석, 3대 추진 전략, 리스크 대응 방안 체계화',
    icon: Briefcase,
  },
];

export default function WorkAutomationPage() {
  const [selectedType, setSelectedType] = useState<DocType>('proposal');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');

  // 프롬프트 빌더
  const buildClaudePrompt = () => {
    if (selectedType === 'proposal') {
      return `당신은 15년 차 수석 비즈니스 기획 전문가입니다.
다음 정보를 바탕으로 즉시 실행 가능한 정밀 [신규 기획안 초안]을 작성해 주세요.

[프로젝트 정보]
- 프로젝트/기획 주제: ${topic || '(주제 미입력)'}
- 타깃 대상: ${targetAudience || '사내 경영진 및 실무팀'}
- 핵심 반영 사항: ${keyPoints || '효율성 극대화 및 빠른 실행 로드맵'}

[작성 요구사항]
1. Executive Summary: 3줄 핵심 요약
2. 추진 배경 및 시장 환경 분석
3. 3대 핵심 추진 전략 (Pillar 1, 2, 3)
4. 단계별 실행 로드맵 (Phase 1 준비 -> Phase 2 런칭 -> Phase 3 고도화)
5. 예상 리스크 및 해결 방안
6. 기대 효과 (정량적 KPI & 정성적 파급 효과)`;
    } else if (selectedType === 'meeting') {
      return `다음은 회의 메모입니다. 경영진 보고용 '1페이지 미팅 브리핑'으로 재구조화해 주세요.

[회의 정보]
- 회의 안건: ${topic || '(안건 미입력)'}
- 참석 대상: ${targetAudience || '관련 부서 담당자'}
- 회의 메모 원문:
${keyPoints || '논의된 주요 사항 및 의견 교환 내용'}

[출력 요구사항]
1. 💡 회의 목적 및 핵심 안건 (한 줄 정의)
2. 🎯 최종 합의 및 의사결정 사항 (3가지)
3. ⚠️ 후속 논의 필요 사항
4. 📋 Action Items 테이블 (담당자 / 과제 / 마감기한 / 우선순위)`;
    } else {
      return `당신은 전문 경영 컨설턴트입니다. 다음 사업/서비스의 전략 제안서를 작성해 주세요.

[사업 정보]
- 사업/아이템명: ${topic || '(아이템 미입력)'}
- 대상 클라이언트: ${targetAudience || '잠재 투자사 및 파트너사'}
- 핵심 특장점: ${keyPoints || '차별화된 기술력 및 빠른 시장 침투'}

[출력 요구사항]
1. 제안 개요 (Problem & Solution)
2. 시장 규모 및 성장 가능성 (TAM-SAM-SOM)
3. 수익 모델 및 비즈니스 구조
4. 마케팅 및 스케일업 전략
5. 제안 마무리 및 협업 기대 효과`;
    }
  };

  const handleCopyPrompt = () => {
    const prompt = buildClaudePrompt();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('클로드 전용 프롬프트가 복사되었습니다! Claude에 붙여넣어 보세요.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleQuickGenerate = () => {
    if (!topic.trim()) {
      toast.error('주제 또는 안건을 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    setGeneratedOutput('');

    // 브라우저 내 데모 생성 시뮬레이션
    setTimeout(() => {
      const prompt = buildClaudePrompt();
      const mockResult = `# [초안 리포트] ${topic}

## 1. Executive Summary
- 본 기획은 "${topic}"을(를) 중심으로 업무 효율성을 300% 이상 증대시키는 것을 목표로 합니다.
- 타깃 대상(${targetAudience || '사내 전사'})의 핵심 니즈를 충족하는 3단계 실천 로드맵을 구축합니다.
- 조기 성과 도출을 위한 AI 기반 자동화 파이프라인을 도입합니다.

## 2. 3대 핵심 추진 전략
1. **신속한 표준화 프로세스 구축**: 기존 수작업 템플릿을 AI 프롬프트 체계로 전환
2. **현장 밀착형 코칭 및 가이드라인 배포**: 실무 담당자 맞춤형 워크플로우 지원
3. **지속적인 피드백 루프**: 주간 단위 KPI 측정 및 개선안 도출

## 3. 세부 실행 계획 및 일정
- **Phase 1 (1~2주차)**: 현황 진단 및 프롬프트 팩 커스터마이징
- **Phase 2 (3~4주차)**: 1차 파일럿 적용 및 오류 교정
- **Phase 3 (5주차~)**: 전사 확대 적용 및 자동화 모니터링

## 4. 기대 효과
- 문서 작성 소요 시간: 4시간 -> 30분 단축 (87.5% 절감)
- 의사결정 속도 향상 및 구성원 만족도 제고`;

      setGeneratedOutput(mockResult);
      setIsGenerating(false);
      toast.success('기획서 초안이 생성되었습니다! 클로드에 복사하여 더 고도화할 수 있습니다.');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#10024a] pb-24 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.35),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(79,70,229,.25),transparent_35%)]" />

      {/* Header */}
      <section className="border-b border-white/10 bg-[#160455]/80 py-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300">
                <Sparkles className="size-3.5" />
                PART 01 · 조영빈 대표
              </div>
              <h1 className="mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
                클로드 업무자동화 스튜디오
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-violet-200/80">
                기획서, 보고서, 회의록을 Claude가 가장 이해하기 쉬운 비즈니스 구조로 생성합니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/materials"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <BookOpen className="size-3.5" />
                <span>관련 교안 보기</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Left Panel: Input Controls */}
          <div className="space-y-6">
            {/* 1. Preset Selector */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
              <label className="text-xs font-extrabold uppercase tracking-wider text-violet-300">
                문서 유형 선택
              </label>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {DOC_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedType === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedType(preset.id as any)}
                      className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                        isSelected
                          ? 'border-violet-400 bg-violet-600/30 text-white shadow-md'
                          : 'border-white/10 bg-white/5 text-violet-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`size-5 ${isSelected ? 'text-fuchsia-300' : 'text-violet-400'}`} />
                      <p className="mt-2 text-xs font-bold leading-tight">{preset.title}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Input Fields */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-violet-200 mb-1.5">
                  주제 또는 프로젝트명 <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 2026 하반기 신규 AI 고객 상담 자동화 솔루션 도입안"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-white placeholder-violet-300/40 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-violet-200 mb-1.5">
                  보고 대상 / 타깃 독자
                </label>
                <input
                  type="text"
                  placeholder="예: 대표이사 및 경영지원본부, 2030 예비 창업자 등"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-white placeholder-violet-300/40 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-violet-200 mb-1.5">
                  핵심 반영 사항 또는 메모 내용
                </label>
                <textarea
                  rows={4}
                  placeholder="반드시 포함되어야 할 예산 범위, 일정, 주요 논의 메모 등을 편하게 적어주세요."
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-white placeholder-violet-300/40 outline-none focus:border-violet-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleQuickGenerate}
                  disabled={isGenerating}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-xs font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>AI 기획서 초안 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>AI 기획서 초안 생성</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-xs font-bold text-violet-200 transition hover:bg-white/20"
                >
                  {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                  <span>Claude 프롬프트 복사</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output & Preview */}
          <div className="flex flex-col rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden min-h-[500px]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-fuchsia-400" />
                <span className="text-xs font-bold text-white">결과물 미리보기</span>
              </div>

              {generatedOutput && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedOutput);
                    toast.success('본문이 클립보드에 복사되었습니다.');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-300 hover:text-white"
                >
                  <Copy className="size-3.5" />
                  <span>결과물 복사</span>
                </button>
              )}
            </div>

            <div className="flex-1 p-6">
              {generatedOutput ? (
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-200">
                  {generatedOutput}
                </pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-violet-300/70 p-8">
                  <FileText className="size-12 text-violet-400/50 mb-3" />
                  <p className="font-bold text-white text-sm">기획서 초안이 생성 대기 중입니다</p>
                  <p className="text-xs mt-1 max-w-sm">
                    좌측에서 주제와 메모를 입력한 후 'AI 기획서 초안 생성'을 누르거나,
                    'Claude 프롬프트 복사'를 통해 Claude Pro에서 직접 실행해 보세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
