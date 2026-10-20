import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowUpRight,Rss,Search} from 'lucide-react';
import {publishedPosts} from '@/lib/brand-blog/public';
import {BLOG_CATEGORIES,BLOG_SITE} from '@/lib/brand-blog/types';
import {BlogCard} from '@/components/brand-blog/BlogCard';
export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:new URL(BLOG_SITE),title:'Blog · 네오앤피터 인사이트',description:'AI 트렌드를 내 업무와 브랜드의 다음 실행으로. 네오앤피터가 전하는 업무자동화·콘텐츠·플랫폼 인사이트.',alternates:{canonical:'/blog',types:{'application/rss+xml':'/blog/feed.xml'}}};
export default async function BlogPage({searchParams}:{searchParams:Promise<{category?:string;q?:string;page?:string}>}){
 const params=await searchParams,category=Object.hasOwn(BLOG_CATEGORIES,params.category??'')?params.category!:'',query=(params.q??'').slice(0,100),page=Math.max(1,Math.min(10000,parseInt(params.page??'1')||1));
 let result:Awaited<ReturnType<typeof publishedPosts>>={posts:[],total:0},error=false;try{result=await publishedPosts({page,limit:9,category,query});}catch{error=true;}
 const href=(p:number)=>`/blog?${new URLSearchParams({...(category?{category}:{}),...(query?{q:query}:{}),page:String(p)})}`;
 const filterClass=(active:boolean)=>`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium transition ${active?'bg-[#293e37] text-[#f7f4e9]':'bg-white/70 text-[#73776b] hover:bg-[#e6e5da]'}`;
 return <div className="bg-[#f5f3eb] text-[#262821]">
  <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6 sm:px-[6%] sm:pt-6">
   <header id="landing-title" className="flex items-start justify-between gap-5">
    <div><p className="text-[10px] font-semibold tracking-[.2em] text-[#9b8048]">NEO &amp; PETER JOURNAL</p><h1 className="mt-2 break-keep text-[28px] font-medium leading-snug tracking-[-.05em] sm:text-[32px]">오늘의 변화, 내일의 실행.</h1><p className="mt-1.5 text-xs leading-6 text-[#797d70] sm:text-[13px]">AI·업무·콘텐츠. 내 일에 연결하는 새로운 관점.</p></div>
    <a href="/blog/feed.xml" aria-label="Blog RSS 구독" className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-[#d8d5c8] text-[#847b65] transition hover:bg-[#ebe6d8]"><Rss size={15}/></a>
   </header>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#d8d5c8] pb-4 sm:mt-5">
    <nav aria-label="블로그 분야" className="flex max-w-full flex-wrap gap-2"><Link href="/blog" aria-current={!category?'page':undefined} className={filterClass(!category)}>전체</Link>{Object.entries(BLOG_CATEGORIES).map(([key,label])=><Link key={key} href={`/blog?category=${key}`} aria-current={category===key?'page':undefined} className={filterClass(category===key)}>{label}</Link>)}</nav>
    <form action="/blog" className="flex w-full items-center gap-2 rounded-full border border-[#dedbd0] bg-white/70 pl-4 pr-2 focus-within:border-[#8b7547] focus-within:ring-2 focus-within:ring-[#b7ac91]/20 sm:w-56">{category&&<input name="category" value={category} type="hidden"/>}<Search size={14} aria-hidden="true" className="shrink-0 text-[#929585]"/><input aria-label="블로그 검색" name="q" defaultValue={query} placeholder="어떤 이야기가 궁금하세요?" className="min-w-0 flex-1 bg-transparent py-2.5 text-[11px] outline-none placeholder:text-[#929585]"/><button aria-label="블로그 검색하기" className="grid size-7 shrink-0 place-items-center rounded-full text-[#4e5e4c] outline-none hover:bg-[#e9eadf] focus-visible:ring-2 focus-visible:ring-[#8b7547]"><ArrowUpRight size={15}/></button></form>
   </div>
   <section aria-label="블로그 글 목록" className="pt-5">
    {!error&&<p role="status" className="sr-only">{query?`‘${query}’ 검색 결과`:category?BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES]:'전체 이야기'} <span className="ml-1 font-semibold text-[#3c5144]">{result.total}</span></p>}
    {error?<div role="status" className="rounded-2xl border border-[#d8d5c8] p-8"><h2 className="text-lg font-semibold">새 글을 불러오지 못했습니다.</h2><p className="mt-3 text-sm text-[#817b6c]">잠시 후 다시 확인해주세요.</p><Link href="/blog" className="mt-5 inline-block text-sm underline">다시 불러오기</Link></div>:result.posts.length?<div className="grid items-stretch gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{result.posts.map((post,i)=><BlogCard key={post.id} post={post} index={(page-1)*9+i}/>)}</div>:<div className="rounded-2xl border border-[#d8d5c8] px-6 py-12"><p className="text-xs tracking-widest text-[#9b8048]">OUR NEXT STORY</p><h2 className="mt-5 text-xl font-medium">{query||category?'찾으시는 주제의 글을 준비하고 있습니다.':'첫 번째 인사이트를 준비하고 있습니다.'}</h2><p className="mt-3 text-sm leading-7 text-[#817b6c]">공식 자료를 읽고, 내 업무에 적용할 수 있는 이야기를 전하겠습니다.</p>{(query||category)&&<Link href="/blog" className="mt-5 inline-block text-sm underline">전체 글 보기</Link>}</div>}
    {result.total>9&&<nav aria-label="블로그 페이지" className="mt-10 flex items-center justify-between border-t border-[#d8d5c8] pt-5 text-sm">{page>1?<Link href={href(page-1)}>← 이전</Link>:<span/>}<span>{page} / {Math.ceil(result.total/9)}</span>{page*9<result.total?<Link href={href(page+1)}>다음 →</Link>:<span/>}</nav>}
   </section>
   <aside className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#d8d5c8] pt-6"><div><p className="text-sm font-medium">읽은 아이디어를, 나의 결과물로.</p><p className="mt-1 text-xs leading-6 text-[#817b6c]">실습으로 이어지는 AI 교육을 만나보세요.</p></div><Link href="/courses" className="inline-flex items-center gap-6 rounded-full border border-[#b7ac91] px-5 py-2.5 text-xs font-semibold">교육과정 살펴보기<ArrowUpRight size={14}/></Link></aside>
  </div>
 </div>;
}
