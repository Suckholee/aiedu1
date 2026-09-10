import Image from 'next/image';
import Link from 'next/link';
import { OnePageScroll } from '@/components/course/OnePageScroll';
import { ParticipantRosterSection } from '@/components/course/ParticipantRosterSection';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  Laptop,
  MapPin,
  MessageCircle,
  PlaySquare,
  Sparkles,
  UserRound,
} from 'lucide-react';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgfrrG2NV1QHbDG72TZEgmbLtqbpEsn9EE0Gv6LO8LCrggJg/viewform';
const CLAUDE_UPGRADE_URL = 'https://claude.ai/upgrade?from=menu';

const curriculum = [
  {
    icon: FileText,
    number: '01',
    instructor: '조영빈 대표',
    title: '클로드를 통한 업무 자동화',
    description: '막막했던 보고서와 기획안을 Claude와 함께 구조화하고, 필요한 내용을 빠르게 정리합니다.',
    points: ['업무별 AI 도구 & 클로드 활용법', '기획서·보고서 초안 만들기', '자료 요약과 분석의 흐름'],
  },
  {
    icon: MessageCircle,
    number: '02',
    instructor: '이석호 대표',
    title: 'AI와 블로그 시작하기',
    description: '휴대폰 속 사진을 활용해 검색에 잘 닿고 내 브랜드를 알리는 블로그 글을 만드는 과정을 실습합니다.',
    points: ['사진에서 핵심 정보 추출', '내 말투와 톤앤매너로 글쓰기', '제목·구성·태그 다듬기'],
  },
  {
    icon: PlaySquare,
    number: '03',
    instructor: '박재범 대표',
    title: 'AI로 숏폼 장착하기',
    description: '사진과 짧은 영상, 링크만으로 홍보용 숏폼 콘텐츠를 만드는 방법을 익힙니다.',
    points: ['콘텐츠 아이디어 빠르게 만들기', '사진·영상 소스 활용하기', '발행 전 체크 포인트'],
  },
];

const included = [
  'AI를 처음 써보는 분도 따라올 수 있는 단계별 실습',
  '바로 업무에 가져갈 수 있는 프롬프트와 작업 흐름',
  '휴대폰과 노트북에서 각각 활용하는 방법',
  '강의 후에도 다시 볼 수 있는 핵심 가이드',
];

const timeline = [
  ['AI 업무자동화 시작하기', 'AI가 내 업무에서 맡을 수 있는 일을 찾고, 오늘 사용할 도구와 흐름을 익힙니다.'],
  ['클로드를 통한 업무 자동화 (조영빈 대표)', '막막했던 기획서와 보고서를 Claude와 함께 구조화하고 실무에 바로 적용하는 실습을 진행합니다.'],
  ['AI와 블로그 시작하기 (이석호 대표)', '휴대폰 속 사진을 활용해 내 말투가 담긴 검색 상위 노출 블로그 글 초안을 완성합니다.'],
  ['AI로 숏폼 장착하기 (박재범 대표)', '사진·영상·링크를 활용해 내 비즈니스를 알리는 30초 홍보 숏폼 콘텐츠를 실습합니다.'],
  ['내 업무 적용 계획 & 질의응답', '강의 후 바로 이어갈 나만의 AI 업무 활용 계획을 정리하고 강사진과 피드백을 나눕니다.'],
];

const baseFaqs = [
  ['AI를 전혀 몰라도 들을 수 있나요?', '네. AI를 처음 활용하는 분을 기준으로, 화면을 함께 보며 따라 하는 방식으로 진행합니다.'],
  ['준비물이 있나요?', '실습을 위해 1. 개인 노트북, 2. 클로드 프로(Claude Pro, 월 약 $19) 구독이 필수입니다. 무료 플랜은 질문 횟수 제한으로 인해 실습이 중단될 수 있으니 사전에 공식 업그레이드 페이지(claude.ai/upgrade)에서 프로 구독을 완료해 주시기 바랍니다.'],
  ['노트북 기종(Mac/Windows)에 제한이 있나요?', '아닙니다. 웹 브라우저(크롬 권장) 환경에서 실습이 진행되므로 운영체제(윈도우/맥)와 관계없이 인터넷 연결이 가능한 노트북이면 참여하실 수 있습니다.'],
  ['어떤 AI 도구를 사용하나요?', '강의일 기준으로 가장 활용도가 높은 도구를 선정해 안내합니다. 사용 도구와 계정 준비 사항은 추후 확정해 넣을 수 있습니다.'],
  ['강의 자료를 받을 수 있나요?', '핵심 실습 가이드와 활용 문구를 제공할 예정입니다. 제공 범위는 운영 정책 확정 후 안내합니다.'],
];

const referralFaq: [string, string] = [
  '지인 초대 할인은 어떻게 적용되나요 (인원 기준)?',
  '초대한 본인 외에 동료나 지인 2명을 초대하여 함께 신청(본인 포함 총 3명 등록)하시면, 초대한 본인에게 50,000원 즉시 할인 혜택이 적용되어 본인 실 수강료 100,000원에 참여하실 수 있습니다. 신청서 작성 시 함께 오시는 지인 성함을 기재해 주시면 확인 후 할인이 적용됩니다.',
];

export interface AiWorkAutomationViewProps {
  variant?: 'default' | 'lhj';
}

export function AiWorkAutomationView({ variant = 'default' }: AiWorkAutomationViewProps) {
  const isLhj = variant === 'lhj';

  const faqs = isLhj
    ? baseFaqs
    : [
        baseFaqs[0],
        baseFaqs[1],
        referralFaq,
        baseFaqs[2],
        baseFaqs[3],
        baseFaqs[4],
      ];

  return (
    <OnePageScroll>
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_14%_5%,rgba(103,73,255,.45),transparent_25%),radial-gradient(circle_at_90%_34%,rgba(236,72,204,.25),transparent_22%),linear-gradient(145deg,#10024a_0%,#27006c_52%,#160050_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.65)_1px,transparent_1px)] [background-size:31px_31px]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#13034d]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-75">
            honestone <span className="text-white/45">&amp;</span> neoNpeter
          </Link>
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#210067] transition-transform hover:scale-105"
          >
            수강 신청하기
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 overflow-x-clip px-5 py-12 break-keep sm:px-8 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always lg:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:py-16">
        <div>
          <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-fuchsia-100 break-keep">
            <Sparkles className="size-4 shrink-0 text-fuchsia-300" />
            <span>AI 초급자를 위한 1day Learn AI · 얼리버드 접수 (9.7 ~ 9.14)</span>
          </div>
          <p className="mb-4 text-xs sm:text-sm font-bold tracking-wider text-violet-200 uppercase">HONESTONE &amp; NEONPETER</p>
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.15] tracking-tight text-white break-keep">
            AI 업무자동화
          </h1>
          <p className="mt-6 max-w-xl text-lg sm:text-2xl font-medium leading-snug sm:leading-relaxed text-white break-keep">
            AI를 업무에 활용하고 싶은데<br className="hidden sm:inline" />{' '}
            <strong className="font-extrabold text-fuchsia-200">무엇부터 해야 할지 막막한</strong> 당신에게.
          </p>
          <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-violet-100/85 break-keep">
            익히기만 하는 AI가 아니라, 내 업무 시간을 실제로 줄여주는 도구로 만듭니다. 3시간 동안 문서, 블로그, 숏폼 콘텐츠 자동화의 첫 결과물을 완성해 보세요.
          </p>

          <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {[
              ['얼리버드', '9.7(월) ~ 9.14(월)'],
              ['수강료', '150,000원'],
              ['일시', '9월 22일 (화)'],
              ['시간/장소', '17–20시 · 서초구'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:px-3 sm:py-4 backdrop-blur-sm break-keep">
                <p className="text-[11px] sm:text-xs text-violet-200">{label}</p>
                <p className="mt-1 text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs break-keep">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/15 px-3 py-1.5 font-bold text-fuchsia-200">
              🎁 참석자 전원: 20만원 상당 혜택 (숏폼 1개월권 + 블로그 10개권)
            </span>
            {isLhj ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 font-bold text-violet-200">
                ✨ 3인 대표 강사진의 실무 밀착 코칭 &amp; 실습 가이드
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 font-bold text-violet-200">
                👥 지인 2명 초대 시 본인 5만원 할인 (본인 외 2명)
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/20 px-3 py-1.5 font-bold text-amber-200">
              💻 필수 준비물: 1. 개인 노트북 · 2. 클로드 프로 구독 (미지참 시 실습 제한)
            </span>
          </div>

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 sm:py-5 text-base font-extrabold shadow-[0_15px_35px_rgba(217,70,239,.28)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(217,70,239,.38)] sm:w-auto"
          >
            지금 수강 신청하기 <ArrowRight className="size-5" />
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-sm overflow-hidden p-2">
          <div className="absolute inset-0 rounded-[2.5rem] bg-fuchsia-500/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-violet-500/10 p-2 shadow-2xl">
            <Image src="/posters/ai-work-automation-poster.png" alt="AI 업무자동화 강의 포스터" width={1587} height={2245} priority className="h-auto w-full rounded-[1.55rem]" />
          </div>
        </div>
      </section>

      <section className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-white py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 w-full">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">WHAT YOU WILL MAKE</p>
            <h2 className="mt-3 text-balance text-2xl sm:text-5xl font-black tracking-tight text-slate-900 break-keep">배우는 즉시, 내 업무에 쓰는 AI</h2>
            <p className="mt-3 sm:mt-5 text-base sm:text-lg leading-relaxed sm:leading-8 text-slate-600 break-keep">어려운 이론 대신, 가장 자주 마주하는 업무를 기준으로 AI 활용법을 익힙니다.</p>
          </div>
          <div className="mt-10 sm:mt-12 grid gap-5 lg:grid-cols-3">
            {curriculum.map(({ icon: Icon, number, instructor, title, description, points }) => (
              <article key={number} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 sm:p-7 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-xl break-keep">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Icon className="size-6" /></span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white shadow-xs">{instructor}</span>
                    <span className="text-sm font-black text-violet-300">{number}</span>
                  </div>
                </div>
                <h3 className="mt-6 text-xl sm:text-3xl font-black tracking-tight text-slate-900 leading-snug break-keep">{title}</h3>
                <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-slate-600 break-keep">{description}</p>
                <ul className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 text-sm font-medium text-slate-700 break-keep">
                  {points.map((point) => <li key={point} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-violet-600" /><span>{point}</span></li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-[#f5f0ff] py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center w-full">
          <div className="rounded-[2rem] bg-[#25006b] p-6 text-white shadow-xl sm:p-10 break-keep">
            <Laptop className="size-10 text-fuchsia-300" />
            <h2 className="mt-6 sm:mt-8 text-2xl sm:text-4xl font-black leading-snug sm:leading-tight tracking-tight text-white break-keep">
              AI, 잘 아는 사람이 아니라<br />잘 쓰는 사람이 앞서갑니다.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-violet-100 break-keep">
              처음이라도 괜찮습니다. 강의가 끝날 때까지 직접 따라 하며 나만의 자동화 시작점을 만들 수 있도록 돕습니다.
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">THIS CLASS IS FOR</p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 break-keep">이런 분께 추천합니다</h2>
            <div className="mt-6 sm:mt-7 grid gap-3 sm:grid-cols-2">
              {[
                '반복되는 문서·기획 업무를 줄이고 싶은 분',
                '블로그나 SNS 콘텐츠를 꾸준히 만들고 싶은 분',
                '휴대폰 사진을 업무 홍보에 활용하고 싶은 분',
                'AI를 처음부터 제대로 시작하고 싶은 분',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-white p-4 sm:p-5 font-semibold leading-relaxed text-sm sm:text-base shadow-sm break-keep">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-fuchsia-100 text-fuchsia-600"><Check className="size-4" /></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-white py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 w-full">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">INSTRUCTORS</p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 break-keep">강사 소개</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed sm:leading-7 text-slate-600 max-w-2xl mx-auto break-keep">
              어니스톤(조영빈 대표)과 neoNpeter(이석호 대표 · 박재범 대표)가 함께하는 3시간 실전 AI 업무자동화 마스터 클래스
            </p>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-6 lg:grid-cols-3">
            {/* 조영빈 대표 */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50 p-5 sm:p-7 shadow-sm transition hover:bg-white hover:shadow-lg break-keep">
              <div>
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-sm break-keep">
                  <span className="text-[10px] font-extrabold tracking-widest text-violet-200 uppercase">PART 01</span>
                  <h4 className="mt-0.5 text-lg sm:text-xl font-black tracking-tight text-white leading-tight break-keep">
                    클로드를 통한 업무 자동화
                  </h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-sm sm:h-24 sm:w-24">
                    <Image src="/instructors/cho-youngbin.png" alt="어니스톤 조영빈 대표" fill sizes="96px" className="object-cover object-[center_62%]" />
                  </div>
                  <div className="break-keep">
                    <p className="text-xs font-bold text-violet-700">어니스톤 대표</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">조영빈 대표</h3>
                    <p className="text-[11px] text-slate-500 font-medium">전문경영자문컨설턴트</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm break-keep">
                  중소기업 인증·정책자금·경영혁신 컨설팅과 강의를 운영하며, 현장에서 바로 적용할 수 있는 Claude 기반 비즈니스 자동화 실행 흐름을 설계합니다.
                </p>
              </div>

              <div className="mt-5 sm:mt-6 space-y-1.5 border-t border-slate-200 pt-5 text-xs text-slate-600 break-keep">
                <p>• 전문경영자문컨설턴트</p>
                <p>• ISO 심사원 양성과정 공동 운영</p>
                <p>• ERA Group 국내 컨설턴트</p>
                <p>• 와디즈 ‘사업학개론’ 2,100% 펀딩</p>
              </div>
            </div>

            {/* 이석호 대표 */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50 p-5 sm:p-7 shadow-sm transition hover:bg-white hover:shadow-lg break-keep">
              <div>
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 p-4 text-white shadow-sm break-keep">
                  <span className="text-[10px] font-extrabold tracking-widest text-fuchsia-200 uppercase">PART 02</span>
                  <h4 className="mt-0.5 text-lg sm:text-xl font-black tracking-tight text-white leading-tight break-keep">
                    AI와 블로그 시작하기
                  </h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-sm sm:h-24 sm:w-24">
                    <Image src="/instructors/lee-seokho.jpg" alt="neoNpeter 이석호 대표" fill sizes="96px" className="scale-[1.38] object-cover object-[center_28%]" />
                  </div>
                  <div className="break-keep">
                    <p className="text-xs font-bold text-fuchsia-700">neoNpeter 대표</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">이석호 대표</h3>
                    <p className="text-[11px] text-slate-500 font-medium">AI 교육 전문가 · 콘텐츠 디렉터</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm break-keep">
                  수많은 수강생의 AI 역량 강화를 이끈 실무 교육 전문성을 바탕으로, 사진 한 장으로 검색에 잘 닿는 실전 블로그 콘텐츠 제작 노하우를 안내합니다.
                </p>
              </div>

              <div className="mt-5 sm:mt-6 space-y-1.5 border-t border-slate-200 pt-5 text-xs text-slate-600 break-keep">
                <p>• neoNpeter 대표 / AI 교육 전문가</p>
                <p>• AI 콘텐츠 &amp; 블로그 자동화 전문가</p>
                <p>• 초보자 맞춤형 프롬프트 워크플로우 설계</p>
                <p>• 온·오프라인 실전 AI 워크숍 다수 진행</p>
              </div>
            </div>

            {/* 박재범 대표 */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50 p-5 sm:p-7 shadow-sm transition hover:bg-white hover:shadow-lg break-keep">
              <div>
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#220063] to-[#3a008c] p-4 text-white shadow-sm break-keep">
                  <span className="text-[10px] font-extrabold tracking-widest text-violet-300 uppercase">PART 03</span>
                  <h4 className="mt-0.5 text-lg sm:text-xl font-black tracking-tight text-white leading-tight break-keep">
                    AI로 숏폼 장착하기
                  </h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-sm sm:h-24 sm:w-24">
                    <Image src="/instructors/park-jaebeom.jpg" alt="neoNpeter 박재범 대표" fill sizes="96px" className="object-cover object-[center_28%]" />
                  </div>
                  <div className="break-keep">
                    <p className="text-xs font-bold text-violet-700">neoNpeter 대표</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">박재범 대표</h3>
                    <p className="text-[11px] text-slate-500 font-medium">AI 콘텐츠 &amp; 솔루션 디렉터</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm break-keep">
                  3년간의 AI 실전 강의 경력과 콘텐츠 기획 전문성을 바탕으로, 사진·글·숏폼 영상 자동화 제작 노하우를 안내합니다.
                </p>
              </div>

              <div className="mt-5 sm:mt-6 space-y-1.5 border-t border-slate-200 pt-5 text-xs text-slate-600 break-keep">
                <p>• neoNpeter 대표 / AI 콘텐츠 전문가</p>
                <p>• AI 실전 강의 경력 3년</p>
                <p>• AI 서비스 및 웹 솔루션 개발</p>
                <p>• 비즈니스 자동화 워크플로우 설계</p>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 rounded-[2rem] bg-slate-950 p-5 sm:p-10 text-white break-keep">
            <p className="text-xs font-black tracking-wider text-fuchsia-300 sm:text-sm uppercase">FROM BEFORE TO AFTER</p>
            <h2 className="mt-3 text-xl sm:text-3xl font-black tracking-tight text-white break-keep">강의 후, 이렇게 달라집니다</h2>
            <div className="mt-6 sm:mt-7 grid gap-4 md:grid-cols-3">
              {[
                ['문서 업무', '빈 화면에서 시작하던 기획·보고서 업무를 AI와 함께 빠르게 구조화합니다.'],
                ['콘텐츠 제작', '사진 한 장에서 블로그와 홍보 콘텐츠의 첫 초안을 만듭니다.'],
                ['일하는 방식', '반복되는 업무를 발견하고, AI에게 맡길 수 있는 흐름을 설계합니다.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 break-keep">
                  <h3 className="font-bold text-fuchsia-200">{title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300 break-keep">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-[#f5f0ff] py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 w-full">
          <div className="text-center">
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">PROGRAM</p>
            <h2 className="mt-3 text-2xl sm:text-5xl font-black tracking-tight text-slate-900 break-keep">커리큘럼</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 break-keep">실습 위주로 단계별 진행되는 3시간 실전 집중 과정입니다.</p>
          </div>
          <div className="mt-8 sm:mt-10 space-y-3">
            {timeline.map(([title, description], index) => (
              <div key={title} className="flex items-start gap-3.5 rounded-2xl bg-white p-4 shadow-sm sm:items-center sm:gap-6 sm:p-6 break-keep">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 font-black text-violet-700 sm:size-14 sm:text-lg">
                  0{index + 1}
                </span>
                <div className="break-keep">
                  <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600 break-keep">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-white py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8 w-full">
          <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">CLASS INFORMATION</p>
          <h2 className="mt-3 text-2xl sm:text-5xl font-black tracking-tight text-slate-900 break-keep">3시간이 바꾸는 업무의 속도</h2>
          <p className="mt-3 sm:mt-5 text-base sm:text-lg text-slate-600 break-keep">작은 자동화 하나가, 앞으로 반복할 수백 시간의 업무를 가볍게 만듭니다.</p>

          <div className="mt-8 sm:mt-10 grid overflow-hidden rounded-[1.75rem] border border-slate-200 text-left sm:grid-cols-2">
            {[
              [CalendarDays, '강의 일시', '9월 22일 (화) · 17:00–20:00'],
              [Sparkles, '얼리버드 접수', '9월 7일 (월) ~ 9월 14일 (월)'],
              [MapPin, '강의 장소', '서울 서초구'],
              [Clock3, '수강료', '150,000원'],
            ].map(([Icon, label, value]) => {
              const InfoIcon = Icon as typeof CalendarDays;
              return (
                <div key={label as string} className="flex items-center gap-4 border-b border-slate-200 p-4 sm:p-6 even:sm:border-l sm:[&:nth-last-child(-n+2)]:border-b-0 break-keep">
                  <InfoIcon className="size-6 shrink-0 text-violet-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">{label as string}</p>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-900 tracking-tight">{value as string}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 수강 실습 필수 준비물 안내 카드 */}
          <div className="mt-6 rounded-[1.75rem] border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/50 p-5 sm:p-7 text-left shadow-sm break-keep">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-xl bg-amber-500 text-white font-black text-xs shadow-xs">
                  필수
                </span>
                <h3 className="text-base sm:text-xl font-black tracking-tight text-slate-900">
                  실습 필수 준비물
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-800">
                <AlertCircle className="size-3.5 text-amber-600" />
                사전 준비 필수
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3.5 rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <Laptop className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-700">준비물 01</p>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    1. 개인 노트북
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">인터넷(와이파이) 연결 가능한 기기 지참</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-fuchsia-100 text-fuchsia-700">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-fuchsia-700">준비물 02</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      2. 클로드 프로 구독
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">$19 USD / 월 (부가세 포함)</p>
                  </div>
                </div>
                <a
                  href={CLAUDE_UPGRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-105 hover:opacity-95"
                >
                  <span>구독하기</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* 클로드 프로 상세 안내 및 혜택 카드 */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
              <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-black text-orange-700">
                      Claude Pro 요금제 안내
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      $19 USD / 월 (연간 결제 시 17% 할인 / $220 청구)
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      왜 클로드 프로(Claude Pro) 구독이 필요한가요?
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      3시간 동안 진행되는 실전 워크숍에서 문서 작성, 분석, 자동화 프롬프트를 끊김 없이 테스트하려면 <strong>더 높은 사용 한도와 고성능 모델</strong>이 필수적입니다. 무료 플랜은 질문 몇 번 만에 한도 초과로 몇 시간 대기가 발생하여 실습 참여가 제한됩니다.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                    <p className="text-xs font-bold text-slate-800 mb-2">✨ Free의 모든 기능 및 Pro 전용 혜택</p>
                    <ul className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <Check className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span><strong>더 높은 사용 한도</strong> (강의 실습 끊김 방지)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span><strong>더 많은 Claude 모델 이용 가능</strong> (Claude 3.5 Sonnet 등)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span><strong>대화 간 유지되는 메모리</strong>로 연속성 확보</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span><strong>Claude Code · Cowork · Claude Design</strong> 지원</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-1">
                    <a
                      href={CLAUDE_UPGRADE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <span>클로드 프로 공식 업그레이드 페이지 바로가기</span>
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                  <div className="relative aspect-[1/1.55] w-full overflow-hidden rounded-xl bg-slate-50">
                    <Image
                      src="/images/claude-pro-plan.png"
                      alt="Claude Pro 구독 플랜 안내"
                      fill
                      sizes="240px"
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
                    Claude Pro 플랜 공식 화면
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/80 bg-amber-100/90 px-4 py-3 text-xs sm:text-sm font-semibold text-amber-950">
              <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-amber-700" />
              <p className="leading-relaxed">
                <strong>주의사항:</strong> 위 준비물(<strong>개인 노트북</strong>, <strong>클로드 프로 구독</strong>)이 준비되지 않을 경우 강의 중 <strong>실습 진행에 제한이 있을 수 있으니</strong> 반드시 사전에 공식 업그레이드를 완료해 주시기 바랍니다.
              </p>
            </div>
          </div>

          {/* 수강생 특별 혜택 섹션 */}
          <div className="mt-6 sm:mt-8 grid gap-4 text-left sm:grid-cols-2">
            {/* 참석자 전원 혜택 */}
            <div className="rounded-[1.75rem] border border-fuchsia-300/30 bg-gradient-to-br from-[#1c004a] to-[#2c0068] p-5 sm:p-6 text-white shadow-md break-keep">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-black text-fuchsia-300">
                <Sparkles className="size-3.5" />
                참석자 전원 혜택 (총 20만원 상당)
              </div>
              <h3 className="mt-3 text-lg sm:text-xl font-black text-white tracking-tight">실전 AI 플랫폼 이용권 증정</h3>
              <ul className="mt-3.5 space-y-2 text-xs sm:text-sm text-violet-100">
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-fuchsia-300" />
                  <span><strong>AI 숏폼 영상 플랫폼 1개월 무료 구독권</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-fuchsia-300" />
                  <span><strong>AI 블로그 글 10개 무료 생성권</strong></span>
                </li>
              </ul>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs text-violet-200/80 leading-relaxed">
                * 수강료(15만원) 이상의 실전 생성 툴 혜택을 참석자 전원에게 지급합니다.
              </p>
            </div>

            {isLhj ? (
              /* 실무 즉시 적용 패키지 (이현주 대표 전용 페이지) */
              <div className="rounded-[1.75rem] border border-violet-300/30 bg-gradient-to-br from-[#27006c] to-[#17004f] p-5 sm:p-6 text-white shadow-md break-keep">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-black text-violet-300">
                  <Sparkles className="size-3.5" />
                  수강생 특별 혜택
                </div>
                <h3 className="mt-3 text-lg sm:text-xl font-black text-white tracking-tight">실무 즉시 적용 패키지 증정</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-violet-100">
                  강의 수강 후에도 사업 현장에서 끊김 없이 복습하고 활용하실 수 있도록 <strong>실전 프롬프트와 업무 매뉴얼</strong>을 모두 제공합니다.
                </p>
                <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-violet-200 space-y-1.5">
                  <p className="font-semibold text-fuchsia-200">• 3인 대표 강사진의 실전 프롬프트 템플릿 모음집</p>
                  <p>• 휴대폰 사진 활용 블로그 글 &amp; 숏폼 제작 가이드</p>
                  <p className="text-[11px] text-violet-300/90 leading-snug">
                    * 강의 종료 후 실무 적용을 위한 질의응답 및 피드백을 지원합니다.
                  </p>
                </div>
              </div>
            ) : (
              /* 지인 초대 할인 혜택 (기본 페이지) */
              <div className="rounded-[1.75rem] border border-violet-300/30 bg-gradient-to-br from-[#27006c] to-[#17004f] p-5 sm:p-6 text-white shadow-md break-keep">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-black text-violet-300">
                  <UserRound className="size-3.5" />
                  지인 초대 특별 프로모션
                </div>
                <h3 className="mt-3 text-lg sm:text-xl font-black text-white tracking-tight">지인 2명 초대 시 본인 5만원 할인</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-violet-100">
                  동료나 지인 <strong>2명을 초대하여 함께 신청(본인 외 2명, 총 3명)</strong>하시면, 초대한 본인의 수강료를 <strong className="text-fuchsia-300">50,000원 즉시 할인</strong>해 드립니다.
                </p>
                <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-violet-200 space-y-1.5">
                  <p>• 기본 1인 수강료: 150,000원</p>
                  <p className="font-bold text-fuchsia-200">• 지인 2명 초대 시 본인 수강료: 100,000원 (-50,000원)</p>
                  <p className="text-[11px] text-violet-300/90 leading-snug">
                    * 본인 외에 추가로 지인 2명을 초대(총 3명 함께 등록)할 때, 초대한 본인에게 5만원 할인 혜택이 적용됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 기본 수강 제공 사항 */}
          <div className="mt-4 rounded-[1.75rem] bg-slate-950 p-5 sm:px-10 sm:py-6 text-left text-white break-keep">
            <p className="text-xs font-bold tracking-wider text-violet-300 uppercase">기본 제공 실습 혜택</p>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex gap-2.5 text-xs sm:text-sm leading-relaxed text-slate-200">
                  <Check className="size-4 shrink-0 text-fuchsia-300 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ParticipantRosterSection googleFormUrl={GOOGLE_FORM_URL} showReferralPromo={!isLhj} />

      <section className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-slate-50 py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always">
        <div className="mx-auto grid max-w-6xl gap-8 sm:gap-12 px-5 sm:px-8 lg:grid-cols-2 w-full">
          <div>
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">FAQ</p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 break-keep">자주 묻는 질문</h2>
            <div className="mt-6 sm:mt-8 space-y-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 break-keep">
                  <summary className="cursor-pointer list-none pr-6 font-bold text-slate-900 text-sm sm:text-base marker:hidden">
                    {question}
                    <span className="float-right text-violet-600 transition group-open:rotate-45 font-black">+</span>
                  </summary>
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs sm:text-sm leading-relaxed text-slate-600 break-keep">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-violet-100 p-6 sm:p-9 break-keep">
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">POLICY · DRAFT</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 break-keep">신청 및 취소 안내</h2>
            <div className="mt-6 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 break-keep">
              <p><strong>신청 일정</strong><br />• 얼리버드 접수: <strong>9월 7일(월) ~ 9월 14일(월)</strong> (AI 맞춤 블로그 &amp; 숏폼 선제작 혜택)<br />• 일반 신청: 얼리버드 마감 후 잔여 좌석 마감 시까지</p>
              <p><strong>수강 필수 준비물</strong><br />
                • <strong>1. 개인 노트북</strong> (인터넷/와이파이 연결 가능 기기)<br />
                • <strong>2. 클로드 프로(Claude Pro) 구독</strong> ($19 USD/월 · <a href={CLAUDE_UPGRADE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-violet-700 underline hover:text-violet-900">공식 구독 페이지 ↗</a>)<br />
                <span className="font-semibold text-amber-800">* 필수 준비물이 없을 경우 강의 중 실습 진행에 제한이 있을 수 있습니다.</span>
              </p>
              <p><strong>특별 혜택 &amp; 안내</strong><br />
                • <strong>참석자 전원 혜택</strong>: AI 숏폼 플랫폼 1개월 무료 구독권 + AI 블로그 글 10개 무료 생성권 (총 20만원 상당 무료 제공)<br />
                {isLhj ? (
                  <span>• <strong>실습 코칭 혜택</strong>: 3인 전문 강사진의 실무 프롬프트 모음집 및 워크플로우 가이드북 제공</span>
                ) : (
                  <span>• <strong>지인 초대 할인</strong>: 본인 외 지인 2명 초대 시(본인 포함 총 3명 신청) 초대한 본인 수강료 50,000원 즉시 할인 (본인 실 수강료 100,000원)</span>
                )}
              </p>
              <p><strong>신청 확정</strong><br />신청 접수 후 결제 방법과 최종 안내를 개별로 보내드립니다.</p>
              <p><strong>취소·환불</strong><br />강의 운영 정책에 맞춰 취소 가능 기간, 환불 기준, 대체 수강 가능 여부를 확정 후 입력해 주세요.</p>
              <p><strong>문의</strong><br />조영빈 010-9630-9429 · 박재범 010-7398-8598</p>
              <div className="pt-2">
                <a
                  href="https://pf.kakao.com/_ZyfxaX/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] text-xs font-bold shadow-sm transition-all"
                >
                  <svg className="size-3.5 fill-[#191919]" viewBox="0 0 24 24">
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.83 5.31 4.59 6.66-.2.74-.73 2.68-.84 3.1-.13.51.19.5.39.37.16-.11 2.54-1.73 3.56-2.43.74.11 1.51.17 2.3.17 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                  </svg>
                  카카오톡 1:1 상담 문의
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="relative z-10 flex min-h-[calc(100svh-4rem)] w-full max-w-full items-center justify-center overflow-x-clip bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 px-5 py-16 text-center break-keep sm:px-8 md:snap-start md:snap-always">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:25px_25px]" />
        <div className="relative mx-auto max-w-3xl w-full break-keep">
          <Sparkles className="mx-auto size-9 text-fuchsia-200" />
          <h2 className="mt-5 text-balance text-3xl sm:text-6xl font-black leading-tight tracking-tight text-white break-keep">
            3시간만 투자하세요.<br />당신의 300시간이 절약됩니다.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-violet-100 break-keep">
            오늘의 막막함을, 내일의 일하는 방식으로 바꿔보세요.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-white break-keep">
            <span className="rounded-full bg-black/25 px-3.5 py-1.5 backdrop-blur-sm border border-white/15">
              🎁 참석자 전원: 20만원 상당 툴 혜택 (숏폼 1개월권 + 블로그 10개권)
            </span>
            {isLhj ? (
              <span className="rounded-full bg-black/25 px-3.5 py-1.5 backdrop-blur-sm border border-white/15">
                ✨ 3인 대표 강사진의 실무 밀착 코칭 &amp; 실습 가이드
              </span>
            ) : (
              <span className="rounded-full bg-black/25 px-3.5 py-1.5 backdrop-blur-sm border border-white/15">
                👥 지인 2명 초대 시 본인 5만원 할인 (본인 외 2명)
              </span>
            )}
            <span className="rounded-full bg-amber-500/25 px-3.5 py-1.5 backdrop-blur-sm border border-amber-300/30 text-amber-200">
              💻 필수 준비물: 1. 개인 노트북 · 2. 클로드 프로 구독 (미지참 시 실습 제한)
            </span>
          </div>

          <div className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 sm:py-5 text-base font-black text-violet-700 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              수강 신청서 작성하기 <ArrowRight className="size-5" />
            </a>
            <a
              href="https://pf.kakao.com/_ZyfxaX/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] px-6 py-4 sm:py-5 text-base font-bold shadow-xl transition hover:-translate-y-1"
            >
              <svg className="size-4 fill-[#191919]" viewBox="0 0 24 24">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.83 5.31 4.59 6.66-.2.74-.73 2.68-.84 3.1-.13.51.19.5.39.37.16-.11 2.54-1.73 3.56-2.43.74.11 1.51.17 2.3.17 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              카톡 문의
            </a>
          </div>
          <p className="mt-6 text-xs sm:text-sm text-violet-100/90 break-keep">문의 · 조영빈 010-9630-9429 &nbsp;|&nbsp; 박재범 010-7398-8598</p>
          <footer className="mt-10 sm:mt-12 text-center text-xs text-violet-200/60">honestone &amp; neoNpeter · 1day Learn AI</footer>
        </div>
      </section>
    </OnePageScroll>
  );
}
