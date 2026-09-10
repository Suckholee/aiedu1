import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  FileText,
  MessageCircle,
  PlaySquare,
  BookOpen,
  Laptop,
  Check,
  CalendarDays,
  MapPin,
  Clock3,
  ExternalLink,
  Flame,
  Award,
} from 'lucide-react';
import { ParticipantRosterSection } from '@/components/course/ParticipantRosterSection';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';
const CLAUDE_UPGRADE_URL = 'https://claude.ai/upgrade?from=menu';

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Background radial effects */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_14%_5%,rgba(103,73,255,.45),transparent_25%),radial-gradient(circle_at_90%_34%,rgba(236,72,204,.25),transparent_22%),linear-gradient(145deg,#10024a_0%,#27006c_52%,#160050_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.65)_1px,transparent_1px)] [background-size:31px_31px]" />

      {/* ── 1. Hero Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-4 py-2 text-xs sm:text-sm font-semibold text-fuchsia-200">
              <Sparkles className="size-4 shrink-0 text-fuchsia-300" />
              <span>AI 초급자를 위한 1day Learn AI · 수강생 전용 포털</span>
            </div>

            <p className="mb-3 text-xs sm:text-sm font-bold tracking-wider text-violet-300 uppercase">
              HONESTONE &amp; NEONPETER
            </p>

            <h1 className="text-balance text-4xl sm:text-6xl font-black leading-[1.15] tracking-tight text-white break-keep">
              AI 업무자동화<br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-200 to-violet-200 bg-clip-text text-transparent">
                실전 마스터 클래스
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-xl font-medium leading-relaxed text-violet-100/90 break-keep">
              AI를 업무에 활용하고 싶은데 <strong className="font-extrabold text-fuchsia-200">무엇부터 해야 할지 막막한</strong> 당신을 위해.<br className="hidden sm:inline" />
              3시간 동안 문서·블로그·숏폼 콘텐츠의 실전 결과물을 직접 완성합니다.
            </p>

            {/* Quick Meta Info Box */}
            <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {[
                ['얼리버드', '9.7(월) ~ 9.14(월)'],
                ['수강료', '150,000원'],
                ['일시', '9월 22일 (화)'],
                ['시간/장소', '17–20시 · 서초구'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-4 backdrop-blur-sm break-keep">
                  <p className="text-[11px] sm:text-xs text-violet-200">{label}</p>
                  <p className="mt-1 text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">{value}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs break-keep">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/20 px-3 py-1.5 font-bold text-fuchsia-200">
                🎁 참석자 전원: 20만원 상당 혜택 (숏폼 1개월권 + 블로그 10개권)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/20 px-3 py-1.5 font-bold text-violet-200">
                👥 지인 2명 초대 시 본인 5만원 즉시 할인
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-4 text-base font-black shadow-[0_15px_35px_rgba(217,70,239,.3)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(217,70,239,.4)] text-white"
              >
                <span>수강 신청서 작성하기</span>
                <ArrowRight className="size-5" />
              </a>

              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                <Flame className="size-4 text-fuchsia-400" />
                <span>얼리버드 제작 샘플 보기</span>
              </Link>
            </div>
          </div>

          {/* Poster image card */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="absolute inset-0 rounded-[2.5rem] bg-fuchsia-500/25 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/5 p-2 shadow-2xl backdrop-blur-sm">
              <Image
                src="/posters/ai-work-automation-poster.png"
                alt="AI 업무자동화 강의 포스터"
                width={1587}
                height={2245}
                priority
                className="h-auto w-full rounded-[1.5rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 수강생 실습 허브 (3대 스튜디오 빠른 진입) ── */}
      <section className="relative z-10 bg-[#160455]/80 py-14 border-y border-white/10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300">
                <Sparkles className="size-3.5" />
                HANDS-ON PRACTICE
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
                수강생 전용 3대 실습 스튜디오
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-violet-200/80">
                강의 진행 중 실시간으로 실습하고, 수강 후에도 언제든지 나만의 콘텐츠를 생성할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Part 1 */}
            <div className="group flex flex-col justify-between rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/10 hover:shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
                    <FileText className="size-6" />
                  </span>
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-[11px] font-black text-violet-300">
                    PART 01 · 조영빈 대표
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black text-white group-hover:text-fuchsia-300 transition">
                  클로드 업무자동화 스튜디오
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-violet-200/80 leading-relaxed">
                  백지 상태의 막막함을 해소! 기획서, 보고서, 회의록 요약 초안을 10분 만에 구조화하는 프롬프트 툴.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-violet-100/90 border-t border-white/10 pt-4">
                  <li className="flex items-center gap-2">✓ 기획서 &amp; 보고서 초안 생성기</li>
                  <li className="flex items-center gap-2">✓ 회의록 3분 요약 &amp; Action Items</li>
                  <li className="flex items-center gap-2">✓ 임원 보고용 비즈니스 프롬프트 팩</li>
                </ul>
              </div>

              <Link
                href="/tools/work-automation"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-violet-500"
              >
                <span>실습실 입장하기</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Part 2 */}
            <div className="group flex flex-col justify-between rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-fuchsia-400/50 hover:bg-white/10 hover:shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white shadow-md">
                    <MessageCircle className="size-6" />
                  </span>
                  <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-[11px] font-black text-fuchsia-300">
                    PART 02 · 이석호 대표
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black text-white group-hover:text-fuchsia-300 transition">
                  AI 네이버 블로그 스튜디오
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-violet-200/80 leading-relaxed">
                  휴대폰 속 사진 3장을 업로드하고 키워드를 지정하면, 네이버 스마트에디터 ONE 양식으로 글이 완성됩니다.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-violet-100/90 border-t border-white/10 pt-4">
                  <li className="flex items-center gap-2">✓ 휴대폰 사진 업로드 &amp; Vision 분석</li>
                  <li className="flex items-center gap-2">✓ 스마트에디터 ONE 인터페이스</li>
                  <li className="flex items-center gap-2">✓ 네이버 블로그 원클릭 복사 기능</li>
                </ul>
              </div>

              <Link
                href="/tools/blog"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-fuchsia-500"
              >
                <span>실습실 입장하기</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Part 3 */}
            <div className="group flex flex-col justify-between rounded-3xl border border-indigo-400/40 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-pink-400/60 hover:bg-white/15 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 size-28 rounded-full bg-pink-500/20 blur-2xl" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-700 text-white shadow-md">
                    <PlaySquare className="size-6" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-pink-500/25 border border-pink-400/40 px-2.5 py-0.5 text-[10px] font-black text-pink-300">
                      VisKits 공식 연동
                    </span>
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black text-indigo-300">
                      PART 03 · 박재범 대표
                    </span>
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-black text-white group-hover:text-pink-300 transition">
                  AI 숏폼 영상 제작 (VisKits)
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-violet-200/90 leading-relaxed">
                  30초 만에 완판 부르는 숏폼의 중심, <strong className="text-pink-300">VisKits (비스킷츠)</strong>! 4대 후킹 공식 대본과 원클릭 AI 영상 렌더링.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-violet-100/90 border-t border-white/10 pt-4">
                  <li className="flex items-center gap-2">✓ <strong>VisKits 1개월 무료 이용권</strong> 지급 (참석자 전원)</li>
                  <li className="flex items-center gap-2">✓ 30초 질문·충격·공감 4대 후킹 공식 스크립트</li>
                  <li className="flex items-center gap-2">✓ AI 음성(TTS) &amp; 9:16 비디오 캔버스 즉시 생성</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/tools/shorts"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:opacity-95 shadow-md"
                >
                  <span>숏폼 스튜디오 입장하기</span>
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="https://viskits.ai/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-bold text-pink-300 hover:text-white hover:bg-white/10 transition"
                >
                  <span>VisKits 공식 홈 (viskits.ai) 바로가기</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 강사진 소개 ── */}
      <section className="relative z-10 bg-white py-16 text-slate-900 break-keep sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">INSTRUCTORS</p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              실무 밀착 코칭 강사진
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              어니스톤(조영빈 대표)과 neoNpeter(이석호 대표 · 박재범 대표)가 함께 진행하는 3시간 실전 집중 과정
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* 조영빈 대표 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:shadow-xl">
              <div>
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
                  <span className="text-[10px] font-extrabold tracking-widest text-violet-200 uppercase">PART 01</span>
                  <h4 className="mt-0.5 text-lg font-black tracking-tight">클로드를 통한 업무 자동화</h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-sm">
                    <Image src="/instructors/cho-youngbin.png" alt="조영빈 대표" fill sizes="80px" className="object-cover object-[center_62%]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-700">어니스톤 대표</p>
                    <h3 className="text-xl font-black text-slate-900">조영빈 대표</h3>
                    <p className="text-[11px] text-slate-500 font-medium">전문경영자문컨설턴트</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  중소기업 인증·정책자금·경영혁신 컨설팅과 강의를 운영하며, 현장에서 바로 적용할 수 있는 Claude 기반 비즈니스 자동화 실행 흐름을 설계합니다.
                </p>
              </div>

              <div className="mt-6 space-y-1.5 border-t border-slate-200 pt-5 text-xs text-slate-600">
                <p>• 전문경영자문컨설턴트</p>
                <p>• ISO 심사원 양성과정 공동 운영</p>
                <p>• ERA Group 국내 컨설턴트</p>
                <p>• 와디즈 ‘사업학개론’ 2,100% 펀딩</p>
              </div>
            </div>

            {/* 이석호 대표 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:shadow-xl">
              <div>
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 p-4 text-white">
                  <span className="text-[10px] font-extrabold tracking-widest text-fuchsia-200 uppercase">PART 02</span>
                  <h4 className="mt-0.5 text-lg font-black tracking-tight">AI와 블로그 시작하기</h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-sm">
                    <Image src="/instructors/lee-seokho.jpg" alt="이석호 대표" fill sizes="80px" className="scale-[1.38] object-cover object-[center_28%]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-fuchsia-700">neoNpeter 대표</p>
                    <h3 className="text-xl font-black text-slate-900">이석호 대표</h3>
                    <p className="text-[11px] text-slate-500 font-medium">AI 교육 전문가 · 콘텐츠 디렉터</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  수많은 수강생의 AI 역량 강화를 이끈 실무 교육 전문성을 바탕으로, 사진 한 장으로 검색에 잘 닿는 실전 블로그 콘텐츠 제작 노하우를 안내합니다.
                </p>
              </div>

              <div className="mt-6 space-y-1.5 border-t border-slate-200 pt-5 text-xs text-slate-600">
                <p>• neoNpeter 대표 / AI 교육 전문가</p>
                <p>• AI 콘텐츠 &amp; 블로그 자동화 전문가</p>
                <p>• 초보자 맞춤형 프롬프트 워크플로우 설계</p>
                <p>• 온·오프라인 실전 AI 워크숍 다수 진행</p>
              </div>
            </div>

            {/* 박재범 대표 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:shadow-xl">
              <div>
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#220063] to-[#3a008c] p-4 text-white">
                  <span className="text-[10px] font-extrabold tracking-widest text-violet-300 uppercase">PART 03</span>
                  <h4 className="mt-0.5 text-lg font-black tracking-tight">AI로 숏폼 장착하기</h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-sm">
                    <Image src="/instructors/park-jaebeom.jpg" alt="박재범 대표" fill sizes="80px" className="object-cover object-[center_28%]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-700">neoNpeter 대표</p>
                    <h3 className="text-xl font-black text-slate-900">박재범 대표</h3>
                    <p className="text-[11px] text-slate-500 font-medium">AI 콘텐츠 &amp; 솔루션 디렉터</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  3년간의 AI 실전 강의 경력과 콘텐츠 기획 전문성을 바탕으로, 사진·글·숏폼 영상 자동화 제작 노하우를 안내합니다.
                </p>
              </div>

              <div className="mt-6 space-y-1.5 border-t border-slate-200 pt-5 text-xs text-slate-600">
                <p>• neoNpeter 대표 / AI 콘텐츠 전문가</p>
                <p>• AI 실전 강의 경력 3년</p>
                <p>• AI 서비스 및 웹 솔루션 개발</p>
                <p>• 비즈니스 자동화 워크플로우 설계</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 실시간 얼리버드 & 신청자 현황 ── */}
      <ParticipantRosterSection googleFormUrl={GOOGLE_FORM_URL} showReferralPromo={true} />

      {/* ── 5. 수강 준비물 & 안내 카드 ── */}
      <section className="relative z-10 bg-[#160455] py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wider text-amber-300 uppercase">BEFORE CLASS</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight">
              실습 필수 준비물 안내
            </h2>
            <p className="mt-2 text-sm text-violet-200">
              원활한 실습 참여를 위해 강의 전 아래 2가지를 반드시 준비해 주시기 바랍니다.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/30 text-violet-300">
                  <Laptop className="size-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-violet-300">준비물 01</span>
                  <h3 className="text-lg font-black text-white">개인 노트북 지참</h3>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-violet-200/80 leading-relaxed">
                Mac/Windows 상관없이 웹 브라우저(크롬 권장)와 와이파이 연결이 가능한 노트북을 지참해 주세요.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-fuchsia-500/30 text-fuchsia-300">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-fuchsia-300">준비물 02</span>
                    <h3 className="text-lg font-black text-white">클로드 프로 (Claude Pro) 구독</h3>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-violet-200/80 leading-relaxed">
                질문 횟수 제한으로 실습이 끊기지 않도록, 공식 업그레이드 페이지에서 Pro 플랜(월 $19)을 사전 구독해 주세요.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href="/guides/prep"
                  className="text-xs font-bold text-fuchsia-300 hover:text-white underline underline-offset-4 transition"
                >
                  자세한 가이드 보기 &rarr;
                </Link>
                <a
                  href={CLAUDE_UPGRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  <span>구독 페이지 바로가기</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
