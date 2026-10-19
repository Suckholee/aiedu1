import type {MetadataRoute} from 'next';
import {BLOG_SITE} from '@/lib/brand-blog/types';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/api','/auth','/checkout','/my-profile','/my-applications','/my-learning','/tools','/drive']},sitemap:`${BLOG_SITE}/sitemap.xml`};}
