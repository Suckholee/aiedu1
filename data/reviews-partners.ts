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

export const STUDENT_REVIEWS: StudentReview[] = [
  {
    id: 'rev-1',
    author: '김*현',
    role: '스타트업 기획팀장',
    company: '핀테크 솔루션즈',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    rating: 5,
    date: '2025.05.12',
    content:
      '강의 내용이 알차고 설명도 이해하기 쉬워요. 매주 월요일마다 회의록 정리하느라 반나절을 버렸는데, 조영빈 대표님 클로드 기획서 추출 프롬프트 덕분에 이제 회의 끝나고 5분 만에 상무님 보고용 5단 구조 문서가 완성됩니다. 팀원들도 전부 감탄하고 있어요!',
    tags: ['업무시간 80% 단축', '보고서 구조화', '클로드 실무'],
    helpfulCount: 24,
    isVerified: true,
  },
  {
    id: 'rev-2',
    author: '박*수',
    role: '와인 유통사 CEO',
    company: '비노글라스',
    courseTitle: 'AI 루틴 캘린더 & CEO 콕핏',
    rating: 5,
    date: '2025.05.08',
    content:
      '대표로서 수많은 매장 운영과 마케팅 이슈를 일일이 챙기느라 지쳤었는데, AI 비서와 마케팅팀이 초안을 미리 짜두고 모바일에서 1초 만에 승인/반려하는 프로세스가 정말 신세계입니다. "AI Proposes, CEO Disposes" 철학이 왜 필수인지 뼈저리게 느꼈습니다.',
    tags: ['CEO 전용', '의사결정 자동화', '모바일 승인'],
    helpfulCount: 31,
    isVerified: true,
  },
  {
    id: 'rev-3',
    author: '이*민',
    role: '이커머스 브랜드 마케터',
    company: '럭스헤븐',
    courseTitle: 'AI 블로그 & 티스토리 스마트 옮겨쓰기',
    rating: 5,
    date: '2025.05.03',
    content:
      '네이버 스마트에디터 ONE에 복사할 때마다 폰트와 박스 스타일이 깨져서 스트레스였는데, 이석호 대표님의 HTML 자동 변환기와 사진 드라이브를 쓰니까 포스팅 시간이 2시간에서 15분으로 줄었습니다. 검색 노출 지수도 눈에 띄게 올랐어요!',
    tags: ['블로그 자동화', '스마트에디터ONE', '시간 절약'],
    helpfulCount: 19,
    isVerified: true,
  },
  {
    id: 'rev-4',
    author: '정*우',
    role: '1인 창업가 / 크리에이터',
    company: '테크브릿지',
    courseTitle: 'VisKits AI 숏폼 영상 제작',
    rating: 4,
    date: '2025.04.29',
    content:
      '영상 편집을 전혀 못하는 초보였는데 박재범 대표님 강의대로 텍스트만 넣으니 대본, AI 성우 보이스, 배경음악, 싱크 자막까지 알아서 뽑아줍니다. 인스타 릴스 올린 지 3일 만에 조회수 1.5만 터졌습니다. 초보자 강추합니다.',
    tags: ['숏폼 바이럴', 'TTS 자막 자동화', '초보 친화'],
    helpfulCount: 15,
    isVerified: true,
  },
];

export const PARTNERS: PartnerCompany[] = [
  {
    id: 'p-1',
    name: '서강대학교 창업지원단 & 위든랩',
    category: '산학 협력 기관',
    logoText: 'SOGANG WEEDEN',
    logoColor: 'from-rose-600 to-red-800',
    badge: 'ACTIVE',
    description: '대학 기반 AI 비즈니스 스타트업 육성 및 인프라 협력 파트너십.',
    benefit: '위든랩 세미나룸 및 오프라인 실습 공간 전액 지원',
    website: 'https://sogang.ac.kr',
  },
  {
    id: 'p-2',
    name: '네오앤피터 (neoNpeter)',
    category: 'SW·생산성 도구',
    logoText: 'neoNpeter AI',
    logoColor: 'from-indigo-600 to-violet-700',
    badge: 'ACTIVE',
    description: 'AI 업무자동화 솔루션 및 차세대 엔터프라이즈 에이전트 개발사.',
    benefit: '3대 실습 스튜디오 (보고서·블로그·캘린더) 평생 라이선스 제공',
    website: 'https://neonpeter.com',
  },
  {
    id: 'p-3',
    name: '어니스트원 (honestone)',
    category: '취업 연계 기업',
    logoText: 'honestone',
    logoColor: 'from-blue-600 to-cyan-700',
    badge: 'ACTIVE',
    description: '기업 디지털 전환 및 생성형 AI 인재 채용 연계 헤드헌팅 전문 그룹.',
    benefit: '우수 수료생 파트너사 AI 전문직 포지션 우선 면접권 부여',
    website: 'https://honestone.kr',
  },
  {
    id: 'p-4',
    name: 'VisKits AI Lab',
    category: 'SW·생산성 도구',
    logoText: 'VisKits Studio',
    logoColor: 'from-fuchsia-600 to-pink-600',
    badge: 'ACTIVE',
    description: '초경량 고화질 AI 숏폼 영상 생성 엔진 및 미디어 파이프라인.',
    benefit: '영상 렌더링 크레딧 1,000분 무료 증정',
    website: 'https://viskits.ai',
  },
  {
    id: 'p-5',
    name: '한국인공지능교육학회',
    category: '산학 협력 기관',
    logoText: 'K-AIEDU',
    logoColor: 'from-amber-600 to-orange-700',
    badge: 'PARTNER',
    description: '대한민국 표준 AI 교육 커리큘럼 및 역량 평가 기준 연구 기관.',
    benefit: '공식 1급/2급 AI 활용 역량 인증서 공동 발급',
    website: 'https://kaiedu.org',
  },
];
