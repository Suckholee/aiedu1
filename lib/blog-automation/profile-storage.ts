import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { BlogSkillId, BlogPlatform } from './blog-skills';
import type { BlogCopyFormula, BlogTone } from './types';

export interface BlogProfile {
  id: string;
  userId: string;
  name: string; // 프로필명 (예: 강남 미소치과 공식 블로그)
  clientName: string; // 고객사/브랜드명 (예: 미소덴탈의료재단)
  ownerName: string; // 담당자/작성자 (예: 김원장, 박마케터)
  blogUrl: string; // 블로그 주소 (예: https://blog.naver.com/misodental)
  blogHandle?: string; // 아이디/핸들 (예: misodental)
  category: string; // 업종 분류 (병원/의료, 맛집/카페, 부동산, IT/앱서비스, 뷰티, 교육 등)
  description?: string; // 한줄 설명
  avatarEmoji: string; // 아이콘 (예: 🏥, 🥐, 💻, 🏠, ☕)
  color: string; // 테마 색상 (blue, amber, emerald, purple, rose, slate, cyan, indigo)
  
  // 템플릿 기본값
  platform: BlogPlatform; // naver | tistory | velog | wordpress
  skillId: BlogSkillId; // 블로그 스킬 ID
  tone: BlogTone; // friendly | professional | casual | informative | persuasive
  copyFormula: BlogCopyFormula; // auto | PAS | AIDA | BAB | FAB
  targetAudience: string; // 타겟 고객층 (예: 3040 직장인, 임플란트 및 미백 관심)
  requiredKeywords: string; // 필수 키워드 및 브랜드 해시태그
  customFields?: Record<string, string>; // 업체 맞춤 상세 정보 (위치, 영업시간, 주차, 연락처 등)
  customInstructions?: string; // AI 추가 맞춤 지침 (예: 과장표현 금지, 지도안내 포함)
  photoCategory?: string; // 전용 사진 보관함 카테고리
  
  // 메타데이터
  favorite?: boolean;
  postsCount: number;
  lastGeneratedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// ─── 초기 기본 샘플 프리셋 (새 사용자에게 유용한 예시 템플릿) ───────────
export const DEFAULT_SAMPLE_PROFILES: Omit<BlogProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '강남 센트럴치과의원 공식 블로그',
    clientName: '센트럴덴탈메디컬',
    ownerName: '김대표원장',
    blogUrl: 'https://blog.naver.com/central_dental',
    blogHandle: 'central_dental',
    category: '병원/의료',
    description: '임플란트 및 심미보철 1:1 맞춤 진료 전문 네이버 블로그',
    avatarEmoji: '🏥',
    color: 'blue',
    platform: 'naver',
    skillId: 'medical',
    tone: 'professional',
    copyFormula: 'PAS',
    targetAudience: '강남 인근 30~50대 직장인 및 안심 진료 희망 환자',
    requiredKeywords: '강남역치과, 강남임플란트, 야간진료치과, 센트럴치과',
    customFields: {
      location: '강남역 11번 출구 도보 2분 (글라스타워 5층)',
      businessHours: '평일 09:30~20:30 (화/목 야간진료), 토요일 09:30~14:00',
      parking: '건물 내 지하 2시간 무료 주차 지원',
      phone: '02-555-2875',
      doctorIntro: '보건복지부 인증 구강악안면외과 전문의 1:1 책임 진료',
    },
    customInstructions: '과장 광고나 가격 덤핑 표현 지양, 환자의 불안감을 해소하고 신뢰를 주는 친절하고 전문적인 어조 유지',
    photoCategory: '시니어/건강',
    favorite: true,
    postsCount: 18,
    lastGeneratedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    name: '성수동 달콤베이커리 카페 스토리',
    clientName: '달콤F&B(주)',
    ownerName: '이지은 파티시에',
    blogUrl: 'https://blog.naver.com/sweet_seongsu',
    blogHandle: 'sweet_seongsu',
    category: '음식점/카페',
    description: '천연 발효종 크루아상과 스페셜티 커피 이야기',
    avatarEmoji: '🥐',
    color: 'amber',
    platform: 'naver',
    skillId: 'restaurant',
    tone: 'friendly',
    copyFormula: 'AIDA',
    targetAudience: '성수동 데이트 코스 및 디저트 핫플을 찾는 2030 여성',
    requiredKeywords: '성수동카페, 뚝섬디저트, 소금빵맛집, 달콤베이커리',
    customFields: {
      location: '성수역 3번 출구 카페거리 도보 5분',
      signatureMenu: '소금버터 크루아상, 피스타치오 크림 라떼',
      businessHours: '화~일 11:00 ~ 21:00 (월요일 정기휴무)',
      features: '당일 생산 당일 판매 원칙, 프랑스산 고메버터 100% 사용',
    },
    customInstructions: '침샘을 자극하는 감각적인 묘사(바삭한 식감, 고소한 풍미), 감성적인 사진 배치 안내',
    photoCategory: '음식/맛집',
    favorite: true,
    postsCount: 24,
    lastGeneratedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    name: '넥스트 테크랩 개발자 & AI 인사이트',
    clientName: 'NextTech Corp.',
    ownerName: '박마케터 / Tech팀',
    blogUrl: 'https://tech.wordpress.com/next_techlab',
    blogHandle: '@next_techlab',
    category: 'IT/앱서비스',
    description: '최신 AI 기술 동향, SaaS 개발 노하우 및 실무 가이드',
    avatarEmoji: '💻',
    color: 'purple',
    platform: 'wordpress',
    skillId: 'itservice',
    tone: 'informative',
    copyFormula: 'FAB',
    targetAudience: '스타트업 개발자, PO/PM, AI 생산성 툴 도입에 관심 있는 실무자',
    requiredKeywords: 'AI자동화, NextJS, 프롬프트엔지니어링, SaaS개발, 넥스트테크',
    customFields: {
      techStack: 'TypeScript, Next.js 14, TailwindCSS, Firebase, Gemini 1.5 Pro',
      serviceUrl: 'https://nexttech-ai.io',
      features: '업무 자동화 300% 단축 사례 기반 실전 튜토리얼',
    },
    customInstructions: '코드 스니펫과 아키텍처 다이어그램 구조를 명확히 제시, 실용적이고 체계적인 정보 전달',
    photoCategory: '기타',
    favorite: false,
    postsCount: 12,
    lastGeneratedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    name: '한강 리치 공인중개사 부동산 가이드',
    clientName: '한강랜드부동산중개',
    ownerName: '최중개사',
    blogUrl: 'https://rich-hangang.tistory.com',
    blogHandle: 'rich-hangang',
    category: '부동산',
    description: '마용성 아파트 시세 분석, 실거래가 브리핑 및 절세 전략',
    avatarEmoji: '🏠',
    color: 'emerald',
    platform: 'tstory',
    skillId: 'realestate',
    tone: 'persuasive',
    copyFormula: 'BAB',
    targetAudience: '내 집 마련 실수요자, 아파트 청약 및 갭투자 관심 30~50대',
    requiredKeywords: '마포아파트시세, 용산재개발, 실거래가분석, 한강리치부동산',
    customFields: {
      location: '마포역 2번 출구 앞 (마포트라팰리스 1층)',
      specialty: '마포/용산 신축 대단지 아파트 및 재개발 매물 전문',
      phone: '02-710-8800',
    },
    customInstructions: '객관적인 통계 데이터와 정책 변동 사항을 명료하게 정리하고 매수자/임차인 관점의 실질적 혜택 강조',
    photoCategory: '부동산/인테리어',
    favorite: false,
    postsCount: 9,
    lastGeneratedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
];

// ─── 프로필 목록 가져오기 ──────────────────────────────
export async function getBlogProfiles(
  user: { uid: string; email?: string | null } | null
): Promise<BlogProfile[]> {
  const userId = user?.uid || 'guest';
  let list: BlogProfile[] = [];

  // 1. 로컬 저장소 조회
  try {
    const localKey = `blog_profiles_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {
    console.error('LocalStorage profile read error:', e);
  }

  // 2. Firestore 클라우드 조회 (로그인 시)
  if (user?.uid && user.uid !== 'guest') {
    try {
      const colRef = collection(db, 'users', user.uid, 'blog_profiles');
      const q = query(colRef, orderBy('createdAtTimestamp', 'desc'), limit(100));
      const snap = await getDocs(q);

      const cloudItems: BlogProfile[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || userId,
          name: data.name || '',
          clientName: data.clientName || '',
          ownerName: data.ownerName || '',
          blogUrl: data.blogUrl || '',
          blogHandle: data.blogHandle || '',
          category: data.category || '일반/기타',
          description: data.description || '',
          avatarEmoji: data.avatarEmoji || '📝',
          color: data.color || 'blue',
          platform: data.platform || 'naver',
          skillId: data.skillId || 'general',
          tone: data.tone || 'friendly',
          copyFormula: data.copyFormula || 'auto',
          targetAudience: data.targetAudience || '',
          requiredKeywords: data.requiredKeywords || '',
          customFields: data.customFields || {},
          customInstructions: data.customInstructions || '',
          photoCategory: data.photoCategory || '전체',
          favorite: !!data.favorite,
          postsCount: data.postsCount || 0,
          lastGeneratedAt: data.lastGeneratedAt,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        };
      });

      if (cloudItems.length > 0) {
        const map = new Map<string, BlogProfile>();
        list.forEach((p) => map.set(p.id, p));
        cloudItems.forEach((p) => map.set(p.id, p));
        list = Array.from(map.values());
      }
    } catch (e) {
      console.warn('Firestore blog profile fetch skipped:', e);
    }
  }

  // 3. 만약 프로필이 비어있다면 샘플 기본값으로 시딩
  if (list.length === 0) {
    const seededList: BlogProfile[] = DEFAULT_SAMPLE_PROFILES.map((sample, idx) => ({
      ...sample,
      id: `profile_sample_${idx + 1}`,
      userId,
      createdAt: Date.now() - idx * 1000 * 60 * 60 * 24 * 3,
      updatedAt: Date.now() - idx * 1000 * 60 * 60 * 24 * 3,
    }));
    list = seededList;
    try {
      localStorage.setItem(`blog_profiles_${userId}`, JSON.stringify(list));
    } catch (e) {}
  }

  // 즐겨찾기 우선, 그 다음 최신 수정순 정렬
  return list.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

// ─── 단일 프로필 저장/생성/수정 ──────────────────────────
export async function saveBlogProfile(
  user: { uid: string; email?: string | null } | null,
  profileData: Partial<BlogProfile> & { name: string }
): Promise<BlogProfile> {
  const userId = user?.uid || 'guest';
  const now = Date.now();
  const id = profileData.id || `profile_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const profile: BlogProfile = {
    id,
    userId,
    name: profileData.name.trim(),
    clientName: (profileData.clientName || '').trim(),
    ownerName: (profileData.ownerName || '').trim(),
    blogUrl: (profileData.blogUrl || '').trim(),
    blogHandle: (profileData.blogHandle || '').trim(),
    category: profileData.category || '일반/기타',
    description: (profileData.description || '').trim(),
    avatarEmoji: profileData.avatarEmoji || '📝',
    color: profileData.color || 'blue',
    platform: profileData.platform || 'naver',
    skillId: profileData.skillId || 'general',
    tone: profileData.tone || 'friendly',
    copyFormula: profileData.copyFormula || 'auto',
    targetAudience: (profileData.targetAudience || '').trim(),
    requiredKeywords: (profileData.requiredKeywords || '').trim(),
    customFields: profileData.customFields || {},
    customInstructions: (profileData.customInstructions || '').trim(),
    photoCategory: profileData.photoCategory || '전체',
    favorite: !!profileData.favorite,
    postsCount: profileData.postsCount || 0,
    lastGeneratedAt: profileData.lastGeneratedAt,
    createdAt: profileData.createdAt || now,
    updatedAt: now,
  };

  // 로컬 저장소 동기화
  try {
    const localKey = `blog_profiles_${userId}`;
    const raw = localStorage.getItem(localKey);
    const list: BlogProfile[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((p) => p.id === id);
    if (index >= 0) {
      list[index] = profile;
    } else {
      list.unshift(profile);
    }
    localStorage.setItem(localKey, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage profile save error:', e);
  }

  // Firestore 동기화
  if (user?.uid && user.uid !== 'guest') {
    try {
      const docRef = doc(db, 'users', user.uid, 'blog_profiles', id);
      const firestoreData = {
        ...profile,
        createdAtTimestamp: Timestamp.fromMillis(profile.createdAt),
        updatedAtTimestamp: Timestamp.fromMillis(profile.updatedAt),
      };
      await setDoc(docRef, firestoreData);
    } catch (e) {
      console.warn('Firestore profile save skipped:', e);
    }
  }

  return profile;
}

// ─── 프로필 삭제 ──────────────────────────────────────
export async function deleteBlogProfile(
  user: { uid: string; email?: string | null } | null,
  profileId: string
): Promise<void> {
  const userId = user?.uid || 'guest';

  // 로컬 저장소 삭제
  try {
    const localKey = `blog_profiles_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const list: BlogProfile[] = JSON.parse(raw);
      const filtered = list.filter((p) => p.id !== profileId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    }
  } catch (e) {}

  // Firestore 삭제
  if (user?.uid && user.uid !== 'guest') {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'blog_profiles', profileId));
    } catch (e) {
      console.warn('Firestore profile delete skipped:', e);
    }
  }
}

// ─── 프로필 즐겨찾기 토글 ─────────────────────────────
export async function toggleFavoriteProfile(
  user: { uid: string; email?: string | null } | null,
  profileId: string
): Promise<boolean> {
  const profiles = await getBlogProfiles(user);
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return false;

  const nextFavorite = !target.favorite;
  await saveBlogProfile(user, {
    ...target,
    favorite: nextFavorite,
  });
  return nextFavorite;
}

// ─── 프로필 생성 횟수 증가 & 최근 생성일 업데이트 ─────────
export async function incrementProfilePostCount(
  user: { uid: string; email?: string | null } | null,
  profileId: string
): Promise<void> {
  const profiles = await getBlogProfiles(user);
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return;

  await saveBlogProfile(user, {
    ...target,
    postsCount: (target.postsCount || 0) + 1,
    lastGeneratedAt: Date.now(),
  });
}
