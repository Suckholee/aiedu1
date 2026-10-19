import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, Code2, Database, Globe2, Laptop, Layers3 } from 'lucide-react';
import { PLATFORM_BUILDING_WORKSHOP as workshop } from '@/lib/platform-building-workshop';
import { merchant } from '@/lib/merchant';

export const metadata: Metadata = {
  metadataBase: new URL('https://aiedu1.vercel.app'),
  title: '나만의 플랫폼 만들기 · 11월 2일·9일 | 네오앤피터',
  description: '2회 총 8시간, 아이디어 기획부터 화면·데이터·AI 연결과 배포까지. 위든타워 3층, 전체 수강료 400,000원. 수업 시간은 추후 안내합니다.',
  openGraph: { title: '나만의 플랫폼 만들기', description: '11월 2일·9일 · 2회 총 8시간 · 40만원', images: [{ url: workshop.poster, width: 1200, height: 675, alt: '11월 2일·9일 나만의 플랫폼 만들기, 2회 총 8시간, 전체 40만원' }] },
};

const steps = [
  [Layers3, '설계', '누가 쓰고, 무엇을 해결할지 정합니다.'],
  [Code2, '구현', 'AI와 대화하며 화면과 기능을 만듭니다.'],
  [Database, '연결', '데이터 저장과 자동화를 연결합니다.'],
  [Globe2, '배포', '다른 기기에서도 열리는 주소를 만듭니다.'],
] as const;

export default function PlatformWorkshopPage() {
  return <div className="overflow-hidden rounded-3xl bg-[#f4f4ee] text-[#102639] selection:bg-lime-200">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-[#102639] px-6 py-4 text-white sm:px-10">
      <Link href="/courses" className="text-sm font-semibold">← 전체 교육과정</Link>
      <a href="#workshop-schedule" className="inline-flex items-center gap-2 text-xs font-bold text-[#d5f78c]">교육 일정·수강료<ArrowDown className="size-4"/></a>
    </div>
    <section className="relative grid gap-10 bg-[#102639] px-6 py-12 text-white sm:px-10 sm:py-16 xl:grid-cols-[1.05fr_.95fr] xl:items-center" aria-labelledby="workshop-title">
      <div>
        <p className="text-xs font-bold tracking-[.18em] text-[#d5f78c]">NEO &amp; PETER / BUILD YOUR OWN PLATFORM</p>
        <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full border border-white/25 px-3 py-1.5">11.02 + 11.09</span><span className="rounded-full border border-white/25 px-3 py-1.5">2회 × 4시간</span><span className="rounded-full border border-white/25 px-3 py-1.5">오프라인 실습</span></div>
        <h1 id="workshop-title" className="mt-7 text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl">나만의 플랫폼<br/><span className="text-[#d5f78c]">만들기.</span></h1>
        <p className="mt-7 text-xl font-semibold leading-relaxed sm:text-2xl">생각만 하던 아이디어를,<br/>내가 쓰는 서비스의 첫 버전으로.</p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">화면을 만드는 데서 멈추지 않습니다. 입력한 정보가 저장되고, AI와 자동화가 연결되고, 내 주소로 열리는 작은 플랫폼을 직접 만들어봅니다.</p>
        <a href="#workshop-curriculum" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#d5f78c] px-6 py-3.5 text-sm font-extrabold text-[#102639] hover:bg-lime-200">8시간의 커리큘럼 살펴보기<ArrowDown className="size-4"/></a>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/[.06] p-5 sm:p-7">
        <p className="mb-4 text-xs tracking-wider text-slate-300">수업 예시 / 내 할 일을 관리하는 작은 플랫폼</p>
        <div className="overflow-hidden rounded-xl bg-[#f8faf8] text-[#102639] shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3"><span className="size-2 rounded-full bg-[#b9cdc5]"/><span className="size-2 rounded-full bg-[#b9cdc5]"/><span className="size-2 rounded-full bg-[#b9cdc5]"/><span className="ml-3 text-[10px] text-slate-500">MY FIRST PLATFORM</span></div>
          <div className="p-5 sm:p-7"><p className="text-[11px] font-bold text-teal-700">MY WORKSPACE</p><h2 className="mt-2 text-2xl font-black">내 일이 모이는 곳.</h2><div className="mt-6 space-y-3">{['내일 발표 준비 추가하기', '콘텐츠 아이디어 정리하기', '완료한 일과 실행 기록 확인하기'].map((item,i)=><div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs"><span className={`grid size-5 shrink-0 place-items-center rounded border ${i===0?'border-teal-700 bg-teal-700 text-white':'border-slate-300'}`}>{i===0&&<Check className="size-3"/>}</span>{item}</div>)}</div><div className="mt-5 rounded-lg bg-[#e7eecf] p-3 text-xs font-semibold leading-6">“내일 할 일에 발표 준비를 추가해줘.”<br/><span className="font-normal text-slate-600">AI 요청 → 데이터 저장 → 화면에서 확인</span></div></div>
        </div>
        <p className="mt-5 text-xs leading-6 text-slate-300">공통 예제로 작동 원리를 익힌 뒤, 내 업무·콘텐츠·학습 관리에 맞춰 확장합니다.</p>
      </div>
    </section>

    <section className="grid gap-0 border-b border-[#102639]/15 sm:grid-cols-2 xl:grid-cols-4" aria-label="교육 핵심 정보">
      {[['교육 일정', '11월 2일 · 11월 9일'], ['교육 시간', '2회 · 총 8시간'], ['교육 장소', workshop.location], ['전체 수강료', `${workshop.price.toLocaleString()}원`]].map(([label,value])=><div key={label} className="border-b border-[#102639]/10 p-6 sm:p-8"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-lg font-black">{value}</p></div>)}
    </section>

    <section className="px-6 py-12 sm:px-10 sm:py-16">
      <p className="text-xs font-bold tracking-widest text-teal-700">FROM IDEA TO FIRST VERSION</p><h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">만들고 싶었던 것을,<br/>작게 만들고 실제로 써봅니다.</h2>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{steps.map(([Icon,title,description],index)=><article key={title} className="rounded-2xl border border-[#102639]/15 bg-white p-5"><div className="flex items-center justify-between"><Icon className="size-6 text-teal-800"/><span className="font-mono text-xs text-slate-400">0{index+1}</span></div><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></article>)}</div>
    </section>

    <section id="workshop-curriculum" className="scroll-mt-24 bg-white px-6 py-12 sm:px-10 sm:py-16" aria-labelledby="curriculum-heading">
      <p className="text-xs font-bold tracking-widest text-teal-700">THE TWO-SESSION WORKSHOP</p><h2 id="curriculum-heading" className="mt-4 text-3xl font-black sm:text-4xl">한 번은 함께 만들고,<br/>한 번은 나의 것으로.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">공통 예제로 작동 원리를 익힌 뒤, 개인 프로젝트로 확장하는 2회·8시간 실습 과정입니다. 회차별 4시간에는 휴식 시간이 포함됩니다.</p>
      <div className="mt-10 grid gap-6 xl:grid-cols-2">{workshop.sessions.map((session,index)=><article key={session.date} className={`rounded-3xl p-6 sm:p-8 ${index===0?'bg-[#eef2e8]':'bg-[#102639] text-white'}`}><p className={`text-xs font-bold ${index===0?'text-teal-800':'text-[#d5f78c]'}`}>SESSION 0{index+1} / {session.label} / 4시간</p><h3 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">{session.title}</h3><ol className="mt-7 space-y-4">{session.topics.map((topic,i)=><li key={topic} className="flex gap-3 text-sm leading-6"><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${index===0?'bg-white text-teal-800':'bg-white/10 text-[#d5f78c]'}`}>{i+1}</span><span>{topic}</span></li>)}</ol><div className={`mt-8 border-t pt-5 ${index===0?'border-[#102639]/15':'border-white/20'}`}><p className={`text-xs ${index===0?'text-slate-500':'text-slate-300'}`}>오늘의 결과물</p><p className="mt-2 text-sm font-bold leading-6">{session.outcome}</p></div></article>)}</div>
      <div className="mt-6 rounded-xl border border-dashed border-teal-300 bg-teal-50 p-5 text-sm leading-7 text-teal-950"><strong>두 수업 사이의 작은 과제.</strong> 내가 만들고 싶은 플랫폼의 사용자와 핵심 기능 하나를 정리해옵니다. 2회차에 같은 예제를 내 용도로 바꿉니다.</div>
    </section>

    <section className="grid gap-10 px-6 py-12 sm:px-10 sm:py-16 xl:grid-cols-2">
      <div><p className="text-xs font-bold tracking-widest text-teal-700">WHO THIS IS FOR</p><h2 className="mt-4 text-3xl font-black">이런 시작을 기다린 분께.</h2><ul className="mt-7 space-y-4 text-sm leading-7">{['내 업무나 브랜드에 맞는 작은 서비스를 만들고 싶은 분', 'AI로 화면은 만들어봤지만 저장·연결·배포에서 막힌 분', '반복하는 일을 관리하는 나만의 공간이 필요한 분', '실제 결과물을 만들며 바이브코딩을 익히고 싶은 분'].map(item=><li key={item} className="flex gap-3"><Check className="mt-1.5 size-4 shrink-0 text-teal-700"/>{item}</li>)}</ul></div>
      <div className="rounded-3xl bg-white p-6 sm:p-8"><Laptop className="size-7 text-teal-700"/><h3 className="mt-5 text-2xl font-black">가볍게 준비하고,<br/>직접 만들어봅니다.</h3><p className="mt-5 text-sm leading-7 text-slate-600">인터넷 연결이 가능한 개인 노트북, 크롬 브라우저, 평소 사용하는 AI 계정을 준비해주세요. 만들고 싶은 서비스의 아이디어가 있으면 좋습니다.</p><p className="mt-4 text-xs leading-6 text-slate-500">사용할 개발 도구와 계정 준비사항, 유료 서비스 이용 여부는 수업 전 안내합니다. 실습은 핵심 기능 1개와 자동화 1개가 작동하는 첫 버전을 목표로 합니다.</p></div>
    </section>

    <section id="workshop-schedule" className="scroll-mt-24 bg-[#d5f78c] px-6 py-12 sm:px-10 sm:py-16" aria-labelledby="schedule-heading">
      <p className="text-xs font-bold tracking-widest text-teal-900">SAVE THESE TWO MONDAYS</p><h2 id="schedule-heading" className="mt-4 text-3xl font-black sm:text-4xl">11월, 내 플랫폼의<br/>첫 번째 버전을 만듭니다.</h2>
      <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2"><div><dt className="text-teal-900">1회차</dt><dd className="mt-1 text-lg font-bold">2026년 11월 2일 (월) · 4시간</dd></div><div><dt className="text-teal-900">2회차</dt><dd className="mt-1 text-lg font-bold">2026년 11월 9일 (월) · 4시간</dd></div><div><dt className="text-teal-900">장소</dt><dd className="mt-1 text-lg font-bold">{workshop.location}</dd></div><div><dt className="text-teal-900">2회 전체 수강료</dt><dd className="mt-1 text-2xl font-black">{workshop.price.toLocaleString()}원</dd></div></dl>
      <div className="mt-8 rounded-2xl bg-white/65 p-5 text-sm leading-7"><p className="font-bold">수업 시간·강사진은 추후 안내합니다.</p><p className="mt-1">현재는 과정 안내를 먼저 공개합니다. 상세 시간이 확정되면 수강신청 안내를 이어갑니다.</p><a href={merchant.phoneHref} className="mt-3 inline-flex items-center gap-2 font-bold underline underline-offset-4">교육 문의 {merchant.phone}<ArrowUpRight className="size-4"/></a></div>
      <div className="mt-6 flex flex-wrap gap-5 text-xs font-semibold"><Link href="/refund-policy" className="underline underline-offset-4">취소·환불 정책</Link><Link href="/service-policy" className="underline underline-offset-4">강의 제공 안내</Link><a href={workshop.poster} download="나만의-플랫폼-만들기-11월.png" className="underline underline-offset-4">포스터 내려받기</a></div>
    </section>
  </div>;
}
