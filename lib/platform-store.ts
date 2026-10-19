import {readPlatformLearning,overlayLearning} from './lms/platform-learning';
import type { PlatformData } from './platform-types';
import { readCatalog, platformCourses } from './lms/catalog';
function overlayCatalog(data:PlatformData,catalog:Awaited<ReturnType<typeof readCatalog>>,learning:Awaited<ReturnType<typeof readPlatformLearning>>) {
    data.courses=platformCourses(catalog.courses,catalog.cohorts);
    for(const course of data.courses) {
        const cohort=catalog.cohorts.find(h=>(h.legacy_course_id??h.id)===course.id);
        const lessons=learning.lessons.filter(l=>l.cohort_id===cohort?.id&&!l.archived).sort((a,b)=>a.position-b.position);
        if(lessons.length){
            course.curriculum=[{id:`curriculum-${course.id}`,chapterNumber:'01',title:'학습 차시',durationMinutes:0,lessons:lessons.map(l=>({id:l.id,lessonNumber:String(l.position+1),title:l.title,duration:'',type:l.kind==='live'?'document':l.kind}))}];
            course.lectureCount=lessons.length;
        }

        const occupied=data.enrollments.filter(e=>e.courseId===course.id&&['신청','승인','수료'].includes(e.status)).length;
        course.studentCount=occupied;course.remainingSeats=Math.max(0,course.totalSeats-occupied);
    }
    return data;
}
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
const keys=['banners','reviews','promotionPosts','logs'] as const;
import {readWithLegacy} from './lms/read-with-legacy';
async function readAuxiliary(){
 const {platformDb,platformRef}=await import('./firebase-admin');
 return platformDb.runTransaction(async tx=>{const root=await tx.get(platformRef);if(!root.exists)throw Error('기존 자료 저장소를 확인하세요.');const snapshots=await Promise.all(keys.map(key=>tx.get(platformRef.collection(key))));return Object.fromEntries(keys.map((key,i)=>[key,snapshots[i].docs.map(doc=>doc.data())])) as Partial<PlatformData>;});
}
export async function readPlatform():Promise<PlatformData>{
 const snapshot=await readWithLegacy(async()=>{const [catalog,learning]=await Promise.all([readCatalog(),readPlatformLearning()]);return {catalog,learning};},readAuxiliary,()=>({}));
 const {catalog,learning}=snapshot.data;
 const data=calculated(overlayCatalog(overlayLearning({...seedData(),...snapshot.legacy},learning,catalog.cohorts),catalog,learning));
 return {...data,sync:{legacy:snapshot.legacyAvailable?'available':'unavailable'}};
}
export async function mutatePlatform(fn: (data: PlatformData) => void): Promise<PlatformData> {
    const [catalog,learning]=await Promise.all([readCatalog(),readPlatformLearning()]);
    const {platformDb,platformRef}=await import('./firebase-admin');
    return platformDb.runTransaction(async tx => {
        const root = await tx.get(platformRef);
        if (!root.exists) throw Error('Firebase 데이터 이전이 아직 완료되지 않았습니다.');
        const snapshots = await Promise.all(keys.map(key => tx.get(platformRef.collection(key))));
        const data = overlayCatalog(overlayLearning({...seedData(),...Object.fromEntries(keys.map((key, i) => [key, snapshots[i].docs.map(doc => doc.data())]))},learning,catalog.cohorts),catalog,learning);
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
