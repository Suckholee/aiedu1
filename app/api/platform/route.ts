import { platformIdentity, isPlatformAdmin, visiblePlatform } from '@/lib/platform-access';
import { z } from 'zod';
import { readPlatform, mutatePlatform } from '@/lib/platform-store';
import type { PlatformCourse } from '@/lib/platform-types';
export const runtime = 'nodejs';
const text = z.string().trim().min(1).max(200);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const safeUrl = z.string().max(2000).refine(v => /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v), '올바른 링크를 입력하세요.');
const command = z.discriminatedUnion('action', [
    z.object({ action: z.literal('promotion'), id: z.string().optional(), date, time, title: text, content: z.string().trim().min(1).max(20000), channel: z.enum(['사이트', '네이버 블로그', '인스타그램', '카카오', '기타']), status: z.enum(['초안', '게시 예정', '게시 완료']), courseId: z.string().max(200), link: z.union([z.literal(''), safeUrl]), imageUrl: z.union([z.literal(''), safeUrl]), owner: z.string().trim().max(100) }),
    z.object({ action: z.literal('movePromotion'), id: text, date, time }),
    z.object({ action: z.literal('course'), id: z.string().optional(), title: text, subtitle: text, category: z.enum(['AI·데이터', '업무자동화', '개발·백엔드', '비즈니스·마케팅']), level: z.enum(['입문', '초급', '중급', '고급']), price: z.number().int().min(0), totalSeats: z.number().int().min(1).max(10000), startDate: date, startTime: time, endTime: time, location: text, instructor: text, published: z.boolean(), curriculumText: z.string().max(10000).optional() }),
    z.object({ action: z.literal('banner'), id: z.string().optional(), title: text, subtitle: text, badge: text, link: safeUrl, startDate: date, endDate: date, active: z.boolean(), order: z.number().int().min(0) }),
    z.object({ action: z.literal('deleteBanner'), id: text }),
    z.object({ action: z.literal('enroll'), courseId: text, name: text, email: z.email().transform(v => v.toLowerCase()), phone: z.string().trim().min(8).max(30) }),
    z.object({ action: z.literal('status'), id: text, status: z.enum(['승인', '반려', '수료', '환불']) }),
    z.object({ action: z.literal('note'), id: text, note: z.string().trim().min(1).max(2000) }),
    z.object({ action: z.literal('attendance'), id: text, attendance: z.boolean() }),
    z.object({ action: z.literal('progress'), id: text, materialId: text }),
    z.object({ action: z.literal('review'), courseId: text, email: z.email().transform(v => v.toLowerCase()), rating: z.number().int().min(1).max(5), content: z.string().trim().min(10).max(2000) }),
    z.object({ action: z.literal('approveReview'), id: text, approved: z.boolean() }),
    z.object({ action: z.literal('material'), courseId: text, title: text, url: safeUrl }),
]);
export async function GET(request: Request) {
    try {
        const user = await platformIdentity(request);
        return Response.json(visiblePlatform(await readPlatform(), user), { headers: { 'Cache-Control': 'no-store' } });
    } catch { return Response.json({ error: 'Firebase 연결 또는 로그인 검증에 실패했습니다.' }, { status: 503 }); }
}
export async function POST(request: Request) {
    try {
        const user = await platformIdentity(request);
        if (!user || !user.email || !user.email_verified) return Response.json({ error: 'Google 계정으로 로그인하세요.' }, { status: 401 });
        const c = command.parse(await request.json());
        const sharedActions = ['promotion', 'movePromotion', 'enroll', 'review', 'progress'];
        if (!sharedActions.includes(c.action) && !isPlatformAdmin(user)) return Response.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        if ((c.action === 'enroll' || c.action === 'review') && c.email !== user.email.toLowerCase()) throw Error('로그인한 계정의 이메일을 사용하세요.');
        const data = await mutatePlatform(d => {
            if (c.action === 'progress' && !isPlatformAdmin(user) && !d.enrollments.some(e => e.id === c.id && e.email === user.email?.toLowerCase())) throw Error('본인의 학습 내역만 변경할 수 있습니다.');
            if (c.action === 'promotion') {
                if (c.courseId && !d.courses.some(course => course.id === c.courseId))
                    throw Error('연결할 교육과정을 찾을 수 없습니다.');
                if (c.channel !== '사이트' && c.status === '게시 완료' && !/^https?:\/\//.test(c.link))
                    throw Error('외부 채널의 게시 완료 기록에는 실제 게시글 링크가 필요합니다.');
                const index = c.id ? d.promotionPosts.findIndex(p => p.id === c.id) : -1;
                if (c.id && index < 0)
                    throw Error('홍보글을 찾을 수 없습니다.');
                const { action, ...values } = c;
                const post = { ...values, link: c.link ?? '', imageUrl: c.imageUrl ?? '', id: c.id ?? crypto.randomUUID(), updatedAt: new Date().toISOString() };
                if (index >= 0)
                    d.promotionPosts[index] = post;
                else
                    d.promotionPosts.push(post);
            }
            if (c.action === 'movePromotion') {
                const post = d.promotionPosts.find(p => p.id === c.id);
                if (!post)
                    throw Error('홍보글을 찾을 수 없습니다.');
                post.date = c.date;
                post.time = c.time;
                post.updatedAt = new Date().toISOString();
            }
            if (c.action === 'course') {
                if (c.endTime <= c.startTime)
                    throw Error('종료 시각은 시작 시각보다 늦어야 합니다.');
                if (d.courses.some(x => x.id !== c.id && x.startDate === c.startDate && x.startTime < c.endTime && x.endTime > c.startTime && (x.instructor.name === c.instructor || x.location === c.location)))
                    throw Error('강사 또는 강의실 일정이 겹칩니다.');
                const old = c.id ? d.courses.find(x => x.id === c.id) : undefined;
                if (c.id && !old)
                    throw Error('과정을 찾을 수 없습니다.');
                const occupied = d.enrollments.filter(x => x.courseId === c.id && !['반려', '환불'].includes(x.status)).length;
                if (occupied > c.totalSeats)
                    throw Error('신청 인원보다 정원을 줄일 수 없습니다.');
                const titles = c.curriculumText?.split('\n').map(t => t.trim()).filter(Boolean);
                const unchanged = old && titles?.join('\n') === old.curriculum.flatMap(ch => ch.lessons.map(l => l.title)).join('\n');
                const curriculum = titles && !unchanged ? [{ id: crypto.randomUUID(), chapterNumber: '01', title: c.title, durationMinutes: 0, lessons: titles.map((title, i) => ({ id: crypto.randomUUID(), lessonNumber: String(i + 1), title, duration: '', type: 'document' as const })) }] : old?.curriculum ?? [];
                const course: PlatformCourse = { rating: 0, reviewCount: 0, ...old, ...c, id: old?.id ?? crypto.randomUUID(), instructor: { role: '', avatar: '', bio: '', ...old?.instructor, name: c.instructor }, remainingSeats: c.totalSeats - occupied, studentCount: occupied, originalPrice: c.price, discountRate: 0, dDay: c.startDate, curriculum, lectureCount: curriculum.reduce((n, ch) => n + ch.lessons.length, 0), highlights: old?.highlights ?? [], durationText: old?.durationText ?? `${c.startTime} ~ ${c.endTime}` };
                if (old)
                    d.courses[d.courses.indexOf(old)] = course;
                else
                    d.courses.push(course);
            }
            if (c.action === 'banner') {
                if (c.endDate < c.startDate)
                    throw Error('게시 종료일을 확인하세요.');
                const item = { ...c, id: c.id ?? crypto.randomUUID() };
                const index = d.banners.findIndex(x => x.id === item.id);
                if (index >= 0)
                    d.banners[index] = item;
                else
                    d.banners.push(item);
            }
            if (c.action === 'deleteBanner')
                d.banners = d.banners.filter(x => x.id !== c.id);
            if (c.action === 'enroll') {
                const course = d.courses.find(x => x.id === c.courseId && x.published);
                if (!course)
                    throw Error('신청 가능한 과정이 없습니다.');
                if (d.enrollments.some(x => x.courseId === c.courseId && x.email === c.email && !['반려', '환불'].includes(x.status)))
                    throw Error('이미 신청한 과정입니다.');
                if (course.remainingSeats <= 0)
                    throw Error('정원이 마감되었습니다.');
                d.enrollments.push({ id: crypto.randomUUID(), courseId: course.id, name: c.name, email: c.email, phone: c.phone, status: '신청', amount: course.price, createdAt: new Date().toISOString(), attendance: false, progress: [], notes: [] });
                course.remainingSeats--;
                course.studentCount++;
            }
            if (['status', 'note', 'attendance', 'progress'].includes(c.action) && 'id' in c) {
                const enrollment = d.enrollments.find(x => x.id === c.id);
                if (!enrollment)
                    throw Error('신청 내역을 찾을 수 없습니다.');
                if (c.action === 'status') {
                    const transitions = { '신청': ['승인', '반려'], '승인': ['수료', '환불'], '수료': ['환불'], '반려': [], '환불': [] };
                    if (!(transitions[enrollment.status] as string[]).includes(c.status))
                        throw Error('허용되지 않는 상태 변경입니다.');
                    if (c.status === '수료' && !enrollment.attendance)
                        throw Error('출석을 확인한 후 수료 처리하세요.');
                    enrollment.status = c.status;
                    if (['반려', '환불'].includes(c.status)) {
                        const course = d.courses.find(x => x.id === enrollment.courseId)!;
                        course.remainingSeats++;
                        course.studentCount--;
                    }
                }
                if (c.action === 'note')
                    enrollment.notes.push(`${new Date().toISOString()} ${c.note}`);
                if (c.action === 'attendance')
                    enrollment.attendance = c.attendance;
                if (c.action === 'progress') {
                    if (!['승인', '수료'].includes(enrollment.status))
                        throw Error('승인된 신청만 학습할 수 있습니다.');
                    if (!d.materials.some(x => x.id === c.materialId && x.courseId === enrollment.courseId))
                        throw Error('과정 자료를 찾을 수 없습니다.');
                    if (!enrollment.progress.includes(c.materialId))
                        enrollment.progress.push(c.materialId);
                }
            }
            if (c.action === 'review') {
                const e = d.enrollments.find(e => e.courseId === c.courseId && e.email === c.email && ['승인', '수료'].includes(e.status));
                if (!e)
                    throw Error('승인된 수강 신청 이메일을 입력하세요.');
                if (d.reviews.some(r => r.enrollmentId === e.id))
                    throw Error('이미 후기를 작성했습니다.');
                d.reviews.push({ id: crypto.randomUUID(), enrollmentId: e.id, courseId: e.courseId, author: e.name[0] + '*'.repeat(Math.max(1, e.name.length - 1)), rating: c.rating, content: c.content, approved: false, createdAt: new Date().toISOString() });
            }
            if (c.action === 'approveReview') {
                const r = d.reviews.find(r => r.id === c.id);
                if (!r)
                    throw Error('후기를 찾을 수 없습니다.');
                r.approved = c.approved;
            }
            if (c.action === 'material') {
                if (!d.courses.some(x => x.id === c.courseId))
                    throw Error('과정을 찾을 수 없습니다.');
                d.materials.push({ id: crypto.randomUUID(), courseId: c.courseId, title: c.title, url: c.url, createdAt: new Date().toISOString() });
            }
            d.logs.unshift({ id: crypto.randomUUID(), message: `${c.action} 처리`, at: new Date().toISOString() });
            d.logs = d.logs.slice(0, 200);
        });
        return Response.json(visiblePlatform(data, user));
    }
    catch (e) {
        return Response.json({ error: e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : '저장에 실패했습니다.' }, { status: 400 });
    }
}
