import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, limit, Timestamp, where, updateDoc } from 'firebase/firestore';

export interface DrivePhotoItem {
  id: string;
  userId: string;
  userName?: string;
  isPublic: boolean;
  name: string;
  url: string;
  category: string;
  description?: string;
  caption?: string;
  keywords?: string[];
  createdAt: number;
}

// 초기 샘플 공유 사진들 (회원 전체가 즉시 실습에 활용 가능한 고품질 샘플)
const INITIAL_SHARED_PHOTOS: DrivePhotoItem[] = [
  {
    id: 'sample_shared_1',
    userId: 'mentor_jo',
    userName: '조영빈 강사',
    isPublic: true,
    name: '성수동 감성 카페 인테리어.jpg',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    category: '매장/인테리어',
    description: '성수동 핫플 카페의 따뜻한 우드 톤 내부 인테리어와 자연광',
    caption: '통창으로 들어오는 따뜻한 오후 햇살이 머무는 성수동 핫플레이스 카페 전경입니다.',
    keywords: ['성수동카페', '인테리어', '감성카페', '네이버블로그'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'sample_shared_2',
    userId: 'mentor_lee',
    userName: '이석호 강사',
    isPublic: true,
    name: 'AI 비타민 세럼 신제품 촬영.jpg',
    url: 'https://images.unsplash.com/photo-1608248597358-1f6e2b694b8e?w=800&q=80',
    category: '제품/리뷰',
    description: '고급스러운 앰플 화장품 제품 컷과 자연광 반사',
    caption: '피부 결을 한 톤 밝혀주는 고농축 비타민C 앰플, 실제 텍스처와 윤광을 담아보았습니다.',
    keywords: ['화장품리뷰', '스킨케어', '제품촬영', 'VisKits숏폼'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'sample_shared_3',
    userId: 'mentor_park',
    userName: '박재범 강사',
    isPublic: true,
    name: '맥북과 스마트 오피스 데스크테리어.jpg',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    category: '일상/기타',
    description: 'AI 업무자동화를 실천하는 미니멀 오피스 데스크 환경',
    caption: '클로드와 AI 도구로 매일 2시간씩 업무시간을 단축하는 스마트 워크스페이스 세팅입니다.',
    keywords: ['업무자동화', '데스크테리어', '스마트오피스', '생산성'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: 'sample_shared_4',
    userId: 'student_kim',
    userName: '김수강 수강생',
    isPublic: true,
    name: '수제 베이커리 크루아상 플레이팅.jpg',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    category: '음식/맛집',
    description: '갓 구워낸 바삭한 버터 크루아상과 원목 트레이',
    caption: '버터 향 가득한 프랑스 정통 크루아상, 겉바속촉 식감이 살아있는 현장입니다.',
    keywords: ['베이커리', '크루아상', '맛집탐방', '플레이팅'],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

const SHARED_LOCAL_KEY = 'photo_drive_shared_community_v1';

// 1. 드라이브 사진 저장 (개인 사진첩 또는 전체 공유)
export async function saveDrivePhotos(
  user: { uid: string; email?: string | null; displayName?: string | null } | null,
  photos: {
    name: string;
    url: string;
    category?: string;
    description?: string;
    caption?: string;
    keywords?: string[];
  }[],
  isPublic: boolean = false
): Promise<DrivePhotoItem[]> {
  const userId = user?.uid || 'guest';
  const userName = user?.displayName || (userId === 'guest' ? '수강생' : user?.email?.split('@')[0] || '수강생');

  const newItems: DrivePhotoItem[] = photos.map((p, idx) => ({
    id: `drive_photo_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    userName,
    isPublic,
    name: p.name || `사진_${idx + 1}`,
    url: p.url,
    category: p.category || '제품/리뷰',
    description: p.description || '',
    caption: p.caption || '',
    keywords: p.keywords || [],
    createdAt: Date.now() + idx,
  }));

  // 로컬 개인 저장소 동기화
  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    const existing: DrivePhotoItem[] = raw ? JSON.parse(raw) : [];
    const updated = [...newItems, ...existing].slice(0, 150);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  // 공유로 설정된 경우 공용 로컬 갤러리에도 추가
  if (isPublic) {
    try {
      const sharedRaw = localStorage.getItem(SHARED_LOCAL_KEY);
      const sharedExisting: DrivePhotoItem[] = sharedRaw ? JSON.parse(sharedRaw) : INITIAL_SHARED_PHOTOS;
      const updatedShared = [...newItems, ...sharedExisting].slice(0, 200);
      localStorage.setItem(SHARED_LOCAL_KEY, JSON.stringify(updatedShared));
    } catch (e) {}
  }

  // Firestore 클라우드 저장
  if (user?.uid && user.uid !== 'guest') {
    try {
      for (const item of newItems) {
        // 개인 컬렉션 저장
        const docRef = doc(db, 'users', user.uid, 'photo_drive', item.id);
        const dataToSave = {
          ...item,
          url: item.url.startsWith('data:') && item.url.length > 500000 ? 'data:image_stored_local' : item.url,
          createdAtTimestamp: Timestamp.fromMillis(item.createdAt),
        };
        await setDoc(docRef, dataToSave);

        // 공유 컬렉션에도 저장
        if (isPublic) {
          const sharedDocRef = doc(db, 'shared_photo_drive', item.id);
          await setDoc(sharedDocRef, dataToSave);
        }
      }
    } catch (e) {
      console.warn('Firestore photo drive save skipped:', e);
    }
  }

  return newItems;
}

// 2. 내 개인 사진첩 목록 조회 (Private Photos)
export async function getDrivePhotos(
  user: { uid: string; email?: string | null } | null
): Promise<DrivePhotoItem[]> {
  const userId = user?.uid || 'guest';
  let list: DrivePhotoItem[] = [];

  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {}

  // Firestore 클라우드 개인 사진 조회
  if (user?.uid && user.uid !== 'guest') {
    try {
      const colRef = collection(db, 'users', user.uid, 'photo_drive');
      const q = query(colRef, orderBy('createdAtTimestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      const cloudItems: DrivePhotoItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || userId,
          userName: data.userName || '수강생',
          isPublic: Boolean(data.isPublic),
          name: data.name || '',
          url: data.url || '',
          category: data.category || '제품/리뷰',
          description: data.description || '',
          caption: data.caption || '',
          keywords: data.keywords || [],
          createdAt: data.createdAt || Date.now(),
        };
      });

      const map = new Map<string, DrivePhotoItem>();
      list.forEach((p) => map.set(p.id, p));
      cloudItems.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
      list = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {}
  }

  return list;
}

// 3. 회원 전체 공유 갤러리 목록 조회 (Shared Community Photos)
export async function getSharedDrivePhotos(): Promise<DrivePhotoItem[]> {
  let list: DrivePhotoItem[] = [];

  try {
    const sharedRaw = localStorage.getItem(SHARED_LOCAL_KEY);
    if (sharedRaw) {
      list = JSON.parse(sharedRaw);
    } else {
      list = [...INITIAL_SHARED_PHOTOS];
      localStorage.setItem(SHARED_LOCAL_KEY, JSON.stringify(list));
    }
  } catch (e) {
    list = [...INITIAL_SHARED_PHOTOS];
  }

  // Firestore 공용 컬렉션 조회
  try {
    const colRef = collection(db, 'shared_photo_drive');
    const q = query(colRef, orderBy('createdAtTimestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const cloudItems: DrivePhotoItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || 'unknown',
          userName: data.userName || '수강생',
          isPublic: true,
          name: data.name || '',
          url: data.url || '',
          category: data.category || '제품/리뷰',
          description: data.description || '',
          caption: data.caption || '',
          keywords: data.keywords || [],
          createdAt: data.createdAt || Date.now(),
        };
      });

      const map = new Map<string, DrivePhotoItem>();
      list.forEach((p) => map.set(p.id, p));
      cloudItems.forEach((p) => map.set(p.id, p));
      list = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (e) {}

  return list;
}

// 4. 사진 전체 공유 상태 토글 (개인 사진첩 <-> 공유 갤러리)
export async function togglePhotoPublicShare(
  user: { uid: string; displayName?: string | null; email?: string | null } | null,
  photoId: string,
  newPublicState: boolean
): Promise<void> {
  const userId = user?.uid || 'guest';

  // 1) 개인 로컬스토리지 업데이트
  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    let targetPhoto: DrivePhotoItem | null = null;
    if (raw) {
      const list: DrivePhotoItem[] = JSON.parse(raw);
      const updated = list.map((p) => {
        if (p.id === photoId) {
          targetPhoto = { ...p, isPublic: newPublicState };
          return targetPhoto;
        }
        return p;
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    }

    // 2) 공유 로컬스토리지 업데이트
    const sharedRaw = localStorage.getItem(SHARED_LOCAL_KEY);
    let sharedList: DrivePhotoItem[] = sharedRaw ? JSON.parse(sharedRaw) : [...INITIAL_SHARED_PHOTOS];

    if (newPublicState && targetPhoto) {
      // 공유 목록에 추가
      if (!sharedList.some((p) => p.id === photoId)) {
        sharedList = [targetPhoto, ...sharedList];
      }
    } else {
      // 공유 목록에서 제거
      sharedList = sharedList.filter((p) => p.id !== photoId);
    }
    localStorage.setItem(SHARED_LOCAL_KEY, JSON.stringify(sharedList));
  } catch (e) {}

  // 3) Firestore 클라우드 업데이트
  if (user?.uid && user.uid !== 'guest') {
    try {
      const userDocRef = doc(db, 'users', user.uid, 'photo_drive', photoId);
      await updateDoc(userDocRef, { isPublic: newPublicState });

      const sharedDocRef = doc(db, 'shared_photo_drive', photoId);
      if (newPublicState) {
        // 공유 컬렉션에 추가
        const snap = await getDocs(query(collection(db, 'users', user.uid, 'photo_drive'), where('id', '==', photoId)));
        if (!snap.empty) {
          await setDoc(sharedDocRef, snap.docs[0].data());
        }
      } else {
        // 공유 컬렉션에서 삭제
        await deleteDoc(sharedDocRef);
      }
    } catch (e) {}
  }
}

// 5. 드라이브 사진 삭제
export async function deleteDrivePhoto(userId: string, photoId: string): Promise<void> {
  // 개인 로컬 저장소 삭제
  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const existing: DrivePhotoItem[] = JSON.parse(raw);
      const filtered = existing.filter((p) => p.id !== photoId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    }

    // 공유 로컬 저장소에서도 삭제
    const sharedRaw = localStorage.getItem(SHARED_LOCAL_KEY);
    if (sharedRaw) {
      const sharedExisting: DrivePhotoItem[] = JSON.parse(sharedRaw);
      const updatedShared = sharedExisting.filter((p) => p.id !== photoId);
      localStorage.setItem(SHARED_LOCAL_KEY, JSON.stringify(updatedShared));
    }
  } catch (e) {}

  // Firestore 삭제
  if (userId && userId !== 'guest') {
    try {
      await deleteDoc(doc(db, 'users', userId, 'photo_drive', photoId));
      await deleteDoc(doc(db, 'shared_photo_drive', photoId));
    } catch (e) {}
  }
}
