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

// 교육 일정은 등록된 실제 과정에서 조회합니다. 예시 일정은 제공하지 않습니다.
export const CALENDAR_EVENTS: CalendarEvent[] = [];
