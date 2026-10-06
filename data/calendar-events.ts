export type EventType = 'vod' | 'live' | 'offline' | 'deadline' | 'exam';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: EventType;
  title: string;
  courseTitle: string;
  status: '예정' | '학습 중' | '완료' | 'D-2' | 'D-Day';
  progress?: number;
  location?: string;
  link?: string;
}

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  vod: {
    label: 'VOD 강의',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  live: {
    label: '라이브 특강',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  offline: {
    label: '오프라인 교육',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  deadline: {
    label: '과제 마감',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  exam: {
    label: '시험',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
};

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'e-1',
    date: '2025-05-02',
    startTime: '10:00',
    endTime: '11:30',
    type: 'live',
    title: '오리엔테이션 및 AI 실무 로드맵 특강',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    status: '완료',
    location: 'Zoom 온라인 실시간',
  },
  {
    id: 'e-2',
    date: '2025-05-05',
    startTime: '09:00',
    endTime: '12:00',
    type: 'vod',
    title: '클로드 지식베이스 & 기획서 구조화 기초 (2개 강좌)',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    status: '완료',
    progress: 100,
  },
  {
    id: 'e-3',
    date: '2025-05-07',
    startTime: '14:00',
    endTime: '17:00',
    type: 'offline',
    title: '오프라인 집중 워크숍 (위든랩 세미나룸)',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    status: '완료',
    location: '서강대 위든랩 1호 회의실',
  },
  {
    id: 'e-4',
    date: '2025-05-09',
    startTime: '23:59',
    endTime: '23:59',
    type: 'deadline',
    title: '1주차 실전 보고서 프롬프트 제출 과제',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    status: '완료',
  },
  {
    id: 'e-5',
    date: '2025-05-13',
    startTime: '19:00',
    endTime: '20:30',
    type: 'live',
    title: '스마트에디터 ONE 서식 변환 & 사진 드라이브 라이브',
    courseTitle: 'AI 블로그 마스터 클래스',
    status: '완료',
  },
  {
    id: 'e-6',
    date: '2025-05-15',
    startTime: '14:00',
    endTime: '16:00',
    type: 'vod',
    title: '네이버 블로그 SEO 최적화 기법 VOD',
    courseTitle: 'AI 블로그 마스터 클래스',
    status: '완료',
    progress: 100,
  },
  {
    id: 'e-7',
    date: '2025-05-19',
    startTime: '10:00',
    endTime: '11:00',
    type: 'exam',
    title: '1차 실무 적용 능력 중간 평가 퀴즈',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    status: '완료',
  },
  // 2025.05.21 (Slide 24 Featured Day!)
  {
    id: 'e-8',
    date: '2025-05-21',
    startTime: '10:00',
    endTime: '11:30',
    type: 'live',
    title: 'AI 시대의 교육 혁신',
    courseTitle: '미래교육 트렌드',
    status: '예정',
    location: 'Zoom 라이브',
  },
  {
    id: 'e-9',
    date: '2025-05-21',
    startTime: '14:00',
    endTime: '15:30',
    type: 'vod',
    title: '데이터 분석 기초',
    courseTitle: '데이터 사이언스 입문',
    status: '학습 중',
    progress: 45,
  },
  {
    id: 'e-10',
    date: '2025-05-21',
    startTime: '16:00',
    endTime: '17:00',
    type: 'deadline',
    title: '1주차 과제 제출',
    courseTitle: '데이터 사이언스 입문',
    status: 'D-2',
  },
  {
    id: 'e-11',
    date: '2025-05-21',
    startTime: '19:00',
    endTime: '20:30',
    type: 'live',
    title: '파이썬 프로그래밍 기초',
    courseTitle: '파이썬으로 시작하기',
    status: '예정',
  },
  // 2025.05.22
  {
    id: 'e-12',
    date: '2025-05-22',
    startTime: '10:00',
    endTime: '11:30',
    type: 'live',
    title: '클라우드 컴퓨팅 개론',
    courseTitle: '클라우드 서비스 이해',
    status: '예정',
  },
  {
    id: 'e-13',
    date: '2025-05-22',
    startTime: '15:00',
    endTime: '16:00',
    type: 'vod',
    title: '통계학의 이해',
    courseTitle: '데이터 사이언스 입문',
    status: '예정',
    progress: 0,
  },
  // Later in the month
  {
    id: 'e-14',
    date: '2025-05-26',
    startTime: '13:00',
    endTime: '15:00',
    type: 'vod',
    title: '숏폼 영상 대본 & 텍스트 자동 자막 VOD (2개)',
    courseTitle: 'VisKits 숏폼 마스터 클래스',
    status: '예정',
  },
  {
    id: 'e-15',
    date: '2025-05-28',
    startTime: '23:59',
    endTime: '23:59',
    type: 'deadline',
    title: '최종 프로젝트 결과물 및 숏폼 영상 제출',
    courseTitle: 'AI 업무자동화 종합 과정',
    status: '예정',
  },
  {
    id: 'e-16',
    date: '2025-05-30',
    startTime: '14:00',
    endTime: '18:00',
    type: 'offline',
    title: '수료식 및 파트너사 네트워킹 데이',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스',
    status: '예정',
    location: '위든랩 메인 라운지',
  },
];
