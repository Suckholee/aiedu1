import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { GenerationLog, BlogAutoStats } from './types';

export async function getBlogAutoStats(): Promise<BlogAutoStats> {
  const logsQuery = query(
    collection(db, 'blog-auto-generation-logs'),
    orderBy('createdAt', 'desc')
  );
  const logsSnapshot = await getDocs(logsQuery);
  const allLogs = logsSnapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as GenerationLog)
  );

  const successCount = allLogs.filter((l) => l.status === 'success').length;
  const failedCount = allLogs.filter((l) => l.status === 'failed').length;
  const totalPosts = allLogs.length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekPosts = allLogs.filter((l) => {
    const date = l.createdAt instanceof Timestamp ? l.createdAt.toDate() : new Date();
    return date >= weekAgo;
  }).length;

  return {
    totalPosts,
    successCount,
    failedCount,
    successRate: totalPosts > 0 ? Math.round((successCount / totalPosts) * 1000) / 10 : 0,
    thisWeekPosts,
    recentLogs: allLogs.slice(0, 10),
  };
}

export async function getGenerationLogs(count: number = 50): Promise<GenerationLog[]> {
  const q = query(
    collection(db, 'blog-auto-generation-logs'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GenerationLog));
}
