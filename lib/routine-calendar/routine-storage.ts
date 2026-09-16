import { RoutineTask, INITIAL_KWAK_ROUTINE_TASKS } from '@/types/routine-calendar';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';

const STORAGE_KEY = 'kwak_routine_calendar_tasks_v1';

export function getLocalRoutineTasks(): RoutineTask[] {
  if (typeof window === 'undefined') return INITIAL_KWAK_ROUTINE_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KWAK_ROUTINE_TASKS));
      return INITIAL_KWAK_ROUTINE_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_KWAK_ROUTINE_TASKS;
  }
}

export function saveLocalRoutineTasks(tasks: RoutineTask[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save routine tasks to local storage:', e);
  }
}

// 태스크 1초 원터치 승인
export async function approveRoutineTask(
  taskId: string,
  user?: { uid: string } | null,
  notes?: string
): Promise<RoutineTask[]> {
  const current = getLocalRoutineTasks();
  const updated = current.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: 'approved' as const,
        approvedAt: Date.now(),
        actionNotes: notes || t.actionNotes,
      };
    }
    return t;
  });

  saveLocalRoutineTasks(updated);

  // Firestore 동기화
  if (user?.uid && user.uid !== 'guest' && db) {
    try {
      const docRef = doc(db, 'users', user.uid, 'routine_tasks', taskId);
      await setDoc(
        docRef,
        {
          status: 'approved',
          approvedAt: Timestamp.now(),
          actionNotes: notes || '',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore sync failed, local state preserved:', e);
    }
  }

  return updated;
}

// 태스크 한 줄 수정 지시
export async function reviseRoutineTask(
  taskId: string,
  feedback: string,
  user?: { uid: string } | null
): Promise<RoutineTask[]> {
  const current = getLocalRoutineTasks();
  const updated = current.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: 'revised' as const,
        revisedFeedback: feedback,
        actionNotes: `[대표 수정 지시] ${feedback}`,
      };
    }
    return t;
  });

  saveLocalRoutineTasks(updated);

  if (user?.uid && user.uid !== 'guest' && db) {
    try {
      const docRef = doc(db, 'users', user.uid, 'routine_tasks', taskId);
      await setDoc(
        docRef,
        {
          status: 'revised',
          revisedFeedback: feedback,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }
  }

  return updated;
}

// 오늘 대기 중인 모든 업무 원클릭 일괄 승인
export async function batchApproveToday(
  user?: { uid: string } | null
): Promise<RoutineTask[]> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const current = getLocalRoutineTasks();
  const updated = current.map((t) => {
    if (t.date === todayStr && t.status === 'draft_ready') {
      return {
        ...t,
        status: 'approved' as const,
        approvedAt: Date.now(),
      };
    }
    return t;
  });

  saveLocalRoutineTasks(updated);
  return updated;
}

// 초기 프리셋 복구
export function resetRoutineTasks(): RoutineTask[] {
  if (typeof window === 'undefined') return INITIAL_KWAK_ROUTINE_TASKS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KWAK_ROUTINE_TASKS));
  return INITIAL_KWAK_ROUTINE_TASKS;
}
