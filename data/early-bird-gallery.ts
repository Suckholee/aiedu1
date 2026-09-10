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

export const EARLY_BIRD_ITEMS: EarlyBirdContent[] = [
  {
    id: 'eb-01',
    applicant: '박*진',
    industry: '베이커리 카페 (F&B)',
    category: 'all',
    title: '매일 아침 7시, 갓 구운 소금빵 100개가 완판되는 비밀',
    subtitle: '휴대폰 사진 3장으로 완성한 네이버 플레이스 연동 블로그 & 릴스 숏폼',
    description: '얼리버드 신청자 박*진 님의 매장 사진을 바탕으로 AI가 자동 추출한 키워드와 후킹 멘트로 제작된 세트입니다.',
    badge: '얼리버드 특별제작 완료',
    createdAt: '2026-09-08',
    tags: ['카페홍보', '인스타릴스', '네이버블로그', '소금빵맛집'],
    shortsData: {
      hookStyle: '질문형',
      duration: '28초',
      hookText: '"소금빵 살 때 아직도 아무 데나 가시나요?"',
      videoAspect: '9:16',
      bgmStyle: 'Chill Lo-Fi',
      voiceType: '자연스러운 여성 (Neural)',
      scriptScenes: [
        { sceneNum: 1, caption: '소금빵 살 때 아직도 그냥 가세요?', narration: '소금빵 살 때 아직도 아무 데나 가시나요?' },
        { sceneNum: 2, caption: '프랑스산 고메버터 100%의 풍미', narration: '매일 아침 프랑스산 천연 버터로 직접 구워냅니다.' },
        { sceneNum: 3, caption: '겉은 바삭, 속은 쫀득한 버터동굴!', narration: '한 입 베어물면 입안 가득 터지는 고소한 풍미.' },
        { sceneNum: 4, caption: '한정수량 매진 전 방문해보세요', narration: '지금 프로필 링크에서 오늘 남은 수량을 확인해 보세요!' },
      ],
    },
    blogData: {
      platform: '네이버 블로그',
      targetAudience: '주말 디저트 투어 및 동네 카페를 찾는 2030 직장인',
      keywords: ['수제소금빵', '동네카페추천', '프랑스고메버터', '베이커리맛집'],
      summary: '향긋한 빵 냄새로 하루를 여는 매장의 철학과 시그니처 소금빵의 차별점을 감성적인 사진과 함께 풀어낸 리뷰형 포스팅',
      contentHtml: `
        <h3 style="color:#1e293b; font-size:20px; font-weight:bold; margin-bottom:12px;">아침을 깨우는 진짜 버터의 향기</h3>
        <p style="color:#475569; line-height:1.8; margin-bottom:16px;">매일 아침 6시 반, 반죽을 치대는 소리와 함께 오븐 온도가 올라갑니다. 저희가 타협하지 않는 단 한 가지는 바로 <strong>100% 프랑스산 발효 버터</strong>의 비율입니다.</p>
        <div style="background:#f8fafc; border-left:4px solid #8b5cf6; padding:12px 16px; margin-bottom:16px;">
          <p style="margin:0; font-weight:600; color:#4338ca;">💡 소금빵 맛있게 즐기는 꿀팁</p>
          <p style="margin:4px 0 0; color:#64748b; font-size:14px;">구매 즉시 손으로 반을 찢어 결 사이의 '버터 동굴'을 확인하고, 따뜻할 때 바로 드셔보세요.</p>
        </div>
        <p style="color:#475569; line-height:1.8;">이번 주말, 나만을 위한 작은 여유가 필요하다면 향긋한 커피와 함께 갓 구운 빵 한 조각 어떠신가요?</p>
      `,
    },
  },
  {
    id: 'eb-02',
    applicant: '최*호',
    industry: '부동산 중개 / 상가 분양',
    category: 'shorts',
    title: '상가 계약 전 3가지만 안 보면 보증금 다 날립니다',
    subtitle: '공인중개사 대표님의 전문성을 살린 35초 쇼츠 영상',
    description: '어려운 부동산 권리 분석과 상권 분석을 초보 임차인의 눈높이에서 3가지 핵심 체크리스트로 재구성한 숏폼 콘텐츠입니다.',
    badge: '얼리버드 숏폼 완료',
    createdAt: '2026-09-09',
    tags: ['상가임대', '공인중개사', '창업팁', '권리금체크'],
    shortsData: {
      hookStyle: '충격형',
      duration: '32초',
      hookText: '"상가 계약 전 이것 모르면 보증금 날립니다!"',
      videoAspect: '9:16',
      bgmStyle: 'Fast Electronic',
      voiceType: '신뢰감 있는 남성 (Neural)',
      scriptScenes: [
        { sceneNum: 1, caption: '상가 계약 전 보증금 날리는 이유', narration: '상가 계약 전 이거 모르면 보증금 다 날립니다.' },
        { sceneNum: 2, caption: '체크 1: 등기부등본 근저당 비율', narration: '첫째, 등기부등본 속 근저당 비율이 시세의 60%를 넘지 않는지 보세요.' },
        { sceneNum: 3, caption: '체크 2: 정화조 및 위반건축물 여부', narration: '둘째, 건축물대장에서 위반건축물 딱지가 붙어있는지 확인 필수!' },
        { sceneNum: 4, caption: '체크 3: 원상복구 조항의 구체성', narration: '셋째, 원상복구 범위를 특약에 명확히 적지 않으면 수백만원 깨집니다.' },
        { sceneNum: 5, caption: '안전한 상가 계약 전문 상담', narration: '더 안전한 상가 계약 팁, 프로필 링크에서 확인하세요.' },
      ],
    },
  },
  {
    id: 'eb-03',
    applicant: '정*우',
    industry: '세무 / 회계 컨설팅',
    category: 'blog',
    title: '법인 전환, 지금 안 하면 연말 세금 3,000만원 더 냅니다',
    subtitle: '개인사업자 대표님들을 사로잡는 절세 전략 가이드 블로그',
    description: '복잡한 세무 용어를 배제하고 개인사업자 연매출 1억~3억 구간 대표님들이 바로 적용 가능한 절세 시점을 명쾌하게 짚어줍니다.',
    badge: '얼리버드 블로그 완료',
    createdAt: '2026-09-09',
    tags: ['법인전환', '개인사업자절세', '세무상담', '종합소득세'],
    blogData: {
      platform: '네이버 블로그',
      targetAudience: '종합소득세 과세표준 구간 상승으로 세금 고민이 깊은 3050 개인사업자 대표',
      keywords: ['법인전환절세', '개인사업자세금', '종합소득세율', '성실신고확인대상'],
      summary: '매출 상승기 대표님들이 가장 놓치기 쉬운 세무 리스크 3가지와 법인 전환 시뮬레이션 예시',
      contentHtml: `
        <h3 style="color:#1e293b; font-size:20px; font-weight:bold; margin-bottom:12px;">"매출은 늘었는데 왜 통장 잔고는 그대로일까요?"</h3>
        <p style="color:#475569; line-height:1.8; margin-bottom:16px;">개인사업자 종합소득세 최고세율은 지방소득세를 포함해 무려 <strong>49.5%</strong>에 달합니다. 열심히 번 돈의 절반 가까이가 세금으로 빠져나가는 셈입니다.</p>
        <div style="background:#eff6ff; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #bfdbfe;">
          <h4 style="margin:0 0 8px; color:#1d4ed8; font-weight:700;">📌 개인 vs 법인 핵심 비교</h4>
          <p style="margin:0; color:#3b82f6; font-size:14px; line-height:1.6;">• 개인사업자 세율: 6% ~ 45% (과표 10억 초과 시)<br/>• 법인세율: 9% ~ 19% (과표 200억 이하 대부분 구간)</p>
        </div>
        <p style="color:#475569; line-height:1.8;">하지만 무작정 법인으로 바꾼다고 능사는 아닙니다. 자금 인출 제약과 전환 비용을 종합 계산해야 하죠. 이번 포스팅에서 실사례로 짚어드립니다.</p>
      `,
    },
  },
  {
    id: 'eb-04',
    applicant: '강*민',
    industry: '피트니스 & PT 스튜디오',
    category: 'all',
    title: '스쿼트 할 때 무릎 아픈 분, 99%는 이 실수 때문입니다',
    subtitle: '신규 회원 등록률을 2배 높이는 헬스장 숏폼 & 블로그 솔루션',
    description: '운동 초보자들의 고질적인 통증 고민을 해결해주면서 자연스럽게 체형 교정 PT 상담으로 연결하는 워크플로우입니다.',
    badge: '얼리버드 특별제작 완료',
    createdAt: '2026-09-10',
    tags: ['헬스타그램', '체형교정PT', '스쿼트자세', '무릎통증'],
    shortsData: {
      hookStyle: '공감형',
      duration: '30초',
      hookText: '"스쿼트만 하면 무릎 아프셨던 분 손들어보세요!"',
      videoAspect: '9:16',
      bgmStyle: 'Energetic Modern',
      voiceType: '활기찬 남성 (Neural)',
      scriptScenes: [
        { sceneNum: 1, caption: '스쿼트만 하면 무릎 시큰거리는 분?', narration: '스쿼트만 하면 무릎 아프셨던 분 손들어보세요!' },
        { sceneNum: 2, caption: '발끝 방향과 무릎 각도 불일치', narration: '무릎이 발끝보다 안쪽으로 모이면 연골에 엄청난 압박이 갑니다.' },
        { sceneNum: 3, caption: '고관절을 먼저 접는 힌지 테크닉', narration: '엉덩이를 뒤로 살짝 빼면서 고관절을 먼저 접어보세요.' },
        { sceneNum: 4, caption: '1회 무료 체형 분석 신청하기', narration: '내 자세가 맞는지 궁금하다면 프로필 링크에서 무료 분석 신청하세요!' },
      ],
    },
    blogData: {
      platform: '네이버 블로그',
      targetAudience: '운동 시작 후 관절 통증으로 주저하는 초보 헬스인',
      keywords: ['스쿼트무릎통증', '고관절힌지', '1대1체형교정', 'PT후기'],
      summary: '잘못된 하체 운동 습관을 교정하고 트레이너의 전문적인 코칭 노하우를 전달하는 유입형 글',
      contentHtml: `
        <h3 style="color:#1e293b; font-size:20px; font-weight:bold; margin-bottom:12px;">운동하러 왔다가 병원 갈 순 없습니다</h3>
        <p style="color:#475569; line-height:1.8; margin-bottom:16px;">많은 분들이 스쿼트를 '단순히 앉았다 일어나는 동작'으로 생각합니다. 하지만 <strong>발목 가동성</strong>과 <strong>고관절 유연성</strong>이 확보되지 않은 상태에서 중량을 얹으면 무릎 관절에 체중의 3배 이상 부하가 걸립니다.</p>
        <p style="color:#475569; line-height:1.8;">저희 스튜디오에서는 운동 전 10분 기능성 스트레칭을 통해 관절 부담 없이 타깃 부위에만 자극이 꽂히도록 돕고 있습니다.</p>
      `,
    },
  },
];
