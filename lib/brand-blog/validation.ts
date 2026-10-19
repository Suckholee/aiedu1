import {z} from 'zod';
export const categorySchema=z.enum(['ai','workflow','content','platform']);
const clean=z.string().trim().min(1).refine(s=>!/<\/?[a-z][^>]*>/i.test(s),'HTML 대신 일반 텍스트를 사용하세요.');
export const articleSchema=z.object({
 title:clean.max(120),excerpt:clean.max(350),category:categorySchema,
 sections:z.array(z.object({heading:clean.max(120),paragraphs:z.array(clean.max(2000)).min(1).max(5),source_ids:z.array(z.string().regex(/^S\d+$/)).max(5)})).min(3).max(7),
 takeaways:z.array(clean.max(300)).min(2).max(5),tags:z.array(clean.max(40)).min(1).max(8),trend_summary:clean.max(1000),
});
export const generatedArticleSchema=articleSchema.extend({primary_source_id:z.string().regex(/^S\d+$/),source_ids:z.array(z.string().regex(/^S\d+$/)).min(2).max(5)});
export const reviewedArticleSchema=z.discriminatedUnion('approved',[
 z.object({approved:z.literal(true),article:generatedArticleSchema,corrections:z.array(z.string().max(500)).max(20)}),
 z.object({approved:z.literal(false),article:z.null(),corrections:z.array(z.string().max(500)).max(20)}),
]);
export function validateArticleEvidence(article:z.infer<typeof generatedArticleSchema>,sources:readonly {id:string;summary:string}[],checkHeadline=true) {
 const ids=new Set(article.source_ids),available=new Set(sources.map(s=>s.id));
 if(ids.size!==article.source_ids.length||ids.size<2||!ids.has(article.primary_source_id)||article.source_ids.some(id=>!available.has(id))||article.sections.some(s=>!s.source_ids.length||s.source_ids.some(id=>!ids.has(id))))return '참고자료 연결 검증에 실패했습니다. 출처가 확인되는 글만 게시합니다.';
 const text=article.sections.flatMap(s=>s.paragraphs).join('\n');
 if(text.length<800||text.length>12000||(text.match(/[가-힣]/g)??[]).length<200)return '한국어 본문 분량을 확인하지 못했습니다. 다시 생성해주세요.';
 if(checkHeadline&&/코딩\s*몰라도|무조건|100\s*%|수익\s*보장|누구나|24시간을\s*바꾼다/.test(article.title))return '제목에 과장하거나 보장하는 표현이 있어 게시를 보류했습니다.';
 for(const source of sources.filter(s=>ids.has(s.id))){const plain=source.summary.replace(/\s+/g,'');if(plain.length>=100&&text.replace(/\s+/g,'').includes(plain.slice(0,100)))return '원문과 겹치는 문장이 길어 게시를 보류했습니다. 다시 생성해주세요.';}
 return null;
}
export const blogCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('generate')}),
 z.object({action:z.literal('settings'),enabled:z.boolean(),auto_publish:z.boolean(),keywords:z.array(z.string().trim().min(2).max(60)).min(1).max(12)}),
 z.object({action:z.literal('edit'),id:z.uuid(),updated_at:z.iso.datetime({offset:true}),status:z.enum(['draft','published','archived']),article:articleSchema}),
]);
export function safeSourceUrl(value:string,hosts?:readonly string[]) {
 try {const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port)return null;if(hosts&&!hosts.includes(url.hostname))return null;url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^(ref|source)$/i.test(key))url.searchParams.delete(key);return url.toString();}catch{return null;}
}
export function cronAuthorized(header:string|null,secret:string|undefined) {return Boolean(secret&&secret.length>=32&&header===`Bearer ${secret}`);}
