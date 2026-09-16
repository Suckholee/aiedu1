export type AgentRole = 'chief' | 'winefit' | 'le_verre' | 'growth';

export type TaskStatus = 'draft_ready' | 'approved' | 'revised' | 'scheduled';

export type TaskCategory =
  | 'newsletter'
  | 'blog'
  | 'shorts'
  | 'store_ops'
  | 'finance'
  | 'b2b'
  | 'briefing';

export interface RoutineTask {
  id: string;
  agentRole: AgentRole;
  agentName: string;
  agentAvatar: string;
  title: string;
  category: TaskCategory;
  categoryName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: TaskStatus;
  summary: string;
  draftContent: string;
  targetPlatform: string; // '네이버 블로그' | '한잔레터 구독자' | '유튜브 숏츠' | '르글라스 직원단톡방' | '구글 캘린더' | '수입사 이메일'
  estimatedSavedMinutes: number; // 절약된 대표의 시간 (분)
  tokenEfficiencyScore: number; // 비용 효율 지수 (1~100)
  actionNotes?: string;
  studioUrl?: string; // 바로가기 연동 스튜디오 URL
  approvedAt?: number;
  revisedFeedback?: string;
}

// 4대 AI 직원팀 정보
export const AI_AGENT_TEAMS: Record<
  AgentRole,
  { name: string; title: string; color: string; bgLight: string; iconName: string; desc: string }
> = {
  chief: {
    name: '비서팀 네오 (Agent Chief)',
    title: '스케줄 · 경영 비서',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50 border-indigo-200',
    iconName: 'CalendarCheck',
    desc: '매일 아침 08:00 데일리 브리핑, VIP 예약 알림 및 스케줄 최적화',
  },
  winefit: {
    name: '마케팅팀 와인핏 (Agent WineFit)',
    title: '콘텐츠 · 퍼스널 브랜딩',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50 border-rose-200',
    iconName: 'Sparkles',
    desc: '한잔레터 칼럼, 네이버 블로그 와인 리뷰, 유튜브 숏폼 대본 작성',
  },
  le_verre: {
    name: '운영팀 르글라스 (Agent LeVerre)',
    title: '매장 운영 · 손익 관리',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50 border-emerald-200',
    iconName: 'Store',
    desc: '100종 잔와인 손익/재고 분석 및 홀/주방 서비스 체크리스트 배포',
  },
  growth: {
    name: '영업팀 그로스 (Agent Growth)',
    title: 'B2B 제안 · 커머스',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50 border-amber-200',
    iconName: 'Briefcase',
    desc: '기업 CEO 와인 특강 맞춤 제안서, 와인 수입사 콜라보 기획',
  },
};

// 곽성진 대표(르글라스 압구정 & 와인핏) 맞춤 주간 루틴 프리셋
export const INITIAL_KWAK_ROUTINE_TASKS: RoutineTask[] = [
  {
    id: 'task_daily_briefing_today',
    agentRole: 'chief',
    agentName: '비서팀 네오',
    agentAvatar: '🤵',
    title: '오늘 08:00 데일리 CEO 브리핑 & 압구정 날씨 페어링',
    category: 'briefing',
    categoryName: '경영 브리핑',
    date: new Date().toISOString().slice(0, 10),
    time: '08:00',
    status: 'draft_ready',
    summary: '오늘 르글라스 예약 14팀(VIP 2팀), 흐린 가을 날씨에 어울리는 피에몬테 네비올로 잔와인 추천 및 WSET 특강 준비 리마인드',
    draftContent: `[곽성진 대표님 데일리 모닝 브리핑]
📅 일시: 오늘 08:00 기준

1. 🍷 르글라스 압구정 예약 현황 (총 14팀 / 점유율 85%)
- VIP 테이블 2건: 삼성전자 임원 모임 (19:30, 6명) ➔ 부르고뉴 프리미어 크뤼 잔와인 라인업 사전 브리핑 필요
- 네이버 예약 8건, 캐치테이블 4건
- 오늘 날씨(가을비 약간): 우드톤 인테리어와 자연스러운 산미의 '피에몬테 네비올로'를 오늘의 글라스 스페셜로 추천 제안

2. 🎓 와인핏(WSET & 온라인) 일정
- 15:00: WSET 3단계 강의 교안 최종 검수 (슬라이드 42p)
- 10월 와인핏 공식 웹사이트 런칭 체크리스트: PG 결제사 심사 서류 검토

3. 🤖 AI 직원팀 오늘의 할 일
- 마케팅팀: [한잔레터] 이번 주 목요 칼럼 초안 작성 완료 대기
- 운영팀: 주말 대비 100종 잔와인 오픈 목록 및 코라뱅 가스 잔량 체크리스트 생성`,
    targetPlatform: '모바일 캘린더 & 카톡',
    estimatedSavedMinutes: 30,
    tokenEfficiencyScore: 98,
    studioUrl: '/tools/work-automation',
  },
  {
    id: 'task_hanjan_letter_draft',
    agentRole: 'winefit',
    agentName: '마케팅팀 와인핏',
    agentAvatar: '🍷',
    title: '한잔레터 제42호: "가을엔 왜 피노누아보다 네비올로가 당길까?"',
    category: 'newsletter',
    categoryName: '한잔레터',
    date: new Date().toISOString().slice(0, 10),
    time: '11:00',
    status: 'draft_ready',
    summary: '23년 소믈리에 경력의 에세이 톤으로 가을 낙엽 향과 탄닌의 매력을 풀어낸 구독자용 주간 와인 칼럼 초안',
    draftContent: `# [한잔레터 Vol.42] 가을엔 왜 피노누아보다 네비올로가 당길까?
**글쓴이: 곽성진 (소믈리에 & 와인핏 대표)**

안녕하세요, 한잔레터 구독자 여러분. 르글라스 압구정 바 카운터에서 와인잔을 닦으며 편지를 띄웁니다.

아침저녁으로 찬 바람이 불기 시작하면 손님들의 잔와인 주문 패턴이 귀신같이 바뀝니다.
여름 내내 사랑받던 청량한 소비뇽 블랑이나 섬세한 부르고뉴 피노누아 대신, 문을 열고 들어오시며 나직이 묻곤 하시죠.

"곽 대표님, 오늘은 낙엽 향 나면서도 여운이 길게 남는 레드 한 잔 추천해 주세요."

그럴 때 제가 망설임 없이 코라뱅으로 추출해 드리는 잔이 바로 이탈리아 피에몬테의 '네비올로(Nebbiolo)'입니다.
네비올로는 이탈리아어로 안개(Nebbia)에서 유래했습니다. 늦가을 안개가 자욱할 때 수확하는 이 포도는, 투명하고 맑은 루비빛 뒤에 단단한 탄닌과 타르, 말린 장미의 그윽한 향기를 숨겨두고 있습니다.

오늘 저녁, 퇴근길에 스스로에게 선물할 와인 한 잔을 고민하고 계신다면...
[더 읽기]`,
    targetPlatform: '한잔레터 구독자 (스티비/메일)',
    estimatedSavedMinutes: 90,
    tokenEfficiencyScore: 95,
    studioUrl: '/tools/blog',
  },
  {
    id: 'task_store_ops_weekend',
    agentRole: 'le_verre',
    agentName: '운영팀 르글라스',
    agentAvatar: '🥂',
    title: '르글라스 주말 피크타임 소믈리에 홀 & 주방 서비스 체크리스트',
    category: 'store_ops',
    categoryName: '매장 운영',
    date: new Date().toISOString().slice(0, 10),
    time: '14:30',
    status: 'draft_ready',
    summary: '100종 잔 단위 와인 서빙 표준(온도 칠링, 코라뱅 니들 소독, 잔 와인 설명 스크립트) 및 주말 마감 가이드',
    draftContent: `# [르글라스 압구정] 주말 서비스 표준 체크리스트
**발행: 르글라스 운영팀 (대표 곽성진 승인용)**

## 1. 와인 글라스 서비스 표준
- [ ] 샴페인/스파클링: 리델 퍼포먼스 플루트 6~8℃ 서빙
- [ ] 화이트/내추럴: 잘토 화이트 잔 10~12℃ 세팅
- [ ] 피에몬테/바롤로: 리델 소믈리에 버건디 잔, 코라뱅 가스 추출 전 헤드 잔량 체크
- [ ] 잔 와인 설명 스크립트 필수 3요소: 
  1) 품종 및 지역 스토리 1줄
  2) 첫 모금에서 느껴지는 아로마 포인트
  3) 오늘 매장 타파스 메뉴와의 마리아주 팁

## 2. 주방 & 홀 마감 체크
- [ ] 오픈된 고가 와인 질소 보존 가스 투입 후 셀러 적재
- [ ] 일일 잔 단위 소진량 포스(POS) 대조 정산표 작성`,
    targetPlatform: '르글라스 직원 단톡방',
    estimatedSavedMinutes: 45,
    tokenEfficiencyScore: 92,
    studioUrl: '/tools/work-automation',
  },
  {
    id: 'task_shorts_script_draft',
    agentRole: 'winefit',
    agentName: '마케팅팀 와인핏',
    agentAvatar: '🎬',
    title: '진스와인페어링 숏폼 대본: "고깃집에서 와인 시킬 때 절대 실패 안 하는 법"',
    category: 'shorts',
    categoryName: '유튜브 숏폼',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '10:00',
    status: 'scheduled',
    summary: '구독자 7,300명 채널 타깃, 삼겹살/한우 회식 자리에서 소주 대신 와인 고를 때 3초 만에 칭찬받는 팁',
    draftContent: `[진스와인페어링 숏폼 스크립트 - 50초]
제목: 삼겹살집에서 이 와인 꺼내면 그날로 와인 고수 소리 듣습니다!

(0~3초 후킹 화면)
곽대표: 삼겹살 기름기 때문에 와인이 안 어울린다고요? 절대 아닙니다! 딱 '이것'만 기억하세요.

(4~20초 본론 1: 산미의 중요성)
소믈리에 경력 23년 동안 고깃집에서 수백 번 실험해봤는데요, 무조건 '산미'와 '가벼운 탄닌'이 있는 레드 와인을 골라야 합니다.
헤비한 까베르네 소비뇽은 삼겹살 쌈장과 부딪혀 떫은맛만 남아 망합니다!

(21~40초 본론 2: 구체적 품종 추천)
대신 '이탈리아 키안티 클라시코'나 '프랑스 가메(보졸레)'를 시켜보세요.
높은 산미가 기름기를 싹 씻어주면서 삼겹살이 무한대로 들어갑니다.

(41~50초 클로징 & CTA)
압구정 르글라스 오시면 잔 단위로 삼겹살 페어링 와인 다 비교해 드립니다.
구독 누르시고 더 많은 와인 꿀팁 받아보세요!`,
    targetPlatform: '유튜브 숏츠 & 인스타 릴스',
    estimatedSavedMinutes: 60,
    tokenEfficiencyScore: 96,
    studioUrl: '/tools/shorts',
  },
  {
    id: 'task_b2b_proposal_draft',
    agentRole: 'growth',
    agentName: '영업팀 그로스',
    agentAvatar: '💼',
    title: '모 기업 최고경영자(CEO) 포럼 맞춤형 와인 인문학 강연 제안서',
    category: 'b2b',
    categoryName: '기업 강연/제안',
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    time: '15:00',
    status: 'scheduled',
    summary: '비즈니스 와인 매너, 역사 속 와인과 리더십 의사결정 사례를 결합한 90분 CEO 강연 제안서 초안',
    draftContent: `# [CEO 특별 강연 제안서] 비즈니스를 움직이는 와인의 언어
**강사: 곽성진 (WSET 국제공인 강사, 르글라스 압구정 대표, 아시아와인트로피 심사위원)**

## 1. 기획 의도
글로벌 비즈니스 디너와 최고위 사교 모임에서 와인은 단순한 음료가 아닌 '품격 있는 대화의 시작'입니다.
23년 실무 소믈리에 노하우를 바탕으로, 기업 리더들이 테이블 위에서 즉각 활용할 수 있는 실전 비즈니스 와인 매너를 전수합니다.

## 2. 90분 특강 커리큘럼
1. **파트 1: 테이블 위의 권력과 매너 (30분)**
   - 와인 리스트 앞에서 당황하지 않고 3분 만에 취향 파악하기
   - 호스트로서 게스트를 감동시키는 잔 세팅과 테이스팅 에티켓
2. **파트 2: 와인 라벨에 숨겨진 유럽 경영사 (30분)**
   - 프랑스 보르도 그랑크뤼 1등급의 탄생과 나폴레옹 3세의 결단
   - 위기 속에서 브랜드 가치를 지켜낸 샴페인 하우스의 리더십
3. **파트 3: 3종 블라인드 테이스팅 실습 (30분)**
   - 프리미엄 글라스 와인 3종 현장 테이스팅 및 아로마 구별 실습`,
    targetPlatform: '기업 교육 담당자 메일',
    estimatedSavedMinutes: 120,
    tokenEfficiencyScore: 94,
    studioUrl: '/tools/work-automation',
  },
];
