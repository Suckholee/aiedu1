import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface DrivePhotoItem {
  id: string;
  userId: string;
  name: string;
  url: string;
  category: string;
  description?: string;
  caption?: string;
  keywords?: string[];
  createdAt: number;
}

// 1. 드라이브 사진 저장 (복수 일괄)
export async function saveDrivePhotos(
  user: { uid: string; email?: string | null } | null,
  photos: { name: string; url: string; category?: string; description?: string; caption?: string; keywords?: string[] }[]
): Promise<DrivePhotoItem[]> {
  const userId = user?.uid || 'guest';
  const newItems: DrivePhotoItem[] = photos.map((p, idx) => ({
    id: `drive_photo_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    name: p.name || `사진_${idx + 1}`,
    url: p.url,
    category: p.category || '기본',
    description: p.description || '',
    caption: p.caption || '',
    keywords: p.keywords || [],
    createdAt: Date.now() + idx,
  }));

  // 로컬 저장소 동기화
  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    const existing: DrivePhotoItem[] = raw ? JSON.parse(raw) : [];
    const updated = [...newItems, ...existing].slice(0, 100);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  // Firestore 클라우드 저장
  if (user?.uid && user.uid !== 'guest') {
    try {
      for (const item of newItems) {
        const docRef = doc(db, 'users', user.uid, 'photo_drive', item.id);
        const dataToSave = {
          ...item,
          url: item.url.startsWith('data:') ? 'base64_stored' : item.url,
          createdAtTimestamp: Timestamp.fromMillis(item.createdAt),
        };
        await setDoc(docRef, dataToSave);
      }
    } catch (e) {
      console.warn('Firestore photo drive save skipped:', e);
    }
  }

  return newItems;
}

// 2. 드라이브 사진 목록 조회
export async function getDrivePhotos(user: { uid: string; email?: string | null } | null): Promise<DrivePhotoItem[]> {
  const userId = user?.uid || 'guest';
  let list: DrivePhotoItem[] = [];

  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {}

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
          name: data.name || '',
          url: data.url || '',
          category: data.category || '기본',
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

// 3. 드라이브 사진 삭제
export async function deleteDrivePhoto(userId: string, photoId: string): Promise<void> {
  try {
    const localKey = `photo_drive_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const existing: DrivePhotoItem[] = JSON.parse(raw);
      const filtered = existing.filter((p) => p.id !== photoId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    }
  } catch (e) {}

  if (userId && userId !== 'guest') {
    try {
      await deleteDoc(doc(db, 'users', userId, 'photo_drive', photoId));
    } catch (e) {}
  }
}
