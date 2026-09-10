import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { BlogSchedule, ScheduleFrequency } from './types';

const COLLECTION = 'blog-auto-schedules';

// ─── CRUD ────────────────────────────────────────

export async function getSchedules(): Promise<BlogSchedule[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BlogSchedule));
}

export async function getSchedule(
  id: string
): Promise<BlogSchedule | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as BlogSchedule;
}

export async function createSchedule(data: {
  title: string;
  topic: string;
  ragDocIds?: string[];
  skillId?: string;
  customFields?: Record<string, string>;
  imageUrls?: string[];
  targetAudience?: string;
  copyFormula?: string;
  tone?: string;
  frequency: ScheduleFrequency;
  time: string;
  dayOfWeek?: number;
}): Promise<BlogSchedule> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    title: data.title,
    topic: data.topic,
    ragDocIds: data.ragDocIds || [],
    skillId: data.skillId || null,
    customFields: data.customFields || {},
    imageUrls: data.imageUrls || [],
    targetAudience: data.targetAudience || null,
    copyFormula: data.copyFormula || null,
    tone: data.tone || null,
    frequency: data.frequency,
    time: data.time,
    dayOfWeek: data.dayOfWeek ?? null,
    isActive: true,
    lastRunAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as BlogSchedule;
}

export async function updateSchedule(
  id: string,
  data: Partial<BlogSchedule>
): Promise<void> {
  const { id: _id, createdAt: _ca, ...updateData } = data as any;
  await updateDoc(doc(db, COLLECTION, id), {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSchedule(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ─── 스케줄 매칭 (Cloud Functions 용) ─────────────

export async function getActiveSchedulesForTime(
  hour: number,
  minute: number,
  dayOfWeek: number
): Promise<BlogSchedule[]> {
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true),
    where('time', '==', timeStr)
  );

  const snapshot = await getDocs(q);
  const schedules = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as BlogSchedule)
  );

  // frequency 필터링
  return schedules.filter((s) => {
    switch (s.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekly':
        return s.dayOfWeek === dayOfWeek;
      default:
        return false;
    }
  });
}
