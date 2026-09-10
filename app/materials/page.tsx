'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Download,
  Copy,
  Check,
  Sparkles,
  FileText,
  FileCode,
  ArrowRight,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { LECTURE_MATERIALS, LecturePartMaterial } from '@/data/lecture-materials';
import { toast } from 'sonner';

export default function MaterialsPage() {
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const copyPrompt = (id: string, text: string, title: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      toast.success(`'${title}' 프롬프트가 클립보드에 복사되었습니다!`);
      setTimeout(() => setCopiedPromptId(null), 2500);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#10024a] pb-24 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,.3),transparent_30%),radial-gradient(circle_at_90%_70%,rgba(217,70,239,.25),transparent_35%)]" />

      {/* Hero Banner */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-[#180055] to-transparent py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-1.5 text-xs font-bold text-violet-200">
            <BookOpen className="size-4 text-violet-300" />
            <span>수강생 전용 공식 강의 교안 &amp; 프롬프트 팩</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
            강의 자료실 &amp; <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-pink-300 bg-clip-text text-transparent">실전 프롬프트 팩</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-violet-200/80 leading-relaxed">
            3인 대표 강사진이 실무에서 직접 검증한 <strong>공식 교안(PPT/PDF)</strong>과<br className="hidden sm:inline" />
            Claude 및 생성형 AI에 바로 복사해 넣을 수 있는 <strong>원클릭 프롬프트 템플릿 모음집</strong>입니다.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/guides/prep"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs sm:text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Laptop className="size-4 text-amber-300" />
              <span>실습 전 필수 준비물 확인하기</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Materials & Prompts Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {LECTURE_MATERIALS.map((part) => (
          <div
            key={part.partNumber}
            className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md"
          >
            {/* Part Header */}
            <div className={`bg-gradient-to-r ${part.accentColor} p-6 sm:p-8 text-white`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-lg bg-black/25 px-3 py-1 text-xs font-black tracking-wider uppercase">
                  {part.partNumber}
                </span>
                <span className="text-xs font-bold text-white/90">
                  강사: {part.instructor}
                </span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">
                {part.title}
              </h2>
              <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-white/85">
                {part.summary}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Downloadable Docs */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <Download className="size-4 text-violet-400" />
                  <span>공식 교안 &amp; 템플릿 파일</span>
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {part.downloadDocs.map((doc) => (
                    <div
                      key={doc.title}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-xs font-black text-violet-300">
                          {doc.type}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {doc.title}
                          </p>
                          <p className="mt-1 text-[11px] text-violet-300/70">
                            {doc.description} • <span className="text-white/60">{doc.fileSize}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toast.info('강의 당일 수강생 인증 후 정식 다운로드 링크가 오픈됩니다.')}
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                      >
                        <Download className="size-3.5" />
                        <span className="hidden sm:inline">다운로드</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready-to-use Prompt Packs */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <Sparkles className="size-4 text-fuchsia-400" />
                  <span>실전 프롬프트 팩 (원클릭 클립보드 복사)</span>
                </h3>

                <div className="mt-3 space-y-4">
                  {part.prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-black text-fuchsia-300">
                              {prompt.category}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {prompt.title}
                            </h4>
                          </div>
                          <p className="mt-1 text-[11px] text-violet-300/80">
                            {prompt.description}
                          </p>
                        </div>

                        <button
                          onClick={() => copyPrompt(prompt.id, prompt.promptTemplate, prompt.title)}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                            copiedPromptId === prompt.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-95'
                          }`}
                        >
                          {copiedPromptId === prompt.id ? (
                            <>
                              <Check className="size-3.5" />
                              <span>복사 완료!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              <span>프롬프트 복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Prompt Body */}
                      <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3.5 font-mono text-[11px] leading-relaxed text-slate-300">
                        {prompt.promptTemplate}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
