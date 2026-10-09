'use client';
import { useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, FileText, ExternalLink, Check, Pencil, X, Copy, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePlatform } from '@/contexts/PlatformContext';
import type { PromotionPost } from '@/lib/platform-types';
const channels: PromotionPost['channel'][] = ['사이트', '네이버 블로그', '인스타그램', '카카오', '기타'];
const statuses: PromotionPost['status'][] = ['초안', '게시 예정', '게시 완료'];
const channelStyle: Record<PromotionPost['channel'], string> = {
    '사이트': 'border-blue-200 bg-blue-50 text-blue-800',
    '네이버 블로그': 'border-emerald-200 bg-emerald-50 text-emerald-800',
    '인스타그램': 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
    '카카오': 'border-amber-200 bg-amber-50 text-amber-900',
    '기타': 'border-slate-200 bg-slate-50 text-slate-700',
};
const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function koreanToday() { return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); }
function parseDate(date: string) { return new Date(`${date}T12:00:00`); }
function blank(date: string): Omit<PromotionPost, 'id' | 'updatedAt'> { return { date, time: '09:00', title: '', content: '', channel: '사이트', status: '초안', courseId: '', link: '', imageUrl: '', owner: '교육 운영팀' }; }
export function PromotionCalendar() {
    const { data, ready, mutate } = usePlatform();
    const today = koreanToday();
    const detailsRef = useRef<HTMLElement>(null);
    const [month, setMonth] = useState(() => parseDate(today));
    const [selectedDate, setSelectedDate] = useState(today);
    const [channel, setChannel] = useState('전체');
    const [status, setStatus] = useState('전체');
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'month' | 'list'>('month');
    const [showCourses, setShowCourses] = useState(true);
    const [draft, setDraft] = useState<(Omit<PromotionPost, 'id' | 'updatedAt'> & {
        id?: string;
    }) | null>(null);
    const [busy, setBusy] = useState(false);
    const [preview, setPreview] = useState<PromotionPost | null>(null);
    const monthKey = dateKey(month).slice(0, 7);
    const posts = data.promotionPosts.filter(p => (channel === '전체' || p.channel === channel) && (status === '전체' || p.status === status) && `${p.title} ${p.content} ${p.owner}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    const monthPosts = posts.filter(p => p.date.startsWith(monthKey));
    const dayPosts = posts.filter(p => p.date === selectedDate);
    const monthDays = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`);
    const missingDays = monthDays.filter(date => !data.promotionPosts.some(p => p.date === date));
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    start.setDate(start.getDate() - start.getDay());
    const cellCount = Math.ceil((new Date(month.getFullYear(), month.getMonth(), 1).getDay() + monthDays.length) / 7) * 7;
    const days = Array.from({ length: cellCount }, (_, i) => { const date = new Date(start); date.setDate(date.getDate() + i); return date; });
    const selectDate = (date: string) => { setSelectedDate(date); if (window.matchMedia('(max-width: 1279px)').matches) requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); if (!date.startsWith(monthKey))
        setMonth(parseDate(date)); };
    const moveMonth = (offset: number) => { const next = new Date(month.getFullYear(), month.getMonth() + offset, 1); setMonth(next); setSelectedDate(dateKey(next)); };
    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!draft || busy)
            return;
        setBusy(true);
        try {
            await mutate({ ...draft, action: 'promotion' });
            selectDate(draft.date);
            setDraft(null);
            toast.success('홍보글을 날짜에 저장했습니다.');
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : '저장에 실패했습니다.');
        }
        finally {
            setBusy(false);
        }
    };
    const movePost = async (id: string, date: string) => {
        const post = data.promotionPosts.find(p => p.id === id);
        if (!post || post.date === date)
            return;
        try {
            await mutate({ action: 'movePromotion', id, date, time: post.time });
            selectDate(date);
            toast.success('홍보 일정을 옮겼습니다.');
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : '이동 실패');
        }
    };
    const statusDot = (post: PromotionPost) => <span aria-label={post.status} className={`mt-1 size-1.5 shrink-0 rounded-full ${post.status === '게시 완료' ? 'bg-emerald-500' : post.status === '게시 예정' ? 'bg-blue-500' : 'bg-slate-400'}`}/>;
    return <div className="promotion-calendar space-y-5 pb-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600"><CalendarDays className="size-4"/>CONTENT SCHEDULE</div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">일정</h1><p className="mt-2 text-sm text-slate-500">하루의 콘텐츠를 계획하고, 우리의 이야기를 함께 전하세요.</p></div>
      <button onClick={() => setDraft(blank(selectedDate))} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus className="size-4"/>홍보글 등록</button>
    </header>
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><span>이번 달 <strong>{monthPosts.length}건</strong></span><span className="text-emerald-700">게시 완료 <strong>{monthPosts.filter(p => p.status === '게시 완료').length}</strong></span><span className="text-blue-700">게시 예정 <strong>{monthPosts.filter(p => p.status === '게시 예정').length}</strong></span><span className="text-slate-500">초안 <strong>{monthPosts.filter(p => p.status === '초안').length}</strong></span><span className="text-slate-500">홍보글 없는 날짜 <strong>{missingDays.length}일</strong></span></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><button aria-label="이전 달" onClick={() => moveMonth(-1)} className="rounded-lg border bg-white p-2 hover:bg-slate-50"><ChevronLeft className="size-4"/></button><h2 className="min-w-28 text-center text-lg font-bold">{month.getFullYear()}.{String(month.getMonth() + 1).padStart(2, '0')}</h2><button aria-label="다음 달" onClick={() => moveMonth(1)} className="rounded-lg border bg-white p-2 hover:bg-slate-50"><ChevronRight className="size-4"/></button><button onClick={() => { setMonth(parseDate(today)); setSelectedDate(today); }} className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold">오늘</button></div>
      <div className="flex flex-wrap items-center gap-2 text-xs"><select aria-label="홍보 채널 필터" value={channel} onChange={e => setChannel(e.target.value)} className="rounded-lg border bg-white p-2"><option value="전체">모든 채널</option>{channels.map(c => <option key={c}>{c}</option>)}</select><select aria-label="게시 상태 필터" value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border bg-white p-2"><option value="전체">모든 상태</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><button aria-pressed={mode === 'list'} onClick={() => setMode(mode === 'month' ? 'list' : 'month')} className="rounded-lg border bg-white px-3 py-2">{mode === 'month' ? '목록 보기' : '월간 보기'}</button></div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><input aria-label="홍보글 검색" placeholder="홍보글 제목·본문·담당자 검색" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-lg border bg-white px-3 py-2 text-sm sm:max-w-xs"/><label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={showCourses} onChange={e => setShowCourses(e.target.checked)}/>강의 일정도 표시 <Link href="/calendar/education" className="text-blue-600">교육 캘린더</Link></label></div>
    {!ready ? <div className="rounded-xl border bg-white p-12 text-center text-slate-500">홍보 일정을 불러오는 중입니다.</div> : <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div>
        {mode === 'month' ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="grid grid-cols-7 border-b bg-slate-50 text-center text-xs font-bold">{['일', '월', '화', '수', '목', '금', '토'].map((day, i) => <div key={day} className={`py-3 ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>{day}</div>)}</div><div className="grid grid-cols-7">{days.map(date => {
                    const key = dateKey(date), selected = key === selectedDate, current = key.startsWith(monthKey), entries = posts.filter(p => p.date === key), courses = showCourses ? data.courses.filter(c => c.published && c.startDate === key) : [];
                    return <div key={key} role="group" aria-label={`${key} 홍보 ${entries.length}건`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void movePost(e.dataTransfer.getData('text/plain'), key); }} className={`relative min-h-28 border-b border-r p-1 sm:min-h-40 sm:p-2 ${selected ? 'bg-blue-50/40 ring-2 ring-inset ring-blue-500' : current ? 'bg-white' : 'bg-slate-50/70'}`}>
            <button aria-label={`${key} 선택`} aria-pressed={selected} onClick={() => selectDate(key)} className={`mb-1 grid size-7 place-items-center rounded-full text-xs font-semibold sm:text-sm ${key === today ? 'bg-blue-600 text-white' : !current ? 'text-slate-400' : date.getDay() === 0 ? 'text-rose-500' : 'text-slate-700'}`}>{date.getDate()}</button>
            <div className="space-y-1">{entries.slice(0, 3).map(post => <button key={post.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', post.id)} onClick={() => { selectDate(key); setPreview(post); }} title={`${post.time} · ${post.channel} · ${post.status}\n${post.title}`} className={`block w-full rounded-md border p-1 text-left sm:p-1.5 ${channelStyle[post.channel]}`}><span className="text-[8px] font-semibold sm:text-[9px]">{post.time} · {post.channel}</span><span className="flex gap-1">{statusDot(post)}<span className="line-clamp-2 break-words text-[10px] font-semibold leading-tight sm:text-xs">{post.title}</span></span><span className="hidden text-[9px] opacity-70 sm:block">{post.status}</span></button>)}{entries.length > 3 && <button onClick={() => selectDate(key)} className="text-[10px] text-blue-600">+{entries.length - 3}건 더 보기</button>}{courses.map(course => <Link key={course.id} href={`/courses/${course.id}`} title={course.title} className="flex gap-1 rounded border border-slate-200 px-1 py-1 text-[9px] text-slate-500"><BookOpen className="hidden size-3 shrink-0 sm:block"/><span className="line-clamp-1">{course.title}</span></Link>)}</div>
            {!entries.length && current && <button aria-label={`${key} 홍보글 추가`} onClick={() => { selectDate(key); setDraft(blank(key)); }} className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-2 text-slate-300 hover:bg-blue-50 hover:text-blue-600"><Plus className="size-3"/><span className="hidden text-[10px] sm:inline">글 추가</span></button>}
          </div>;
                })}</div></div> : <div className="space-y-3">{monthPosts.map(post => <button key={post.id} onClick={() => { selectDate(post.date); setPreview(post); }} className="flex w-full items-start gap-4 rounded-xl border bg-white p-4 text-left"><div className="shrink-0 text-center text-blue-600"><strong className="block text-xl">{post.date.slice(-2)}</strong><span className="text-xs">{post.time}</span></div><div className="min-w-0"><span className={`rounded border px-2 py-0.5 text-[10px] ${channelStyle[post.channel]}`}>{post.channel} · {post.status}</span><h3 className="mt-2 font-bold">{post.title}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-500">{post.content}</p></div></button>)}{!monthPosts.length && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">선택한 조건의 홍보글이 없습니다.</div>}</div>}
        <p className="mt-3 text-xs text-slate-400">● 초안 · ● 게시 예정 · ● 게시 완료 / 날짜를 클릭해 관리하고, 글을 끌어 날짜를 옮길 수 있습니다.</p>
      </div>
      <aside ref={detailsRef} aria-label="선택한 날짜의 홍보글" className="scroll-mt-20 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-blue-600">선택한 날짜</p><h2 className="mt-1 text-lg font-bold">{parseDate(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</h2></div><button aria-label="선택한 날짜에 홍보글 등록" onClick={() => setDraft(blank(selectedDate))} className="rounded-lg bg-blue-50 p-2 text-blue-600"><Plus className="size-4"/></button></div>
        {!dayPosts.length ? <div className="space-y-3 rounded-xl border border-dashed p-6 text-center"><FileText className="mx-auto size-6 text-slate-300"/><p className="text-sm text-slate-500">이 날짜에 등록된 홍보글이 없습니다.</p><button className="text-sm font-bold text-blue-600" onClick={() => setDraft(blank(selectedDate))}>첫 홍보글 작성</button></div> : dayPosts.map(post => <article key={post.id} className="space-y-3 border-t pt-4"><div className="flex items-center justify-between text-xs"><span className={`rounded border px-2 py-1 ${channelStyle[post.channel]}`}>{post.channel}</span><span className="flex gap-1 text-slate-500">{statusDot(post)}{post.status} · {post.time}</span></div>{post.imageUrl && <img src={post.imageUrl} alt={post.title} className="h-32 w-full rounded-lg object-cover"/>}<h3 className="font-bold">{post.title}</h3><p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-500">{post.content}</p><div className="flex flex-wrap gap-3 text-xs font-semibold"><button onClick={() => setPreview(post)} className="text-blue-600">전체 글 보기</button><button onClick={() => setDraft({ ...post })} className="flex items-center gap-1 text-slate-500"><Pencil className="size-3"/>수정</button><button onClick={() => { const { id, updatedAt, ...copy } = post; setDraft({ ...copy, date: selectedDate, status: '초안', title: `${post.title} (복사)` }); }} className="flex items-center gap-1 text-slate-500"><Copy className="size-3"/>복사</button></div>{post.link && <a href={post.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600">{post.channel === '사이트' ? '연결 페이지' : '실제 게시글'}<ExternalLink className="size-3"/></a>}</article>)}
        <div className="border-t pt-3 text-xs leading-relaxed text-slate-400">Google 로그인으로 초안을 공유하고 함께 편집하세요. 외부 채널의 게시 현황은 실제 게시 링크로 기록합니다.</div>
      </aside>
    </div>}

    {draft && <Dialog open onOpenChange={open => { if (!open && !busy && (!draft.title && !draft.content || window.confirm('저장하지 않고 닫을까요?')))
        setDraft(null); }}><DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-7 [&>button]:hidden"><div className="mb-5 flex items-center justify-between"><DialogTitle className="text-xl font-bold">{draft.id ? '홍보글 수정' : '홍보글 등록'}</DialogTitle><button aria-label="홍보글 편집 닫기" disabled={busy} onClick={() => { if (!draft.title && !draft.content || window.confirm('저장하지 않고 닫을까요?'))
        setDraft(null); }}><X className="size-5"/></button></div><form onSubmit={save} className="space-y-4"><div className="grid grid-cols-2 gap-4"><label className="text-sm font-semibold">게시 날짜<input required type="date" className={fieldClass} value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })}/></label><label className="text-sm font-semibold">게시 시각<input required type="time" className={fieldClass} value={draft.time} onChange={e => setDraft({ ...draft, time: e.target.value })}/></label><label className="text-sm font-semibold">채널<select className={fieldClass} value={draft.channel} onChange={e => setDraft({ ...draft, channel: e.target.value as PromotionPost['channel'] })}>{channels.map(c => <option key={c}>{c}</option>)}</select></label><label className="text-sm font-semibold">게시 상태<select className={fieldClass} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as PromotionPost['status'] })}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label></div><label className="block text-sm font-semibold">홍보글 제목<input required maxLength={200} className={fieldClass} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}/></label><label className="block text-sm font-semibold">홍보글 본문<textarea required maxLength={20000} rows={8} className={fieldClass} value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })}/></label><label className="block text-sm font-semibold">관련 교육과정<select className={fieldClass} value={draft.courseId} onChange={e => setDraft({ ...draft, courseId: e.target.value })}><option value="">연결하지 않음</option>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label className="block text-sm font-semibold">연결 페이지 / 실제 게시글 링크<input className={fieldClass} placeholder="/courses/... 또는 https://..." value={draft.link} onChange={e => setDraft({ ...draft, link: e.target.value })}/></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">대표 이미지 주소<input className={fieldClass} placeholder="/images/... 또는 https://..." value={draft.imageUrl} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })}/></label><label className="text-sm font-semibold">담당자<input maxLength={100} className={fieldClass} value={draft.owner} onChange={e => setDraft({ ...draft, owner: e.target.value })}/></label></div><p className="text-xs leading-relaxed text-slate-500">저장하면 지정한 날짜에 글이 표시됩니다. 게시 예정은 일정 기록이며 외부 블로그·SNS 자동 게시를 실행하지 않습니다.</p><button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-50"><Check className="size-4"/>{busy ? '저장 중…' : '캘린더에 저장'}</button></form></DialogContent></Dialog>}
    {preview && <Dialog open onOpenChange={open => { if (!open)
        setPreview(null); }}><DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 [&>button]:hidden"><div className="flex items-start justify-between gap-4"><span className={`rounded border px-2 py-1 text-xs ${channelStyle[preview.channel]}`}>{preview.channel} · {preview.status}</span><button aria-label="홍보글 상세 닫기" onClick={() => setPreview(null)}><X className="size-5"/></button></div><p className="mt-4 text-xs text-slate-500">{preview.date} {preview.time} · {preview.owner}</p><DialogTitle className="mt-2 text-2xl font-bold">{preview.title}</DialogTitle>{preview.imageUrl && <img className="mt-5 max-h-72 w-full rounded-xl object-cover" src={preview.imageUrl} alt={preview.title}/>}<div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{preview.content}</div><div className="mt-6 flex flex-wrap gap-3 border-t pt-4"><button onClick={() => { setDraft({ ...preview }); setPreview(null); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">글 수정</button><button onClick={async () => { try {
        await navigator.clipboard.writeText(`${preview.title}\n\n${preview.content}`);
        toast.success('홍보글을 복사했습니다.');
    }
    catch {
        toast.error('클립보드 권한을 확인하세요.');
    } }} className="rounded-lg border px-4 py-2 text-sm">본문 복사</button>{preview.link && <a className="rounded-lg border px-4 py-2 text-sm text-blue-600" href={preview.link} target="_blank" rel="noreferrer">연결 페이지 열기</a>}</div></DialogContent></Dialog>}
  </div>;
}
