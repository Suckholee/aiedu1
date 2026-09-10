// ─── 블로그 마케팅 연구 데이터 스키마 ───────────────────────
// 네이버 SEO, 고조회수 패턴, 카피라이팅 공식 등
// 파이프라인에 공급되어 AI 콘텐츠 생성 품질을 극대화

// ─── 타입 정의 ─────────────────────────────────────────────

export interface NaverSeoRule {
  id: string;
  category: 'content' | 'keyword' | 'image' | 'structure' | 'engagement';
  rule: string;
  detail: string;
  source: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface ContentPattern {
  id: string;
  name: string;
  description: string;
  structure: string[];  // 글의 순서 패턴
  idealLength: { min: number; max: number };  // 글자수
  imageCount: { min: number; max: number };
  thumbnailTip: string;
}

export interface CopywritingFormula {
  id: string;
  name: string;
  fullName: string;
  steps: { label: string; description: string; example: string }[];
  bestFor: string[];
}

export interface PhotoCompositionRule {
  id: string;
  name: string;
  description: string;
  technique: string;
  exampleImageUrl: string;
}

export interface BlogTypeResearch {
  typeId: string;
  typeName: string;
  titleFormula: string;
  titleExamples: string[];
  contentFlow: string[];
  keyPhrases: string[];
  avoidPhrases: string[];
  photoSequence: string[];
  seoTips: string[];
}

// ─── 네이버 SEO 규칙 (2025-2026 기준) ─────────────────────

export const NAVER_SEO_RULES: NaverSeoRule[] = [
  // 콘텐츠 규칙
  {
    id: 'content-length',
    category: 'content',
    rule: '본문 1,500~3,000자 (한글 기준)',
    detail: '상위 노출 블로그 평균 글자수. 너무 짧으면 정보 부족, 너무 길면 이탈률 증가.',
    source: 'Naver D.I.A+ Algorithm Research 2025',
    priority: 'critical',
  },
  {
    id: 'experience-tone',
    category: 'content',
    rule: '직접 경험 기반 톤 필수',
    detail: '"제가 직접 써보니...", "실제 방문해보니..." 등 개인 경험 톤이 AI 시대에 가장 높은 평가를 받음. 네이버 Next N Search(2026)는 작성자 신뢰도(Authority)를 핵심 랭킹 요소로 평가.',
    source: 'Naver Next N Search 2026, adsensefarm.kr',
    priority: 'critical',
  },
  {
    id: 'authenticity',
    category: 'content',
    rule: '80% 정보성 + 20% 홍보성 비율',
    detail: '순수 홍보글은 D.I.A 알고리즘에 의해 하위 노출. 정보 가치가 높은 콘텐츠에 자연스러운 홍보 요소를 20% 이내로 배치.',
    source: '블로그 마케팅 가이드 - ascentkorea.com',
    priority: 'critical',
  },
  {
    id: 'unique-content',
    category: 'content',
    rule: '고유한 스토리/관점 필수',
    detail: 'C-Rank 알고리즘의 주제 전문성(40%) 평가. 복붙은 가능하나 고유 스토리가 있어야 상위 노출.',
    source: 'Naver C-Rank Algorithm',
    priority: 'high',
  },

  // 키워드 규칙
  {
    id: 'keyword-count',
    category: 'keyword',
    rule: '핵심 키워드 5~6개 (1,500~2,000자 기준)',
    detail: '제목 + 본문에 자연스럽게 분배. 같은 키워드 8회 이하 반복 (10회 이상 시 홍보성 판정).',
    source: 'threads.com/@jungbo365 블로그 최적화 연구',
    priority: 'critical',
  },
  {
    id: 'title-keyword',
    category: 'keyword',
    rule: '제목에 핵심 키워드 배치 (25자 이내)',
    detail: '모바일 화면에서 제목 전체 표시를 위해 25자 이내. 지역명 + 업종/서비스 + 후킹 요소 조합.',
    source: 'kmong.com 블로그 원고 가이드라인',
    priority: 'critical',
  },
  {
    id: 'longtail-keyword',
    category: 'keyword',
    rule: '롱테일 키워드 활용',
    detail: '"홍천 불고기 맛집", "강남 피부과 피코토닝 가격" 등 세부 키워드로 경쟁도 낮은 검색어 공략. 검색량은 적어도 오래 노출.',
    source: 'tamblemarketing.com 블로그 마케팅 전략',
    priority: 'high',
  },
  {
    id: 'no-clickbait',
    category: 'keyword',
    rule: '낚시성 제목/과도한 링크 금지',
    detail: 'Naver는 clickbait과 overlinking을 스팸으로 판정. 자연스러운 제목과 최소한의 외부 링크만 사용.',
    source: 'interad.com Naver Blog SEO Guide',
    priority: 'high',
  },

  // 이미지 규칙
  {
    id: 'image-count',
    category: 'image',
    rule: '이미지 6~15장 (유형별 차이)',
    detail: '상위 노출 1~5위 평균 이미지 개수. 맛집 블로그는 10~15장, 제품 리뷰는 6~10장. 유사 이미지 중복 금지.',
    source: 'threads.com, eduall100.com 맛집 블로그 가이드',
    priority: 'critical',
  },
  {
    id: 'image-size',
    category: 'image',
    rule: '이미지 너비 800~1,200px, 200KB 이하',
    detail: '네이버 기본 레이아웃 693px, 확장형 886px. 원본은 800~1200px로 리사이즈 후 TinyPNG 등으로 압축.',
    source: 'creativestudio.kr, simplep.net',
    priority: 'high',
  },
  {
    id: 'image-original',
    category: 'image',
    rule: '직접 촬영한 오리지널 사진 우대',
    detail: 'D.I.A 알고리즘은 원본 이미지를 감지. 스톡 사진보다 직접 촬영(아마추어 느낌이어도) 사진이 신뢰도 점수에 유리.',
    source: 'richfreesia.com 블로그 상단노출 전략',
    priority: 'high',
  },

  // 구조 규칙
  {
    id: 'text-photo-pattern',
    category: 'structure',
    rule: '"텍스트 3줄 + 사진 1장" 반복 패턴',
    detail: '네이버 모바일 최적화 구조. 텍스트 3~4줄 쓰고 관련 사진 1장 배치를 반복. 체류시간 극대화.',
    source: '네이버 블로그 마케팅 베스트 프랙티스',
    priority: 'critical',
  },
  {
    id: 'section-structure',
    category: 'structure',
    rule: '소제목(##)으로 명확한 섹션 구분',
    detail: '소제목으로 글을 5~7개 섹션으로 나누면 가독성 향상 + 검색엔진 구조 파악에 유리.',
    source: 'ascentkorea.com 블로그 글쓰기 팁',
    priority: 'high',
  },
  {
    id: 'intro-hook',
    category: 'structure',
    rule: '도입부 2~3줄에 핵심 정보 or 공감 요소',
    detail: '첫 문장에서 핵심을 전달하거나 독자 공감을 유도. 방문 계기를 간단히 언급 (너무 길면 이탈).',
    source: 'eduall100.com 맛집 블로그, brunch.co.kr',
    priority: 'high',
  },
  {
    id: 'practical-info',
    category: 'structure',
    rule: '실용 정보 블록 필수 (위치/가격/시간)',
    detail: '글 하단에 영업시간, 위치(지도), 가격, 주차 등 실용 정보를 모아 표시. 사용자 만족도와 체류시간 증가.',
    source: 'eduall100.com, 블로그 체험단 가이드라인',
    priority: 'high',
  },

  // 참여 규칙
  {
    id: 'consistency',
    category: 'engagement',
    rule: '주 2~3회 꾸준한 업로드',
    detail: 'C-Rank 활동 지속성(30%) 평가. 주 2회 고품질 글이 매일 저품질 글보다 효과적.',
    source: 'Naver C-Rank Algorithm, clumsy1post.com',
    priority: 'high',
  },
  {
    id: 'cta-natural',
    category: 'engagement',
    rule: '자연스러운 CTA (행동유도)',
    detail: '"더 자세한 상담은 아래 링크에서" 등 자연스러운 행동 유도. 강압적 판매 문구 금지.',
    source: '블로그 마케팅 가이드라인',
    priority: 'medium',
  },
];

// ─── 콘텐츠 패턴 (고조회수 블로그 분석) ────────────────────

export const CONTENT_PATTERNS: ContentPattern[] = [
  {
    id: 'review-experience',
    name: '체험 후기형',
    description: '방문/사용 경험을 시간순으로 서술. 맛집, 뷰티, 여행에 최적.',
    structure: [
      '후킹 도입 (방문 계기 2~3줄)',
      '외관/첫인상 + 사진',
      '핵심 체험 상세 (메뉴/시술/코스) + 사진 3~5장',
      '가격/비용 정보',
      '솔직 장단점',
      '실용 정보 (위치/시간/주차)',
      '총평 + CTA',
    ],
    idealLength: { min: 1500, max: 2500 },
    imageCount: { min: 10, max: 15 },
    thumbnailTip: '가장 매력적인 음식/결과물 사진을 썸네일로 선택',
  },
  {
    id: 'comparison-review',
    name: '비교 리뷰형',
    description: '2~3개 제품/서비스를 비교 분석. 제품, IT서비스에 최적.',
    structure: [
      '비교 대상 소개 (왜 이 제품들인지)',
      '비교 항목별 상세 분석 + 사진',
      '장단점 비교표 (차트/표)',
      '가격 비교',
      '최종 추천 (타겟별)',
      '구매 정보',
    ],
    idealLength: { min: 2000, max: 3000 },
    imageCount: { min: 8, max: 12 },
    thumbnailTip: '비교 대상을 나란히 놓은 사진',
  },
  {
    id: 'before-after',
    name: 'Before-After형',
    description: '변화 과정을 극적으로 보여줌. 뷰티, 인테리어, 교육에 최적.',
    structure: [
      '시작 전 고민/문제 (공감 유도)',
      'Before 상태 + 사진',
      '과정 설명 (단계별)',
      'After 결과 + 사진',
      'Before vs After 비교',
      '비용/기간 정보',
      '유지 관리 팁',
    ],
    idealLength: { min: 1500, max: 2500 },
    imageCount: { min: 8, max: 12 },
    thumbnailTip: 'Before-After 양쪽이 한눈에 보이는 비교 사진',
  },
  {
    id: 'guide-tutorial',
    name: '가이드/튜토리얼형',
    description: '단계별 안내. IT서비스, 컨설팅, 교육에 최적.',
    structure: [
      '문제 정의 (이런 고민 있으시죠?)',
      '해결 방법 개요',
      'Step 1~5 단계별 가이드 + 스크린샷',
      '주의사항/팁',
      '결과 확인',
      '관련 서비스 자연스럽게 연결',
    ],
    idealLength: { min: 2000, max: 3000 },
    imageCount: { min: 6, max: 10 },
    thumbnailTip: '최종 결과물이나 대시보드 스크린샷',
  },
  {
    id: 'event-promotion',
    name: '이벤트/프로모션형',
    description: '참여를 유도하는 긴급성 기반. 이벤트, 채용에 최적.',
    structure: [
      '핵심 혜택 먼저! (선착순/마감임박)',
      '이벤트 상세 정보',
      '참여 방법 (3단계 이내)',
      '이전 후기/성과',
      '신청 링크 + CTA',
    ],
    idealLength: { min: 1000, max: 1800 },
    imageCount: { min: 5, max: 8 },
    thumbnailTip: '이벤트 혜택이 한눈에 보이는 포스터형 이미지',
  },
];

// ─── 카피라이팅 공식 상세 ──────────────────────────────────

export const COPYWRITING_FORMULAS: CopywritingFormula[] = [
  {
    id: 'AIDA',
    name: 'AIDA',
    fullName: 'Attention → Interest → Desire → Action',
    steps: [
      {
        label: 'Attention (주의)',
        description: '눈길을 끄는 첫 문장으로 스크롤을 멈추게 한다',
        example: '"월 매출 300% 올린 비밀, 알려드릴게요"',
      },
      {
        label: 'Interest (흥미)',
        description: '구체적 정보와 스토리로 계속 읽게 만든다',
        example: '기능 상세 설명, 차별화 포인트, 데이터',
      },
      {
        label: 'Desire (욕구)',
        description: '이걸 사용하면 나도 이렇게 될 수 있다는 기대감',
        example: '성공 사례, 후기, Before-After',
      },
      {
        label: 'Action (행동)',
        description: '지금 바로 행동하도록 유도',
        example: '"지금 상담 신청하세요" + 링크/연락처',
      },
    ],
    bestFor: ['여행/숙박', '이벤트/행사', '채용/기업홍보', '일반/자유'],
  },
  {
    id: 'PAS',
    name: 'PAS',
    fullName: 'Problem → Agitate → Solution',
    steps: [
      {
        label: 'Problem (문제)',
        description: '독자가 공감할 구체적 문제/고민을 제시',
        example: '"매번 어디서 먹을지 고민이시죠?"',
      },
      {
        label: 'Agitate (자극)',
        description: '문제를 방치하면 어떻게 되는지, 왜 해결이 어려운지 자극',
        example: '"검색해봐도 광고글뿐이고, 실패하면 시간과 돈 낭비..."',
      },
      {
        label: 'Solution (해결)',
        description: '우리 서비스/제품이 어떻게 해결하는지 상세 설명',
        example: '"직접 가본 이 곳은 달랐습니다" + 상세 리뷰',
      },
    ],
    bestFor: ['음식점/카페', '병원/의료', 'IT/앱서비스', '법률/세무/컨설팅'],
  },
  {
    id: 'BAB',
    name: 'BAB',
    fullName: 'Before → After → Bridge',
    steps: [
      {
        label: 'Before (이전)',
        description: '변화 이전의 문제 상태를 생생하게 묘사',
        example: '"시술 전, 거울 볼 때마다 한숨이 나왔어요"',
      },
      {
        label: 'After (이후)',
        description: '변화된 결과를 감각적으로 보여줌',
        example: '"지금은 화장 없이도 자신감 넘쳐요"',
      },
      {
        label: 'Bridge (다리)',
        description: 'Before→After를 가능하게 한 방법/서비스를 자연스럽게 소개',
        example: '"OO피부과의 피코토닝 5회 과정 덕분이에요"',
      },
    ],
    bestFor: ['뷰티/미용', '부동산/인테리어', '학원/교육', '개인브랜딩/강사'],
  },
  {
    id: 'FAB',
    name: 'FAB',
    fullName: 'Features → Advantages → Benefits',
    steps: [
      {
        label: 'Features (기능)',
        description: '제품/서비스의 객관적 사실과 스펙을 나열',
        example: '"6.7인치 AMOLED, 5000mAh 배터리, 256GB"',
      },
      {
        label: 'Advantages (장점)',
        description: '기능이 경쟁사 대비 어떤 이점이 있는지',
        example: '"동급 대비 30% 긴 배터리 수명"',
      },
      {
        label: 'Benefits (혜택)',
        description: '이 장점이 사용자 삶에 어떤 변화를 주는지',
        example: '"하루 종일 충전 걱정 없이 사용하세요"',
      },
    ],
    bestFor: ['제품/상품'],
  },
];

// ─── 사진 구도 규칙 (범용) ─────────────────────────────────

export const PHOTO_COMPOSITION_RULES: PhotoCompositionRule[] = [
  {
    id: 'top-view-flatlay',
    name: '탑뷰 (플랫레이)',
    description: '위에서 아래로 90도 촬영. 음식, 제품 구성품 나열에 최적.',
    technique: '삼각대 고정, 자연광(창가), 소품 최소화, 여백 확보',
    exampleImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&h=480&fit=crop',
  },
  {
    id: 'angle-45',
    name: '45도 앵글',
    description: '사람이 실제로 보는 각도. 외관, 제품, 인물에 자연스러움.',
    technique: '눈높이에서 약간 위, 대상에서 1~2m 거리, 배경 정리',
    exampleImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=640&h=480&fit=crop',
  },
  {
    id: 'closeup-macro',
    name: '클로즈업 (매크로)',
    description: '질감, 디테일을 부각. 음식의 김, 제품 소재, 피부 결.',
    technique: '포커스를 대상 핵심에, 배경 블러(아웃포커스), 조명 측면에서',
    exampleImageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640&h=480&fit=crop',
  },
  {
    id: 'wide-interior',
    name: '와이드샷 (공간)',
    description: '공간 전체를 보여줌. 매장 내부, 사무실, 숙소에 사용.',
    technique: '코너에서 대각선 방향, 광각렌즈(0.5x), 수평 유지, 밝은 조명',
    exampleImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&h=480&fit=crop',
  },
  {
    id: 'action-shot',
    name: '액션샷 (사용 장면)',
    description: '실제 사용 중인 모습. 스케일감과 실용성을 전달.',
    technique: '손/몸과 함께 촬영, 연출하되 자연스럽게, 동작 중 포착',
    exampleImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=640&h=480&fit=crop',
  },
  {
    id: 'before-after-shot',
    name: 'Before-After',
    description: '동일 조건에서 변화 전후를 촬영. 뷰티, 인테리어 필수.',
    technique: '동일 위치/조명/각도 고정, 시간만 다르게. 양쪽 나란히 배치.',
    exampleImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=640&h=480&fit=crop',
  },
  {
    id: 'profile-portrait',
    name: '프로필/인물',
    description: '전문가 프로필, 의료진, 강사 촬영.',
    technique: '밝은 배경, 정면~15도, 반신 촬영, 자연스러운 표정, 전문복 착용',
    exampleImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=640&h=480&fit=crop',
  },
];

// ─── 유형별 블로그 작성 연구 데이터 ────────────────────────

export const BLOG_TYPE_RESEARCH: BlogTypeResearch[] = [
  {
    typeId: 'restaurant',
    typeName: '음식점/카페',
    titleFormula: '[지역명] + [음식종류/가게이름] + [후킹] (예: 강남 맛집 추천)',
    titleExamples: [
      '홍대 파스타 맛집 추천 | 직접 가본 솔직 후기',
      '강남역 점심 맛집 BEST 3 | 직장인 추천 리스트',
      '제주 흑돼지 맛집 | 현지인이 추천한 숨은 식당',
    ],
    contentFlow: [
      '방문 계기 2~3줄 (개인적 이유)',
      '가게 외관 + 사진 (간판 잘 보이게)',
      '내부 분위기 + 사진 (인테리어 포인트)',
      '메뉴판/가격 + 사진',
      '대표 메뉴 1 상세 (식감, 향, 비주얼) + 탑뷰 사진',
      '대표 메뉴 2 상세 + 클로즈업 사진',
      '사이드 메뉴/음료 + 사진',
      '먹는 장면 (젓가락 올린 샷) + 사진',
      '솔직 장단점 (한 가지는 아쉬운 점)',
      '실용 정보 블록: 위치/영업시간/주차/예약',
      '한줄 총평',
    ],
    keyPhrases: [
      '직접 가봤는데', '솔직히 말하면', '이 가격에 이 퀄리티',
      '웨이팅 각오해야', '재방문 의사 100%', '숨은 맛집',
    ],
    avoidPhrases: [
      '협찬받았습니다', '광고', '최고의 맛집', '무조건 가세요',
      '세상에서 제일', '인생 맛집 (과도한 사용)',
    ],
    photoSequence: [
      '외관 전경 (간판 포함, 45도)',
      '내부 와이드샷 (좌석/인테리어)',
      '메뉴판 정면',
      '대표메뉴 탑뷰 (전체)',
      '메뉴 클로즈업 (젓가락/포크 올린 장면)',
      '사이드 메뉴',
      '디저트/음료',
      '먹다 남은 접시 (다 먹었다는 증거)',
    ],
    seoTips: [
      '지역명 + 업종 키워드를 제목 앞쪽에 배치',
      '영업시간/주차 정보는 반드시 포함 (검색 의도 매칭)',
      '네이버 지도 링크나 주소 텍스트 삽입',
      '사진 10~15장, 유사 앵글 중복 금지',
    ],
  },
  {
    typeId: 'product',
    typeName: '제품/상품',
    titleFormula: '[제품명] + [리뷰/비교/추천] + [핵심포인트]',
    titleExamples: [
      '갤럭시 S26 울트라 한달 사용 솔직 후기',
      '다이슨 vs 샤오미 공기청정기 비교 | 가성비 승자는?',
      '2026 노트북 추천 TOP 5 | 용도별 완벽 정리',
    ],
    contentFlow: [
      '구매 계기 (왜 이 제품인지)',
      '언박싱/패키지 + 사진',
      '구성품 플랫레이 + 사진',
      '외관/디자인 디테일 + 사진',
      '핵심 기능 1 상세 + 사용 사진',
      '핵심 기능 2 상세 + 사용 사진',
      '핵심 기능 3 상세 + 사용 사진',
      '장점 정리 (3~5개)',
      '단점 정리 (1~2개, 솔직하게)',
      '경쟁 제품 비교 (간단 표)',
      '추천 대상 & 비추 대상',
      '구매 정보 (가격/채널)',
    ],
    keyPhrases: [
      '한달 실사용', '솔직히', '이 가격 대비', '아쉬운 점 하나',
      '추천하는 분', '비추하는 분', '가성비',
    ],
    avoidPhrases: [
      '완벽한 제품', '단점 없음', '무조건 사세요', '최저가 보장',
    ],
    photoSequence: [
      '박스/패키지 45도 앵글',
      '구성품 플랫레이 (흰 배경)',
      '제품 정면',
      '제품 측면/후면 디테일',
      '실사용 장면 (손과 함께)',
      '비교 대상과 나란히',
      '핵심 부분 매크로',
    ],
    seoTips: [
      '제품명 + "후기/리뷰/비교" 키워드 필수',
      '스펙 수치를 본문에 자연스럽게 포함',
      '장단점 리스트는 볼드 처리로 스캔 가능하게',
    ],
  },
  {
    typeId: 'beauty',
    typeName: '뷰티/미용',
    titleFormula: '[시술명/제품명] + [결과] + [솔직후기]',
    titleExamples: [
      '피코토닝 5회 후기 | Before-After 사진 공개',
      '강남 피부과 추천 | 여드름 흉터 치료 한달 경과',
      '올리브영 선크림 TOP 3 비교 | 민감성 피부 추천',
    ],
    contentFlow: [
      '시술/사용 전 고민 (공감 유도)',
      'Before 상태 + 사진',
      '선택 과정 (왜 이 곳/제품인지)',
      '시술/사용 과정 상세 (통증/시간/비용)',
      '과정 중 사진',
      'After 결과 + 사진',
      'Before vs After 비교 사진',
      '유지 관리 팁',
      '가격/위치 실용 정보',
      '총평 (재방문/재구매 의사)',
    ],
    keyPhrases: [
      '솔직 후기', '통증은 이 정도', '다운타임', '유지 기간',
      '가격 대비 만족', 'Before-After',
    ],
    avoidPhrases: [
      '기적의 효과', '100% 보장', '부작용 없음', '의학적 보장',
    ],
    photoSequence: [
      'Before 사진 (동일 조명/각도, 민낯)',
      '시술 중/사용 중 사진',
      '사용 제품/장비 클로즈업',
      'After 사진 (Before와 동일 조건)',
      'Before-After 나란히 비교',
    ],
    seoTips: [
      '시술명 + "후기/가격/추천" 키워드 조합',
      '비용 정보 반드시 포함 (검색 의도)',
      'Before-After 사진은 신뢰도 극대화',
    ],
  },
  {
    typeId: 'medical',
    typeName: '병원/의료',
    titleFormula: '[증상/질환] + [치료법] + [정보성키워드]',
    titleExamples: [
      '허리디스크 비수술 치료 | 도수치료 3개월 경험담',
      '충치 치료 비용 총정리 | 2026년 기준 보험적용',
      '위내시경 후기 | 수면 vs 비수면 차이점',
    ],
    contentFlow: [
      '증상/고민 소개 (공감)',
      '병원 선택 과정',
      '시설/장비 사진 + 설명',
      '진단 과정',
      '치료 방법 상세 설명',
      '치료 결과/경과',
      '비용 정보 (보험 적용 여부)',
      '의료진 전문성 간접 소개',
      '위치/예약 정보',
    ],
    keyPhrases: [
      '전문의 상담', '개인차가 있을 수 있습니다', '제 경우에는',
      '비용은 참고용', '정확한 진단은 전문의와',
    ],
    avoidPhrases: [
      '100% 완치', '부작용 없음', '최고의 의사', '의학적 보장',
      '이 치료만이 답', '수술 없이 무조건',
    ],
    photoSequence: [
      '병원 외관/내부 (밝고 깨끗)',
      '진료실/장비 사진',
      '의료진 프로필 (가운, 밝은 표정)',
      '상담 장면 (얼굴 비식별)',
    ],
    seoTips: [
      '증상명 + 치료법 키워드 조합',
      '의학 정보의 정확성 최우선 (잘못된 정보는 역효과)',
      '"개인차 있을 수 있음" 등 의료 면책 문구 포함',
    ],
  },
  {
    typeId: 'education',
    typeName: '학원/교육',
    titleFormula: '[지역] + [과목/대상] + [성과키워드]',
    titleExamples: [
      '목동 수학학원 추천 | 내신 20점 올린 비결',
      '초등 영어 학원 비교 | 원어민 vs 한국인 강사',
      '코딩 학원 후기 | 비전공자 취업 성공 스토리',
    ],
    contentFlow: [
      '학부모/학생 고민 공감',
      '학원 시설/환경 + 사진',
      '커리큘럼/교육 방식 설명',
      '수업 현장 + 사진',
      '교재/자료 + 사진',
      '성적 향상 사례 (Before → After)',
      '강사진 소개',
      '수강료/시간표',
      '위치/상담 안내',
    ],
    keyPhrases: [
      '성적 향상', '소수정예', '맞춤 커리큘럼', '실제 성적표',
      '학부모 후기', '체험 수업',
    ],
    avoidPhrases: [
      '100% 성적 보장', '무조건 올라감', '다른 학원은 안됨',
    ],
    photoSequence: [
      '수업 현장 (학생 뒷모습, 집중하는 모습)',
      '교실/시설 와이드샷',
      '교재/커리큘럼 자료',
      '성적 향상 증거 (마스킹)',
    ],
    seoTips: [
      '지역명 + 과목 + "학원 추천" 키워드',
      '성적 향상 수치가 있으면 클릭률 급상승',
      '학부모 타겟이므로 신뢰성 있는 톤 유지',
    ],
  },
  {
    typeId: 'realestate',
    typeName: '부동산/인테리어',
    titleFormula: '[지역/평수] + [유형] + [변화키워드]',
    titleExamples: [
      '30평 아파트 리모델링 | 3천만원으로 이렇게 변했다',
      '강남 신축 오피스텔 후기 | 1인 가구 추천',
      '셀프 인테리어 비포어애프터 | 원룸 꾸미기',
    ],
    contentFlow: [
      '시공 전 상태/고민',
      'Before 전체 공간 + 사진',
      '시공 계획/컨셉 설명',
      '시공 과정 (단계별) + 사진',
      'After 완성 + 사진',
      'Before vs After 비교',
      '사용 자재/가구 정보',
      '총 비용/기간 공개',
      '거주 후기 (실제 생활감)',
    ],
    keyPhrases: [
      '비포어애프터', '시공비', '셀프인테리어', '평수 대비',
      '수납공간', '동선', '채광',
    ],
    avoidPhrases: [
      '최저가 시공', '하자 없음 보장', '아무 업체나',
    ],
    photoSequence: [
      'Before 전체 공간 (동일 위치에서)',
      'After 전체 공간 (동일 앵글)',
      '디테일 포인트 (타일, 조명, 가구)',
      '수납/기능성 클로즈업',
    ],
    seoTips: [
      '평수 + 지역명 + "리모델링/인테리어" 키워드',
      '비용 공개는 클릭률을 2~3배 높임',
      'Before-After 비교가 핵심 콘텐츠',
    ],
  },
  {
    typeId: 'travel',
    typeName: '여행/숙박',
    titleFormula: '[여행지] + [일정] + [추천/후기]',
    titleExamples: [
      '제주도 2박3일 코스 추천 | 동쪽 완벽 가이드',
      '방콕 자유여행 4박5일 | 가성비 호텔 + 맛집 총정리',
      '부산 당일치기 코스 | 해운대~광안리 완벽 동선',
    ],
    contentFlow: [
      '여행 개요 (일정/테마/예산)',
      '이동 정보 (교통편)',
      'Day 1 코스 상세 + 풍경 사진',
      'Day 1 맛집 + 음식 사진',
      'Day 2 코스 상세 + 사진',
      '숙소 리뷰 + 사진',
      '꿀팁/주의사항',
      '총 예산 정리',
      '추천/비추 포인트',
    ],
    keyPhrases: [
      '실제 다녀온', '꿀팁', '동선 추천', '예산 공개',
      '포토스팟', '현지인 추천',
    ],
    avoidPhrases: [
      '무조건 가세요', '최고의 여행지', '실패 없는',
    ],
    photoSequence: [
      '랜드마크/풍경 (황금시간대)',
      '숙소 전경 + 룸뷰',
      '현지 음식 탑뷰',
      '이동 중 거리/교통 사진',
      '포토스팟에서 찍은 사진',
    ],
    seoTips: [
      '여행지 + "코스/일정/추천" 키워드',
      '일정별 시간대 정보 포함 (검색 의도 매칭)',
      '예산 정보는 클릭률을 크게 높임',
    ],
  },
  {
    typeId: 'itservice',
    typeName: 'IT/앱서비스',
    titleFormula: '[서비스명] + [문제해결] + [가이드/후기]',
    titleExamples: [
      'Notion AI 활용법 | 업무 효율 200% 올리는 방법',
      '무료 화상회의 앱 TOP 5 비교 | 재택근무 필수',
      '쇼핑몰 만들기 가이드 | 비개발자도 가능',
    ],
    contentFlow: [
      '이런 불편함 있으시죠? (문제 정의)',
      '기존 해결 방법의 한계',
      '이 서비스 소개 + 메인 화면 스크린샷',
      '핵심 기능 1 + 화면 캡처',
      '핵심 기능 2 + 화면 캡처',
      '핵심 기능 3 + 화면 캡처',
      '요금제/가격 비교',
      '실제 활용 사례',
      '장단점 정리',
      '추천 대상',
    ],
    keyPhrases: [
      '실사용 후기', '무료/유료 차이', '이렇게 쉬울 줄이야',
      '업무 효율', '가성비', '대안 서비스',
    ],
    avoidPhrases: [
      '완벽한 서비스', '버그 없음', '무조건 추천',
    ],
    photoSequence: [
      '메인 대시보드/홈 화면',
      '핵심 기능 사용 중 (빨간 박스/화살표 강조)',
      '결과물/성과 화면',
      '요금제 비교표',
    ],
    seoTips: [
      '서비스명 + "사용법/후기/비교" 키워드',
      '스크린샷에 빨간 박스/화살표로 포인트 강조',
      '단계별 넘버링 (Step 1, 2, 3...)',
    ],
  },
  {
    typeId: 'consulting',
    typeName: '법률/세무/컨설팅',
    titleFormula: '[상황] + [해결법] + [전문가키워드]',
    titleExamples: [
      '상속세 절세 방법 5가지 | 세무사가 알려드립니다',
      '이혼 재산분할 기준 | 2026년 판례 정리',
      '1인 사업자 종합소득세 신고 가이드 | 놓치기 쉬운 공제',
    ],
    contentFlow: [
      '흔한 실수/고민 사례 (비식별)',
      'Q&A 형식으로 핵심 정보',
      '법/세무 정확한 기준 설명',
      '실제 사례 적용 (비식별화)',
      '주의사항/자주 하는 실수',
      '전문가 자격/경력 간접 소개',
      '"이런 경우 전문가 상담이 필요합니다" CTA',
    ],
    keyPhrases: [
      '전문가 기준으로', '실제 사례', '많이들 모르시는',
      '주의하셔야 할 점', '상담 받아보시길',
    ],
    avoidPhrases: [
      '100% 승소', '무조건 절세', '법적 보장',
    ],
    photoSequence: [
      '전문가 프로필 (정장, 사무실 배경)',
      '상담 장면 (얼굴 비식별)',
      '사무실/자격증 사진',
    ],
    seoTips: [
      '상황 키워드 + "방법/기준/가이드" 조합',
      'Q&A 형식은 체류시간을 높임',
      '정확한 법률/세무 정보가 신뢰도의 핵심',
    ],
  },
  {
    typeId: 'event',
    typeName: '이벤트/행사',
    titleFormula: '[혜택] + [마감/긴급성] + [이벤트명]',
    titleExamples: [
      '선착순 100명 무료체험 | 3월 한정 이벤트',
      '오픈기념 50% 할인 | 이번 주까지만!',
      '추석맞이 사은 이벤트 | 전 제품 1+1',
    ],
    contentFlow: [
      '핵심 혜택 먼저! (이미지 포함)',
      '이벤트 상세 (일시/장소/대상)',
      '참여 방법 (3단계 이내)',
      '경품/혜택 상세 + 사진',
      '이전 행사 성공 사례/후기',
      '마감 긴급성 강조',
      '신청 링크/방법 CTA',
    ],
    keyPhrases: [
      '선착순', '마감 임박', '한정 수량', '무료',
      '지금 바로', '놓치지 마세요',
    ],
    avoidPhrases: [
      '거짓 마감일', '과장된 경품', '복잡한 참여 조건',
    ],
    photoSequence: [
      '이벤트 포스터/배너',
      '경품/혜택 실물 사진',
      '이전 행사 현장 사진',
    ],
    seoTips: [
      '혜택 키워드 + 브랜드명 + "이벤트"',
      '날짜/기한을 명시하여 긴급성 전달',
      '참여 방법은 최대한 간단하게',
    ],
  },
  {
    typeId: 'exchange',
    typeName: '환율/세계정세/무역',
    titleFormula: '[연도/월/주차] + [주요통화/과세환율] + [환율수치/세계정세 키워드]',
    titleExamples: [
      '2026년 8월 5주차 주요통화 과세환율 정보 (달러 1,405원대 하락과 미 금리인하 정세 분석)',
      '이번 주 고시환율 총정리: 엔화 강세 전환과 글로벌 금융시장 세계정세 트렌드',
      '수입기업 필독! 관세청 고시환율 변동과 미국 연준 금리정책이 미치는 영향',
    ],
    contentFlow: [
      '이번 주 환율 변동 총괄 브리핑 및 한 줄 결론',
      '주요 수입과세·고시환율 비교표 (USD, JPY, EUR, CNY 등 증감 수치)',
      '과세환율 기본 개념 및 적용 시점 (수입신고일 기준 등 관세법 팩트)',
      '세계정세 트렌드 ①: 미국 연준(Fed) 금리 기조 & 고용/물가 지표 영향',
      '세계정세 트렌드 ②: 일본은행(BOJ) 통화정책 & 엔 캐리 트레이드 동향',
      '세계정세 트렌드 ③: 유럽·중국 경기 동향 및 국제 유가·지정학적 리스크',
      '수출입 기업 및 해외직구족 실전 환리스크 대응 전략',
      '관세청 유니패스 조회 방법 & 전문가(관세법인) 상담 CTA',
    ],
    keyPhrases: [
      '과세환율', '고시환율', '수입신고 시점', '기준환율',
      '미국 연준(Fed)', '금리 인하', '엔 캐리 트레이드', '세계정세',
      '환리스크 관리', '유니패스 조회', '관세법 제18조',
    ],
    avoidPhrases: [
      '100% 확실한 환율 예측', '무조건 오른다/내린다', '단정적인 투기 권유',
    ],
    photoSequence: [
      '주요 통화 고시환율 비교표 / 인포그래픽',
      '세계정세 / 금융시장 및 무역항 현장',
      '주요국 화폐 / 환전 감성 컷',
      '관세법인 캐릭터 / 유니패스 조회 가이드',
    ],
    seoTips: [
      '[연도+월+주차+과세환율/고시환율]은 매주 검색량이 폭증하는 황금 키워드',
      '환율 수치만 나열하기보다 "왜 환율이 변했는지 세계정세 이유"를 적어야 체류시간 급증',
      '마크다운 표(Table)와 FAQ가 포함되면 구글 AEO 및 네이버 스마트블록 상위 노출에 매우 유리',
    ],
  },
  {
    typeId: 'recruiting',
    typeName: '채용/기업홍보',
    titleFormula: '[회사명] + [포지션/문화] + [매력포인트]',
    titleExamples: [
      'OO기업 개발자 채용 | 연봉 + 복지 총정리',
      '스타트업 문화가 궁금하다면 | OO 팀원 인터뷰',
      'OO 기업 입사 후기 | 현직자가 말하는 장단점',
    ],
    contentFlow: [
      '기업 비전/미션 소개',
      '사무실 환경 + 사진',
      '팀 문화/분위기 + 활동 사진',
      '복지 혜택 상세',
      '직원 인터뷰 톤 (Q&A)',
      '모집 포지션/자격요건',
      '연봉/처우 범위 (가능한 선에서)',
      '지원 방법/마감일 CTA',
    ],
    keyPhrases: [
      '현직자 후기', '팀 분위기', '복지 혜택', '성장 기회',
      '워라밸', '유연근무',
    ],
    avoidPhrases: [
      '꿈의 직장', '최고의 회사', '야근 없음 (거짓이면)',
    ],
    photoSequence: [
      '사무실 전경 (밝고 활기찬)',
      '팀 활동 (회의, 워크샵)',
      '복지 시설 (카페, 휴게실)',
    ],
    seoTips: [
      '회사명 + "채용/후기/복지" 키워드',
      '연봉 범위 공개 시 클릭률 급상승',
      '실제 직원 사진이 스톡 사진보다 신뢰도 높음',
    ],
  },
  {
    typeId: 'personal',
    typeName: '개인브랜딩/강사',
    titleFormula: '[전문분야] + [성과/실적] + [소개키워드]',
    titleExamples: [
      'AI 교육 전문가 이석호 | 수강생 5000명의 비결',
      '퍼스널 브랜딩 코칭 후기 | 3개월 만에 매출 2배',
      '프리랜서 강사 되는 법 | 10년차 강사의 솔직 조언',
    ],
    contentFlow: [
      '자기소개 (경력/자격 핵심만)',
      '전문 분야 설명',
      '대표 성과/포트폴리오 + 증거 사진',
      '고객/수강생 후기 (실명 or 익명)',
      '서비스/강의 소개',
      '차별화 포인트',
      '연락처/상담 CTA',
    ],
    keyPhrases: [
      '전문가', '실적', '포트폴리오', '수강생 후기',
      '맞춤 컨설팅', '무료 상담',
    ],
    avoidPhrases: [
      '국내 최고', '유일한 전문가', '100% 성공 보장',
    ],
    photoSequence: [
      '프로필 사진 (전문적+친근)',
      '강의/활동 장면',
      '저서/수료증/수상 내역',
    ],
    seoTips: [
      '전문분야 + 이름 + "강사/컨설턴트" 키워드',
      '실적 수치가 있으면 신뢰도 극대화',
      '고객 후기 인용이 설득력 높음',
    ],
  },
  {
    typeId: 'saju',
    typeName: '사주/운세/타로',
    titleFormula: '[연도/시점] + [일주/띠/키워드] + 오늘의 운세/사주 분석 + [개운법/주의사항]',
    titleExamples: [
      '2026년 하반기 대운 흐름 분석: 갑목(甲木) 일주가 꼭 알아야 할 재물운 개운법',
      '오늘의 사주 일진 운세 총정리! 오행으로 풀어보는 귀인 타이밍과 실천 팁',
      '신비로운 사주 & 타로 상담 후기: 답답했던 이직 타이밍 명쾌하게 풀린 이유',
    ],
    contentFlow: [
      '일상의 고민 및 시기별 운의 궁금증 환기 (공감 도입)',
      '사주 원국 및 오행(목화토금수) 기운 분포 팩트 분석',
      '핵심 운세 흐름 (재물/사업, 직장/커리어, 애정/인간관계)',
      '실생활 적용 개운(開運) 실천 가이드 (행운의 색, 숫자, 방향, 행동)',
      '마음의 평온을 주는 따뜻한 조언과 희망적 마무리 (CTA)',
    ],
    keyPhrases: [
      '오행의 조화', '사주 원국', '대운의 흐름', '천간과 지지',
      '개운 팁', '귀인의 조력', '마음의 중심', '지혜로운 선택',
    ],
    avoidPhrases: [
      '절대 안 됩니다', '망할 운명', '100% 맞는 예언', '부적을 써야만',
    ],
    photoSequence: [
      '사주 명식표 / 천문도 인포그래픽',
      '오행 밸런스 차트',
      '아늑한 촛불과 타로 카드 상담 데스크',
      '단아한 전통 힐링 공간 / 개운 소품',
    ],
    seoTips: [
      '연도/월/일 + "사주", "운세", "일주", "개운법" 키워드 자연스럽게 배치',
      '과도한 공포 마케팅을 피하고 신뢰감 있는 힐링/카운셀링 톤 유지',
      '구체적인 오행 설명과 실천 팁으로 체류 시간 극대화',
    ],
  },
];

// ─── 파이프라인 공급용: 연구 데이터를 프롬프트로 변환 ──────

export function getResearchPromptForType(typeId: string): string {
  const research = BLOG_TYPE_RESEARCH.find(r => r.typeId === typeId);
  if (!research) return '';

  const seoRules = NAVER_SEO_RULES
    .filter(r => r.priority === 'critical')
    .map(r => `- ${r.rule}: ${r.detail}`)
    .join('\n');

  return `
[블로그 마케팅 연구 데이터 - ${research.typeName}]

■ 네이버 SEO 필수 규칙:
${seoRules}

■ 제목 공식: ${research.titleFormula}
  예시: ${research.titleExamples.join(' | ')}

■ 글 흐름 (순서대로):
${research.contentFlow.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}

■ 자연스러운 표현 (사용 권장):
${research.keyPhrases.map(p => `  - "${p}"`).join('\n')}

■ 금지 표현 (절대 사용 금지):
${research.avoidPhrases.map(p => `  - "${p}"`).join('\n')}

■ 사진 배치 순서:
${research.photoSequence.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}

■ SEO 팁:
${research.seoTips.map(t => `  - ${t}`).join('\n')}
`.trim();
}

export function getAllSeoRulesPrompt(): string {
  return NAVER_SEO_RULES
    .sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2 };
      return p[a.priority] - p[b.priority];
    })
    .map(r => `[${r.priority.toUpperCase()}] ${r.rule} — ${r.detail}`)
    .join('\n');
}
