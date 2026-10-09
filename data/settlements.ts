export type PaymentStatus = '결제완료' | '미결제' | '결제실패' | '환불';
export type EnrollmentStatus = '신청' | '승인' | '반려' | '대기';
export type SettlementStatus = '정산대기' | '정산완료' | '미정산' | '환불정산';

export interface ApplicantSettlementRecord {
  id: string;
  orderId: string;
  courseId: string;
  applicantName: string;
  email: string;
  phone: string;
  company: string;
  appliedAt: string;
  paidAt?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  enrollmentStatus: EnrollmentStatus;
  settlementStatus: SettlementStatus;
  instructorShare: number; // 강사 배분 기준액 (e.g. 70%)
  taxDeducted: number; // 3.3% 원천징수세
  netToInstructor: number; // 실지급액
  taxInvoiceStatus: '발급완료' | '미신청' | '신청접수';
  rejectReason?: string;
}

export interface CourseSettlementMeta {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  instructorAvatar: string;
  period: string;
  capacity: number;
  currentCount: number;
  price: number;
  // Summary aggregations
  totalRevenue: number;
  settledRevenue: number;
  unsettledRevenue: number;
  totalInstructorFee: number;
  settledInstructorFee: number;
  unsettledInstructorFee: number;
}

export const COURSE_SETTLEMENT_METAS: CourseSettlementMeta[] = [
  {
    courseId: 'ai-work-automation-master',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (1기)',
    instructorName: '이석호 · 조영빈 · 박재범 대표',
    instructorAvatar: '/instructors/lee-seokho.jpg',
    period: '2025.05.01 ~ 2025.05.31',
    capacity: 40,
    currentCount: 32,
    price: 129000,
    totalRevenue: 4128000,
    settledRevenue: 2838000,
    unsettledRevenue: 1290000,
    totalInstructorFee: 2889600,
    settledInstructorFee: 1986600,
    unsettledInstructorFee: 903000,
  },
  {
    courseId: 'data-analytics-intro',
    courseTitle: '데이터 분석 기초 및 시각화 마스터 클래스 (2기)',
    instructorName: '김데이터 수석',
    instructorAvatar: '/instructors/park-jaebeom.jpg',
    period: '2025.06.01 ~ 2025.06.30',
    capacity: 50,
    currentCount: 24,
    price: 99000,
    totalRevenue: 2376000,
    settledRevenue: 1584000,
    unsettledRevenue: 792000,
    totalInstructorFee: 1663200,
    settledInstructorFee: 1108800,
    unsettledInstructorFee: 554400,
  },
  {
    courseId: 'spring-boot-backend-pro',
    courseTitle: 'Spring Boot 3 & MSA 백엔드 아키텍처 완전 정복',
    instructorName: '박백엔드 아키텍트',
    instructorAvatar: '/instructors/cho-youngbin.png',
    period: '2025.05.15 ~ 2025.06.15',
    capacity: 30,
    currentCount: 22,
    price: 159000,
    totalRevenue: 3498000,
    settledRevenue: 2226000,
    unsettledRevenue: 1272000,
    totalInstructorFee: 2448600,
    settledInstructorFee: 1558200,
    unsettledInstructorFee: 890400,
  },
  {
    courseId: 'digital-marketing-growth',
    courseTitle: '생성형 AI 기반 디지털 퍼포먼스 마케팅 & CRM 실무',
    instructorName: '최마케팅 디렉터',
    instructorAvatar: '/instructors/park-jaebeom.jpg',
    period: '2025.05.20 ~ 2025.06.20',
    capacity: 60,
    currentCount: 35,
    price: 110000,
    totalRevenue: 3850000,
    settledRevenue: 2420000,
    unsettledRevenue: 1430000,
    totalInstructorFee: 2695000,
    settledInstructorFee: 1694000,
    unsettledInstructorFee: 1001000,
  },
];

export const INITIAL_SETTLEMENT_RECORDS: ApplicantSettlementRecord[] = [
  // Course 1: AI 업무자동화
  {
    id: 'rec-001',
    orderId: 'ORD-20250520-000101',
    courseId: 'ai-work-automation-master',
    applicantName: '김수강',
    email: 'student.kim@example.com',
    phone: '010-1234-5678',
    company: '핀테크 솔루션즈',
    appliedAt: '2025.05.20 14:35',
    paidAt: '2025.05.20 14:36',
    amount: 129000,
    paymentMethod: '카드(신한)',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산완료',
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '발급완료',
  },
  {
    id: 'rec-002',
    orderId: 'ORD-20250520-000102',
    courseId: 'ai-work-automation-master',
    applicantName: '곽성진',
    email: 'ceo.kwak@example.com',
    phone: '010-9876-5432',
    company: '비노글라스 / 르글라스',
    appliedAt: '2025.05.20 13:22',
    paidAt: '2025.05.20 13:25',
    amount: 129000,
    paymentMethod: '카카오페이',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산완료',
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '발급완료',
  },
  {
    id: 'rec-003',
    orderId: 'ORD-20250519-000103',
    courseId: 'ai-work-automation-master',
    applicantName: '이지은',
    email: 'jieun.lee@luxheaven.kr',
    phone: '010-3344-5566',
    company: '럭스헤븐',
    appliedAt: '2025.05.19 16:10',
    paidAt: '2025.05.19 16:12',
    amount: 129000,
    paymentMethod: '카드(삼성)',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산대기', // 미정산자
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '신청접수',
  },
  {
    id: 'rec-004',
    orderId: 'ORD-20250519-000104',
    courseId: 'ai-work-automation-master',
    applicantName: '정우진',
    email: 'woojin.jung@example.com',
    phone: '010-4455-6677',
    company: '스타트업랩',
    appliedAt: '2025.05.19 11:03',
    paidAt: '2025.05.19 11:05',
    amount: 129000,
    paymentMethod: '무통장입금',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산대기', // 미정산자
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '미신청',
  },
  {
    id: 'rec-005',
    orderId: 'ORD-20250518-000105',
    courseId: 'ai-work-automation-master',
    applicantName: '박민수',
    email: 'minsu.park@example.com',
    phone: '010-5566-7788',
    company: 'XYZ파트너스',
    appliedAt: '2025.05.18 10:15',
    amount: 129000,
    paymentMethod: '무통장입금(가상계좌)',
    paymentStatus: '미결제', // 미결제 신청자
    enrollmentStatus: '신청',
    settlementStatus: '미정산',
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '미신청',
  },
  {
    id: 'rec-006',
    orderId: 'ORD-20250518-000106',
    courseId: 'ai-work-automation-master',
    applicantName: '김태희',
    email: 'taehee.kim@example.com',
    phone: '010-6677-8899',
    company: '개인 수강생',
    appliedAt: '2025.05.18 17:42',
    amount: 129000,
    paymentMethod: '카드(현대)',
    paymentStatus: '결제실패',
    enrollmentStatus: '반려',
    settlementStatus: '미정산',
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '미신청',
    rejectReason: '한도 초과로 결제 승인이 거절되었습니다.',
  },
  {
    id: 'rec-007',
    orderId: 'ORD-20250517-000107',
    courseId: 'ai-work-automation-master',
    applicantName: '서지민',
    email: 'jimin.seo@example.com',
    phone: '010-7788-1122',
    company: '테크커뮤니티',
    appliedAt: '2025.05.17 15:33',
    paidAt: '2025.05.17 15:35',
    amount: 129000,
    paymentMethod: '카드(국민)',
    paymentStatus: '환불', // 환불 건
    enrollmentStatus: '반려',
    settlementStatus: '환불정산',
    instructorShare: 0,
    taxDeducted: 0,
    netToInstructor: 0,
    taxInvoiceStatus: '미신청',
    rejectReason: '일정 중복으로 인한 수강생 본인 취소 요청',
  },
  {
    id: 'rec-008',
    orderId: 'ORD-20250517-000108',
    courseId: 'ai-work-automation-master',
    applicantName: '오선호',
    email: 'sunho.oh@example.com',
    phone: '010-8899-2233',
    company: '글로벌AI랩',
    appliedAt: '2025.05.17 10:08',
    paidAt: '2025.05.17 10:10',
    amount: 129000,
    paymentMethod: '카드(BC)',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산완료',
    instructorShare: 90300,
    taxDeducted: 2980,
    netToInstructor: 87320,
    taxInvoiceStatus: '발급완료',
  },

  // Course 2: Data Analytics
  {
    id: 'rec-101',
    orderId: 'ORD-20250521-000201',
    courseId: 'data-analytics-intro',
    applicantName: '한유진',
    email: 'yujin.han@data.io',
    phone: '010-2233-4455',
    company: '빅데이터솔루션',
    appliedAt: '2025.05.21 09:20',
    paidAt: '2025.05.21 09:22',
    amount: 99000,
    paymentMethod: '카카오페이',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산완료',
    instructorShare: 69300,
    taxDeducted: 2286,
    netToInstructor: 67014,
    taxInvoiceStatus: '발급완료',
  },
  {
    id: 'rec-102',
    orderId: 'ORD-20250521-000202',
    courseId: 'data-analytics-intro',
    applicantName: '윤도현',
    email: 'dohyun.yoon@analytics.com',
    phone: '010-3344-7788',
    company: '인사이트랩',
    appliedAt: '2025.05.21 11:40',
    paidAt: '2025.05.21 11:42',
    amount: 99000,
    paymentMethod: '카드(신한)',
    paymentStatus: '결제완료',
    enrollmentStatus: '승인',
    settlementStatus: '정산대기',
    instructorShare: 69300,
    taxDeducted: 2286,
    netToInstructor: 67014,
    taxInvoiceStatus: '신청접수',
  },
  {
    id: 'rec-103',
    orderId: 'ORD-20250520-000203',
    courseId: 'data-analytics-intro',
    applicantName: '강태석',
    email: 'taeseok.kang@growth.co',
    phone: '010-9988-1122',
    company: '그로스파트너스',
    appliedAt: '2025.05.20 16:05',
    amount: 99000,
    paymentMethod: '무통장입금',
    paymentStatus: '미결제',
    enrollmentStatus: '신청',
    settlementStatus: '미정산',
    instructorShare: 69300,
    taxDeducted: 2286,
    netToInstructor: 67014,
    taxInvoiceStatus: '미신청',
  },
];
