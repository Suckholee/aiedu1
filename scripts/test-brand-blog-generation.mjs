import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {pathToFileURL} from 'node:url';
const validation=pathToFileURL(process.cwd()+'/lib/brand-blog/validation.ts').href;
let source=await readFile(new URL('../lib/brand-blog/generate.ts',import.meta.url),'utf8');
source=source.replace("import 'server-only';",'').replace("import {createAdminClient} from '@/lib/supabase/admin';",'const createAdminClient=()=>{throw Error("Database is not used in generation tests");};').replace("import {collectTrends,type TrendCandidate} from './feeds';",'type TrendCandidate=any;const collectTrends=async()=>{throw Error("Feed collection is not used in generation tests");};').replace("from './validation'",'from '+JSON.stringify(validation)).replace('async function compose(','export async function compose(');
const {compose}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
const article={title:'AI 업무 연결 전 확인할 사항',excerpt:'공식 자료를 바탕으로 작은 실습을 제안합니다.',category:'workflow',primary_source_id:'S1',source_ids:['S1','S2'],sections:[1,2,3].map(i=>({heading:'실습 '+i,paragraphs:['공식 자료의 사실과 독자를 위한 실습 제안을 구분하여 확인합니다. '.repeat(14)],source_ids:['S1']})),takeaways:['가상 자료로 실습하세요.','결과를 확인하세요.'],tags:['AI'],trend_summary:'최근 공식 자료를 실무 연결 관점에서 읽습니다.'};
const sources=[1,2].map(i=>({id:'S'+i,title:'Official agent workflow '+i,url:'https://github.blog/source-'+i,publisher:'GitHub Blog',published_at:'2026-10-18T00:00:00Z',checked_at:'2026-10-19T00:00:00Z',summary:'A named team uses agents to prepare documentation. This does not guarantee outcomes for all businesses.',score:30}));
const originalFetch=globalThis.fetch;
const saved={key:process.env.GOOGLE_GENERATIVE_AI_API_KEY,other:process.env.GEMINI_API_KEY,model:process.env.GOOGLE_API_MODEL};
let calls=[];
const response=value=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:20}}),{status:200});
const mocked=review=>{calls=[];globalThis.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));return response(calls.length===1?article:review);};};
try{
 process.env.GOOGLE_GENERATIVE_AI_API_KEY='fixture-key';process.env.GOOGLE_API_MODEL='gemini-2.5-flash';
 mocked({approved:true,corrections:['중립 제목'],article:{...article,title:'에이전트 업무 연결을 작게 시험하는 방법'}});
 const result=await compose(sources,['AI 업무자동화'],[]);
 assert.equal(calls.length,2);assert.equal(result.article.title,'에이전트 업무 연결을 작게 시험하는 방법');assert.equal(result.article.sources.length,2);assert.deepEqual(result.usage,{input_tokens:20,output_tokens:40});
 assert.match(calls[1].contents[0].parts[0].text,/에이전트 생성 증가와 회원가입/);
 mocked({approved:false,corrections:['근거 부족'],article:null});await assert.rejects(compose(sources,[],[]),/출처 대조 검토를 통과하지 못해/);
 mocked({approved:true,corrections:[],article:{...article,primary_source_id:'S2'}});await assert.rejects(compose(sources,[],[]),/참고자료가 변경/);
 mocked({approved:true,corrections:[],article:{...article,title:'누구나 수익 보장'}});await assert.rejects(compose(sources,[],[]),/과장하거나 보장/);
 console.log('PASS: two-call editorial correction, aggregated usage, review rejection, primary source integrity and headline publication guards');
 if(process.argv.includes('--live')){
  globalThis.fetch=async(...args)=>{const response=await originalFetch(...args);const payload=await response.clone().json();const value=payload.candidates?.[0];console.log(JSON.stringify({modelStage:calls.length++===2?'draft':'review',status:response.status,finish:value?.finishReason}));if(value?.finishReason==='STOP'){try{const data=JSON.parse(value.content.parts.filter(p=>!p.thought).map(p=>p.text??'').join(''));const {generatedArticleSchema,reviewedArticleSchema}=await import(validation);const schema=Object.hasOwn(data,'approved')?reviewedArticleSchema:generatedArticleSchema;const check=schema.safeParse(data);console.log(JSON.stringify({approved:data.approved,issues:check.success?[]:check.error.issues.map(i=>({path:i.path,code:i.code,message:i.message}))}));}catch{console.log('Live response JSON could not be parsed');}}return response;};
  const env=await readFile('.env.local','utf8');
  for(const key of ['GOOGLE_GENERATIVE_AI_API_KEY','GEMINI_API_KEY','GOOGLE_API_MODEL']){const match=env.match(new RegExp('^'+key+'=(.*)$','m'));if(match)process.env[key]=match[1].trim().replace(/^(["'])(.*)\1$/,'$2');else delete process.env[key];}
  if(!process.env.GOOGLE_GENERATIVE_AI_API_KEY&&!process.env.GEMINI_API_KEY)throw Error('Local Gemini key unavailable');
  // Bounded live check with recently verified public facts, without feed availability or DB writes.
  const candidates=[{...sources[0],title:'Amp puts AI agents to work beyond code with OpenAI models',url:'https://openai.com/index/amp-beyond-coding',publisher:'OpenAI News',published_at:'2026-10-14T00:00:00Z',summary:'OpenAI describes Amp expanding its coding agent to work around coding. The Amp team also uses agents for documentation, page design and marketing. These are experiences reported by the named company, not promises for every business.'},{...sources[1],title:'Stack Overflow for Agents triples signups with ChatGPT plugin',url:'https://openai.com/index/stack-overflow-chatgpt-plugin',publisher:'OpenAI News',published_at:'2026-10-16T00:00:00Z',summary:'Stack Overflow combined development work using Codex, model APIs and a ChatGPT plugin. The case reports separate measures: up to 10x agents created and 3x registrations. A team built the product; it is not evidence of universal no-code capabilities or guaranteed visitor growth.'}];const start=Date.now();const live=await compose(candidates,['AI 업무자동화','콘텐츠 브랜딩'],[]);
  console.log(JSON.stringify({live:true,databaseWrites:0,model:live.model,title:live.article.title,sections:live.article.sections.length,sources:live.article.sources.length,elapsedMs:Date.now()-start,usage:live.usage}));
 }
}catch(error){console.error(error instanceof Error?error.message:'Generation test failed');process.exitCode=1;}finally{globalThis.fetch=originalFetch;for(const [key,value] of Object.entries({GOOGLE_GENERATIVE_AI_API_KEY:saved.key,GEMINI_API_KEY:saved.other,GOOGLE_API_MODEL:saved.model}))if(value===undefined)delete process.env[key];else process.env[key]=value;}
