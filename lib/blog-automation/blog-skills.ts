// ─── 블로그 홍보 스킬 (유형별 프롬프트 + 사진 가이드) ────
import { getResearchPromptForType } from './blog-marketing-research';

export type BlogSkillId =
  | 'one_to_one'
  | 'restaurant'
  | 'consulting'
  | 'product'
  | 'general'
  | 'saju'
  | 'beauty'
  | 'medical'
  | 'education'
  | 'realestate'
  | 'travel'
  | 'itservice'
  | 'exchange'
  | 'event'
  | 'recruiting'
  | 'personal';

export interface PhotoGuide {
  title: string;
  description: string;
  exampleImageUrl?: string;
}

export interface OptionalField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'images';
  placeholder: string;
}

export interface BlogSkill {
  id: BlogSkillId;
  name: string;
  emoji: string;
  description: string;
  copywritingFormula: 'AIDA' | 'PAS' | 'BAB' | 'FAB';
  promptTemplate: string;
  photoGuides: PhotoGuide[];
  optionalFields: OptionalField[];
}

export const BLOG_SKILLS: BlogSkill[] = [
  {
    id: 'one_to_one',
    name: 'BNI 원투원 (121 미팅)',
    emoji: '🤝',
    description: '대표님과의 1:1 미팅 기록, 비즈니스 인사이트 및 상생 협업 스토리',
    copywritingFormula: 'BAB',
    promptTemplate: `당신은 비즈니스 네트워킹 및 BNI 121 미팅 전문 비즈니스 작가입니다.
실제 대표님과의 원투원(1:1) 만남에서 나눈 깊은 대화와 배움을 진정성 있고 품격 있게 블로그 글로 작성하세요.

★ [BNI 원투원 작성 공식 (P-S-I)]:
1. [만남의 배경 (Partner Intro)]: 언제, 어디서, 누구와, 어떤 이유로 만났는지 (만남의 계기와 상대방 대표님의 전문성)
2. [대화의 핵심 (Story & Insight)]: 오늘 미팅에서 나눈 진솔한 대화와 실제 메모에 담긴 구체적인 이야기
3. [나의 인사이트 (My Business Learning)]: 작성자(나)의 시점에서 느낀 배움과 내 사업에 적용할 깨달음
4. [상생 협업의 가능성 (Synergy & Impact)]: 두 기업이 서로 주고받을 수 있는 상생 시너지, 추천 리퍼럴, 다음 약속

필수 작성 원칙:
- 과장된 찬사나 영혼 없는 칭찬 대신, 상대방 사업의 '진짜 차별화된 가치와 전문성'을 깊이 있게 조명.
- BNI 용어나 내부 은어는 일반 대중도 쉽게 이해하도록 자연스러운 비즈니스 언어로 순화.
- 실제 미팅 메모와 사실에 기반하여 솔직하고 신뢰감 있는 대표님의 시점(1인칭)으로 작성.
- 네이버 블로그 스마트에디터 최적화: 1~2문장 단위의 호흡, 인용구(따옴표/말풍선) 활용, 사진 자리([IMAGE_N]) 유기적 배치.
- 글의 맺음말에 상대방 대표님 회사 소개 및 비즈니스 문의/연락처 안내 포함.`,
    photoGuides: [
      { title: '두 대표님 미팅 투샷', description: '미팅 장소에서 두 대표님이 정답게 마주보거나 함께 찍은 사진', exampleImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop' },
      { title: '원투원 자료/노트', description: '상대방 대표님 소개 자료나 미팅 메모, 다이어리 사진', exampleImageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&h=300&fit=crop' },
      { title: '미팅 장소/티타임', description: '만난 카페나 레스토랑, 와인바의 정갈한 테이블 및 음료 사진', exampleImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop' },
      { title: '상대방 제품/사업장', description: '상대방 대표님의 사업장이나 제품, 시공/작업 사례 사진', exampleImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'partnerName', label: '파트너 대표님 성함', type: 'text', placeholder: '예: 홍길동 대표 (파트너 대표님 성함)' },
      { key: 'partnerCompany', label: '회사명 / 챕터', type: 'text', placeholder: '예: OO솔루션 (BNI 챕터)' },
      { key: 'partnerField', label: '전문 분야 / 핵심 사업', type: 'text', placeholder: '예: 기업 브랜딩 및 공간 디자인' },
      { key: 'targetReferral', label: '이상적인 추천 고객 (타겟 리퍼럴)', type: 'text', placeholder: '예: 신규 매장 오픈 예정인 대표, 리브랜딩이 필요한 기업' },
      { key: 'partnerStrength', label: '차별화된 핵심 강점', type: 'text', placeholder: '예: 15년 실무 경력의 브랜드 분석과 맞춤형 디렉팅' },
      { key: 'meetingDate', label: '미팅 일자', type: 'text', placeholder: '예: 2026년 9월 16일' },
      { key: 'meetingPlace', label: '미팅 장소', type: 'text', placeholder: '예: 비즈니스 라운지 카페' },
      { key: 'meetingTranscript', label: '녹음본 대화 텍스트 전문 (클로바노트/스크립트)', type: 'textarea', placeholder: '클로바노트, 비토, 스마트폰 음성메모에서 복사한 대화 텍스트 전문을 붙여넣으세요' },
      { key: 'conversationCore', label: '오늘 대화 핵심 주제', type: 'textarea', placeholder: '오늘 어떤 주제로 이야기했는지 메모' },
      { key: 'myInsight', label: '나의 비즈니스 인사이트', type: 'textarea', placeholder: '내 사업에 적용하고 싶은 깨달음이나 배운 점' },
      { key: 'synergyPlan', label: '상생 협업 / 다음 약속', type: 'textarea', placeholder: '서로 어떤 도움을 주고받을지, 다음 약속한 일' },
    ],
  },
  {
    id: 'restaurant',
    name: '와인·F&B / 매장 방문',
    emoji: '🍷',
    description: '르글라스 와인바, 다이닝, 레스토랑 및 카페 체험기',
    copywritingFormula: 'PAS',
    promptTemplate: `당신은 맛집 전문 블로거입니다. 실제 방문한 것처럼 생생한 체험기를 작성하세요.

작성 공식 (PAS): 문제(어디서 먹을지 고민) → 자극(이런 곳이 있다!) → 해결(메뉴+분위기 상세 소개)

필수 포함 요소:
- 가게 외관/내부 분위기 묘사
- 대표 메뉴 2~3가지 맛 상세 묘사 (식감, 향, 비주얼)
- 가격대 정보
- 위치/주차/영업시간 실용 정보
- "텍스트 3줄 + 사진 자리" 패턴으로 구성 (네이버 최적화)
- 개인 경험/솔직 후기 톤 유지`,
    photoGuides: [
      { title: '외관 전경', description: '간판이 잘 보이게 정면 45도 각도, 밝은 낮시간대', exampleImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop' },
      { title: '대표메뉴 탑뷰', description: '접시 전체가 보이는 위에서 아래로 촬영, 자연광 활용', exampleImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
      { title: '메뉴 클로즈업', description: '젓가락/포크로 집어올린 장면, 김이 나는 순간 포착', exampleImageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop' },
      { title: '내부 분위기', description: '좌석 전체가 보이는 와이드샷, 인테리어 포인트 포함', exampleImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop' },
      { title: '메뉴판/가격표', description: '글씨가 선명하게 읽히도록 정면 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'storeName', label: '가게 이름', type: 'text', placeholder: '예: 담아코치 식당' },
      { key: 'menuInfo', label: '대표 메뉴 / 가격', type: 'textarea', placeholder: '예: 된장찌개 8,000원, 제육볶음 9,000원' },
      { key: 'location', label: '위치 / 영업시간', type: 'textarea', placeholder: '예: 서울 강남구 역삼동, 11:00~21:00' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '음식, 외관, 내부 사진' },
    ],
  },
  {
    id: 'product',
    name: '제품/상품',
    emoji: '📦',
    description: '제품 리뷰, 언박싱, 비교 분석',
    copywritingFormula: 'FAB',
    promptTemplate: `당신은 제품 리뷰 전문 블로거입니다. 실사용 기반의 솔직한 리뷰를 작성하세요.

작성 공식 (FAB): 기능(Features) → 장점(Advantages) → 혜택(Benefits)

필수 포함 요소:
- 언박싱/첫인상 (패키지, 구성품)
- 핵심 기능 3~5가지 상세 설명
- 실제 사용 후기 (장단점 솔직하게)
- 경쟁 제품과 비교 포인트
- 구매 가격/채널 정보
- 추천 대상 명시
- 80% 정보성 + 20% 홍보성 비율 유지`,
    photoGuides: [
      { title: '박스/패키지', description: '제품 박스를 45도 각도로, 브랜드 로고 노출', exampleImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
      { title: '구성품 나열', description: '흰 배경에 모든 구성품 정렬, 위에서 플랫레이 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
      { title: '사용 장면', description: '실제 사용 환경에서 손/몸과 함께 촬영 (스케일감)', exampleImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop' },
      { title: '디테일 클로즈업', description: '질감, 소재, 버튼 등 핵심 디테일 매크로 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop' },
      { title: '비교 샷', description: '경쟁 제품과 나란히 놓고 크기/디자인 비교', exampleImageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'productName', label: '제품명', type: 'text', placeholder: '예: 삼성 갤럭시 S26' },
      { key: 'specs', label: '주요 스펙 / 가격', type: 'textarea', placeholder: '예: 6.7인치, 256GB, 1,199,000원' },
      { key: 'proscons', label: '장단점 메모', type: 'textarea', placeholder: '예: 장점 - 배터리 오래감, 단점 - 무거움' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '제품 사진, 사용 사진' },
    ],
  },
  {
    id: 'beauty',
    name: '뷰티/미용',
    emoji: '💇',
    description: '시술 후기, Before-After, 뷰티 팁',
    copywritingFormula: 'BAB',
    promptTemplate: `당신은 뷰티/미용 전문 블로거입니다. Before-After 중심의 변화 스토리를 작성하세요.

작성 공식 (BAB): 시술 전 고민(Before) → 변화된 모습(After) → 시술/제품이 다리 역할(Bridge)

필수 포함 요소:
- 시술/제품 사용 전 고민 서술
- 과정 설명 (통증, 시간, 비용)
- Before-After 비교
- 유지 관리 팁
- 가격/위치 등 실용 정보`,
    photoGuides: [
      { title: 'Before 사진', description: '동일 조명/각도로, 화장 없이 자연 상태 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop' },
      { title: 'After 사진', description: 'Before와 동일 조건에서 촬영, 변화가 명확히 보이게', exampleImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop' },
      { title: '시술 과정', description: '시술 중 모습 (동의 하에), 전문성 어필', exampleImageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop' },
      { title: '제품/도구 샷', description: '사용된 제품이나 장비 클로즈업', exampleImageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'shopName', label: '매장/병원명', type: 'text', placeholder: '예: OO피부과 강남점' },
      { key: 'treatment', label: '시술/서비스 내용', type: 'textarea', placeholder: '예: 피코토닝 5회, 회당 50,000원' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: 'Before-After, 시술 과정 사진' },
    ],
  },
  {
    id: 'medical',
    name: '병원/의료',
    emoji: '🏥',
    description: '전문 의료 정보, 치료 사례, 건강 팁',
    copywritingFormula: 'PAS',
    promptTemplate: `당신은 의료 전문 블로거입니다. 증상→진단→치료 흐름으로 전문성을 어필하세요.

작성 공식 (PAS): 증상/고민(Problem) → 방치 시 위험(Agitate) → 전문 치료 해결(Solution)

필수 포함 요소:
- 흔한 증상/고민 공감
- 전문적 원인 분석 (신뢰 구축)
- 치료 방법/과정 설명
- 치료 사례 (비식별화)
- 의료진 전문성 간접 어필
- 의학적으로 정확한 정보`,
    photoGuides: [
      { title: '시설 외관/내부', description: '깨끗하고 전문적인 이미지, 밝은 조명', exampleImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop' },
      { title: '의료진 프로필', description: '가운 착용, 밝은 표정, 상반신 정면 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop' },
      { title: '치료 장비', description: '최신 장비 클로즈업, 전문성 어필', exampleImageUrl: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&h=300&fit=crop' },
      { title: '상담 장면', description: '의사-환자 상담 모습 (얼굴 비식별)', exampleImageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'hospitalName', label: '병원명', type: 'text', placeholder: '예: OO정형외과' },
      { key: 'specialty', label: '전문 분야 / 치료 내용', type: 'textarea', placeholder: '예: 디스크 비수술 치료, 도수치료' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '시설, 장비, 의료진 사진' },
    ],
  },
  {
    id: 'education',
    name: '학원/교육',
    emoji: '📚',
    description: '학원 소개, 성적 향상 사례, 커리큘럼',
    copywritingFormula: 'BAB',
    promptTemplate: `당신은 교육 전문 블로거입니다. 성적 향상 스토리를 중심으로 작성하세요.

작성 공식 (BAB): 성적 고민(Before) → 향상된 결과(After) → 교육 프로그램이 해결(Bridge)

필수 포함 요소:
- 학부모/학생의 고민 공감
- 커리큘럼/교육 방식 소개
- 성적 향상 사례 (Before → After)
- 강사진 전문성
- 수강료/시간표 등 실용 정보`,
    photoGuides: [
      { title: '수업 현장', description: '학생들이 집중하는 모습, 자연스러운 앵글 (뒷모습 OK)', exampleImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop' },
      { title: '시설/교실', description: '깨끗한 학습 환경, 와이드 앵글', exampleImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop' },
      { title: '성적표/결과', description: '향상된 성적 증거 (개인정보 마스킹)', exampleImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop' },
      { title: '교재/커리큘럼', description: '사용 교재 나열, 체계적인 이미지', exampleImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'academyName', label: '학원명', type: 'text', placeholder: '예: 담아코치 영어학원' },
      { key: 'curriculum', label: '주요 프로그램 / 대상', type: 'textarea', placeholder: '예: 중등 내신 영어, 소수정예 8명반' },
      { key: 'results', label: '성과/실적 메모', type: 'textarea', placeholder: '예: 평균 20점 향상, 외고 합격 5명' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '수업, 시설, 성적 사진' },
    ],
  },
  {
    id: 'realestate',
    name: '부동산/인테리어',
    emoji: '🏠',
    description: '매물 소개, 시공 사례, 인테리어 팁',
    copywritingFormula: 'BAB',
    promptTemplate: `당신은 부동산/인테리어 전문 블로거입니다. 시공 전후 변화를 강조하세요.

작성 공식 (BAB): 시공 전 낡은 상태(Before) → 완성된 공간(After) → 시공 과정/업체(Bridge)

필수 포함 요소:
- Before-After 공간 변화
- 시공 과정/기간/예산 범위
- 사용 자재/디자인 포인트
- 평면도/구조 설명
- 위치/교통/생활 편의시설 정보`,
    photoGuides: [
      { title: 'Before 전체 공간', description: '시공 전 동일 위치에서 와이드 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' },
      { title: 'After 전체 공간', description: 'Before와 동일 앵글, 밝은 조명 연출', exampleImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop' },
      { title: '디테일 포인트', description: '타일, 조명, 가구 등 인테리어 포인트 클로즈업', exampleImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop' },
      { title: '평면도/도면', description: '공간 배치를 보여주는 도면이나 3D 이미지', exampleImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'propertyInfo', label: '매물/공간 정보', type: 'textarea', placeholder: '예: 강남 30평 아파트, 2024년 리모델링' },
      { key: 'budget', label: '예산/가격 범위', type: 'text', placeholder: '예: 시공비 3,000만원대' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '시공 전후, 도면 사진' },
    ],
  },
  {
    id: 'travel',
    name: '여행/숙박',
    emoji: '✈️',
    description: '여행 코스, 숙소 리뷰, 맛집/관광 정보',
    copywritingFormula: 'AIDA',
    promptTemplate: `당신은 여행 전문 블로거입니다. 일정별 코스 가이드를 작성하세요.

작성 공식 (AIDA): 매력적 여행지 후킹(Attention) → 상세 코스(Interest) → 가고 싶게(Desire) → 예약 정보(Action)

필수 포함 요소:
- 여행 코스 일정 (시간대별)
- 각 장소별 꿀팁
- 교통편/소요시간
- 예산 정보 (숙박, 식비, 입장료)
- 실용 팁 (준비물, 주의사항)`,
    photoGuides: [
      { title: '랜드마크 풍경', description: '대표 관광지, 황금시간대(일출/일몰) 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop' },
      { title: '숙소 전경', description: '객실 전체가 보이는 와이드샷, 창문 뷰 포함', exampleImageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop' },
      { title: '현지 음식', description: '현지 특색 있는 음식, 밝은 자연광 탑뷰', exampleImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
      { title: '이동 장면', description: '교통수단, 거리 풍경 등 여행 분위기 전달', exampleImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'destination', label: '여행지', type: 'text', placeholder: '예: 제주도 동쪽 코스' },
      { key: 'schedule', label: '일정/코스 메모', type: 'textarea', placeholder: '예: 1일차 - 성산일출봉 → 섭지코지 → ...' },
      { key: 'budget', label: '예산 정보', type: 'text', placeholder: '예: 2박3일 1인 40만원' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '풍경, 숙소, 음식 사진' },
    ],
  },
  {
    id: 'itservice',
    name: 'IT/앱서비스',
    emoji: '💻',
    description: '서비스 소개, 기능 튜토리얼, 사용 사례',
    copywritingFormula: 'PAS',
    promptTemplate: `당신은 IT/테크 전문 블로거입니다. 문제 해결 중심 튜토리얼을 작성하세요.

작성 공식 (PAS): 불편/문제(Problem) → 기존 해결 방법의 한계(Agitate) → 이 서비스로 해결(Solution)

필수 포함 요소:
- 타겟 사용자의 불편/문제 정의
- 서비스 핵심 기능 3~5가지 (스크린샷 포함)
- 단계별 사용법 가이드
- 요금제/가격 비교
- 실제 사용 사례/후기
- 80% 교육성 + 20% 홍보성`,
    photoGuides: [
      { title: '메인 화면 스크린샷', description: '서비스 대시보드/홈 전체, 깔끔한 캡처', exampleImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
      { title: '핵심 기능 화면', description: '주요 기능 사용 중 화면, 포인트에 빨간 박스/화살표', exampleImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' },
      { title: '결과 화면', description: '서비스 사용 후 결과물/성과 화면', exampleImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
      { title: '비교 이미지', description: '기존 방식 vs 서비스 사용 시 비교', exampleImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'serviceName', label: '서비스명', type: 'text', placeholder: '예: 담아코치 AI 학습관리' },
      { key: 'features', label: '핵심 기능', type: 'textarea', placeholder: '예: AI 맞춤 학습, 실시간 진도 관리, 학부모 알림' },
      { key: 'pricing', label: '요금제', type: 'text', placeholder: '예: 무료체험 14일, 월 29,000원' },
      { key: 'images', label: '스크린샷 (선택)', type: 'images', placeholder: '서비스 화면 캡처' },
    ],
  },
  {
    id: 'consulting',
    name: '법률/세무/컨설팅',
    emoji: '⚖️',
    description: '전문 상담 사례, Q&A, 지식 공유',
    copywritingFormula: 'PAS',
    promptTemplate: `당신은 전문 컨설팅 분야 블로거입니다. 사례 기반 전문 지식을 공유하세요.

작성 공식 (PAS): 흔한 실수/고민(Problem) → 방치 시 불이익(Agitate) → 전문가 해결(Solution)

필수 포함 요소:
- 실제 상담 사례 (비식별화)
- Q&A 형식 활용
- 법/세무 관련 정확한 정보
- 전문가 자격/경력 간접 어필
- "이런 경우 전문가 상담이 필요합니다" 자연스러운 CTA`,
    photoGuides: [
      { title: '전문가 프로필', description: '정장 착용, 사무실 배경, 신뢰감 있는 정면 촬영', exampleImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop' },
      { title: '상담 장면', description: '고객과 상담 중 모습 (얼굴 비식별)', exampleImageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop' },
      { title: '사무실/자격증', description: '전문 자격증, 깔끔한 사무 환경', exampleImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'firmName', label: '사무소/회사명', type: 'text', placeholder: '예: OO법률사무소' },
      { key: 'specialty', label: '전문 분야', type: 'textarea', placeholder: '예: 상속세 절세, 부동산 세금 컨설팅' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '전문가, 사무실 사진' },
    ],
  },
  {
    id: 'exchange',
    name: '환율/세계정세/무역',
    emoji: '💱',
    description: '주요통화 고시·과세환율 브리핑 및 환율을 움직인 세계정세·거시경제 트렌드 분석',
    copywritingFormula: 'AIDA',
    promptTemplate: `당신은 국제 금융·통관 및 거시경제 전문 애널리스트이자 신뢰받는 경제 칼럼니스트입니다. 주간/일간 주요 통화 고시환율(과세환율) 정보와 함께, 환율 등락의 핵심 원인이 되는 '글로벌 세계정세 및 거시경제 트렌드'를 깊이 있게 분석하여 독자에게 실질적인 비즈니스·투자 인사이트를 제공하세요.

작성 공식 (AIDA + E-E-A-T 전문성 분석):
★ [실시간 웹검색(Google Search) 자율 탐색 지침]:
- 사용자가 '주요 환율 데이터'나 '세계정세 이슈'를 직접 적지 않고 비워두었거나 날짜/회차만 입력한 경우, Google Search 도구를 사용하여 해당 시점(또는 가장 최신)의 관세청 과세환율(고시환율) 및 당시 글로벌 경제/세계정세 뉴스를 **AI가 직접 웹에서 실시간 검색하여 최신 팩트와 정확한 수치로 글을 완성**하세요.

★ [서식 및 문체 엄격 규칙]:
- **서식 규칙**: 모든 세부 분석 주제는 반드시 '### 1. 미국 연준(Fed)의 피벗 신호...'와 같이 마크다운 3단계 헤더(###)로 작성하십시오. 번호 기호(①, ②)만 홀로 쓰거나 소제목 바로 밑에 불필요한 구분선(---)을 넣지 마십시오.
- **문체 규칙**: 어색한 1인칭 후기체("제가 수년간 분석해온 경험에 따르면", "ㅋㅋ", "^^")는 절대 금지하며, 정중하고 신뢰감 있는 전문 분석 문체(~습니다, ~됩니다, ~분석됩니다)를 유지하십시오.

1. [Attention - 핵심 브리핑]: 이번 주 환율 변동의 전체적인 흐름 요약 및 한 줄 즉답 결론.
2. [Interest - 주요 통화별 고시·과세환율 비교표]:
   - 미국(USD), 일본(JPY), 유럽(EUR), 중국(CNY), 영국(GBP), 호주(AUD), 뉴질랜드(NZD) 등 주요 통화의 환율 수치(기준/이번주, 전주/다음주, 증감 ▲/▼)를 깔끔한 Markdown Table(마크다운 표)로 작성.
3. [Desire - ★핵심: 환율을 움직인 세계정세 트렌드 심층 분석]:
   - ### 1. 미국 연준(Fed) 기준금리 및 통화정책 기조, FOMC, CPI 및 고용지표의 달러화 영향
   - ### 2. 일본은행(BOJ) 금리 정책 및 엔 캐리 트레이드 청산/엔화 가치 흐름
   - ### 3. 유럽(ECB)·중국 경기 동향 및 국제 유가·지정학적 리스크
   - 각 소주제마다 '### 소제목' 아래에 풍부하고 논리적인 팩트 기반 해설을 1~2개 문단으로 서술.
4. [Action - 실무 적용 가이드 & 실전 대응 전략]:
   - 과세환율 법적 정의 (관세법 제18조) 및 수입신고일 기준 적용 팩트.
   - 고시 주기 및 관세청 유니패스(UNIPASS) 조회 방법 안내.
   - 수입/수출 기업 및 해외 직구족을 위한 실전 환리스크 관리 전략.
   - FAQ에 환율 및 과세환율 관련 실무 질문 4~5개 필수 포함.`,
    photoGuides: [
      { title: '환율 고시표 / 인포그래픽', description: '통화별 환율 표 및 증감 차트가 선명하게 보이는 그래픽', exampleImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop' },
      { title: '세계정세 / 금융 비즈니스', description: '월스트리트 증시, 연준 Fed, 세계지도, 컨테이너 무역항', exampleImageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop' },
      { title: '주요국 통화 / 화폐 컷', description: '달러(USD), 엔화(JPY), 유로(EUR) 등 지폐 및 환전 감성 컷', exampleImageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&h=300&fit=crop' },
      { title: '관세 / 통관 / 전문가 캐릭터', description: '관세법인 로고, 유니패스 조회 안내, 친근한 설명 캐릭터', exampleImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'period', label: '적용 기간 / 고시 회차 (선택)', type: 'text', placeholder: '비워두면 AI가 최근 주차를 자동 검색합니다 (예: 2026년 8월 5주차)' },
      { key: 'exchangeRates', label: '주요 환율 데이터 / 증감 (선택)', type: 'textarea', placeholder: '비워두셔도 AI가 Google Search로 최신 관세청 고시환율을 직접 찾아 작성합니다' },
      { key: 'globalIssues', label: '주요 세계정세 / 이슈 메모 (선택)', type: 'textarea', placeholder: '비워두셔도 AI가 환율 변동 원인이 된 최신 세계정세 뉴스를 직접 탐색하여 분석합니다' },
      { key: 'organization', label: '작성 법인 / 전문가 안내 (선택)', type: 'text', placeholder: '예: 관세법인 보강 (수입통관·과세환율·환급 전문 컨설팅)' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '환율표, 세계정세 그래픽, 캐릭터 사진' },
    ],
  },
  {
    id: 'event',
    name: '이벤트/행사',
    emoji: '🎉',
    description: '이벤트 안내, 프로모션, 참여 유도',
    copywritingFormula: 'AIDA',
    promptTemplate: `당신은 이벤트/마케팅 전문 블로거입니다. 참여를 유도하는 글을 작성하세요.

작성 공식 (AIDA): 눈길 끄는 혜택(Attention) → 상세 내용(Interest) → 참여 욕구(Desire) → 신청 방법(Action)

필수 포함 요소:
- 이벤트 핵심 혜택 먼저 제시
- 일시/장소/대상 명확히
- 참여 방법 단계별 안내
- 긴급성 요소 ("선착순", "마감 임박")
- 명확한 CTA (신청 링크/방법)`,
    photoGuides: [
      { title: '이벤트 포스터', description: '핵심 정보가 한눈에 보이는 홍보 이미지', exampleImageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop' },
      { title: '상품/혜택 사진', description: '경품이나 혜택 실물 사진', exampleImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
      { title: '이전 행사 사진', description: '지난 행사의 성공적인 현장 분위기', exampleImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'eventName', label: '이벤트명', type: 'text', placeholder: '예: 담아코치 봄맞이 무료체험 이벤트' },
      { key: 'eventDetail', label: '일시/장소/혜택', type: 'textarea', placeholder: '예: 3/15~3/31, 온라인, 1개월 무료' },
      { key: 'images', label: '포스터/사진 (선택)', type: 'images', placeholder: '이벤트 포스터, 상품 사진' },
    ],
  },
  {
    id: 'recruiting',
    name: '채용/기업홍보',
    emoji: '🏢',
    description: '채용 공고, 기업 문화, 복지 소개',
    copywritingFormula: 'AIDA',
    promptTemplate: `당신은 기업 문화/채용 전문 블로거입니다. 지원하고 싶게 만드는 글을 작성하세요.

작성 공식 (AIDA): 매력적 첫인상(Attention) → 기업 문화 소개(Interest) → 합류 욕구(Desire) → 지원 방법(Action)

필수 포함 요소:
- 기업 비전/문화 소개
- 팀 분위기/복지 혜택
- 직원 인터뷰 톤으로 작성
- 모집 포지션/자격요건
- 지원 방법/마감일 CTA`,
    photoGuides: [
      { title: '사무실 전경', description: '밝고 활기찬 업무 환경, 와이드 앵글', exampleImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
      { title: '팀 활동 사진', description: '회의, 워크샵, 회식 등 자연스러운 모습', exampleImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop' },
      { title: '복지 시설', description: '카페테리아, 휴게실, 운동시설 등', exampleImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'companyName', label: '회사명', type: 'text', placeholder: '예: 담아코치' },
      { key: 'positions', label: '모집 포지션', type: 'textarea', placeholder: '예: 프론트엔드 개발자, UX 디자이너' },
      { key: 'benefits', label: '복지/문화 메모', type: 'textarea', placeholder: '예: 유연근무, 자기개발비 월 30만원' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '사무실, 팀, 복지 사진' },
    ],
  },
  {
    id: 'personal',
    name: '개인브랜딩/강사',
    emoji: '🎤',
    description: '전문가 포지셔닝, 포트폴리오, 강의 홍보',
    copywritingFormula: 'BAB',
    promptTemplate: `당신은 퍼스널 브랜딩 전문 블로거입니다. 전문가로서의 신뢰를 구축하세요.

작성 공식 (BAB): 고객의 현재 고민(Before) → 전문가와 함께한 후(After) → 나의 전문성(Bridge)

필수 포함 요소:
- 전문 분야 소개 (경력/자격)
- 대표 성과/포트폴리오
- 고객/수강생 후기
- 강의/서비스 안내
- 자연스러운 연락처/상담 CTA`,
    photoGuides: [
      { title: '프로필 사진', description: '전문적이면서 친근한 정면 반신, 밝은 배경', exampleImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop' },
      { title: '강의/활동 장면', description: '강연, 미팅, 작업 중 자연스러운 모습', exampleImageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop' },
      { title: '성과/결과물', description: '저서, 수료증, 수상 내역 등 증거', exampleImageUrl: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'expertName', label: '이름/브랜드명', type: 'text', placeholder: '예: 이석호 대표' },
      { key: 'expertise', label: '전문 분야 / 경력', type: 'textarea', placeholder: '예: AI 교육 컨설팅 10년, 스타트업 3회 창업' },
      { key: 'portfolio', label: '대표 실적', type: 'textarea', placeholder: '예: 저서 2권, 강연 100회, 수강생 5,000명' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '프로필, 강의, 활동 사진' },
    ],
  },
  {
    id: 'saju',
    name: '사주/운세/타로',
    emoji: '🔮',
    description: '오늘의 운세, 사주명리 분석, 띠별/별자리 운세, 궁합/타로 상담 후기',
    copywritingFormula: 'PAS',
    promptTemplate: `당신은 사주명리학 및 타로·운세 전문 상담가이자 따뜻한 힐링 칼럼니스트입니다. 전통 명리학 원리(음양오행, 천간지지, 일주, 십신, 신살, 대운·세운)를 현대인의 일상, 커리어, 인간관계, 연애 심리에 접목하여 깊이 있고 신뢰감 넘치는 운세 분석 블로그 글을 작성하세요.

작성 공식 (PAS): 문제/고민(Problem - 답답한 현실과 고민) → 자극/심층 분석(Agitate - 현재 운의 흐름과 오행 기운의 작용) → 해결(Solution - 구체적인 실천 개운법과 타이밍 조언)

필수 포함 요소:
- 독자의 현재 심리적 고민과 답답함에 깊이 공감하는 따뜻한 오프닝
- 사주 원국 및 오행(목화토금수) 기운의 조화와 균형에 대한 전문적이고 쉬운 해설
- 구체적 운세 분석 (재물운/사업운, 직장/커리어운, 애정/인간관계운, 건강/심리운 등)
- 실생활에서 즉시 실천할 수 있는 현실적인 개운(開運) 솔루션 (행운의 색상, 방향, 숫자, 마음가짐, 행동 팁)
- 맹신이나 불안감을 조성하는 극단적인 예언은 절대 배제하고, 독자에게 용기와 긍정적인 방향성을 제시하는 희망적 마무리
- "텍스트 2~3줄 + 사진 자리([IMAGE_N])" 패턴으로 구성 (네이버 스마트에디터 최적화)`,
    photoGuides: [
      { title: '사주 명식표/원국표', description: '생년월일시 사주팔자 천간지지 및 대운 흐름 인포그래픽', exampleImageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&h=300&fit=crop' },
      { title: '오행 기운 차트', description: '목화토금수(木火土金水) 상생상극 밸런스 그래픽', exampleImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop' },
      { title: '아늑한 상담 데스크', description: '고풍스러운 목재 테이블, 따뜻한 촛불, 타로 카드와 원석', exampleImageUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=400&h=300&fit=crop' },
      { title: '개운 소품 / 힐링 공간', description: '전통 향, 찻잔, 마음의 평온을 주는 단아한 동양풍 공간', exampleImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop' },
    ],
    optionalFields: [
      { key: 'birthInfo', label: '생년월일시 / 일주', type: 'text', placeholder: '예: 1992년 8월 15일 미시 (갑자일주)' },
      { key: 'focusArea', label: '핵심 상담/운세 분야', type: 'text', placeholder: '예: 2026년 하반기 이직운 및 재물운' },
      { key: 'ohengFocus', label: '주요 오행 / 십신 메모', type: 'textarea', placeholder: '예: 화(火) 기운 보완 필요, 식신생재 흐름' },
      { key: 'images', label: '사진 (선택)', type: 'images', placeholder: '사주 원국표, 타로 카드, 상담 공간 사진' },
    ],
  },
  {
    id: 'general',
    name: '일반/자유',
    emoji: '✏️',
    description: '유형 없이 주제만으로 자유롭게 생성',
    copywritingFormula: 'AIDA',
    promptTemplate: `당신은 전문 블로거입니다. 주제에 대한 깊이 있는 블로그 글을 작성하세요.

작성 공식 (AIDA): 관심 끄는 도입(Attention) → 상세 정보(Interest) → 공감/욕구(Desire) → 행동 유도(Action)

필수 포함 요소:
- SEO 최적화 제목 (숫자 + 키워드)
- ## 소제목으로 명확한 섹션 구분
- 구체적 수치/사례 포함
- 핵심 키워드 자연스러운 배치
- 최신 정보 반영`,
    photoGuides: [],
    optionalFields: [
      { key: 'notes', label: '참고 사항', type: 'textarea', placeholder: '강조하고 싶은 내용이나 참고 자료' },
    ],
  },
];

// 5대 핵심 비즈니스 정예 스킬 (BNI 원투원 중심)
export const CORE_BLOG_SKILL_IDS: BlogSkillId[] = [
  'one_to_one',
  'restaurant',
  'consulting',
  'product',
  'general',
];

export const CORE_BLOG_SKILLS: BlogSkill[] = [
  BLOG_SKILLS.find((s) => s.id === 'one_to_one') || BLOG_SKILLS[0],
  BLOG_SKILLS.find((s) => s.id === 'restaurant')!,
  BLOG_SKILLS.find((s) => s.id === 'consulting')!,
  BLOG_SKILLS.find((s) => s.id === 'product')!,
  BLOG_SKILLS.find((s) => s.id === 'general')!,
];

export function getSkillById(id: BlogSkillId): BlogSkill {
  return BLOG_SKILLS.find(s => s.id === id) || BLOG_SKILLS[0];
}

export type BlogPlatform = 'naver' | 'tstory' | 'wordpress';

export interface MarketingOptions {
  platform?: BlogPlatform; // 'naver' | 'tstory' | 'wordpress'
  targetAudience?: string;
  copyFormula?: string; // 'auto' | 'AIDA' | 'PAS' | 'BAB' | 'FAB'
  tone?: string; // 'friendly' | 'professional' | 'casual' | 'informative' | 'persuasive'
}

const PLATFORM_GUIDE: Record<BlogPlatform, string> = {
  naver: `★ [네이버 블로그 실전 인기글 스타일 적용]:
1. [모바일 1~2줄 호흡 줄바꿈]: 뭉텅이 문단 절대 금지! 스마트폰에서 한눈에 읽히도록 1~2문장마다 엔터 줄바꿈 적용.
2. [네이버 시그니처 말풍선 인용구]: 각 주요 섹션 도입부나 핵심 감정선마다 '> [말풍선] 핵심 한마디 (빨간색/강조 멘트)' 형태로 반드시 2~3회 이상 배치.
   예: > [말풍선] 1층 MAC 매장 바로 앞, 컬러감부터 눈에 확!
   예: > [말풍선] 근데 바디워시 거품이 진짜 신기했어요
3. [찐후기 내돈내산 바이브]:
   - 딱딱한 AI 설명체(~에 대해 알아보겠습니다, 결론적으로) 절대 금지!
   - 1인칭 생생한 감정 표현, 일상 대화체, 적절한 리액션(^^, ㅋㅋ, ~더라고요, ~했거든요, 오? 오오...?) 자연스럽게 사용.
4. [사진 밀착형 티키타카]:
   - 사진 바로 앞: 궁금증/상황 유발 ("제가 일부러 손을 막 흔들어봤거든요ㅋㅋ")
   - [IMAGE_N] 사진 배치
   - 사진 바로 뒤: 생생한 체감 디테일 ("근데 안 떨어지는 거 있죠? 거품이 진짜 쫀쫀해요...")`,

  tstory: `★ [티스토리 / 브런치 에세이 매거진 스타일 적용]:
1. [지적이고 세련된 문단형 서술]: 잘 정돈된 단락과 매끄러운 문맥 연결.
2. [소제목 & 인용구 활용]: '## 소제목'과 '> 인용구'를 적절히 배치하여 잡지 칼럼을 읽는 듯한 고급스러운 레이아웃.
3. [전문성과 경험의 조화]: 개인적 인사이트와 객관적 정보를 균형 있게 전달.
4. [구글 SEO 친화적 구조]: 명확한 소제목 체계와 요점 정리.`,

  wordpress: `★ [워드프레스 / 구글 AEO 전문 아티클 스타일 적용]:
1. [AEO 스니펫 즉답]: 첫 문단에 질문에 대한 핵심 정의와 결론을 명확히 제시.
2. [데이터 및 구조화 표]: 비교표(Markdown Table), 불릿 포인트, 단계별 가이드 필수 포함.
3. [E-E-A-T 신뢰도 구축]: 통계, 수치, 근거 기반의 논리적이고 전문적인 비즈니스 문체.
4. [FAQ 및 체크리스트]: 독자의 잠재적 의문을 해결하는 구조화된 콘텐츠.`,
};

const COPY_FORMULA_GUIDE: Record<string, string> = {
  AIDA: '작성 공식 (AIDA): 주의(Attention) → 관심(Interest) → 욕구(Desire) → 행동(Action) 순서로 작성',
  PAS: '작성 공식 (PAS): 문제(Problem) → 자극(Agitate) → 해결(Solution) 순서로 작성',
  BAB: '작성 공식 (BAB): 이전(Before) → 변화(After) → 연결(Bridge) 순서로 작성',
  FAB: '작성 공식 (FAB): 기능(Features) → 장점(Advantages) → 혜택(Benefits) 순서로 작성',
};

const TONE_GUIDE: Record<string, string> = {
  friendly: '톤앤매너: 친근하고 다정한 말투 (반말/경어 혼용, 이모지 적절 활용, "~해요", "~거든요")',
  professional: '톤앤매너: 전문적이고 신뢰감 있는 말투 (정중한 경어, 수치/근거 기반, 객관적 서술)',
  casual: '톤앤매너: 캐주얼하고 편안한 말투 (일상 대화체, SNS 스타일, 짧은 문장)',
  informative: '톤앤매너: 정보 전달 중심 (백과사전 스타일, 구조적 서술, 핵심 요약 강조)',
  persuasive: '톤앤매너: 설득력 있는 말투 (독자 공감 유도, 구체적 사례, 강한 CTA)',
};

/** 스킬 + 사용자 입력 자료 + 마케팅 연구 데이터로 최종 프롬프트 생성 */
export function buildSkillPrompt(
  skill: BlogSkill,
  topic: string,
  customFields?: Record<string, string>,
  imageDescriptions?: string[],
  marketing?: MarketingOptions,
): string {
  let prompt = skill.promptTemplate;

  // 플랫폼 스타일 지정 (네이버 / 티스토리 / 워드프레스)
  const platform = marketing?.platform || 'naver';
  if (PLATFORM_GUIDE[platform]) {
    prompt += `\n\n${PLATFORM_GUIDE[platform]}`;
  }

  // 카피라이팅 공식 오버라이드 (auto가 아닌 경우)
  if (marketing?.copyFormula && marketing.copyFormula !== 'auto' && COPY_FORMULA_GUIDE[marketing.copyFormula]) {
    prompt += `\n\n★ ${COPY_FORMULA_GUIDE[marketing.copyFormula]}`;
  }

  // 톤앤매너 지정
  if (marketing?.tone && TONE_GUIDE[marketing.tone]) {
    prompt += `\n\n★ ${TONE_GUIDE[marketing.tone]}`;
  }

  // 타겟 오디언스 지정
  if (marketing?.targetAudience) {
    prompt += `\n\n★ 타겟 오디언스: ${marketing.targetAudience}
- 이 타겟이 사용하는 언어, 관심사, 검색 키워드에 맞춰 작성
- 타겟이 공감할 수 있는 사례와 표현 사용
- 타겟의 니즈와 페인포인트를 반영한 해결책 제시`;
  }

  // 마케팅 연구 데이터 주입 (파이프라인 핵심)
  const researchData = getResearchPromptForType(skill.id);
  if (researchData) {
    prompt += `\n\n${researchData}`;
  }

  // 사용자가 업로드한 사진 설명 (Gemini Vision 분석 결과 및 스토리텔링 파이프라인)
  if (imageDescriptions && imageDescriptions.length > 0) {
    prompt += `\n\n[사용자가 제공한 사진 ${imageDescriptions.length}장 — 사진 기반 유기적 스토리라인 필수]`;
    imageDescriptions.forEach((desc, i) => {
      prompt += `\n[IMAGE_${i + 1}] 사진 내용: ${desc}`;
    });
    prompt += `\n
★ [최우선 필수 원칙: 사진 중심 유기적 스토리텔링 (Photo-Driven Storyline Engine)]:
이 글의 핵심은 **"사진의 시각적 디테일(인물의 표정, 안경, 의상, 인상, 미팅 공간 분위기, 서류/양식지 등)과 글의 서사(Storyline)가 한 몸처럼 유기적으로 맞물려 돌아가는 생생한 스토리 중심의 블로그"**입니다!
정보를 먼저 나열하고 사진을 기계적으로 끼워 넣는 글은 절대 금지합니다.

1. [사진 분석 디테일의 본문 서사 융합 (필수)]:
   - 각 사진([IMAGE_1] ~ [IMAGE_${imageDescriptions.length}])의 분석 내용에 담긴 **인물의 시각적 특징(따뜻한 미소, 지적인 뿔테 안경, 깔끔한 셔츠/정장 차림, 신뢰감 넘치는 제스처 등)이나 현장 분위기(미팅 공간의 조명, 테이블 위 따뜻한 커피와 펼쳐진 양식지 등)**를 본문의 대화 및 서사 속에 직접 언급하고 묘사하세요.
   - 예: "사진 속 대표님의 온화한 미소와 스마트한 뿔테 안경 너머로 전문성에 대한 깊은 자부심이 느껴졌습니다. 테이블 위에 정성껏 준비해 오신 121 양식지를 함께 펼쳐보며..."

2. [사진 밀착형 에피소드 & 디테일 묘사]:
   - **사진 직전**: 그 장면을 찍게 된 상황, 대화가 시작된 순간, 현장의 생생한 공기와 첫인상
   - **[IMAGE_N] 단독 줄 배치**
   - **사진 직후**: 사진 속 피사체(인물의 인상, 표정, 양식지 속 메모 등)를 직접 호명하며 묘사하고, 그 장면에서 자연스럽게 비즈니스 인사이트/철학/정보로 물 흐르듯 연결!

3. [1인칭 생생한 현장 보이스]:
   - "오늘 직접 마주 앉아 나눈 생생한 이야기", "실제 현장에서 함께 호흡하며 느낀 진심"을 바탕으로 작성.
   - 독자가 글쓴이와 함께 미팅 테이블에 마주 앉아 이야기를 듣는 듯한 생동감과 신뢰감을 유지할 것.
4. 모든 사진([IMAGE_1] ~ [IMAGE_${imageDescriptions.length}])을 빠짐없이 이야기의 이정표로 문맥에 맞게 배치할 것.`;
  }

  // 사용자가 입력한 자료 추가
  if (customFields && Object.keys(customFields).length > 0) {
    const fieldEntries = Object.entries(customFields)
      .filter(([key, val]) => val && key !== 'images')
      .map(([key, val]) => {
        const field = skill.optionalFields.find(f => f.key === key);
        return field ? `- ${field.label}: ${val}` : `- ${key}: ${val}`;
      });

    if (fieldEntries.length > 0) {
      prompt += `\n\n[사용자 제공 정보 - 반드시 본문에 자연스럽게 반영하세요]\n${fieldEntries.join('\n')}`;
    }
  }

  // BNI 원투원 스킬 전용 프롬프트 가이드
  if (skill.id === 'one_to_one') {
    const myName = customFields.myAuthorName || '';
    const myCompany = customFields.myAuthorCompany || '';
    const myChapter = customFields.myAuthorChapter || '';
    const mySpecialty = customFields.myAuthorSpecialty || '';
    const myReferral = customFields.myAuthorReferral || '';

    // 다자간(1:N) 미팅 여부 판별
    let isMultiPartner = false;
    let multiAttendees: Array<{
      name: string;
      company: string;
      chapter?: string;
      specialty?: string;
      targetReferral?: string;
      partnerStrength?: string;
    }> = [];

    if (customFields.attendeesJson) {
      try {
        const parsed = JSON.parse(customFields.attendeesJson);
        if (Array.isArray(parsed) && parsed.length > 1) {
          isMultiPartner = true;
          multiAttendees = parsed;
        }
      } catch {}
    } else if (customFields.partnerName && (customFields.partnerName.includes(',') || customFields.partnerName.includes('&'))) {
      isMultiPartner = true;
    }

    const hostProfileSection = (myName || myCompany)
      ? `\n\n★ [글 작성자(나 / 호스트 대표님) 프로필]:
- 작성자 성함: ${myName || '작성자 대표'}
- 내 회사명 / 소속: ${myCompany || '소속 기업'}${myChapter ? ` (${myChapter})` : ''}
- 내 전문분야 / 주력 사업: ${mySpecialty || '전문 비즈니스'}
${myReferral ? `- 내 이상적인 추천 고객 (리퍼럴): ${myReferral}` : ''}

★ [화자(1인칭 시점) 엄격 반영 지침]:
- 이 블로그 글의 화자(1인칭 '저', '저희 ${myCompany || '회사'}')는 바로 위 [작성자(나)] 대표님입니다.
- 오늘 만난 파트너 대표님(${customFields.partnerName || '상대방 대표'}님)과 대화하면서, 내 사업(${myCompany || '내 비즈니스'}) 관점에서 무엇을 배우고 느꼈는지, 그리고 내 전문분야(${mySpecialty || ''})와 파트너 대표님의 사업이 어떻게 상생 협력할 수 있는지를 진정성 있게 서술하세요.`
      : '';

    const multiPartnerGuide = isMultiPartner
      ? `\n\n★ [1:N / 다자간(조인트) 121 미팅 특별 서사 지침]:
- 이번 원투원 미팅은 작성자(나: ${myName || '호스트 대표'})와 함께 총 ${multiAttendees.length > 0 ? multiAttendees.length : '복수'}명의 파트너 대표님들이 함께한 다자간(1:2, 1:3 등 조인트) 비즈니스 미팅입니다.
${multiAttendees.length > 0
  ? `- 참석하신 파트너 대표님 목록 및 정보:\n` +
    multiAttendees
      .map(
        (a, i) =>
          `  ${i + 1}) ${a.company} ${a.name} 대표님 (전문분야: ${a.specialty || '비즈니스'} / 이상적 리퍼럴: ${a.targetReferral || '소개 희망'} / 핵심 강점: ${a.partnerStrength || '전문성'})`
      )
      .join('\n')
  : `- 참여 파트너: ${customFields.partnerName}`}
- [다자간 서사 필수 요구사항]:
  1. 본문에서 참여하신 모든 파트너 대표님을 개별 단락으로 공평하고 균형 있게 상세히 조명해 주세요.
  2. 세 분(또는 여러 대표님) 간에 오고 간 대화의 교류, 서로 다른 비즈니스가 융합될 때 생기는 삼각 협업 시너지(크로스 리퍼럴 및 상생 프로젝트)를 생생하게 풀어내세요.
  3. 글 마지막의 추천 및 문의 안내에서도 참여하신 대표님들의 비즈니스를 모두 정중히 소개해 주세요.`
      : '';

    prompt += `\n\n★ [BNI 121 원투원 양식 기반 스토리텔링 전용 지침]:
1. [글의 제목]: 반드시 "[BNI 원투원] {상대방 회사} {대표님 성함} 대표님과의 만남 — {핵심 인사이트/협업 가치}" 형식의 품격 있는 비즈니스 제목으로 작성. (다자간 미팅일 경우 모든 대표님 또는 회사명을 제목에 자연스럽게 병기)
${hostProfileSection}
${multiPartnerGuide}
2. [BNI 원투원 6단계 서사 구조 (P-S-I)]:
   - ① 만남의 배경: 대표님들을 뵙게 된 계기와 미팅 일시/장소 분위기
   - ② 파트너의 전문성 & 추천 고객: 각 대표님의 독보적인 강점과 어떤 고객을 연결해드리면 좋은지(타겟 리퍼럴) 상세 조명
   - ③ 오늘 나눈 대화의 핵심: 오늘 121 미팅에서 나눈 진솔한 대화와 실제 메모에 담긴 생생한 비즈니스 스토리
   - ④ 나의 인사이트 (배운 점): 작성자(나)의 시점에서 느낀 비즈니스 인사이트와 내 사업(${myCompany || '내 사업'})에 적용할 점
   - ⑤ 상생과 협업 계획: 참여 기업들이 함께 그리는 시너지, 서로 줄 수 있는 소개 기회, 다음 약속한 일정
   - ⑥ 맺음말 및 문의 안내: 파트너 대표님들을 적극 추천하는 이유와 회사/문의처 안내
3. [네이버 블로그 친화적 서식]:
   - 각 섹션 시작 시 '> [말풍선] 핵심 한마디' 배치
   - 미팅 사진 [IMAGE_N] 자연스러운 배치
   - 사실과 메모에 기반한 진정성 있는 1인칭 대표님 시점 유지
4. [녹음본 대화 스크립트 반영]: 녹음본 텍스트 전문(클로바노트 전사본 등)이 제공된 경우, 대표님들이 나눈 실제 대화 일화, 인상 깊었던 명언이나 고민, 구체적인 비즈니스 솔루션을 본문에 생생하게 녹여내어 글의 신뢰감과 현장감을 극대화하세요.`;
  }

  prompt += `\n\n주제: "${topic}"`;

  return prompt;
}
