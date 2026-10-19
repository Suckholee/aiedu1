import {publishedPosts} from '@/lib/brand-blog/public';
export const dynamic='force-dynamic';
export async function GET(){try{const {posts}=await publishedPosts({limit:3});return Response.json({posts:posts.map(({slug,title,excerpt,category,published_at})=>({slug,title,excerpt,category,published_at}))},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({posts:[],error:'새 글을 불러오지 못했습니다.'},{status:503});}}
