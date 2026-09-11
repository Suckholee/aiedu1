'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bot,
  PenTool,
  Video,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface LabCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  href: string;
  description: string;
  tags: string[];
  buttonColor: string;
  buttonText?: string;
  badgeText?: string;
  badgeBg?: string;
  featuredNote?: React.ReactNode;
}

const LAB_CARDS: LabCardProps[] = [
  {
    icon: <Bot className="size-8" />,
    iconBg: 'bg-[#f0edff]',
    iconColor: 'text-[#6355f6]',
    title: '업무 자동화 실습실',
    href: '/tools/work-automation',
    description: '반복 업무를 자동화하고 생산성을 극대화하세요!',
    tags: ['문서사진 양식복원', '기획·보고서', '회의록', 'Claude Pro'],
    buttonColor: 'bg-[#6355f6] hover:bg-[#5041e8] text-white',
    buttonText: '실습실 입장',
    badgeText: 'Part 1 · 박재범',
    badgeBg: 'bg-purple-100 text-purple-700',
  },
  {
    icon: <PenTool className="size-8" />,
    iconBg: 'bg-[#e7f7ee]',
    iconColor: 'text-[#16a34a]',
    title: '블로그 실습실',
    href: '/tools/blog',
    description: 'AI와 함께 매력적인 콘텐츠를 만들고 블로그를 성장시키세요!',
    tags: ['콘텐츠 생성', 'SEO 최적화', '이미지 생성', '스마트에디터'],
    buttonColor: 'bg-[#22c55e] hover:bg-[#16a34a] text-white',
    buttonText: '실습실 입장',
    badgeText: 'Part 2 · 조영빈',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: <Video className="size-8" />,
    iconBg: 'bg-[#ffe8ef]',
    iconColor: 'text-[#e11d48]',
    title: '숏폼 실습실',
    href: '/tools/shorts',
    description: '짧고 임팩트 있는 숏폼 콘텐츠로 브랜드를 확산하세요!',
    tags: ['숏폼 제작', '영상 편집', '트렌드 분석', 'VisKits'],
    buttonColor: 'bg-[#e11d48] hover:bg-[#be123c] text-white',
    buttonText: '실습실 입장',
    badgeText: 'Part 3 · 이석호',
    badgeBg: 'bg-rose-100 text-rose-700',
    featuredNote: (
      <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-1.5 text-xs text-rose-700">
        <span className="flex items-center gap-1 font-bold">
          <Sparkles className="size-3.5 text-rose-500" />
          공식 연동: VisKits AI
        </span>
        <a
          href="https://viskits.ai/home"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-0.5 font-bold underline hover:text-rose-900"
          onClick={(e) => e.stopPropagation()}
        >
          <span>viskits.ai</span>
          <ExternalLink className="size-3" />
        </a>
      </div>
    ),
  },
];

export function QuickLabLauncher() {
  return (
    <section className="w-full">
      {/* Section Header matching reference */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">⚡</span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              3대 실습실 퀵 런처
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            원하는 실습실을 선택해 바로 시작하세요!
          </p>
        </div>
      </div>

      {/* 3 Cards Grid matching the exact reference UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {LAB_CARDS.map((card) => (
          <div
            key={card.title}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
          >
            <div>
              {/* Card Top: Rounded Icon + Badge */}
              <div className="flex items-start justify-between">
                <div
                  className={`grid size-16 place-items-center rounded-2xl ${card.iconBg} ${card.iconColor} transition-transform duration-200 group-hover:scale-105`}
                >
                  {card.icon}
                </div>
                {card.badgeText && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${card.badgeBg}`}
                  >
                    {card.badgeText}
                  </span>
                )}
              </div>

              {/* Title with Right Chevron */}
              <Link
                href={card.href}
                className="mt-5 inline-flex items-center gap-1 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
              >
                <span>{card.title}</span>
                <ChevronRight className="size-4.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
              </Link>

              {/* Description */}
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium break-keep">
                {card.description}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-100/90 px-2 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Optional featured note (e.g. VisKits callout) */}
              {card.featuredNote}
            </div>

            {/* Bottom Button */}
            <div className="mt-6 pt-2">
              <Link
                href={card.href}
                className={`flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold shadow-sm transition active:scale-[0.98] ${card.buttonColor}`}
              >
                <span>{card.buttonText}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
