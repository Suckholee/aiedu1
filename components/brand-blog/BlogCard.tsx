import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {BLOG_CATEGORIES,blogDate,type BlogPost} from '@/lib/brand-blog/types';
import {BlogCover} from './BlogCover';

export function BlogCard({post,index=0}:{post:Pick<BlogPost,'slug'|'title'|'excerpt'|'category'|'published_at'>;index?:number}){
 return <article className="h-full min-w-0">
  <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#8b7547] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3eb]">
   <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#e7e4d9] shadow-[0_8px_24px_-15px_rgba(31,41,36,0.45)]">
    <div className="h-full w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.035]"><BlogCover category={post.category} slug={post.slug}/></div>
    <span className="absolute left-4 top-4 rounded-full bg-[#faf8f0]/95 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#34413d]">{BLOG_CATEGORIES[post.category]}</span>
    <span aria-hidden="true" className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-[#faf8f0]/95 text-[#34413d] transition-colors group-hover:bg-[#e8cf87]"><ArrowUpRight size={17}/></span>
   </div>
   <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
    <h3 className="line-clamp-2 break-keep text-xl font-semibold leading-[1.45] tracking-[-.035em] text-[#242b25] transition-colors group-hover:text-[#8b6834]">{post.title}</h3>
    <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.8] text-[#777b70]">{post.excerpt}</p>
    <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[10px] tracking-wide text-[#858578]"><time dateTime={post.published_at??undefined}>{post.published_at?blogDate(post.published_at):''}</time><span aria-hidden="true" className="text-[#a29a86]">JOURNAL / {String(index+1).padStart(2,'0')}</span></div>
   </div>
  </Link>
 </article>;
}
