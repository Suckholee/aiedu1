import type { Course } from '@/data/courses';
export type PlatformCourse = Course & {
    startDate: string;
    startTime: string;
    endTime: string;
    location: string;
    published: boolean;
};
export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    link: string;
    startDate: string;
    endDate: string;
    active: boolean;
    order: number;
}
export interface Enrollment {
    id: string;
    courseId: string;
    name: string;
    email: string;
    phone: string;
    status: '신청' | '승인' | '반려' | '수료' | '환불';
    amount: number;
    createdAt: string;
    attendance: boolean;
    progress: string[];
    notes: string[];
}
export interface Material {
    id: string;
    courseId: string;
    title: string;
    url: string;
    createdAt: string;
}
export interface Review {
    id: string;
    enrollmentId: string;
    courseId: string;
    author: string;
    rating: number;
    content: string;
    approved: boolean;
    createdAt: string;
}
export interface PromotionPost {
    id: string;
    date: string;
    time: string;
    title: string;
    content: string;
    channel: '\uc0ac\uc774\ud2b8' | '\ub124\uc774\ubc84 \ube14\ub85c\uadf8' | '\uc778\uc2a4\ud0c0\uadf8\ub7a8' | '\uce74\uce74\uc624' | '\uae30\ud0c0';
    status: '\ucd08\uc548' | '\uac8c\uc2dc \uc608\uc815' | '\uac8c\uc2dc \uc644\ub8cc';
    courseId: string;
    link: string;
    imageUrl: string;
    owner: string;
    updatedAt: string;
}
export interface PlatformData {
    promotionPosts: PromotionPost[];
    reviews: Review[];
    courses: PlatformCourse[];
    banners: Banner[];
    enrollments: Enrollment[];
    materials: Material[];
    logs: {
        id: string;
        message: string;
        at: string;
    }[];
}
