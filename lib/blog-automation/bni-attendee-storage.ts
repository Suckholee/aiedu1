import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

export interface BniAttendee {
  id: string;
  name: string; // 성함 및 직함 (예: 김성훈 대표)
  company: string; // 회사명 (예: 알파브랜딩)
  chapter: string; // 소속 챕터 (예: BNI 마스터 챕터)
  specialty: string; // 전문분야 / 주력 사업
  targetReferral: string; // 이상적인 추천 고객 (소개 희망 리퍼럴)
  partnerStrength: string; // 차별화된 핵심 강점 & USP
  sheetSummary: string; // 121 사전 양식지 메모 요약
  preferredPlace?: string; // 선호 미팅 장소
  phone?: string;
  email?: string;
  createdAt: number;
  updatedAt: number;
}

const LOCAL_STORAGE_KEY = 'bni_saved_attendees_v1';

/** 초기 기본 BNI 파트너 및 회의 참석자 예시 (사용자가 수정 및 삭제 가능) */
export const DEFAULT_BNI_ATTENDEES: BniAttendee[] = [
  {
    id: 'att_sample_1',
    name: '김성훈 대표',
    company: '알파브랜딩',
    chapter: 'BNI 마스터 챕터',
    specialty: '기업 브랜딩 및 공간 디자인 디렉팅',
    targetReferral: '신규 사옥 이전 기업, 프리미엄 매장 오픈 준비 중인 F&B 브랜드 대표',
    partnerStrength: '15년 업력의 브랜드 정체성 분석과 감각적인 비즈니스 동선 설계',
    sheetSummary: '고객의 브랜드 경험을 극대화하는 공간 설계 철학. 단순 인테리어를 넘어 매출로 연결되는 동선 기획 강점.',
    preferredPlace: '비즈니스 라운지 카페 (압구정)',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'att_sample_2',
    name: '이서진 대표',
    company: '미래경영컨설팅',
    chapter: 'BNI 마스터 챕터',
    specialty: 'CEO 법인 자산관리 및 가업승계 자문',
    targetReferral: '연매출 30억 이상 중소기업 대표, 법인 전환 및 세무 리스크 고민 기업',
    partnerStrength: '국내 대형 금융사 18년 경력, 중기부 인증 법인 경영 전략 자문가',
    sheetSummary: '고객의 기업 생애 주기에 맞춘 장기적 절세 플랜과 가업승계 맞춤 솔루션 제공. 단순 상품 판매가 아닌 파트너십.',
    preferredPlace: '르글라스 압구정 프라이빗 룸',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'att_sample_3',
    name: '박민우 대표',
    company: '스페이스원 디자인',
    chapter: 'BNI 에이스 챕터',
    specialty: '하이엔드 상업공간 및 주거 인테리어 시공',
    targetReferral: '고급 와인바/다이닝 신규 창업자, 50평 이상 프리미엄 오피스 인테리어',
    partnerStrength: '설계부터 책임 직영 시공까지 원스톱, 철저한 3년 무상 AS 보증',
    sheetSummary: '공간의 조도와 동선이 고객 체류 시간과 객단가를 결정한다는 철학. 시공 후 매출 데이터 기반 컨설팅.',
    preferredPlace: '신사동 가로수길 미팅룸',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

/** 로컬스토리지에서 참석자 목록 읽기 */
export function getLocalBniAttendees(): BniAttendee[] {
  if (typeof window === 'undefined') return DEFAULT_BNI_ATTENDEES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BNI_ATTENDEES));
      return DEFAULT_BNI_ATTENDEES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BNI_ATTENDEES;
  } catch (e) {
    console.error('Error reading local BNI attendees:', e);
    return DEFAULT_BNI_ATTENDEES;
  }
}

/** 로컬스토리지에 참석자 목록 저장 */
export function setLocalBniAttendees(attendees: BniAttendee[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(attendees));
  } catch (e) {
    console.error('Error writing local BNI attendees:', e);
  }
}

/** 통합 참석자 목록 조회 (Firestore + LocalStorage 듀얼 동기화) */
export async function getBniAttendees(userId?: string): Promise<BniAttendee[]> {
  const localList = getLocalBniAttendees();

  if (!userId || !db) {
    return localList;
  }

  try {
    const colRef = collection(db, 'users', userId, 'bni_attendees');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      // 클라우드가 비어있으면 로컬 초기값들을 클라우드로 시딩
      for (const item of localList) {
        await setDoc(doc(db, 'users', userId, 'bni_attendees', item.id), item, { merge: true });
      }
      return localList;
    }

    const cloudList: BniAttendee[] = [];
    snap.forEach((d) => cloudList.push(d.data() as BniAttendee));
    setLocalBniAttendees(cloudList);
    return cloudList;
  } catch (e) {
    console.warn('Firestore BNI attendees fetch fallback to local:', e);
    return localList;
  }
}

/** 참석자 정보 저장/수정 */
export async function saveBniAttendee(
  attendee: BniAttendee,
  userId?: string
): Promise<BniAttendee> {
  const localList = getLocalBniAttendees();
  const idx = localList.findIndex((a) => a.id === attendee.id);

  const updatedItem: BniAttendee = {
    ...attendee,
    updatedAt: Date.now(),
  };

  let newList: BniAttendee[];
  if (idx >= 0) {
    newList = [...localList];
    newList[idx] = updatedItem;
  } else {
    newList = [updatedItem, ...localList];
  }

  setLocalBniAttendees(newList);

  // Firestore 동기화
  if (userId && db) {
    try {
      await setDoc(
        doc(db, 'users', userId, 'bni_attendees', updatedItem.id),
        updatedItem,
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore BNI attendee save warning:', e);
    }
  }

  return updatedItem;
}

/** 참석자 삭제 */
export async function deleteBniAttendee(
  attendeeId: string,
  userId?: string
): Promise<void> {
  const localList = getLocalBniAttendees();
  const filtered = localList.filter((a) => a.id !== attendeeId);
  setLocalBniAttendees(filtered);

  if (userId && db) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'bni_attendees', attendeeId));
    } catch (e) {
      console.warn('Firestore BNI attendee delete warning:', e);
    }
  }
}
