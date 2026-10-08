export interface CourseCurriculumItem {
  id: string;
  chapterNumber: string;
  title: string;
  durationMinutes: number;
  lessons: {
    id: string;
    lessonNumber: string;
    title: string;
    duration: string;
    type: 'video' | 'practice' | 'document' | 'quiz';
    isFreePreview?: boolean;
  }[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: 'AI·데이터' | '업무자동화' | '개발·백엔드' | '비즈니스·마케팅';
  level: '초급' | '중급' | '고급' | '입문';
  rating: number;
  reviewCount: number;
  studentCount: number;
  price: number;
  originalPrice: number;
  discountRate: number;
  remainingSeats: number;
  totalSeats: number;
  dDay: string;
  thumbnail: string;
  badge?: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  durationText: string;
  lectureCount: number;
  curriculum: CourseCurriculumItem[];
  highlights: string[];
}

export const COURSES: Course[] = [];
