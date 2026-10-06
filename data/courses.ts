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

export const COURSES: Course[] = [
  {
    id: 'ai-work-automation-master',
    title: 'AI 업무자동화 실전 마스터 클래스',
    subtitle: '말로 한 회의가 1초 만에 보고서·블로그·숏폼으로! 3시간 실전 혁신 워크숍',
    category: '업무자동화',
    level: '입문',
    rating: 4.9,
    reviewCount: 1248,
    studentCount: 3247,
    price: 129000,
    originalPrice: 161000,
    discountRate: 20,
    remainingSeats: 12,
    totalSeats: 100,
    dDay: 'D-3',
    thumbnail: '/images/ai_consulting_workflow.jpg',
    badge: 'BEST',
    instructor: {
      name: '이석호 · 조영빈 · 박재범',
      role: '대표 강사진 (AI 비즈니스 자동화 전문가 그룹)',
      avatar: '/instructors/lee-seokho.jpg',
      bio: 'honestone & neoNpeter 대표. 대기업·스타트업 150회 이상 AI 도입 컨설팅 및 실무 워크숍 총괄.',
    },
    durationText: '총 3파트 · 18시간 분량 실습 템플릿 포함',
    lectureCount: 24,
    highlights: [
      '수료증 공식 발급 (PDF/출력 지원)',
      '3대 AI 실습 스튜디오 (보고서·블로그·숏폼) 무제한 라이선스',
      '네이버 스마트에디터 원클릭 복사 & HTML 서식 변환기',
      '1:1 실습 질의응답 및 프롬프트 팩 평생 소장',
    ],
    curriculum: [
      {
        id: 'c1',
        chapterNumber: '01',
        title: '말로 한 상담이 기획서와 보고서가 되기까지 (조영빈 대표)',
        durationMinutes: 60,
        lessons: [
          { id: 'l1-1', lessonNumber: '1-1', title: '클로드(Claude) 프로젝트 기반 업무 지식베이스 구축', duration: '20분', type: 'video', isFreePreview: true },
          { id: 'l1-2', lessonNumber: '1-2', title: '음성 녹음본 1분 만에 5단 구조 보고서로 추출하기', duration: '25분', type: 'practice' },
          { id: 'l1-3', lessonNumber: '1-3', title: '실전 기획서 템플릿 작성 및 내보내기', duration: '15분', type: 'document' },
        ],
      },
      {
        id: 'c2',
        chapterNumber: '02',
        title: 'AI 블로그 & 티스토리 스마트 옮겨쓰기 (이석호 대표)',
        durationMinutes: 70,
        lessons: [
          { id: 'l2-1', lessonNumber: '2-1', title: '스마트에디터 ONE 복사 붙여넣기 텍스트 유실 원리 파악', duration: '15분', type: 'video', isFreePreview: true },
          { id: 'l2-2', lessonNumber: '2-2', title: '사진 드라이브 웹캠 연동 및 캡션 자동 생성 실습', duration: '30분', type: 'practice' },
          { id: 'l2-3', lessonNumber: '2-3', title: '1-to-1 미팅 리포트 자동 블로그 포스팅 파이프라인', duration: '25분', type: 'practice' },
        ],
      },
      {
        id: 'c3',
        chapterNumber: '03',
        title: 'VisKits AI 숏폼 영상 제작 및 SNS 확산 (박재범 대표)',
        durationMinutes: 50,
        lessons: [
          { id: 'l3-1', lessonNumber: '3-1', title: '텍스트에서 30초 바이럴 숏폼 대본과 자막 원클릭 생성', duration: '20분', type: 'video' },
          { id: 'l3-2', lessonNumber: '3-2', title: '음성 합성(TTS)과 BGM 자동 믹싱 워크플로우', duration: '20분', type: 'practice' },
          { id: 'l3-3', lessonNumber: '3-3', title: '유튜브 쇼츠 / 인스타 릴스 즉시 업로드 포맷팅', duration: '10분', type: 'document' },
        ],
      },
    ],
  },
  {
    id: 'data-analytics-intro',
    title: '데이터 분석 기초 및 시각화 마스터 클래스',
    subtitle: '파이썬과 태블로로 완성하는 비즈니스 의사결정 데이터 파이프라인',
    category: 'AI·데이터',
    level: '초급',
    rating: 4.8,
    reviewCount: 890,
    studentCount: 2150,
    price: 99000,
    originalPrice: 140000,
    discountRate: 29,
    remainingSeats: 24,
    totalSeats: 80,
    dDay: 'D-7',
    thumbnail: '/images/learning_dashboard.png',
    badge: '인기',
    instructor: {
      name: '김데이터 수석',
      role: '글로벌 테크기업 시니어 데이터 사이언티스트',
      avatar: '/instructors/park-jaebeom.jpg',
      bio: '현직 10년차 데이터 엔지니어. 빅데이터 분석 및 비즈니스 BI 대시보드 구축 전문가.',
    },
    durationText: '총 4파트 · 28시간 분량',
    lectureCount: 32,
    highlights: [
      '실제 비즈니스 매출 데이터셋 5종 제공',
      '파이썬 판다스 & 넘파이 치트시트 증정',
      '태블로(Tableau) 인터랙티브 대시보드 템플릿',
    ],
    curriculum: [
      {
        id: 'da1',
        chapterNumber: '01',
        title: '데이터 분석의 기초 및 파이썬 환경 설정',
        durationMinutes: 60,
        lessons: [
          { id: 'dal1', lessonNumber: '1-1', title: '데이터 사이언스 개요 및 실무 프로세스', duration: '25분', type: 'video', isFreePreview: true },
          { id: 'dal2', lessonNumber: '1-2', title: '주피터 노트북 환경 구축 및 판다스 기초', duration: '35분', type: 'practice' },
        ],
      },
      {
        id: 'da2',
        chapterNumber: '02',
        title: '탐색적 데이터 분석(EDA)과 데이터 정제',
        durationMinutes: 90,
        lessons: [
          { id: 'dal3', lessonNumber: '2-1', title: '결측치 및 이상치 처리 기법', duration: '40분', type: 'practice' },
          { id: 'dal4', lessonNumber: '2-2', title: '상관관계 분석 및 히트맵 시각화', duration: '50분', type: 'practice' },
        ],
      },
    ],
  },
  {
    id: 'spring-boot-backend-pro',
    title: 'Spring Boot 3 & MSA 백엔드 아키텍처 완전 정복',
    subtitle: '실무에 바로 적용하는 스프링 핵심 원리부터 대규모 트래픽 분산 처리까지',
    category: '개발·백엔드',
    level: '중급',
    rating: 4.9,
    reviewCount: 1540,
    studentCount: 4120,
    price: 159000,
    originalPrice: 199000,
    discountRate: 20,
    remainingSeats: 8,
    totalSeats: 60,
    dDay: 'D-5',
    thumbnail: '/images/claude_skill_building.jpg',
    badge: '추천',
    instructor: {
      name: '박백엔드 아키텍트',
      role: '유니콘 커머스 테크리드',
      avatar: '/instructors/cho-youngbin.png',
      bio: '수천만 건 트래픽 처리 시스템 설계 및 운영 경력 12년.',
    },
    durationText: '총 6파트 · 42강 · 36시간',
    lectureCount: 42,
    highlights: [
      '스프링 시큐리티 + JWT 실무 인증 체계',
      'Redis 캐싱 & Kafka 이벤트 기반 아키텍처',
      'AWS ECS & 도커 무중단 배포 실습',
    ],
    curriculum: [
      {
        id: 'sb1',
        chapterNumber: '01',
        title: 'Spring Framework 핵심 원리와 IoC/DI',
        durationMinutes: 80,
        lessons: [
          { id: 'sbl1', lessonNumber: '1-1', title: '스프링 컨테이너와 빈 생명주기 완벽 분석', duration: '40분', type: 'video', isFreePreview: true },
          { id: 'sbl2', lessonNumber: '1-2', title: '컴포넌트 스캔과 의존관계 자동 주입', duration: '40분', type: 'practice' },
        ],
      },
    ],
  },
  {
    id: 'digital-marketing-growth',
    title: '생성형 AI 기반 디지털 퍼포먼스 마케팅 & CRM 실무',
    subtitle: '콘텐츠 기획부터 광고 카피 생성, ROAS 300% 달성하는 초개인화 마케팅',
    category: '비즈니스·마케팅',
    level: '초급',
    rating: 4.7,
    reviewCount: 620,
    studentCount: 1890,
    price: 110000,
    originalPrice: 150000,
    discountRate: 26,
    remainingSeats: 35,
    totalSeats: 100,
    dDay: 'D-12',
    thumbnail: '/images/blog_automation_workflow.jpg',
    badge: 'NEW',
    instructor: {
      name: '최마케팅 디렉터',
      role: '글로벌 광고대행사 전략기획 본부장',
      avatar: '/instructors/park-jaebeom.jpg',
      bio: '누적 광고 집행액 300억 원 이상, AI 마케팅 에이전트 설계 전문가.',
    },
    durationText: '총 3파트 · 18강',
    lectureCount: 18,
    highlights: [
      '광고 카피 & 썸네일 AI 자동 프롬프트 100종',
      '메타(인스타/페이스북) & 구글 광고 실전 대시보드',
      '고객 세그먼트별 CRM 재구매 유도 시나리오',
    ],
    curriculum: [
      {
        id: 'dm1',
        chapterNumber: '01',
        title: 'AI를 활용한 고객 페르소나 및 카피라이팅',
        durationMinutes: 60,
        lessons: [
          { id: 'dml1', lessonNumber: '1-1', title: '타깃 고객군 심층 분석 및 페르소나 도출', duration: '30분', type: 'video' },
          { id: 'dml2', lessonNumber: '1-2', title: '전환율 높은 숏폼 스크립트 작성 실습', duration: '30분', type: 'practice' },
        ],
      },
    ],
  },
];
