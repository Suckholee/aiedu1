export interface StudentReview {
  id: string;
  author: string;
  role: string;
  company?: string;
  courseTitle: string;
  rating: number; // 1-5
  date: string;
  content: string;
  tags: string[];
  helpfulCount: number;
  isVerified: boolean;
  avatar?: string;
  images?: string[];
  source?: '내부' | '네이버 블로그' | '유튜브' | '커뮤니티';
}

export interface PartnerCompany {
  id: string;
  name: string;
  category: '취업 연계 기업' | 'SW·생산성 도구' | '산학 협력 기관' | '콘텐츠 제휴';
  logoText: string;
  logoColor: string;
  badge: 'ACTIVE' | 'PARTNER';
  description: string;
  benefit: string;
  website: string;
}

export const STUDENT_REVIEWS: StudentReview[] = [];

export const PARTNERS: PartnerCompany[] = [];
