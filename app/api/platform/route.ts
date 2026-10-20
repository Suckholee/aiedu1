import {after} from 'next/server';
import {dispatchSmsSafely} from '@/lib/lms/sms';
import {requireMember,requireSameOrigin,LmsError} from '@/lib/lms/access';
import {legacyLearningCommand} from '@/lib/lms/platform-learning';
import { platformIdentity, isPlatformAdmin, visiblePlatform } from '@/lib/platform-access';
import { z } from 'zod';
import { readPlatform, mutatePlatform } from '@/lib/platform-store';
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
    z.object({ action: z.literal('enroll'), referralCode:z.string().trim().max(50).default(''), courseId: text, name: text, email: z.email().transform(v => v.toLowerCase()), phone: z.string().trim().min(8).max(30), company:z.string().trim().max(200).default(''), notes:z.string().trim().max(2000).default(''), paymentMethod:z.string().max(100).default(''),receiptType:z.string().max(100).default(''),receiptNumber:z.string().max(100).default(''),depositorName:z.string().max(200).default('') }),
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
        return Response.json(visiblePlatform(await readPlatform(), user), { headers: { 'Cache-Control': 'private, no-store','Vary':'Cookie, Authorization' } });
    } catch(e) { return Response.json({error:e instanceof LmsError?e.message:'데이터 연결을 확인하지 못했습니다. 다시 시도해주세요.'},{status:e instanceof LmsError?e.status:503,headers:{'Cache-Control':'private, no-store','Vary':'Cookie, Authorization'}}); }
}
export async function POST(request: Request) {
    try {
        requireSameOrigin(request);
        const user = await platformIdentity(request);
        if (!user || !user.email || !user.email_verified) return Response.json({ error: '이메일이 확인된 카카오 또는 구글 계정으로 로그인하세요.' }, { status: 401 });
        const c = command.parse(await request.json());
        if(['enroll','status','note','attendance','progress','material'].includes(c.action)){
            const member=await requireMember();
            if(member.legacy_firebase_uid!==user.uid)throw new LmsError('현재 계정으로 다시 로그인하세요.',401);
            if(c.action==='enroll'&&c.email!==member.email?.toLowerCase())throw new LmsError('로그인한 계정의 이메일을 사용하세요.');
            await legacyLearningCommand(c,member);
            if(c.action==='enroll')after(dispatchSmsSafely);
            return Response.json(visiblePlatform(await readPlatform(),user),{headers:{'Cache-Control':'private, no-store'}});
        }
        if(c.action==='course')return Response.json({error:'과정·기수 관리 화면에서 변경하세요.'},{status:409});
        const sharedActions = ['enroll', 'review', 'progress'];
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
            if (c.action === 'review') {
                const e = d.enrollments.find(e => e.courseId === c.courseId && e.learnerId === user.lmsProfileId && ['승인', '수료'].includes(e.status)&&(!e.accessUntil||Date.parse(e.accessUntil)>Date.now()));
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
            d.logs.unshift({ id: crypto.randomUUID(), message: `${c.action} 처리`, at: new Date().toISOString() });
            d.logs = d.logs.slice(0, 200);
        });
        return Response.json(visiblePlatform(data, user),{headers:{'Cache-Control':'private, no-store','Vary':'Cookie, Authorization'}});
    }
    catch (e) {
        return Response.json({ error: e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : '저장에 실패했습니다.' }, { status: e instanceof LmsError?e.status:400 });
    }
}
