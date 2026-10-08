import type { PlatformCourse, PromotionPost } from '@/lib/platform-types';
// These are editable drafts derived from the local course catalogue, not published posts.
export function coursePromotionDrafts(courses: PlatformCourse[]): PromotionPost[] {
    return courses.filter(c => c.published).map(c => ({
        id: `course-promotion-${c.id}`, date: c.startDate, time: '09:00', title: `${c.title} 수강 안내`,
        content: `${c.title}\n\n${c.subtitle}\n\n교육일: ${c.startDate} ${c.startTime}~${c.endTime}\n장소: ${c.location}\n담당 강사: ${c.instructor.name}\n수강료: ${c.price.toLocaleString('ko-KR')}원\n\n커리큘럼과 신청 조건을 확인하고 수강을 신청해 주세요.`,
        channel: '사이트', status: '초안', courseId: c.id, link: `/courses/${c.id}`, imageUrl: c.thumbnail,
        owner: '교육 운영팀', updatedAt: new Date().toISOString(),
    }));
}
