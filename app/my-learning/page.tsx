'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {BillingPanel} from '@/components/lms/BillingPanel';
import {useLearning} from '@/components/lms/useLearning';
import {enrollmentNames,attendanceNames,learningSummary,canStudy} from '@/lib/lms/learning-types';
import {getUserApplications,type ApplicantSettlementRecord} from '@/lib/settlement-store';
import {MemberAccessPrompt} from '@/components/auth/MemberAccessPrompt';
const card='space-y-4 rounded-2xl border border-slate-200 bg-white p-6';
const button='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const date=(v:string)=>new Date(v).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
export default function MyLearning(){
 const {data,error,busy,load,save,lmsMember,lmsLoading}=useLearning();const [local,setLocal]=useState<ApplicantSettlementRecord[]>([]);
 useEffect(()=>setLocal(getUserApplications()),[]);
 const ownLocal=lmsMember?.email?local.filter(r=>r.email?.toLowerCase()===lmsMember.email?.toLowerCase()):[];
 return <div className="mx-auto max-w-5xl space-y-6 pb-16"><nav className="flex gap-4 text-sm"><Link className="font-semibold text-indigo-600" href="/my-applications">내 신청·결제 목록</Link><Link href="/courses">강의 찾아보기</Link></nav><header className="flex flex-wrap justify-between gap-3"><div><p className="text-sm font-semibold text-indigo-600">내 학습</p><h1 className="mt-2 text-3xl font-bold">수강신청·출결·진도</h1><p className="mt-3 text-sm text-slate-500">신청 상태와 회차 출결을 확인하고 차시별 학습 기록을 이어가세요.</p></div><Link className="text-sm font-semibold text-indigo-600" href="/courses">교육과정 찾기</Link></header>
 <MemberAccessPrompt purpose="학습 내역"/>
 {lmsLoading&&<p role="status">계정 정보를 확인하고 있습니다.</p>}
 {error&&lmsMember&&<section className={card}><p role="alert">{error}</p><button onClick={()=>void load()}>다시 연결</button></section>}
 {lmsMember&&!data&&!error&&<p role="status">학습 기록을 불러오는 중입니다.</p>}
 {data&&!data.enrollments.some(e=>e.learner_id===lmsMember?.id)&&<section className={card}><h2 className="font-bold">아직 수강신청 내역이 없습니다.</h2><Link className="text-indigo-600" href="/apply">온라인 수강신청</Link></section>}
 {data&&data.enrollments.filter(e=>e.learner_id===lmsMember?.id).map(e=>{
  const h=data.cohorts.find(h=>h.id===e.cohort_id),s=learningSummary(data,e),valid=canStudy(e);
  return <article key={e.id} className={card}><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">{enrollmentNames[e.status]}</span><h2 className="mt-3 text-xl font-bold">{h?.title??'교육과정'}</h2><p className="mt-1 text-sm text-slate-500">신청 {date(e.applied_at)} · {e.contact_name}</p>{e.access_until&&<p className="text-xs text-slate-500">수강 만료 {date(e.access_until)}</p>}</div>{['applied','waitlisted'].includes(e.status)&&<button className="text-sm text-slate-600" disabled={busy} onClick={()=>void save({action:'status',id:e.id,status:'cancelled'})}>신청 취소</button>}</div>
   {['applied','waitlisted'].includes(e.status)&&<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">담당자가 신청을 확인하고 있습니다. 승인 후 학습 자료가 열립니다. 결제 상태는 수강 승인과 별도로 확인합니다.</p>}
   {!valid&&['active','completed'].includes(e.status)&&<p className="text-sm text-amber-800">수강 기간이 만료되었습니다. 담당자에게 문의하세요.</p>}
   <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold">진도 {s.percent}% · {s.complete}/{s.lessons}차시 완료 · 출결 {s.attended}/{s.sessions}회</p><progress aria-label={`${h?.title??'과정'} 학습 진도`} className="mt-3 h-2 w-full accent-indigo-600" value={s.percent} max={100}/></div>
   {valid&&<><section className="space-y-3"><h3 className="font-semibold">학습 차시</h3><p className="text-xs text-slate-500">학습을 마친 후 완료 표시를 해주세요. 영상 시청 시간은 자동 측정되지 않습니다.</p>{data.lessons.filter(l=>l.cohort_id===e.cohort_id&&!l.archived).sort((a,b)=>a.position-b.position).map(l=>{
    const p=data.progress.find(p=>p.enrollment_id===e.id&&p.lesson_id===l.id);return <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="text-sm font-semibold">{l.position+1}. {l.title} {l.required?'· 필수':''}</p><p className="mt-1 text-xs text-slate-500">진도 {p?.progress_percent??0}%</p>{l.content_url&&<a className="mt-2 inline-block text-sm text-indigo-600" href={l.content_url} target="_blank" rel="noreferrer">학습 자료 열기 ↗</a>}</div>{l.kind==='quiz'?<span className="text-xs text-slate-500">담당자 확인</span>:<button className={button} disabled={busy||p?.progress_percent===100} onClick={()=>void save({action:'progress',id:e.id,lesson_id:l.id,percent:100})}>{p?.progress_percent===100?'완료됨':'학습 완료 표시'}</button>}</div>;
   })}{!s.lessons&&<p className="text-sm text-slate-500">등록된 학습 차시가 없습니다.</p>}</section>
   <section className="space-y-3"><h3 className="font-semibold">회차별 출결</h3>{data.sessions.filter(s=>s.cohort_id===e.cohort_id&&!s.archived).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)).map(s=>{const a=data.attendance.find(a=>a.enrollment_id===e.id&&a.session_id===s.id);return <div key={s.id} className="flex flex-wrap justify-between gap-3 border-t pt-3 text-sm"><div><p className="font-semibold">{s.title}</p><p className="text-xs text-slate-500">{date(s.starts_at)} · {s.location}</p></div><span>{a?attendanceNames[a.status]:'미기록'}</span></div>;})}{!s.sessions&&<p className="text-sm text-slate-500">등록된 수업 회차가 없습니다.</p>}</section></>}
  </article>;
 })}
 <BillingPanel/>
 {!!ownLocal.length&&<details className={card}><summary className="cursor-pointer text-sm font-semibold">이 기기에 남아 있는 이전 신청·정산 기록 {ownLocal.length}건</summary><p className="text-xs text-slate-500">기존 기기 저장 기록입니다. 현재 수강 승인과 학습 기록은 위 서버 내역을 기준으로 확인하세요.</p>{ownLocal.map(r=><div key={r.id} className="border-t py-3 text-sm"><strong>{r.applicantName} · {r.orderId}</strong><p className="text-xs text-slate-500">{date(r.appliedAt)} · 기존 상태 {r.enrollmentStatus} · ₩{r.amount.toLocaleString()}</p></div>)}</details>}
 </div>;
}
