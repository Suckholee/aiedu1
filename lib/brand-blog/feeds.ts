import {safeSourceUrl} from './validation';
import type {BlogSource} from './types';
export const TREND_FEEDS=[
 {publisher:'Google The Keyword',url:'https://blog.google/innovation-and-ai/technology/ai/rss/',hosts:['blog.google']},
 {publisher:'GitHub Blog',url:'https://github.blog/feed/',hosts:['github.blog']},
 {publisher:'OpenAI News',url:'https://openai.com/news/rss.xml',hosts:['openai.com']},
] as const;
export interface TrendCandidate extends BlogSource {summary:string;score:number;}
export function plainFeedText(value:string) {
 return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp);/g,e=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&nbsp;':' '}[e]??e)).replace(/&#(x[\da-f]+|\d+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/\s+/g,' ').trim();
}
const tag=(xml:string,name:string)=>xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]??'';
export function parseTrendFeed(xml:string,feed:{publisher:string;hosts:readonly string[]},now=new Date()):TrendCandidate[] {
 if(xml.length>3_000_000||/<!DOCTYPE|<!ENTITY/i.test(xml.split(/<item(?:\s|>)/i)[0]))throw Error('피드 형식을 확인하지 못했습니다.');
 return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].flatMap(([,item])=>{
  const title=plainFeedText(tag(item,'title')).slice(0,240),url=safeSourceUrl(plainFeedText(tag(item,'link')),feed.hosts);
  const date=new Date(plainFeedText(tag(item,'pubDate'))),age=(now.getTime()-date.getTime())/86400000;
  const summary=plainFeedText(tag(item,'description')||tag(item,'content:encoded')).slice(0,900);
  if(!title||!url||!Number.isFinite(age)||age<-(1/24)||age>30)return [];
  const matches=(title+' '+summary).match(/\bai\b|artificial intelligence|generative|gemini|copilot|claude|automation|agent|coding|developer|platform|content|learning|gpt/gi)??[];
  if(!matches.length)return [];
  return [{id:'',title,url,publisher:feed.publisher,published_at:date.toISOString(),checked_at:now.toISOString(),summary,score:Math.max(0,30-age)+Math.min(matches.length,8)*2}];
 });
}
export async function collectTrends(excludedUrls:string[]=[],now=new Date()) {
 const results=await Promise.allSettled(TREND_FEEDS.map(async feed=>{
  const r=await fetch(feed.url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'User-Agent':'neoNpeter-TrendBlog/1.0'}});
  if(!r.ok)throw Error('피드 연결 실패');
  const reader=r.body?.getReader();if(!reader)throw Error('피드 내용 없음');
  let size=0,text='';const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>3_000_000){await reader.cancel();throw Error('피드 용량 초과');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();
  return parseTrendFeed(text,feed,now);
 }));
 const seen=new Set(excludedUrls),ranked=results.flatMap(r=>r.status==='fulfilled'?r.value:[]).sort((a,b)=>b.score-a.score);
 const counts=new Map<string,number>();
 const candidates=ranked.filter(s=>{if(seen.has(s.url)||(counts.get(s.publisher)??0)>=5)return false;seen.add(s.url);counts.set(s.publisher,(counts.get(s.publisher)??0)+1);return true;}).slice(0,12).map((s,i)=>({...s,id:`S${i+1}`}));
 if(candidates.length<2)throw Error('최근 30일 내 참고할 새 공식 자료가 부족합니다. 다음 실행 또는 관리자 재시도를 기다립니다.');
 return {candidates,feedsAvailable:results.filter(r=>r.status==='fulfilled').length};
}
