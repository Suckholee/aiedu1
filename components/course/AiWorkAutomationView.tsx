import Image from 'next/image';
import Link from 'next/link';
import { CourseInstructorProfiles } from '@/components/course/CourseInstructorProfiles';
import { courseInstructorProfiles, publicCourseDescription } from '@/lib/course-presentation';
import { OnePageScroll } from '@/components/course/OnePageScroll';
import type { PlatformCourse } from '@/lib/platform-types';
import { ArrowRight, CalendarDays, Check, Clock3, FileText, Laptop, MapPin, MessageCircle, PlaySquare, Sparkles } from 'lucide-react';

const curriculum = [
  {
    icon: FileText,
    number: '01',
    instructor: '조영빈 대표',
    title: '말로 한 상담이 보고서가 되기까지 (Claude 업무자동화)',
    description: '현장에서 말로 나눈 3분 녹음·메모를 Claude로 완성형 비즈니스 문서로 바꾸고, 나만의 스킬(Skill)로 굳혀 반복 업무를 10분으로 줄입니다.',
    points: ['3분 음성 녹취록 → 정갈한 비즈니스 문서화', 'Claude 나만의 자동화 스킬(/skill) 굳히기', '워드(.docx) & 엑셀(.xlsx) 파일 원클릭 추출'],
  },
  {
    icon: MessageCircle,
    number: '02',
    instructor: '이석호 대표',
    title: '크롬으로 블로그 자동화하기',
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
  ['크롬으로 블로그 자동화하기 (이석호 대표)', '휴대폰 속 사진을 활용해 내 말투가 담긴 검색 상위 노출 블로그 글 초안을 완성합니다.'],
  ['AI로 숏폼 장착하기 (박재범 대표)', '사진·영상·링크를 활용해 내 비즈니스를 알리는 30초 홍보 숏폼 콘텐츠를 실습합니다.'],
  ['내 업무 적용 계획 & 질의응답', '강의 후 바로 이어갈 나만의 AI 업무 활용 계획을 정리하고 강사진과 피드백을 나눕니다.'],
];

export function AiWorkAutomationView({ course }: { course: PlatformCourse }) {
  const description = publicCourseDescription(course.description);
  const instructors = course.instructors ?? courseInstructorProfiles(course.instructor);
  const date = course.startDate
    ? new Date(`${course.startDate}T00:00:00+09:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' })
    : '일정 안내 예정';
  const price = `${course.price.toLocaleString()}원`;
  const applicationOpen = course.enrollmentOpen !== false && course.remainingSeats > 0;
  const applyUrl = `/apply?course=${encodeURIComponent(course.id)}`;
  const faqs = [
    ['AI를 전혀 몰라도 들을 수 있나요?', '네. AI를 처음 활용하는 분을 기준으로, 화면을 함께 보며 따라 하는 방식으로 진행합니다.'],
    ['준비물이 있나요?', '인터넷 연결이 가능한 개인 노트북과 Claude Pro 계정을 준비해주세요. Mac과 Windows 모두 크롬 브라우저에서 실습할 수 있습니다.'],
    ['수강신청은 어떻게 하나요?', '수강 신청하기를 누르고 카카오톡 또는 Google 계정으로 로그인한 뒤 신청서를 작성해주세요. 신청 접수와 최종 수강 승인은 별도로 처리됩니다.'],
    ['신청과 결제 내역은 어디에서 확인하나요?', '로그인한 계정의 ‘내 신청·결제 목록’에서 신청 내용, 주문별 납부 안내와 처리 상태를 확인할 수 있습니다.'],
  ];
  const applyLink = (label: string, className: string) => applicationOpen
    ? <Link href={applyUrl} className={className}>{label}<ArrowRight className="size-4 shrink-0" /></Link>
    : <span aria-disabled="true" className={`${className} opacity-60`}>모집 마감</span>;

  return (
    <OnePageScroll>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#13034d]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white sm:text-base">honestone <span className="text-white/45">&amp;</span> neoNpeter</Link>
          <div className="flex items-center gap-4">
            <Link href="/my-applications" className="hidden text-xs text-violet-100 sm:block">내 신청·결제</Link>
            {applyLink('수강 신청하기', 'inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#210067]')}
          </div>
        </div>
      </header>

      <section aria-labelledby="promotion-title" className="relative mx-auto grid w-full max-w-6xl items-center gap-10 overflow-x-clip px-5 py-12 break-keep sm:px-8 md:min-h-[calc(100svh-4rem)] md:snap-start lg:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:py-16">
        <div>
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-fuchsia-100 sm:text-sm"><Sparkles className="size-4"/>AI 초급자를 위한 1day Learn AI</div>
          <p className="mb-4 text-xs font-bold tracking-wider text-violet-200 sm:text-sm">HONESTONE &amp; NEONPETER</p>
          <h1 id="promotion-title" className="text-balance text-4xl font-black leading-[1.15] tracking-tight text-white sm:text-6xl lg:text-7xl">AI 업무자동화</h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white sm:text-2xl">AI를 업무에 활용하고 싶은데<br/><strong className="font-extrabold text-fuchsia-200">무엇부터 해야 할지 막막한</strong> 당신에게.</p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-violet-100/85 sm:text-base">익히기만 하는 AI가 아니라, 내 업무 시간을 실제로 줄여주는 도구로 만듭니다. 3시간 동안 문서, 블로그, 숏폼 콘텐츠 자동화의 첫 결과물을 완성해 보세요.</p>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
            {[
              ['강의 일시', date],
              ['강의 시간', `${course.startTime}–${course.endTime}`],
              ['강의 장소', course.location || '장소 안내 예정'],
              ['수강료', price],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs text-violet-200">{label}</p><p className="mt-1 text-sm font-bold text-white">{value}</p></div>)}
          </div>
          {applyLink('지금 수강 신청하기', 'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-base font-extrabold text-white shadow-xl transition hover:-translate-y-1 sm:w-auto')}
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-violet-600/40 via-[#220063] to-fuchsia-700/40 p-6 shadow-2xl sm:p-8">
          <p className="text-xs font-bold tracking-[.2em] text-fuchsia-200">1DAY LEARN AI</p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">내 업무에 바로 쓰는<br/><span className="text-fuchsia-200">세 가지 자동화.</span></h2>
          <div className="mt-8 space-y-4">
            {[
              ['01', '조영빈 대표', '말로 한 상담이 보고서로', '/instructors/cho-youngbin.png', 'center 62%'],
              ['02', '이석호 대표', '사진 한 장이 블로그로', '/instructors/lee-seokho.jpg', 'center 28%'],
              ['03', '박재범 대표', '아이디어가 숏폼 영상으로', '/instructors/park-jaebeom.jpg', 'center 28%'],
            ].map(([number, name, title, image, position]) => <div key={number} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-xl"><Image src={image} alt={name} fill sizes="64px" style={{objectPosition: position}} className="object-cover" /></div><div><p className="text-xs font-bold text-fuchsia-200">{number} · {name}</p><p className="mt-1 text-sm font-bold text-white sm:text-base">{title}</p></div></div>)}
          </div>
          <p className="mt-7 border-t border-white/20 pt-5 text-sm font-semibold text-violet-100">어니스톤 × 네오앤피터 · 3시간 실전 마스터 클래스</p>
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
          {description && <section id="course-introduction" aria-labelledby="course-introduction-title" className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"><h2 id="course-introduction-title" className="text-2xl font-black text-slate-900">과정 소개</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{description}</p></section>}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs sm:text-sm font-black tracking-wider text-violet-600 uppercase">INSTRUCTORS</p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 break-keep">강사 소개</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed sm:leading-7 text-slate-600 max-w-2xl mx-auto break-keep">
              어니스톤(조영빈 대표)과 neoNpeter(이석호 대표 · 박재범 대표)가 함께하는 3시간 실전 AI 업무자동화 마스터 클래스
            </p>
          </div>

          <div className="mt-8 sm:mt-10"><CourseInstructorProfiles profiles={instructors}/></div>

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

      <section className="w-full bg-white py-12 text-slate-900 sm:py-16 md:snap-start">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="text-xs font-black tracking-wider text-violet-600">CLASS INFORMATION</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">3시간이 바꾸는 업무의 속도</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              [CalendarDays, '강의 일시', date],
              [Clock3, '강의 시간', `${course.startTime}–${course.endTime}`],
              [MapPin, '강의 장소', course.location || '장소 안내 예정'],
              [Sparkles, '수강료', price],
            ].map(([Icon, label, value]) => { const InfoIcon = Icon as typeof CalendarDays; return <div key={label as string} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5"><InfoIcon className="size-6 shrink-0 text-violet-600"/><div><p className="text-xs text-slate-500">{label as string}</p><p className="mt-1 font-bold">{value as string}</p></div></div>; })}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h3 className="flex items-center gap-2 font-bold"><Laptop className="size-5 text-violet-600"/>실습 준비물</h3><p className="mt-3 text-sm leading-7">개인 노트북과 Claude Pro 계정을 준비해주세요. 인터넷에 연결 가능한 노트북으로 함께 실습합니다. 서비스 구독료는 수강료와 별도입니다.</p></div>
          <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white"><h3 className="font-bold text-fuchsia-200">기본 제공 실습 안내</h3><ul className="mt-4 grid gap-3 sm:grid-cols-2">{included.map(item => <li key={item} className="flex gap-2 text-sm text-slate-200"><Check className="size-4 shrink-0 text-fuchsia-300"/>{item}</li>)}</ul></div>
        </div>
      </section>

      <section className="bg-slate-50 py-12 text-slate-900 sm:py-16 md:snap-start">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-2">
          <div><p className="text-xs font-black tracking-wider text-violet-600">FAQ</p><h2 className="mt-3 text-3xl font-black">자주 묻는 질문</h2><div className="mt-6 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold text-sm">{question}</summary><p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></div>
          <div className="rounded-[2rem] bg-violet-100 p-6 sm:p-9"><p className="text-xs font-black tracking-wider text-violet-600">APPLICATION GUIDE</p><h2 className="mt-3 text-3xl font-black">신청 및 수강 안내</h2><div className="mt-6 space-y-5 text-sm leading-7 text-slate-700"><p><strong>수강신청</strong><br/>카카오톡 또는 Google 계정으로 로그인한 뒤 신청서를 작성해주세요. 신청과 결제 상태는 같은 계정의 ‘내 신청·결제 목록’에 저장됩니다.</p><p><strong>신청 확정</strong><br/>신청 접수와 수강 승인은 별도로 처리합니다. 신청 후 주문별 납부 안내와 처리 상태를 확인해주세요.</p><p><strong>취소·환불</strong><br/>신청 화면의 취소·환불 안내를 확인한 뒤 동의해주세요.</p><Link href="/my-applications" className="inline-flex items-center gap-2 font-bold text-violet-700 underline">내 신청·결제 목록 확인<ArrowRight className="size-4"/></Link></div></div>
        </div>
      </section>

      <section id="apply" className="relative flex min-h-[65svh] items-center justify-center bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 px-5 py-16 text-center sm:px-8 md:snap-start">
        <div className="mx-auto max-w-3xl"><Sparkles className="mx-auto size-9 text-fuchsia-200"/><h2 className="mt-5 text-balance text-3xl font-black leading-tight text-white sm:text-5xl">오늘의 막막함을,<br/>내일의 일하는 방식으로.</h2><p className="mt-5 text-sm leading-7 text-violet-100">{date} · {course.startTime}–{course.endTime}<br/>{course.location} · {price}</p>{applyLink('수강 신청서 작성하기', 'mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black text-violet-700 shadow-xl transition hover:-translate-y-1')}<Link href="/courses" className="mt-6 block text-sm text-violet-100 underline">전체 교육과정 보기</Link></div>
      </section>
    </OnePageScroll>
  );
}
