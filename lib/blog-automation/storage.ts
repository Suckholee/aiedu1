import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface SavedBlogPost {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  subtitle?: string;
  content: string;
  htmlContent: string;
  excerpt: string;
  tags: string[];
  faqs?: { question: string; answer: string }[];
  images?: { url: string; name: string; caption?: string; description?: string }[];
  skillId?: string;
  platform?: string;
  targetAudience?: string;
  profileId?: string;
  profileName?: string;
  clientName?: string;
  blogUrl?: string;
  charCount: number;
  createdAt: number;
}

export async function saveBlogPostRecord(
  user: { uid: string; email?: string | null } | null,
  post: any,
  meta?: {
    skillId?: string;
    platform?: string;
    targetAudience?: string;
    profileId?: string;
    profileName?: string;
    clientName?: string;
    blogUrl?: string;
  }
): Promise<SavedBlogPost> {
  const userId = user?.uid || 'guest';
  const userEmail = user?.email || '비회원 (게스트)';
  const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const charCount = (post.content || '').replace(/\s+/g, '').length;

  const record: SavedBlogPost = {
    id,
    userId,
    userEmail,
    title: post.title || '제목 없음',
    subtitle: post.subtitle || '',
    content: post.content || '',
    htmlContent: post.htmlContent || '',
    excerpt: post.excerpt || '',
    tags: post.tags || [],
    faqs: post.faqs || [],
    images: post.images || [],
    skillId: meta?.skillId || 'general',
    platform: meta?.platform || 'naver',
    targetAudience: meta?.targetAudience || '',
    profileId: meta?.profileId,
    profileName: meta?.profileName,
    clientName: meta?.clientName,
    blogUrl: meta?.blogUrl,
    charCount,
    createdAt: Date.now(),
  };

  try {
    const localKey = `blog_posts_${userId}`;
    const raw = localStorage.getItem(localKey);
    const list: SavedBlogPost[] = raw ? JSON.parse(raw) : [];
    const updated = [record, ...list.filter((p) => p.id !== id)].slice(0, 50);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  if (user?.uid && user.uid !== 'guest') {
    try {
      const docRef = doc(db, 'users', user.uid, 'blog_posts', id);
      const firestoreData = {
        ...record,
        images: (record.images || []).slice(0, 10).map((img) => ({
          url: img.url && img.url.startsWith('data:') ? 'base64_image' : (img.url || ''),
          name: img.name || '',
          caption: img.caption || '',
          description: img.description || '',
        })),
        createdAtTimestamp: Timestamp.fromMillis(record.createdAt),
      };
      await setDoc(docRef, firestoreData);
    } catch (e) {
      console.warn('Firestore 저장 스킵:', e);
    }
  }

  return record;
}

export async function getSavedBlogPosts(user: { uid: string; email?: string | null } | null): Promise<SavedBlogPost[]> {
  const userId = user?.uid || 'guest';
  let posts: SavedBlogPost[] = [];

  try {
    const localKey = `blog_posts_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      posts = JSON.parse(raw);
    }
  } catch (e) {}

  if (user?.uid && user.uid !== 'guest') {
    try {
      const colRef = collection(db, 'users', user.uid, 'blog_posts');
      const q = query(colRef, orderBy('createdAtTimestamp', 'desc'), limit(50));
      const snap = await getDocs(q);

      const cloudPosts: SavedBlogPost[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || userId,
          userEmail: data.userEmail || user.email || '',
          title: data.title || '',
          subtitle: data.subtitle || '',
          content: data.content || '',
          htmlContent: data.htmlContent || '',
          excerpt: data.excerpt || '',
          tags: data.tags || [],
          faqs: data.faqs || [],
          images: data.images || [],
          skillId: data.skillId || 'general',
          platform: data.platform || 'naver',
          targetAudience: data.targetAudience || '',
          profileId: data.profileId,
          profileName: data.profileName,
          clientName: data.clientName,
          blogUrl: data.blogUrl,
          charCount: data.charCount || 0,
          createdAt: data.createdAt || Date.now(),
        };
      });

      const map = new Map<string, SavedBlogPost>();
      posts.forEach((p) => map.set(p.id, p));
      cloudPosts.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });

      posts = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.warn('Firestore 조회 스킵, 로컬 데이터 사용:', e);
    }
  }

  return posts;
}

export async function deleteSavedBlogPost(userId: string, postId: string): Promise<void> {
  try {
    const localKey = `blog_posts_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const list: SavedBlogPost[] = JSON.parse(raw);
      const filtered = list.filter((p) => p.id !== postId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    }
  } catch (e) {}

  if (userId && userId !== 'guest') {
    try {
      await deleteDoc(doc(db, 'users', userId, 'blog_posts', postId));
    } catch (e) {}
  }
}
