import type { PlatformData } from './platform-types';
function calculated(data: PlatformData): PlatformData {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    for (const course of data.courses) {
        const reviews = data.reviews.filter(r => r.courseId === course.id && r.approved);
        course.reviewCount = reviews.length;
        course.rating = reviews.length ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10) / 10 : 0;
        const days = Math.round((Date.parse(course.startDate) - Date.parse(today)) / 86400000);
        course.dDay = days > 0 ? `D-${days}` : days === 0 ? 'D-Day' : '\uac1c\uac15';
    }
    return data;
}
export function seedData(): PlatformData {
    return { promotionPosts: [], reviews: [], courses: [], banners: [], enrollments: [], materials: [], logs: [] };
}
const keys = ['courses', 'banners', 'enrollments', 'materials', 'reviews', 'promotionPosts', 'logs'] as const;
import { platformDb, platformRef } from './firebase-admin';
export async function readPlatform(): Promise<PlatformData> {
    return platformDb.runTransaction(async tx => {
        const root = await tx.get(platformRef);
        if (!root.exists) throw Error('Firebase 데이터 이전이 아직 완료되지 않았습니다.');
        const snapshots = await Promise.all(keys.map(key => tx.get(platformRef.collection(key))));
        return calculated(Object.fromEntries(keys.map((key, i) => [key, snapshots[i].docs.map(doc => doc.data())])) as unknown as PlatformData);
    });
}
export function mutatePlatform(fn: (data: PlatformData) => void): Promise<PlatformData> {
    return platformDb.runTransaction(async tx => {
        const root = await tx.get(platformRef);
        if (!root.exists) throw Error('Firebase 데이터 이전이 아직 완료되지 않았습니다.');
        const snapshots = await Promise.all(keys.map(key => tx.get(platformRef.collection(key))));
        const data = Object.fromEntries(keys.map((key, i) => [key, snapshots[i].docs.map(doc => doc.data())])) as unknown as PlatformData;
        fn(data);
        calculated(data);
        for (const [i, key] of keys.entries()) {
            const previous = new Map(snapshots[i].docs.map(doc => [doc.id, doc]));
            for (const item of data[key]) {
                const old = previous.get(item.id);
                if (!old || JSON.stringify(old.data()) !== JSON.stringify(item)) tx.set(platformRef.collection(key).doc(item.id), JSON.parse(JSON.stringify(item)));
                previous.delete(item.id);
            }
            for (const doc of previous.values()) tx.delete(doc.ref);
        }
        tx.update(platformRef, { updatedAt: new Date().toISOString() });
        return data;
    });
}
