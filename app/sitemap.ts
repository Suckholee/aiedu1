import type {MetadataRoute} from 'next';
import {publishedPosts} from '@/lib/brand-blog/public';
import {BLOG_SITE} from '@/lib/brand-blog/types';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const {posts}=await publishedPosts({limit:1000});return [{url:BLOG_SITE,changeFrequency:'weekly',priority:1},{url:`${BLOG_SITE}/blog`,changeFrequency:'daily',priority:.9},...posts.map(p=>({url:`${BLOG_SITE}/blog/${p.slug}`,lastModified:p.updated_at,changeFrequency:'monthly' as const,priority:.7}))];}
