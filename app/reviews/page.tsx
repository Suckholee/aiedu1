'use client';
import { useState } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { WriteReviewModal } from '@/components/reviews/WriteReviewModal';
import { PARTNERS } from '@/data/reviews-partners';
export default function ReviewsPage() {
    const { data } = usePlatform();
    const [open, setOpen] = useState(false);
    const reviews = data.reviews.filter(r => r.approved);
    return <div className="space-y-6"><div className="flex justify-between"><h1 className="text-2xl font-black">수강 후기 &amp; 제휴사</h1><button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => setOpen(true)}>후기 작성</button></div><div className="space-y-4">{reviews.map(r => <article className="rounded-xl border bg-white p-5" key={r.id}><h2 className="font-bold">{r.author} · {'★'.repeat(r.rating)}</h2><p className="text-sm text-slate-500">{data.courses.find(c => c.id === r.courseId)?.title}</p><p className="mt-3 whitespace-pre-wrap">{r.content}</p></article>)}{!reviews.length && <p>공개된 수강 후기가 없습니다.</p>}</div><section className="space-y-3"><h2 className="text-xl font-bold">제휴사 안내</h2><div className="grid gap-4 sm:grid-cols-2">{PARTNERS.map(p => <div className="rounded-xl border bg-white p-5" key={p.id}><h3 className="font-bold">{p.name}</h3><p className="text-sm">{p.category}</p></div>)}</div></section><WriteReviewModal open={open} onOpenChange={setOpen} courseTitle=""/></div>;
}
