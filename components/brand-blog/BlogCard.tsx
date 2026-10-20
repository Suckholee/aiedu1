import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {BLOG_CATEGORIES,blogDate,type BlogPost} from '@/lib/brand-blog/types';

export function BlogCard({post,index=0}:{post:Pick<BlogPost,'slug'|'title'|'excerpt'|'category'|'published_at'>;index?:number}){
 return <article className="min-w-0 bg-[#f4f0e5]">
  <Link href={`/blog/${post.slug}`} className="group flex h-full min-h-60 flex-col justify-between gap-6 p-6 outline-none hover:bg-[#edc83c] focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-[#175495]">
   <div className="flex items-center justify-between gap-3 text-[10px] font-semibold tracking-wider"><span>{BLOG_CATEGORIES[post.category]} / {String(index+1).padStart(2,'0')}</span><ArrowUpRight size={20} aria-hidden="true"/></div>
   <div><h3 className="line-clamp-3 break-keep text-2xl font-semibold leading-snug tracking-tight">{post.title}</h3><p className="mt-3 line-clamp-2 text-xs leading-7 text-[#5d6357]">{post.excerpt}</p></div>
   <time className="text-[10px] text-[#5d6357]" dateTime={post.published_at??undefined}>{post.published_at?blogDate(post.published_at):''}</time>
  </Link>
 </article>;
}
