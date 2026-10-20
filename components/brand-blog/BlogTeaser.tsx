'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {BlogMosaic} from './BlogMosaic';
import type {BlogPost} from '@/lib/brand-blog/types';
export function BlogTeaser(){
 const [posts,setPosts]=useState<BlogPost[]>([]);
 useEffect(()=>{const controller=new AbortController();fetch('/api/blog',{signal:controller.signal}).then(r=>r.ok?r.json():null).then(body=>{if(body?.posts)setPosts(body.posts);}).catch(()=>{});return ()=>controller.abort();},[]);
 return <section id="journal" className="bg-[#f4f1e7] px-[7%] py-20 text-[#282b23] sm:py-28"><div className="mx-auto max-w-[1440px]"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-[10px] tracking-[.22em] text-[#9b8048]">/ NEO &amp; PETER JOURNAL /</p><h2 className="mt-7 break-keep text-3xl font-medium leading-snug tracking-tight sm:text-5xl">새로운 관점이,<br/>다음 실행이 되도록.</h2></div><Link href="/blog" className="inline-flex items-center gap-6 border-b border-[#a99b7a] pb-2 text-xs">Blog 전체 보기<ArrowUpRight size={16}/></Link></div>{posts.length?<div className="mt-10"><BlogMosaic posts={posts} compact/></div>:<p className="mt-10 max-w-xl text-sm leading-8 text-[#817b6c]">AI 트렌드부터 업무자동화와 브랜드 콘텐츠까지.<br/>내 일에 연결할 네오앤피터의 인사이트를 Blog에서 만나보세요.</p>}</div></section>;
}
