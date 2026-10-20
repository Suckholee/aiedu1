'use client';
import Link from 'next/link';
import {CourseMeetingDetails} from '@/components/course/CourseMeetingDetails';
import {useCallback,useEffect,useState,type FormEvent} from 'react';
import {BankTransferNotice} from '@/components/course/BankTransferNotice';
import {canPay,type BillingOrder} from '@/lib/lms/checkout-types';
import {enrollmentNames} from '@/lib/lms/learning-types';
import {orderNames} from '@/lib/lms/finance-types';
const card='rounded-2xl border border-slate-200 bg-white p-6';
const input='mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200';
const button='rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50';
const won=(n:number)=>`₩${Number(n).toLocaleString('ko-KR')}`;
type Lookup={orders:BillingOrder[];expiresAt:string};
async function call(method:string,body?:object){
 const response=await fetch('/api/lms/guest-lookup',{method,cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(25000)});
 const result=await response.json();
 return {response,result};
}
export function GuestApplicationList(){
 const [email,setEmail]=useState(''),[code,setCode]=useState(''),[challenge,setChallenge]=useState('');
 const [data,setData]=useState<Lookup|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState(''),[resendAt,setResendAt]=useState(0),[now,setNow]=useState(Date.now());
 const load=useCallback(async(initial=false)=>{
  setBusy(true);setError('');
  try{const {response,result}=await call('GET');if(!response.ok){setData(null);if(!initial||response.status!==401)setError(result.error);return;}setData(result);setChallenge('');setCode('');}
  catch{setData(null);setError('신청 내역을 불러오지 못했습니다. 다시 조회해주세요.');}
  finally{setBusy(false);setLoading(false);}
 },[]);
 useEffect(()=>{void load(true);},[load]);
 useEffect(()=>{if(!challenge)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[challenge]);
 useEffect(()=>{if(!data)return;const timer=setTimeout(()=>{setData(null);setError('조회 시간이 만료되었습니다. 이메일 인증을 다시 해주세요.');},Math.max(0,new Date(data.expiresAt).getTime()-Date.now()));return()=>clearTimeout(timer);},[data]);
 async function requestCode(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try{const {response,result}=await call('POST',{action:'request',email:email.trim()});if(!response.ok)throw Error(result.error);setChallenge(result.challengeId);setCode('');setResendAt(Date.now()+60000);setNow(Date.now());setMessage('인증번호를 보냈습니다. 스팸함도 확인하고 10분 안에 입력해주세요.');}
  catch(e){setError(e instanceof Error?e.message:'인증번호를 보내지 못했습니다.');}finally{setBusy(false);}
 }
 async function verify(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try{const {response,result}=await call('POST',{action:'verify',challengeId:challenge,code});if(!response.ok)throw Error(result.error);await load();}
  catch(e){setError(e instanceof Error?e.message:'인증을 완료하지 못했습니다.');}finally{setBusy(false);}
 }
 async function logout(){
  setBusy(true);setError('');
  try{const {response,result}=await call('DELETE');if(!response.ok)throw Error(result.error);setData(null);setChallenge('');setCode('');setEmail('');setMessage('조회가 종료되었습니다.');}
  catch(e){setError(e instanceof Error?e.message:'조회 종료를 다시 시도해주세요.');}finally{setBusy(false);}
 }
 return <div className="mx-auto max-w-3xl space-y-6 pb-16">
  <header><p className="text-sm font-semibold text-indigo-600">회원가입 없이 확인하세요</p><h1 className="mt-2 text-3xl font-bold">비회원 신청 조회</h1><p className="mt-3 text-slate-600">수강신청에 입력한 이메일로 인증하면 신청 내역과 결제 상태를 확인할 수 있습니다.</p></header>
  <nav className="flex flex-wrap gap-4 text-sm"><Link href="/apply" className="font-semibold text-indigo-600">수강신청</Link><Link href="/my-applications">회원 신청·결제 목록</Link></nav>
  {loading?<p role="status">조회 상태를 확인하고 있습니다.</p>:null}
  {error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
  {!data&&!loading&&<section className={card} aria-label="이메일 본인 확인">
   <form onSubmit={requestCode} className="space-y-4"><label className="block font-semibold" htmlFor="guest-email">신청 이메일<input id="guest-email" type="email" autoComplete="email" required maxLength={254} readOnly={!!challenge} value={email} onChange={e=>setEmail(e.target.value)} placeholder="신청할 때 입력한 이메일" className={input}/></label><div className="flex flex-wrap items-center gap-3"><button className={button} disabled={busy||!!challenge&&now<resendAt}>{busy?'처리 중…':challenge?now<resendAt?`${Math.ceil((resendAt-now)/1000)}초 후 재발송`:'인증번호 다시 받기':'인증번호 받기'}</button>{challenge&&<button type="button" disabled={busy} onClick={()=>{setChallenge('');setCode('');setMessage('');setError('');}} className="text-sm text-slate-600 underline">이메일 변경</button>}</div></form>
   {challenge&&<form onSubmit={verify} className="mt-6 space-y-4 border-t pt-6"><label htmlFor="guest-code" className="block font-semibold">이메일 인증번호<input id="guest-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} placeholder="6자리 인증번호" className={input}/></label><button className={button} disabled={busy||code.length!==6}>인증하고 신청 내역 보기</button></form>}
   {message&&<p role="status" className="mt-4 text-sm text-indigo-700">{message}</p>}
   <p className="mt-5 text-sm text-slate-500">인증번호는 10분간 유효하며, 인증 후 30분 동안 조회할 수 있습니다. 이메일 인증으로 회원가입이 되지는 않습니다.</p>
  </section>}
  {data&&<><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">비회원 신청 {data.orders.length}건</p><div className="flex gap-4 text-sm"><button disabled={busy} onClick={()=>void load()} className="text-indigo-600">새로고침</button><button disabled={busy} onClick={()=>void logout()} className="text-slate-600 underline">조회 종료·다른 이메일</button></div></div>
   <section className="space-y-4" aria-label="비회원 신청 목록">{data.orders.map(o=><article className={card} key={o.id}>
    <div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">{enrollmentNames[o.enrollment_status]}</span><span className="rounded bg-slate-100 px-2 py-1">{o.amount_krw===0&&o.status==='paid'?'무료':orderNames[o.status]}</span>{!o.current_application&&<span>이전 신청</span>}</div>
    <h2 className="mt-3 text-xl font-bold">{o.title}</h2><p className="mt-2 break-all text-xs text-slate-500">접수번호 {o.number}</p>
    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm"><dt>신청일</dt><dd>{new Date(o.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</dd><dt>일시·장소</dt><dd><CourseMeetingDetails startsAt={o.starts_at} endsAt={o.ends_at} location={o.location} courseId={o.legacy_course_id}/></dd><dt>수강료</dt><dd>{won(o.amount_krw)}</dd><dt>확인된 입금</dt><dd>{won(o.received_krw)}</dd></dl>
    {canPay(o)&&<div className="mt-5 space-y-3 border-t pt-4"><p className="font-semibold">남은 납부 금액 {won(o.due_krw)}</p><BankTransferNotice guest/>{o.payment_guide&&<p className="whitespace-pre-wrap text-sm text-slate-600">{o.payment_guide}</p>}</div>}
    <p className="mt-4 text-sm text-slate-500">신청 변경·취소나 입금 확인은 접수번호로 <a className="text-indigo-600 underline" href="tel:01089523667">담당자에게 문의</a>해주세요.</p>
   </article>)}{!data.orders.length&&<div className={`${card} text-center`}><h2 className="font-bold">이 이메일로 접수한 비회원 신청이 없습니다.</h2><p className="mt-2 text-sm text-slate-500">다른 이메일로 신청했다면 해당 이메일로 다시 인증해주세요. 로그인 후 신청한 내역은 회원 신청·결제 목록에서 확인할 수 있습니다.</p></div>}</section>
   <p className="text-sm text-slate-500">공용 기기에서는 확인을 마친 뒤 ‘조회 종료’를 눌러주세요.</p>
  </>}
 </div>;
}
