'use client';
import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {CourseMeetingDetails} from '@/components/course/CourseMeetingDetails';
import {AuthModal} from '@/components/auth/AuthModal';
import {enrollmentNames} from '@/lib/lms/learning-types';
import {orderNames} from '@/lib/lms/finance-types';
import type {ApplicantRoster} from '@/lib/lms/roster-types';
const field='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm';
const button='rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50';
export function RosterCodeAccess(){
 const [data,setData]=useState<ApplicantRoster|null>(null),[code,setCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[login,setLogin]=useState(false);
 const [showCode,setShowCode]=useState(false);
 const [cohort,setCohort]=useState(''),[query,setQuery]=useState(''),[status,setStatus]=useState(''),[payment,setPayment]=useState('');
 const load=useCallback(async(initial=false)=>{
  setBusy(true);setError('');
  try{const r=await fetch('/api/lms/roster-view',{cache:'no-store',signal:AbortSignal.timeout(20000)});const result=await r.json();if(!r.ok){setData(null);if(!initial||r.status!==401)setError(result.error);return;}setData(result);}
  catch{setData(null);setError('신청 목록을 불러오지 못했습니다. 다시 시도해주세요.');}finally{setBusy(false);setLoading(false);}
 },[]);
 useEffect(()=>{void load(true);},[load]);
 useEffect(()=>{if(!data)return;const timer=setTimeout(()=>{setData(null);setError('조회 시간이 만료되었습니다. 코드를 다시 입력해주세요.');},Math.max(0,Date.parse(data.expiresAt)-Date.now()));return()=>clearTimeout(timer);},[data]);
 const rows=useMemo(()=>data?.applicants.filter(e=>(!cohort||e.cohort_id===cohort)&&(!status||e.status===status)&&(!payment||e.paymentStatus===payment)&&`${e.contact_name} ${e.contact_email} ${e.contact_phone} ${e.company} ${e.orderNumber??''}`.toLowerCase().includes(query.toLowerCase()))??[],[data,cohort,status,payment,query]);
 async function unlock(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{const r=await fetch('/api/lms/roster-view',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code}),signal:AbortSignal.timeout(20000)});const result=await r.json();setCode('');setShowCode(false);if(!r.ok)throw Error(result.error);await load();}
  catch(e){setError(e instanceof Error?e.message:'코드를 확인하지 못했습니다.');}finally{setBusy(false);}
 }
 async function close(){
  setBusy(true);setData(null);setCode('');setShowCode(false);
  try{const r=await fetch('/api/lms/roster-view',{method:'DELETE'});if(!r.ok)throw Error();setError('');}catch{setError('조회 종료를 다시 시도해주세요.');}finally{setBusy(false);}
 }
 return <div className="mx-auto max-w-6xl space-y-6 pb-16"><AuthModal open={login} onOpenChange={setLogin}/>
  <header><p className="text-sm font-semibold text-indigo-600">교육 운영</p><h1 className="mt-2 text-3xl font-bold">신청자 목록</h1><p className="mt-3 text-sm text-slate-600">관리자 계정으로 로그인하거나 조회 코드를 입력해 신청자 명단과 결제 상태를 확인하세요.</p></header>
  {error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
  {loading?<p role="status">조회 접속을 확인하고 있습니다.</p>:!data?<div className="grid gap-5 sm:grid-cols-2"><section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">조회 코드로 보기</h2><p className="text-sm text-slate-500">회원가입 없이 신청 명단을 조회할 수 있습니다.</p><form onSubmit={unlock} className="space-y-4"><div><label htmlFor="roster-code" className="block text-sm font-semibold">조회 코드</label><div className="relative mt-2"><input id="roster-code" className={`${field} pr-20`} type={showCode?'text':'password'} autoComplete="current-password" spellCheck={false} autoCapitalize="none" required maxLength={100} value={code} onChange={e=>setCode(e.target.value)}/><button type="button" aria-controls="roster-code" aria-pressed={showCode} aria-label={showCode?'조회 코드 숨기기':'조회 코드 보기'} className="absolute inset-y-0 right-1 rounded-lg px-3 text-sm font-semibold text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" onClick={()=>setShowCode(v=>!v)}>{showCode?'숨기기':'보기'}</button></div></div><button className={button} disabled={busy||!code}>{busy?'확인 중…':'신청자 목록 보기'}</button></form><p className="text-xs text-slate-500">조회만 가능하며 접속은 1시간 동안 유지됩니다.</p></section><section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">관리자 로그인</h2><p className="text-sm text-slate-500">신청 승인·출결·진도 관리는 관리자 계정으로 로그인해주세요.</p><button className={button} onClick={()=>setLogin(true)}>관리자 계정으로 로그인</button></section></div>:<>
   <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">조회 전용 · 표시된 신청자 {rows.length}명</p><div className="flex gap-4 text-sm"><button disabled={busy} className="text-indigo-600" onClick={()=>void load()}>새로고침</button><button disabled={busy} className="underline" onClick={()=>void close()}>조회 종료</button></div></div>
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><select aria-label="조회할 강의 기수" className={field} value={cohort} onChange={e=>setCohort(e.target.value)}><option value="">전체 강의</option>{data.cohorts.map(h=><option key={h.id} value={h.id}>{h.title}</option>)}</select><input aria-label="신청자 검색" className={field} value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름·이메일·연락처 검색"/><select aria-label="신청 상태" className={field} value={status} onChange={e=>setStatus(e.target.value)}><option value="">전체 신청 상태</option>{Object.entries(enrollmentNames).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select><select aria-label="결제 상태" className={field} value={payment} onChange={e=>setPayment(e.target.value)}><option value="">전체 결제 상태</option>{Object.entries(orderNames).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></div>
   <section aria-label="코드 조회 신청자 목록" className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50"><tr>{['신청자','연락처·이메일','소속','강의','신청 상태','결제 상태','수강료','신청일'].map(h=><th className="p-4" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(e=><tr className="border-t" key={e.id}><td className="p-4 font-semibold">{e.contact_name}</td><td className="p-4"><p>{e.contact_phone}</p><p className="text-xs text-slate-500">{e.contact_email}</p></td><td className="p-4">{e.company||'—'}</td><td className="max-w-64 p-4">{data.cohorts.find(h=>h.id===e.cohort_id)?.title??'강의'}<div className="mt-3"><CourseMeetingDetails startsAt={data.cohorts.find(h=>h.id===e.cohort_id)?.starts_at} endsAt={data.cohorts.find(h=>h.id===e.cohort_id)?.ends_at} location={data.cohorts.find(h=>h.id===e.cohort_id)?.location} courseId={data.cohorts.find(h=>h.id===e.cohort_id)?.legacy_course_id}/></div><p className="mt-1 break-all text-xs text-slate-400">{e.orderNumber}</p></td><td className="p-4">{enrollmentNames[e.status]}</td><td className="p-4">{e.paymentStatus?orderNames[e.paymentStatus]:'주문 없음'}</td><td className="whitespace-nowrap p-4">₩{Number(e.amount_krw).toLocaleString('ko-KR')}</td><td className="p-4">{new Date(e.applied_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-8 text-center text-slate-500">조건에 맞는 신청자가 없습니다.</p>}</section>
  </>}
 </div>;
}
