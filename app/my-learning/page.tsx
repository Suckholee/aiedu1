'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { toast } from 'sonner';
export default function MyLearning() {
    const { data, ready, mutate } = usePlatform();
    const { user } = useAuth();
    const email = user?.isGuest ? '' : user?.email ?? '';
    const [busy, setBusy] = useState(false);
    const enrollments = data.enrollments.filter(e => e.email === email.trim().toLowerCase());
    return <div className="space-y-6"><h1 className="text-2xl font-black">내 강의실</h1><p className="text-sm text-slate-500">Google 로그인 계정의 신청 및 학습 내역입니다.</p>{!ready ? <p>불러오는 중입니다.</p> : !enrollments.length ? <p>신청 내역이 없습니다. <Link href="/courses" className="text-blue-700">교육과정 탐색</Link></p> : enrollments.map(e => { const c = data.courses.find(c => c.id === e.courseId)!; const materials = data.materials.filter(m => m.courseId === c.id); return <section key={e.id} className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold"><Link href={`/courses/${c.id}`}>{c.title}</Link></h2><p>{e.status} · {c.startDate} {c.startTime} · {c.location}</p><p className="text-sm">신청번호: {e.id}</p>{['승인', '수료'].includes(e.status) ? <><p>학습 진행 {e.progress.length}/{materials.length} · 출석 {e.attendance ? '확인' : '미확인'}</p>{materials.map(m => <div key={m.id} className="flex flex-wrap gap-3"><a className="font-bold text-blue-700" href={m.url} target="_blank" rel="noreferrer">{m.title} 열기</a><button disabled={busy || e.progress.includes(m.id)} className="rounded bg-blue-50 px-3 py-1 text-blue-700" onClick={async () => { setBusy(true); try {
        await mutate({ action: 'progress', id: e.id, materialId: m.id });
        toast.success('학습 완료를 기록했습니다.');
    }
    catch (err) {
        toast.error(err instanceof Error ? err.message : '저장 실패');
    }
    finally {
        setBusy(false);
    } }}>{e.progress.includes(m.id) ? '학습 완료' : '완료 기록'}</button></div>)}{!materials.length && <p>자료 등록을 준비하고 있습니다.</p>}{e.status === '수료' && <div className="rounded-xl border-2 border-blue-200 p-8 text-center print:border-black"><h3 className="text-2xl font-bold">수료 확인서</h3><p className="mt-4">{e.name}님은 {c.title} 과정을 수료했습니다.</p><button className="mt-3 text-blue-700 print:hidden" onClick={() => window.print()}>확인서 인쇄</button></div>}</> : <p>관리자 승인 후 학습 자료를 이용할 수 있습니다.</p>}</section>; })}</div>;
}
