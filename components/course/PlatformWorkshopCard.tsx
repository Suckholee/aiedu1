import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PLATFORM_BUILDING_WORKSHOP as workshop } from '@/lib/platform-building-workshop';

export function PlatformWorkshopCard() {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={workshop.href} aria-label={`${workshop.title} 상세 보기`} className="relative block aspect-video overflow-hidden bg-[#102639] focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-blue-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={workshop.poster} alt={`11월 2일·9일 나만의 플랫폼 만들기, 2회 총 8시간, 전체 수강료 ${workshop.price.toLocaleString()}원`} className="size-full object-cover transition group-hover:scale-[1.02]" />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-xs font-bold text-teal-700">{workshop.category} · 11월 개강 안내</p>
        <Link href={workshop.href} className="text-lg font-extrabold text-slate-900 hover:text-teal-700">{workshop.title}</Link>
        <p className="text-sm leading-relaxed text-slate-500">{workshop.subtitle}<br/>11월 2일·9일 · {workshop.duration}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div><p className="text-xs text-slate-500">2회 전체 수강료</p><p className="mt-1 text-xl font-black text-slate-950">₩ {workshop.price.toLocaleString()}</p></div>
          <Link href={workshop.href} className="inline-flex items-center gap-1 rounded-xl bg-[#102639] px-4 py-2 text-xs font-bold text-white hover:bg-teal-900">과정 살펴보기<ArrowUpRight className="size-4"/></Link>
        </div>
      </div>
    </article>
  );
}
