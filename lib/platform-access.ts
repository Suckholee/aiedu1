import { platformAuth } from './firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { PlatformData } from './platform-types';
export async function platformIdentity(request: Request): Promise<DecodedIdToken | null> {
    const header = request.headers.get('authorization');
    if (!header) return null;
    if (!header.startsWith('Bearer ')) throw Error('Google 로그인이 필요합니다.');
    return platformAuth.verifyIdToken(header.slice(7), true);
}
export function isPlatformAdmin(user: DecodedIdToken | null) {
    return !!user && (user.admin === true || (process.env.PLATFORM_ADMIN_EMAILS ?? '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean).includes(user.email?.toLowerCase() ?? ''));
}
export function visiblePlatform(data: PlatformData, user: DecodedIdToken | null): PlatformData {
    if (isPlatformAdmin(user)) return data;
    const email = user?.email?.toLowerCase();
    const enrollments = email ? data.enrollments.filter(e => e.email === email).map(e => ({ ...e, notes: [] })) : [];
    return { ...data, courses: data.courses.filter(c => c.published), promotionPosts: user ? data.promotionPosts : data.promotionPosts.filter(p => p.status === '게시 완료'), reviews: data.reviews.filter(r => r.approved), logs: [], enrollments, materials: data.materials.filter(m => enrollments.some(e => e.courseId === m.courseId && ['승인', '수료'].includes(e.status))) };
}
