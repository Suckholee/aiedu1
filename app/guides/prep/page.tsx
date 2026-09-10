'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Laptop,
  Sparkles,
  AlertCircle,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

const CLAUDE_UPGRADE_URL = 'https://claude.ai/upgrade?from=menu';

export default function PrepGuidePage() {
  return (
    <div className="relative min-h-screen bg-[#10024a] pb-24 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(245,158,11,.25),transparent_35%),radial-gradient(circle_at_85%_60%,rgba(139,92,246,.3),transparent_30%)]" />

      {/* Hero Banner */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-[#180055] to-transparent py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-xs font-bold text-amber-200">
            <AlertCircle className="size-4 text-amber-300" />
            <span>수강생 사전 체크리스트 · 강의 당일 지참 필수</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
            실습 <span className="text-amber-300">필수 준비물</span> 안내 가이드
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-violet-200/90 leading-relaxed">
            3시간 동안 진행되는 마스터 클래스는 100% 직접 실습하는 워크숍입니다.<br className="hidden sm:inline" />
            원활한 실습 참여를 위해 강의 시작 전 아래 2가지 준비물을 반드시 세팅해 주세요.
          </p>
        </div>
      </section>

      {/* Main Guide Content */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Warning Callout */}
        <div className="flex items-start gap-3.5 rounded-2xl border-2 border-amber-300/80 bg-amber-100 p-4 sm:p-5 text-amber-950 shadow-md">
          <AlertCircle className="size-5 shrink-0 text-amber-700 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-extrabold text-amber-950">주의사항:</strong>{' '}
            무료 플랜은 질문 3~5회 만에 사용 한도가 초과되어 몇 시간 동안 실습이 중단됩니다.
            따라서 강의 당일 끊김 없는 실습 참여를 위해 반드시 <strong>개인 노트북 지참</strong>과{' '}
            <strong>클로드 프로(Claude Pro, 월 $19) 사전 구독</strong>을 완료해 주시기 바랍니다.
          </div>
        </div>

        {/* 1. 개인 노트북 준비 */}
        <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-violet-600 text-white shadow-md">
              <Laptop className="size-6" />
            </span>
            <div>
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">준비물 01</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">개인 노트북 지참</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-fuchsia-300">OS 환경</p>
              <p className="mt-1 text-slate-200">
                Mac, Windows, Linux 기종 제한 없이 모두 가능합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-fuchsia-300">권장 브라우저</p>
              <p className="mt-1 text-slate-200">
                최신 버전의 <strong>Google Chrome 브라우저</strong>를 권장합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-fuchsia-300">충전 어댑터</p>
              <p className="mt-1 text-slate-200">
                3시간 동안 연속 실습이 진행되므로 노트북 충전기를 꼭 챙겨주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 2. 클로드 프로 구독 안내 */}
        <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
              <Sparkles className="size-6" />
            </span>
            <div>
              <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">준비물 02</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">클로드 프로 (Claude Pro) 공식 구독</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div className="space-y-4 text-xs sm:text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="font-bold text-white mb-1.5">💳 요금제 정보</p>
                <p className="text-violet-200/90 leading-relaxed">
                  • 요금: <strong>$19 USD / 월</strong> (부가세 포함)<br />
                  • 결제 수단: 해외 결제 가능한 신용카드 또는 체크카드<br />
                  • 연간 결제 선택 시 17% 할인이 적용되나, 월간 결제로도 충분합니다.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="font-bold text-white mb-2">✨ Claude Pro 구독 시 얻는 실습 혜택</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-400" />
                    <span><strong>5배 더 높은 사용량</strong> (실습 중단 없는 연속 질문)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-400" />
                    <span><strong>Claude 3.5 Sonnet 최고성능 모델</strong> 무제한 활용</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-400" />
                    <span><strong>Claude Artifacts</strong> 실시간 문서 및 코드 뷰어</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-400" />
                    <span><strong>대화 간 기억(Memory)</strong>으로 나만의 맞춤형 비서 구현</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href={CLAUDE_UPGRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition hover:scale-105"
                >
                  <span>클로드 프로 공식 업그레이드 페이지 바로가기</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>

            {/* Plan Image */}
            <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3 shadow-xl">
              <div className="relative aspect-[1/1.55] w-full overflow-hidden rounded-xl bg-slate-900">
                <Image
                  src="/images/claude-pro-plan.png"
                  alt="Claude Pro 구독 플랜 화면"
                  fill
                  sizes="260px"
                  className="object-contain"
                />
              </div>
              <p className="mt-2 text-center text-[11px] text-violet-200">
                공식 구독 페이지 플랜 선택 화면
              </p>
            </div>
          </div>
        </div>

        {/* 3. 스마트폰 사진 준비 팁 */}
        <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-fuchsia-600 text-white shadow-md">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">추천 준비물</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">휴대폰 사진 3~5장 준비</h2>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-violet-200/80 leading-relaxed">
            2교시(AI 블로그) 및 3교시(AI 숏폼)에서 내 비즈니스에 맞는 실습 결과물을 만들기 위해,<br className="hidden sm:inline" />
            <strong>내 매장, 제품, 작업실, 일상 풍경 사진 3~5장</strong>을 노트북에 옮겨두거나 카카오톡 '나와의 채팅'에 준비해 두시면 바로 실습하실 수 있습니다.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 sm:p-8 text-center text-white shadow-2xl">
          <h3 className="text-xl sm:text-2xl font-black">모든 준비가 완료되셨나요?</h3>
          <p className="mt-2 text-xs sm:text-sm text-violet-100">
            강의 전 3대 실습 스튜디오를 미리 둘러보고 익혀보세요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/work-automation"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-violet-900 transition hover:bg-violet-50"
            >
              업무자동화 실습실
            </Link>
            <Link
              href="/tools/blog"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-violet-900 transition hover:bg-violet-50"
            >
              AI 블로그 실습실
            </Link>
            <Link
              href="/tools/shorts"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-violet-900 transition hover:bg-violet-50"
            >
              AI 숏폼 실습실
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
