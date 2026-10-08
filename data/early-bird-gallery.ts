export interface EarlyBirdContent {
  id: string;
  applicant: string; // 예: 김*수
  industry: string; // 예: F&B 카페/디저트, 부동산 분양/중개, 경영 컨설팅 등
  category: 'shorts' | 'blog' | 'all';
  title: string;
  subtitle?: string;
  description: string;
  badge: string; // 예: '얼리버드 1차 완료', 'AI 제작 완료'
  createdAt: string;
  tags: string[];
  
  // 숏폼 전용 데이터
  shortsData?: {
    hookStyle: '질문형' | '충격형' | '공감형' | '스토리형';
    duration: string;
    hookText: string;
    videoAspect: '9:16';
    bgmStyle: string;
    voiceType: string;
    scriptScenes: {
      sceneNum: number;
      caption: string;
      narration: string;
    }[];
  };

  // 블로그 전용 데이터
  blogData?: {
    platform: '네이버 블로그' | '브런치';
    targetAudience: string;
    keywords: string[];
    summary: string;
    contentHtml: string;
  };
}

export const EARLY_BIRD_ITEMS: EarlyBirdContent[] = [];
