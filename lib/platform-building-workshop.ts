/** Confirmed promotion details. Enrollment opens only after an LMS cohort is ready. */
export const PLATFORM_BUILDING_WORKSHOP = {
  slug: 'my-platform-1102',
  title: '나만의 플랫폼 만들기',
  subtitle: 'AI와 함께, 아이디어를 작동하는 첫 버전으로.',
  category: '개발·백엔드',
  price: 400000,
  location: '위든타워 3층',
  duration: '2회 · 총 8시간',
  poster: '/posters/my-platform-1102.png',
  href: '/courses/my-platform-1102',
  sessions: [
    { date: '2026-11-02', label: '11월 2일 (월)', title: '작은 플랫폼을 완성하는 날', outcome: '화면·데이터 저장·AI 연결이 이어지는 공통 예제', topics: ['실습 환경 준비와 첫 바이브코딩', '입력·목록·상태 변경 화면 만들기', '데이터 저장과 새로고침 후 유지 확인', 'AI 연결과 첫 자동화 실행'] },
    { date: '2026-11-09', label: '11월 9일 (월)', title: '내 아이디어로 확장하는 날', outcome: '핵심 기능 1개와 자동화 1개를 갖춘 나의 첫 버전', topics: ['내가 해결할 문제와 핵심 기능 정하기', '공통 예제를 내 업무·브랜드에 맞게 바꾸기', '자동화 규칙과 오류 상황 테스트', '공유 주소 배포와 결과 시연'] },
  ],
} as const;
