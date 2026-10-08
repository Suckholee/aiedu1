'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { usePlatform } from '@/contexts/PlatformContext';
import { toast } from 'sonner';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseTitle: string;
    isVerifiedStudent?: boolean;
    currentProgress?: number;
    onReviewSubmitted?: (review: {
        rating: number;
        content: string;
        author: string;
    }) => void;
}
export function WriteReviewModal({ open, onOpenChange, courseTitle, onReviewSubmitted }: Props) {
    const { data, mutate } = usePlatform();
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [courseId, setCourseId] = useState('');
    const [busy, setBusy] = useState(false);
    const selectedId = courseId || data.courses.find(c => c.title === courseTitle)?.id || data.courses[0]?.id;
    return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogTitle>수강 후기 작성</DialogTitle><p className="text-sm text-slate-500">승인된 수강생만 작성할 수 있으며 관리자 검토 후 공개됩니다.</p><form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try {
        await mutate({ action: 'review', courseId: selectedId, email, rating, content });
        onReviewSubmitted?.({ rating, content, author: email });
        toast.success('후기를 접수했습니다. 관리자 검토 후 공개됩니다.');
        setContent('');
        onOpenChange(false);
    }
    catch (err) {
        toast.error(err instanceof Error ? err.message : '후기 저장 실패');
    }
    finally {
        setBusy(false);
    } }}><label className="block">과정<select className="w-full rounded border p-2" value={selectedId} onChange={e => setCourseId(e.target.value)}>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label className="block">신청 이메일<input required type="email" className="w-full rounded border p-2" value={email} onChange={e => setEmail(e.target.value)}/></label><label className="block">별점<select className="w-full rounded border p-2" value={rating} onChange={e => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}</select></label><label className="block">후기<textarea className="w-full rounded border p-2" minLength={10} maxLength={2000} required value={content} onChange={e => setContent(e.target.value)}/></label><button disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-white">{busy ? '접수 중' : '후기 접수'}</button></form></DialogContent></Dialog>;
}
