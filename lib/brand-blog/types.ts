export const BLOG_SITE = 'https://aiedu1.vercel.app';
export const BLOG_CATEGORIES = {ai:'AI 트렌드',workflow:'업무자동화',content:'콘텐츠·브랜딩',platform:'플랫폼·바이브코딩'} as const;
export type BlogCategory = keyof typeof BLOG_CATEGORIES;
export interface BlogSource {id:string;title:string;url:string;publisher:string;published_at:string;checked_at:string;}
export interface BlogSection {heading:string;paragraphs:string[];source_ids:string[];}
export interface BlogPost {
 id:string;slug:string;title:string;excerpt:string;category:BlogCategory;sections:BlogSection[];takeaways:string[];tags:string[];sources:BlogSource[];
 trend_summary:string;status:'draft'|'published'|'archived';generated:boolean;generation_day:string|null;source_key:string|null;
 published_at:string|null;created_at:string;updated_at:string;
}
export interface BlogRun {id:string;job_day:string;status:'running'|'succeeded'|'failed';attempts:number;started_at:string;finished_at:string|null;error:string;post_id:string|null;model:string;}
export interface BlogSettings {id:number;enabled:boolean;auto_publish:boolean;keywords:string[];updated_at:string;}
export const blogDate=(date:string)=>new Date(date).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'});
export const blogReadingMinutes=(post:Pick<BlogPost,'sections'>)=>Math.max(2,Math.ceil(post.sections.reduce((n,s)=>n+s.paragraphs.join('').length,0)/500));
