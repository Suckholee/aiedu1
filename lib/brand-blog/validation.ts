import {z} from 'zod';
export const categorySchema=z.enum(['ai','workflow','content','platform']);
const clean=z.string().trim().min(1).refine(s=>!/<\/?[a-z][^>]*>/i.test(s),'HTML 대신 일반 텍스트를 사용하세요.');
export const articleSchema=z.object({
 title:clean.max(120),excerpt:clean.max(350),category:categorySchema,
 sections:z.array(z.object({heading:clean.max(120),paragraphs:z.array(clean.max(2000)).min(1).max(5),source_ids:z.array(z.string().regex(/^S\d+$/)).max(5)})).min(3).max(7),
 takeaways:z.array(clean.max(300)).min(2).max(5),tags:z.array(clean.max(40)).min(1).max(8),trend_summary:clean.max(1000),
});
export const generatedArticleSchema=articleSchema.extend({primary_source_id:z.string().regex(/^S\d+$/),source_ids:z.array(z.string().regex(/^S\d+$/)).min(2).max(5)});
export const blogCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('generate')}),
 z.object({action:z.literal('settings'),enabled:z.boolean(),auto_publish:z.boolean(),keywords:z.array(z.string().trim().min(2).max(60)).min(1).max(12)}),
 z.object({action:z.literal('edit'),id:z.uuid(),updated_at:z.iso.datetime({offset:true}),status:z.enum(['draft','published','archived']),article:articleSchema}),
]);
export function safeSourceUrl(value:string,hosts?:readonly string[]) {
 try {const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port)return null;if(hosts&&!hosts.includes(url.hostname))return null;url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^(ref|source)$/i.test(key))url.searchParams.delete(key);return url.toString();}catch{return null;}
}
export function cronAuthorized(header:string|null,secret:string|undefined) {return Boolean(secret&&secret.length>=32&&header===`Bearer ${secret}`);}
