'use client';
import { useCallback,useEffect,useState,type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import type { LmsCourse,LmsCohort,LmsMember,LmsRole } from '@/lib/lms/types';

type View='courses'|'cohorts'|'members'|'roles';
type Data={courses:LmsCourse[];cohorts:LmsCohort[];members:LmsMember[];member:LmsMember;totalMembers:number};
const field='mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm';
const button='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const card='space-y-4 rounded-2xl border border-slate-200 bg-white p-5';
const roleNames:Record<LmsRole,string>={admin:'관리자',operations:'교육 운영',finance:'회계'};
const statusNames={draft:'초안',open:'모집 중',closed:'모집 마감',running:'수업 중',completed:'종료',cancelled:'취소'};
const modeNames={offline:'오프라인',live:'실시간 온라인',vod:'VOD',blended:'혼합 수업'};
const local=(v:string|null)=>v?new Date(v).toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}).slice(0,16).replace(' ','T'):'';
function Input({label,name,value='',type='text',required=true}:{label:string;name:string;value?:string|number;type?:string;required?:boolean}){
  return <label className="block text-sm font-semibold">{label}<input className={field} name={name} type={type} defaultValue={value} required={required} min={type==='number'?0:undefined}/></label>;
}
export function ManagementConsole({view}:{view:View}) {
  const {lmsMember,lmsLoading}=useAuth();
  const {refresh:refreshPlatform}=usePlatform();
  const [data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
  const [course,setCourse]=useState<LmsCourse|null>(null),[cohort,setCohort]=useState<LmsCohort|null>(null),[member,setMember]=useState<LmsMember|null>(null);
  const [query,setQuery]=useState(''),[search,setSearch]=useState(''),[page,setPage]=useState(0);
  const load=useCallback(async()=>{
    setLoading(true);
    try {
      const r=await fetch(`/api/lms/manage?q=${encodeURIComponent(search)}&page=${page}`,{cache:'no-store'});
      const body=await r.json();if(!r.ok)throw Error(body.error);setData(body);setError('');
    }catch(e){setData(null);setError(e instanceof Error?e.message:'조회 실패');}finally{setLoading(false);}
  },[page,search]);
  useEffect(()=>{
    if(lmsLoading)return;
    if(!lmsMember){setData(null);setError('카카오 또는 구글 계정으로 로그인하세요.');setLoading(false);return;}
    void load();
  },[load,lmsLoading,lmsMember?.id]);
  const save=async(command:object)=>{
    setBusy(true);
    try{
      const r=await fetch('/api/lms/manage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)});
      const body=await r.json();if(!r.ok)throw Error(body.error);
      await load();await refreshPlatform();toast.success('저장했습니다.');return true;
    }catch(e){toast.error(e instanceof Error?e.message:'저장 실패');return false;}finally{setBusy(false);}
  };
  const titles={courses:'교육과정 관리',cohorts:'기수·일정 관리',members:'회원 관리',roles:'권한 관리'};
  if(!data||!lmsMember||data.member.id!==lmsMember.id)return <div className={card}><h1 className="text-2xl font-bold">{titles[view]}</h1><p role="status">{error||'운영 데이터를 불러오는 중입니다.'}</p>{error&&lmsMember&&<button onClick={()=>void load()}>다시 시도</button>}</div>;
  const admin=data.member.roles.includes('admin');
  if((view==='members'||view==='roles')&&!admin)return <div className={card}>회원·권한 관리는 관리자만 사용할 수 있습니다.</div>;
  return <div className="space-y-6 pb-12">
    <header className="space-y-2"><p className="text-sm font-semibold text-indigo-600">교육 운영</p><h1 className="text-3xl font-bold">{titles[view]}</h1><p className="text-sm text-slate-500">{view==='courses'?'교육과정의 소개를 관리하고 기수별 수업을 개설하세요.':view==='cohorts'?'같은 교육과정에 여러 기수를 개설하고 일정·정원·수강료를 관리하세요.':'회원 정보와 담당 업무에 맞는 권한을 관리하세요.'}</p></header>
    <nav className="flex flex-wrap gap-2" aria-label="교육 운영 메뉴"><Link className="rounded-lg border px-3 py-2 text-sm" href="/admin">종합 현황</Link><Link className="rounded-lg border bg-white px-3 py-2 text-sm" href="/admin/finance">결제·환불·정산·CRM</Link><Link className="rounded-lg border bg-white px-3 py-2 text-sm" href="/admin/learning">수강·출결·진도 관리</Link>{(['courses','cohorts','members','roles'] as View[]).filter(v=>admin||!['members','roles'].includes(v)).map(v=><Link key={v} aria-current={v===view?'page':undefined} className={`rounded-lg border px-3 py-2 text-sm ${v===view?'bg-indigo-600 text-white':'bg-white'}`} href={`/admin/${v}`}>{titles[v]}</Link>)}</nav>
    {error&&<div role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-900">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-3">{[[data.courses.length,'교육과정'],[data.cohorts.length,'개설 기수'],[data.totalMembers,'등록 회원']].map(([n,label])=><div key={label} className="rounded-xl border bg-white p-4"><strong className="text-2xl">{n}</strong><span className="ml-3 text-sm text-slate-500">{label}</span></div>)}</div>

    {view==='courses'&&<>
      <form key={course?.id??'new-course'} className={card} onSubmit={async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();const f=new FormData(e.currentTarget);
        if(await save({action:'course',...(course?{id:course.id}:{}),title:f.get('title'),slug:f.get('slug'),subtitle:f.get('subtitle'),description:f.get('description'),category:f.get('category'),level:f.get('level'),thumbnail:f.get('thumbnail'),published:f.has('published')}))setCourse(null);
      }}><h2 className="font-bold">{course?'과정 수정':'새 교육과정'}</h2><div className="grid gap-4 sm:grid-cols-2"><Input label="과정명" name="title" value={course?.title}/><Input label="과정 주소 (영문·숫자·하이픈)" name="slug" value={course?.slug}/><Input label="짧은 소개" name="subtitle" value={course?.subtitle} required={false}/><Input label="대표 이미지 주소" name="thumbnail" value={course?.thumbnail} required={false}/>
        <label className="text-sm font-semibold">분야<select className={field} name="category" defaultValue={course?.category||'업무자동화'}>{['AI·데이터','업무자동화','개발·백엔드','비즈니스·마케팅'].map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="text-sm font-semibold">난이도<select className={field} name="level" defaultValue={course?.level||'입문'}>{['입문','초급','중급','고급'].map(v=><option key={v}>{v}</option>)}</select></label></div>
        <label className="block text-sm font-semibold">상세 소개<textarea name="description" rows={4} className={field} defaultValue={course?.description}/></label><label className="flex gap-2 text-sm"><input name="published" type="checkbox" defaultChecked={course?.published??false}/>공개 과정으로 설정 (모집 기수가 있어야 수강 목록에 표시됩니다)</label>
        <div className="flex gap-3"><button disabled={busy} className={button}>과정 저장</button>{course&&<button type="button" onClick={()=>setCourse(null)}>수정 취소</button>}</div>
      </form>
      <section className={card}><h2 className="font-bold">교육과정 {data.courses.length}개</h2>{data.courses.map(c=><article key={c.id} className="flex flex-wrap justify-between gap-3 border-t py-4"><div><h3 className="font-semibold">{c.title}</h3><p className="text-sm text-slate-500">{c.category} · {c.level} · {c.published?'공개':'비공개'} · {data.cohorts.filter(h=>h.course_id===c.id).length}개 기수</p><p className="text-xs text-slate-400">{c.slug}</p></div><button className="text-sm font-semibold text-indigo-600" onClick={()=>{setCourse(c);window.scrollTo({top:0,behavior:'smooth'});}}>과정 수정</button></article>)}{!data.courses.length&&<p className="text-sm text-slate-500">첫 교육과정을 등록한 후 기수를 개설하세요.</p>}</section>
    </>}

    {view==='cohorts'&&<>
      {!data.courses.length?<section className={card}><p>먼저 교육과정을 등록하세요.</p><Link className="text-indigo-600" href="/admin/courses">교육과정 관리로 이동</Link></section>:<form key={cohort?.id??'new-cohort'} className={card} onSubmit={async e=>{
        e.preventDefault();const f=new FormData(e.currentTarget);const instant=(k:string)=>f.get(k)?`${f.get(k)}:00+09:00`:null;
        if(await save({action:'cohort',...(cohort?{id:cohort.id}:{}),course_id:cohort?.course_id??f.get('course_id'),title:f.get('title'),delivery_mode:f.get('delivery_mode'),status:f.get('status'),starts_at:instant('starts_at'),ends_at:instant('ends_at'),capacity:Number(f.get('capacity')),price_krw:Number(f.get('price_krw')),location:f.get('location'),instructor_name:f.get('instructor_name')}))setCohort(null);
      }}><h2 className="font-bold">{cohort?'기수 수정':'새 기수 개설'}</h2><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">교육과정<select name="course_id" className={field} defaultValue={cohort?.course_id} disabled={!!cohort}>{data.courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><Input label="기수명" name="title" value={cohort?.title}/>
        <label className="text-sm font-semibold">수업 방식<select name="delivery_mode" className={field} defaultValue={cohort?.delivery_mode??'offline'}>{Object.entries(modeNames).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
        <label className="text-sm font-semibold">운영 상태<select name="status" className={field} defaultValue={cohort?.status??'draft'}>{Object.entries(statusNames).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
        <Input label="수업 시작 (한국 시간, VOD는 선택)" type="datetime-local" name="starts_at" value={local(cohort?.starts_at)} required={false}/><Input label="수업 종료 (한국 시간, VOD는 선택)" type="datetime-local" name="ends_at" value={local(cohort?.ends_at)} required={false}/>
        <Input label="정원" type="number" name="capacity" value={cohort?.capacity??20}/><Input label="수강료 (원)" type="number" name="price_krw" value={cohort?.price_krw??0}/><Input label="장소" name="location" value={cohort?.location} required={false}/><Input label="담당 강사" name="instructor_name" value={cohort?.instructor_name} required={false}/></div>
        <div className="flex gap-3"><button disabled={busy} className={button}>기수 저장</button>{cohort&&<button type="button" onClick={()=>setCohort(null)}>수정 취소</button>}</div>
      </form>}
      <section className={card}><h2 className="font-bold">개설 기수 {data.cohorts.length}개</h2>{data.cohorts.map(h=><article key={h.id} className="flex flex-wrap justify-between gap-3 border-t py-4"><div><h3 className="font-semibold">{h.title}</h3><p className="text-sm text-slate-500">{data.courses.find(c=>c.id===h.course_id)?.title} · {statusNames[h.status]} · {modeNames[h.delivery_mode]}</p><p className="text-sm">{h.starts_at?local(h.starts_at).replace('T',' '):'상시 학습'} · 정원 {h.capacity??'제한 없음'}명 · ₩{Number(h.price_krw).toLocaleString()}</p><p className="text-xs text-slate-500">{h.location} {h.instructor_name}</p><details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-indigo-600">수강생 결제 안내 설정</summary><form className="mt-3 space-y-3" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{const r=await fetch('/api/lms/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'payment_guide',cohort_id:h.id,guide:f.get('guide')})});const b=await r.json();if(!r.ok)throw Error(b.error);await load();toast.success('결제 안내를 저장했습니다.');}catch(e){toast.error(e instanceof Error?e.message:'저장 실패');}finally{setBusy(false);}}}><label className="block text-sm">입금 계좌·예금주·납부 기한·문의 방법<textarea name="guide" className={field} rows={4} maxLength={2000} defaultValue={h.payment_guide??''}/></label><p className="text-xs text-slate-500">이 기수 신청자의 주문 화면에 표시됩니다. 확인한 수납 계좌와 안내만 입력하세요.</p><button className={button} disabled={busy}>결제 안내 저장</button></form></details></div><div className="flex items-center gap-4"><Link className="text-sm text-slate-600" href={`/courses/${h.legacy_course_id??h.id}`}>수강 화면</Link><button className="text-sm font-semibold text-indigo-600" onClick={()=>{setCohort(h);window.scrollTo({top:0,behavior:'smooth'});}}>기수 수정</button><Link className="text-sm font-semibold text-indigo-600" href="/admin/learning">학습 운영</Link></div></article>)}{!data.cohorts.length&&<p className="text-sm text-slate-500">개설한 기수가 없습니다.</p>}</section>
    </>}

    {(view==='members'||view==='roles')&&<>
      <form className="flex gap-2" onSubmit={e=>{e.preventDefault();setPage(0);setSearch(query);}}><input aria-label="회원 이름·이메일 검색" className={field} placeholder="이름 또는 이메일 검색" value={query} onChange={e=>setQuery(e.target.value)}/><button className={button} disabled={loading}>검색</button></form>
      {member&&<form key={member.id+view} className={card} onSubmit={async e=>{
        e.preventDefault();const f=new FormData(e.currentTarget);const command=view==='roles'?{action:'roles',id:member.id,roles:f.getAll('roles')}:{action:'member',id:member.id,display_name:f.get('display_name'),phone:f.get('phone'),company:f.get('company'),status:f.get('status')};
        if(await save(command))setMember(null);
      }}><h2 className="font-bold">{member.display_name} · {view==='roles'?'권한 변경':'회원 정보 수정'}</h2><p className="text-sm text-slate-500">{member.email} · {member.status==='active'?'활성 회원':'이용 중지'}</p>
        {view==='roles'?<><p className="text-sm text-slate-600">기본 회원은 수강생입니다. 담당 업무에 필요한 권한만 선택하세요.</p><div className="flex flex-wrap gap-5">{Object.entries(roleNames).map(([role,label])=><label key={role} className="flex gap-2 text-sm"><input type="checkbox" name="roles" value={role} defaultChecked={member.roles.includes(role as LmsRole)}/>{label}</label>)}</div><p className="text-xs text-slate-500">관리자: 회원·권한·교육 운영 / 교육 운영: 과정·기수 / 회계: 수납·정산</p></>:<div className="grid gap-4 sm:grid-cols-2"><Input label="이름" name="display_name" value={member.display_name}/><Input label="연락처" name="phone" value={member.phone??''} required={false}/><Input label="소속" name="company" value={member.company??''} required={false}/><label className="text-sm font-semibold">회원 상태<select name="status" className={field} defaultValue={member.status}><option value="active">활성</option><option value="suspended">이용 중지</option></select></label></div>}
        <div className="flex gap-3"><button className={button} disabled={busy}>변경 저장</button><button type="button" onClick={()=>setMember(null)}>취소</button></div></form>}
      <section className={card}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">회원</th><th className="p-3">상태</th><th className="p-3">역할</th><th className="p-3">관리</th></tr></thead><tbody>{data.members.map(m=><tr key={m.id} className="border-b"><td className="p-3"><strong>{m.display_name}</strong><p className="text-xs text-slate-500">{m.email}</p><p className="text-xs text-slate-400">{m.company}</p></td><td className="p-3">{m.status==='active'?'활성':'이용 중지'}</td><td className="p-3">{m.roles.map(r=>roleNames[r]).join(' · ')||'수강생'}</td><td className="p-3"><button className="font-semibold text-indigo-600" onClick={()=>setMember(m)}>{view==='roles'?'권한 변경':'정보 수정'}</button></td></tr>)}</tbody></table></div>{!data.members.length&&<p>검색 결과가 없습니다.</p>}<div className="flex justify-between text-sm"><button disabled={!page||loading} onClick={()=>setPage(p=>p-1)}>이전</button><span>{page+1} / {Math.max(1,Math.ceil(data.totalMembers/50))} 페이지 · {data.totalMembers}명</span><button disabled={(page+1)*50>=data.totalMembers||loading} onClick={()=>setPage(p=>p+1)}>다음</button></div></section>
    </>}
  </div>;
}
