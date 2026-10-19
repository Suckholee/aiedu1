import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {getSupabaseConfig} from '@/lib/supabase/config';
import type {BlogPost} from './types';
function publicClient(){const {url,key}=getSupabaseConfig();return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(10000)})}});}
export async function publishedPosts({page=1,limit=12,category='',query=''}={}) {
 const size=Math.max(1,Math.min(1000,limit)),offset=(Math.max(1,page)-1)*size;
 let q=publicClient().from('brand_blog_posts').select('*',{count:'exact'}).eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false});
 if(category)q=q.eq('category',category);
 const search=query.replace(/[%_,().\\]/g,'').slice(0,100);if(search)q=q.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
 const {data,count,error}=await q.range(offset,offset+size-1);if(error)throw Error('블로그 글을 불러오지 못했습니다.');
 return {posts:(data??[]) as BlogPost[],total:count??0};
}
export async function publishedPost(slug:string){
 const {data,error}=await publicClient().from('brand_blog_posts').select('*').eq('slug',slug).eq('status','published').lte('published_at',new Date().toISOString()).maybeSingle();
 if(error)throw Error('블로그 글을 불러오지 못했습니다.');return data as BlogPost|null;
}
