'use client';
import { auth } from '@/lib/firebase';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/contexts/PlatformContext';
import { toast } from 'sonner';
import type { PlatformCourse, Banner } from '@/lib/platform-types';
const input = 'w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm';
const button = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50';
const section = 'rounded-2xl border border-slate-200 bg-white p-5 space-y-4';
export function AdminConsole({ view }: {
    view: 'dashboard' | 'courses' | 'banners' | 'crm' | 'operations';
}) {
    const { data, ready, mutate, refresh } = usePlatform();
    const [busy, setBusy] = useState(false);
    const [editCourse, setEditCourse] = useState<PlatformCourse | null>(null);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);
    const [query, setQuery] = useState('');
    const run = async (command: object) => { setBusy(true); try {
        await mutate(command);
        toast.success('저장했습니다. 연결된 화면에 반영됩니다.');
        return true;
    }
    catch (e) {
        toast.error(e instanceof Error ? e.message : '저장 실패');
        return false;
    }
    finally {
        setBusy(false);
    } };
    const submitCourse = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const value = Object.fromEntries(f); if (await run({ ...value, action: 'course', id: editCourse?.id, price: Number(value.price), totalSeats: Number(value.totalSeats), published: f.has('published') }))
        setEditCourse(null); };
    const submitBanner = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const value = Object.fromEntries(f); if (await run({ ...value, action: 'banner', id: editBanner?.id, order: Number(value.order), active: f.has('active') }))
        setEditBanner(null); };
    const titles = { dashboard: '운영 대시보드', courses: '과정·기수·일정 관리', banners: '배너·홍보 관리', crm: '신청·상담 CRM', operations: '수업·자료·환불 관리' };
    const field = (label: string, name: string, defaultValue: string | number, type = 'text') => <label className="block text-sm font-semibold">{label}<input className={input} name={name} type={type} defaultValue={defaultValue} required min={type === 'number' ? 0 : undefined}/></label>;
    if (!ready)
        return <p>운영 데이터를 불러오는 중입니다.</p>;
    return <div className="space-y-6 pb-12"><h1 className="text-2xl font-black">{titles[view]}</h1><p className="text-sm text-slate-500">로컬 운영 환경 · 신청·승인·환불은 테스트 기록이며 실제 결제와 메시지 발송은 발생하지 않습니다.</p>
    <nav className="flex flex-wrap gap-3 text-sm font-semibold"><Link className="rounded-lg border bg-blue-50 px-3 py-2 text-blue-700" href="/calendar">홍보 캘린더</Link>{Object.entries(titles).map(([key, title]) => <Link key={key} className="rounded-lg border bg-white px-3 py-2 hover:bg-blue-50" href={key === 'dashboard' ? '/admin' : key === 'banners' ? '/admin/promotions' : `/admin/${key}`}>{title}</Link>)}</nav>
    {view === 'dashboard' && <><div className="grid gap-4 sm:grid-cols-3">{[['공개 과정', data.courses.filter(c => c.published).length], ['승인 대기', data.enrollments.filter(e => e.status === '신청').length], ['승인·수료 인원', data.enrollments.filter(e => ['승인', '수료'].includes(e.status)).length]].map(([label, value]) => <div key={label} className={section}><p>{label}</p><strong className="text-3xl">{value}</strong></div>)}</div><div className={section}><h2 className="font-bold">최근 변경 이력</h2>{data.logs.slice(0, 20).map(l => <p key={l.id} className="text-sm">{new Date(l.at).toLocaleString('ko-KR')} · {l.message}</p>)}{!data.logs.length && <p>과정 등록 또는 수강 신청 후 이력이 표시됩니다.</p>}</div></>}
    {view === 'courses' && <><form key={editCourse?.id ?? 'new'} onSubmit={submitCourse} className={section}><h2 className="font-bold">{editCourse ? '과정 수정' : '새 과정 등록'}</h2><div className="grid gap-4 sm:grid-cols-2">{field('과정명', 'title', editCourse?.title ?? '')}{field('소개', 'subtitle', editCourse?.subtitle ?? '')}<label>분야<select name="category" defaultValue={editCourse?.category ?? '업무자동화'} className={input}>{['AI·데이터', '업무자동화', '개발·백엔드', '비즈니스·마케팅'].map(v => <option key={v}>{v}</option>)}</select></label><label>난이도<select name="level" className={input} defaultValue={editCourse?.level ?? '입문'}>{['입문', '초급', '중급', '고급'].map(v => <option key={v}>{v}</option>)}</select></label>{field('수강료 (원)', 'price', editCourse?.price ?? 0, 'number')}{field('정원', 'totalSeats', editCourse?.totalSeats ?? 20, 'number')}{field('교육일', 'startDate', editCourse?.startDate ?? '2026-10-09', 'date')}{field('장소 / 온라인 접속 안내', 'location', editCourse?.location ?? '')}{field('시작', 'startTime', editCourse?.startTime ?? '14:00', 'time')}{field('종료', 'endTime', editCourse?.endTime ?? '17:00', 'time')}{field('담당 강사', 'instructor', editCourse?.instructor.name ?? '')}</div><label className="block text-sm font-semibold">커리큘럼 (한 줄에 한 차시)<textarea name="curriculumText" className={input} rows={5} defaultValue={editCourse?.curriculum.flatMap(ch => ch.lessons.map(l => l.title)).join('\n') ?? ''} placeholder="과정 소개 및 학습 목표&#10;실습과 최종 프로젝트"/></label>
        <label className="flex gap-2"><input name="published" type="checkbox" defaultChecked={editCourse?.published ?? true}/>공개 (홈·교육과정·캘린더 노출)</label><button disabled={busy} className={button}>저장</button>{editCourse && <button type="button" className="ml-3" onClick={() => setEditCourse(null)}>새 과정 등록</button>}</form><div className={section}>{data.courses.map(c => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3"><div><Link className="font-bold text-blue-700" href={`/courses/${c.id}`}>{c.title}</Link><p className="text-sm">{c.startDate} {c.startTime} · {c.instructor.name} · 잔여 {c.remainingSeats}/{c.totalSeats}석 · {c.published ? '공개' : '비공개'}</p></div><button className={button} onClick={() => { setEditCourse(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>수정</button></div>)}</div></>}
    {view === 'banners' && <><form key={editBanner?.id ?? 'new'} className={section} onSubmit={submitBanner}><h2 className="font-bold">{editBanner ? '배너 수정' : '배너 등록'}</h2><div className="grid gap-4 sm:grid-cols-2">{field('제목', 'title', editBanner?.title ?? '')}{field('설명', 'subtitle', editBanner?.subtitle ?? '')}{field('상단 문구', 'badge', editBanner?.badge ?? '교육 안내')}{field('링크', 'link', editBanner?.link ?? '/courses')}{field('게시 시작', 'startDate', editBanner?.startDate ?? '2026-10-07', 'date')}{field('게시 종료', 'endDate', editBanner?.endDate ?? '2026-12-31', 'date')}{field('노출 순서', 'order', editBanner?.order ?? 1, 'number')}</div><label className="flex gap-2"><input type="checkbox" name="active" defaultChecked={editBanner?.active ?? true}/>공개</label><button className={button} disabled={busy}>저장</button><button type="button" className="ml-3" onClick={() => setEditBanner(null)}>입력 초기화</button></form><div className={section}>{data.banners.map(b => <div key={b.id} className="flex flex-wrap justify-between gap-3 border-b py-3"><div className="flex-1"><strong>{b.title}</strong><p>{b.startDate} ~ {b.endDate} · 순서 {b.order} · {b.active ? '공개' : '숨김'}</p></div><button onClick={() => setEditBanner(b)} className={button}>수정</button><button disabled={busy} onClick={() => void run({ ...b, action: 'banner', active: !b.active })}>공개 전환</button><button disabled={busy} onClick={() => { if (window.confirm('배너를 삭제할까요?'))
        void run({ action: 'deleteBanner', id: b.id }); }}>삭제</button></div>)}</div></>}
    {(view === 'crm' || view === 'operations') && <><input aria-label="신청자 검색" className={input} placeholder="이름, 이메일, 과정명 검색" value={query} onChange={e => setQuery(e.target.value)}/><div className="space-y-4">{data.enrollments.filter(e => `${e.name} ${e.email} ${data.courses.find(c => c.id === e.courseId)?.title}`.includes(query)).map(e => <div key={e.id} className={section}><div className="flex flex-wrap justify-between"><div><h2 className="font-bold">{e.name} · {e.status}</h2><p>{data.courses.find(c => c.id === e.courseId)?.title}</p><p className="text-sm">{e.email} · <a href={`tel:${e.phone}`}>{e.phone}</a> · ₩{e.amount.toLocaleString()} (테스트)</p><p className="text-xs text-slate-500">신청번호 {e.id}</p></div><div className="flex items-center gap-2">{(e.status === '신청' ? ['승인', '반려'] : ['승인', '수료'].includes(e.status) ? e.status === '승인' ? ['수료', '환불'] : ['환불'] : []).map(status => <button key={status} className={button} disabled={busy} onClick={() => { if (status !== '환불' || window.confirm('테스트 환불 처리하고 좌석을 반환할까요?'))
        void run({ action: 'status', id: e.id, status }); }}>{status}</button>)}</div></div><label className="flex gap-2"><input type="checkbox" checked={e.attendance} disabled={busy} onChange={v => void run({ action: 'attendance', id: e.id, attendance: v.target.checked })}/>출석 확인 · 학습 완료 자료 {e.progress.length}개</label><form className="flex gap-2" onSubmit={async (v) => { v.preventDefault(); const form = v.currentTarget; const f = new FormData(form); if (await run({ action: 'note', id: e.id, note: f.get('note') }))
        form.reset(); }}><input name="note" required placeholder="상담 내용 / 후속 업무 기록" className={input}/><button className={button} disabled={busy}>기록</button></form>{e.notes.map((n, i) => <p key={i} className="text-sm text-slate-600">{n}</p>)}</div>)}{!data.enrollments.length && <div className={section}>수강 신청이 없습니다. <Link className="text-blue-700" href="/courses">교육과정에서 테스트 신청하기</Link></div>}</div></>}
    {view === 'operations' && <><form className={section} onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; setBusy(true); try {
        const response = await fetch('/api/platform/files', { method: 'POST', headers: auth?.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : {}, body: new FormData(form) });
        const result = await response.json();
        if (!response.ok)
            throw Error(result.error);
        await refresh();
        toast.success('파일을 등록했습니다.');
        form.reset();
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : '업로드 실패');
    }
    finally {
        setBusy(false);
    } }}><h2 className="font-bold">자료 파일 업로드</h2><select aria-label="업로드 대상 과정" name="courseId" className={input}>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><input aria-label="자료 파일" name="file" type="file" required accept=".pdf,.ppt,.pptx,.docx,.xlsx,.txt"/><p className="text-sm text-slate-500">20MB 이하 · PDF는 브라우저에서 열람, PPT·Word·Excel은 원본 다운로드</p><button disabled={busy} className={button}>파일 등록</button></form><div className={section}><h2 className="font-bold">후기 검토·공개</h2>{data.reviews.map(r => <div className="border-b py-3" key={r.id}><p>{r.author} · {r.rating}점 · {r.content}</p><button disabled={busy} className={button} onClick={() => void run({ action: 'approveReview', id: r.id, approved: !r.approved })}>{r.approved ? '공개 취소' : '공개 승인'}</button></div>)}{!data.reviews.length && <p>접수된 후기가 없습니다.</p>}</div></>}
    {view === 'operations' && <form className={section} onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; if (await run({ ...Object.fromEntries(new FormData(form)), action: 'material' }))
        form.reset(); }}><h2 className="font-bold">과정에 학습 자료 연결</h2><label>교육과정<select name="courseId" className={input}>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>{field('자료 제목', 'title', '')}{field('자료 링크 (PDF/PPT/웹페이지)', 'url', '')}<button disabled={busy} className={button}>자료 등록</button><p className="text-sm">등록한 자료는 승인된 수강생의 내 강의실에 표시됩니다.</p>{data.materials.map(m => <p key={m.id}><a className="text-blue-700" href={m.url} target="_blank" rel="noreferrer">{m.title}</a> · {data.courses.find(c => c.id === m.courseId)?.title}</p>)}</form>}
  </div>;
}
