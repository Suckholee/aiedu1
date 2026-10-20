import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowUpRight,Rss,Search} from 'lucide-react';
import {publishedPosts} from '@/lib/brand-blog/public';
import {BLOG_CATEGORIES,BLOG_SITE} from '@/lib/brand-blog/types';
import {BlogCard} from '@/components/brand-blog/BlogCard';
import {BlogMosaic} from '@/components/brand-blog/BlogMosaic';
export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:new URL(BLOG_SITE),title:'Blog · 네오앤피터 인사이트',description:'AI 트렌드를 내 업무와 브랜드의 다음 실행으로. 네오앤피터가 전하는 업무자동화·콘텐츠·플랫폼 인사이트.',alternates:{canonical:'/blog',types:{'application/rss+xml':'/blog/feed.xml'}}};
export default async function BlogPage({searchParams}:{searchParams:Promise<{category?:string;q?:string;page?:string}>}){
 const params=await searchParams,category=Object.hasOwn(BLOG_CATEGORIES,params.category??'')?params.category!:'',query=(params.q??'').slice(0,100),page=Math.max(1,Math.min(10000,parseInt(params.page??'1')||1));
 let result:Awaited<ReturnType<typeof publishedPosts>>={posts:[],total:0},error=false;try{result=await publishedPosts({page,limit:9,category,query});}catch{error=true;}
 const href=(p:number)=>`/blog?${new URLSearchParams({...(category?{category}:{}),...(query?{q:query}:{}),page:String(p)})}`;
 const filterClass=(active:boolean)=>`px-3 py-2 text-[10px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191b1a] ${active?'bg-[#191b1a] text-[#f7f3e8]':'text-[#54594f] hover:bg-[#e5e1d5]'}`;
 return <div className="bg-[#f4f0e5] text-[#191b1a]">
  <div className="px-3 pb-3 pt-3 sm:px-5">
   <header id="landing-title" className="flex items-end justify-between gap-4">
    <div><p className="text-[9px] font-semibold tracking-[.19em]">NEO &amp; PETER JOURNAL</p><h1 className="mt-1 break-keep text-2xl font-semibold leading-8 tracking-[-.055em]">오늘의 변화, 내일의 실행.</h1></div>
    <p className="hidden pb-1 text-[10px] tracking-wide text-[#74776d] lg:block">새로운 관점에서, 나의 다음 실행으로.</p>
    <a href="/blog/feed.xml" aria-label="Blog RSS 구독" className="grid size-8 shrink-0 place-items-center border border-[#191b1a] hover:bg-[#edc83c]"><Rss size={13}/></a>
   </header>
   <div className="my-3 flex flex-wrap items-center justify-between gap-2">
    <nav aria-label="블로그 분야" className="flex max-w-full flex-wrap border border-[#191b1a]"><Link href="/blog" aria-current={!category?'page':undefined} className={filterClass(!category)}>전체</Link>{Object.entries(BLOG_CATEGORIES).map(([key,label])=><Link key={key} href={`/blog?category=${key}`} aria-current={category===key?'page':undefined} className={filterClass(category===key)}>{label}</Link>)}</nav>
    <form action="/blog" className="flex w-full items-center gap-2 border border-[#191b1a] px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#175495] sm:w-56">{category&&<input name="category" value={category} type="hidden"/>}<Search size={13} aria-hidden="true" className="shrink-0"/><input aria-label="블로그 검색" name="q" defaultValue={query} placeholder="궁금한 이야기 찾기" className="min-w-0 flex-1 bg-transparent py-2 text-[10px] outline-none placeholder:text-[#74776d]"/><button aria-label="블로그 검색하기" className="grid size-5 shrink-0 place-items-center outline-none focus-visible:outline focus-visible:outline-2"><ArrowUpRight size={14}/></button></form>
   </div>
   <section aria-label="블로그 글 목록">
    {!error&&<p role="status" className="sr-only">{query?`‘${query}’ 검색 결과`:category?BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES]:'전체 이야기'} {result.total}편</p>}
    {error?<div role="status" className="border-[6px] border-[#191b1a] p-8"><h2 className="text-lg font-semibold">새 글을 불러오지 못했습니다.</h2><p className="mt-3 text-sm text-[#74776d]">잠시 후 다시 확인해주세요.</p><Link href="/blog" className="mt-5 inline-block text-sm underline">다시 불러오기</Link></div>:result.posts.length?<><BlogMosaic posts={result.posts.slice(0,6)}/>{result.posts.length>6&&<div className="mt-2 grid gap-2 border-[8px] border-[#191b1a] bg-[#191b1a] sm:grid-cols-3">{result.posts.slice(6).map((post,i)=><BlogCard key={post.id} post={post} index={(page-1)*9+i+6}/>)}</div>}</>:<div className="border-[6px] border-[#191b1a] px-6 py-12"><p className="text-xs tracking-widest">OUR NEXT STORY</p><h2 className="mt-5 text-xl font-medium">{query||category?'찾으시는 주제의 글을 준비하고 있습니다.':'첫 번째 인사이트를 준비하고 있습니다.'}</h2><p className="mt-3 text-sm leading-7 text-[#74776d]">공식 자료를 읽고, 내 업무에 적용할 수 있는 이야기를 전하겠습니다.</p>{(query||category)&&<Link href="/blog" className="mt-5 inline-block text-sm underline">전체 글 보기</Link>}</div>}
    {result.total>9&&<nav aria-label="블로그 페이지" className="mt-5 flex items-center justify-between border-t-2 border-[#191b1a] pt-4 text-sm">{page>1?<Link href={href(page-1)}>← 이전</Link>:<span/>}<span>{page} / {Math.ceil(result.total/9)}</span>{page*9<result.total?<Link href={href(page+1)}>다음 →</Link>:<span/>}</nav>}
   </section>
  </div>
 </div>;
}
