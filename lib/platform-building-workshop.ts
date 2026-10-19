/** Confirmed promotion details. Enrollment opens only after an LMS cohort is ready. */
export const PLATFORM_BUILDING_WORKSHOP = {
  slug: 'my-platform-1102',
  title: '나만의 플랫폼 만들기',
  subtitle: '앞 4시간은 AI 블로그 홍보 페이지, 뒤 4시간은 개인 프로젝트 코칭.',
  category: '개발·백엔드',
  price: 800000,
  location: '위든타워 3층',
  duration: '2회 · 총 8시간',
  poster: '/posters/my-platform-1102.png',
  href: '/courses/my-platform-1102',
  sessions: [
    { date: '2026-11-02', label: '11월 2일 (월)', title: 'AI 블로그 홍보 페이지 만들기', outcome: 'AI 초안 생성과 글 작성·조회·수정·삭제가 가능한 홍보 페이지', topics: ['실습 환경 준비와 내 브랜드 홍보 페이지 구성', '블로그 글 작성·목록·수정·삭제 기능 만들기', '주제 입력 → AI 초안 생성 → 검토·저장 연결', '저장된 글과 오류 상황 확인, 공유 주소 배포'] },
    { date: '2026-11-09', label: '11월 9일 (월)', title: '개인 프로젝트 맞춤 코칭', outcome: '개인이 선택한 핵심 기능의 구현·개선과 다음 작업 계획', topics: ['각자의 목표와 현재 진행 상황 확인', '원하는 방식에 맞춰 구현할 핵심 기능 정하기', '개별 구현 코칭과 막히는 오류 함께 해결하기', '사용 흐름 점검, 결과 공유와 다음 단계 정리'] },
  ],
} as const;
