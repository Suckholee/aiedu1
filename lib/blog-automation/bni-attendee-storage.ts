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
  sheetImages?: string[]; // 양식지에서 추출된 이미지 (페이지별 캡처/문서 내 사진)
  preferredPlace?: string; // 선호 미팅 장소
  phone?: string;
  email?: string;
  createdAt: number;
  updatedAt: number;
}

const LOCAL_STORAGE_KEY = 'bni_saved_attendees_v1';

/** 초기 BNI 파트너 및 회의 참석자 목록 (가상 목업 완전 배제, 사용자 직접 등록) */
export const DEFAULT_BNI_ATTENDEES: BniAttendee[] = [];

/** 로컬스토리지에서 참석자 목록 읽기 (목업 샘플 영구 정화) */
export function getLocalBniAttendees(): BniAttendee[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // 목업/더미 샘플 데이터(att_sample_, 김성훈, 이서진, 박민우) 영구 필터링 제거
    const cleanList = parsed.filter(
      (a: any) =>
        a &&
        a.id &&
        !String(a.id).startsWith('att_sample_') &&
        a.name !== '김성훈 대표' &&
        a.name !== '이서진 대표' &&
        a.name !== '박민우 대표'
    );
    if (cleanList.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch (e) {
    console.error('Error reading local BNI attendees:', e);
    return [];
  }
}

/** 로컬스토리지에 참석자 목록 저장 */
export function setLocalBniAttendees(attendees: BniAttendee[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanList = attendees.filter(
      (a) =>
        a &&
        a.id &&
        !String(a.id).startsWith('att_sample_') &&
        a.name !== '김성훈 대표' &&
        a.name !== '이서진 대표' &&
        a.name !== '박민우 대표'
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanList));
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
      return localList;
    }

    const cloudList: BniAttendee[] = [];
    snap.forEach((d) => {
      const data = d.data() as BniAttendee;
      if (
        data &&
        data.id &&
        !String(data.id).startsWith('att_sample_') &&
        data.name !== '김성훈 대표' &&
        data.name !== '이서진 대표' &&
        data.name !== '박민우 대표'
      ) {
        cloudList.push(data);
      }
    });
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
