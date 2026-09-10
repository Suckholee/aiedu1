export interface ContentLink {
  title?: string;
  url?: string;
  status: 'completed' | 'in_progress';
}

export interface Participant {
  id: string;
  name: string; // 성함 (예: '김철수' 입력 시 maskName을 통해 '김*수'로 안전하게 변환)
  industry: string; // 업종 (예: '부동산 중개 / 분양', '세무 / 회계', 'F&B 카페' 등)
  isEarlyBird: boolean; // 얼리버드 여부
  earlyBirdBadge?: string; // 예: '얼리버드 1차', '얼리버드 2차'
  blogPost?: ContentLink; // AI 블로그 글 링크 정보
  shortFormVideo?: ContentLink; // AI 숏폼 영상 링크 정보
  appliedAt?: string; // 신청 일자
}

/**
 * 개인정보 보호를 위한 성함 마스킹 함수
 * - 2글자: 이호 -> 이*
 * - 3글자: 김철수 -> 김*수
 * - 4글자 이상: 남궁민수 -> 남**수
 * - 이미 '*'가 포함된 경우 원문 유지
 */
export function maskName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.includes('*')) return trimmed;
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  const middleMask = '*'.repeat(trimmed.length - 2);
  return `${trimmed[0]}${middleMask}${trimmed[trimmed.length - 1]}`;
}

export const EARLY_BIRD_PERIOD = {
  startDate: '9월 7일',
  endDate: '9월 14일',
  label: '9월 7일 ~ 9월 14일',
  description: '9월 7일부터 9월 14일까지 얼리버드 신청 기간입니다. 이 기간 내 신청자 전원에게 AI 블로그 글 & 숏폼 영상을 사전 제작해 드립니다.',
};

export const AI_WORK_PARTICIPANTS: Participant[] = [
  // 실제 신청자가 접수되면 이곳에 추가됩니다 (목업 데이터 배제)
];

