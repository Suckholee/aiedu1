# Firebase → Supabase 전환 오류 점검

점검일: 2026-10-19. 변경은 기존 운영 데이터·권한을 보존하는 범위에서 수행했다. DB 스키마 변경은 없다.

## 확인한 오류와 수정

| 오류 경로 | 영향 | 수정 |
| --- | --- | --- |
| Firebase 초기 로그인 상태가 null이면 Supabase 세션 DELETE | 유효한 Supabase 세션도 새로고침/브라우저 복원 시 해제될 수 있음 | Supabase 검증 세션을 먼저 복원하고 명시적 로그아웃에서만 종료. 명시적 Google 계정 선택 때만 검증된 새 Google 신원을 연결 |
| 카카오 완료 화면이 Firebase custom-token 로그인을 반드시 기다림 | LMS 회원은 생성돼도 Firebase 장애로 가입 전체 실패 | 서버 회원 확인 단계와 기존 사진·실습 저장소 연결 분리. 알려진 Supabase 회원은 동일 Firebase UID로 호환 세션 복원 |
| 플랫폼 API가 Firebase Bearer 토큰만 신원으로 사용 | Supabase에 로그인해도 강의/신청 화면은 비로그인으로 보일 수 있음 | Supabase 검증 회원을 우선 사용. Firebase custom 토큰만 남은 경우 단독 LMS 접근 차단 |
| 플랫폼 조회 전체를 Firestore transaction에 의존 | 홍보/후기 저장소 장애가 Supabase 강의/학습/신청 응답까지 실패시킴 | 핵심 데이터는 Supabase에서 조회. 안내·후기 등 기존 자료는 제한 시간 내 별도 조회하고 실패 사실을 표시. 기존 자료 쓰기는 정상 원본 조회 후에만 허용하여 빈 fallback으로 덮어쓰지 않음 |
| 계정 전환 뒤 이전 mutation 응답이 공통 상태를 변경 | 이전 계정의 신청 정보가 잠깐 표시될 가능성 | 요청을 시작한 계정과 응답 actor UUID 검사. 이전 요청 취소 및 응답 폐기. 계정이 바뀐 렌더부터 이전 목록 즉시 가림 |
| 공통 조회를 5초마다 새로 시작하고 이전 응답 버림 | 느린 요청이 겹치면 계속 로딩될 수 있음 | 진행 중 조회를 공유하고 제한 시간 적용 |
| `/api/platform`, 신청/주문 페이지가 세션 갱신 proxy 대상에서 빠짐 | 로그인 만료 경계에서 페이지별 결과 불일치 | 대상 경로 추가, Cookie/Authorization별 private/no-store 응답. 세션 GET/DELETE에서 Firebase 서버 초기화도 분리 |
| 파일 API가 인증/CSRF 실패까지 400으로 응답 | 권한 오류를 입력 오류로 오인 | 401/403 유지, 파일 저장 전에 실제 기수 확인 |
| 호환 토큰 API의 빈 JSON 기본값 | `{}` 요청 시 지원하지 않는 요청 오류 | token 기본값·잘못된 JSON 입력 검증 |

이메일이나 브라우저 캐시만으로 기존 회원을 합치지 않는다. DB 권한과 기존 Firebase UID는 유지한다. 기존 보안 규칙을 넓히거나 운영 키를 다른 환경으로 복사하지 않았다.

## 읽기 대조 결과

- Supabase 회원 8명 / Firebase Auth 사용자 8명. 기존 UID 누락 0, 중복 Supabase Auth UUID 0, 연결 포인터 누락 0.
- 관리자 1명 유지. 기존 정산·CRM 원본 19건 / 원본 import 1건 / 주문 19건 유지.
- 원본 Firebase 과정·수강신청·자료 각 0건, Supabase 과정·기수·수강신청·자료 각 0건. 빈 모집 목록은 데이터 손실로 확인되지 않았으며 실제 기수 개설이 필요하다.
- Firebase 홍보글 1건·로그 5건 보존. 배너·후기 0건.
- Vercel Supabase Secret key는 Production만 설정되어 있다. Preview는 Supabase URL/키/서버 키가 준비되지 않아 전체 LMS 검증 대상이 아니다. 승인 없이 Production 키를 Preview/Development에 추가하지 않는다.

기계 판독 결과: `.local-data/audits/lms-transition.json`. 개인정보나 인증 키는 이 문서에 기록하지 않는다.

## 남아 있는 Firebase 의존성

| 기능 | 현재 저장소/인증 | 상태 |
| --- | --- | --- |
| 회원·역할·과정·기수·신청·출결·진도·금융/CRM | Supabase 23개 테이블 | 운영 원장 |
| Google 신규 로그인 | Firebase Google → 서버 검증 → Supabase | 외부 인증 반환 팝업의 빈 화면 현상은 실브라우저 재확인 필요. 이 점검에서 Google OAuth 성공을 가정하지 않음 |
| Kakao 신규 로그인 | Supabase OAuth → Supabase 회원 | 핵심 LMS 완료는 Firebase 호환 연결에 종속되지 않도록 수정. 운영 브라우저에서 프로필 사진 추가 제공 동의 화면까지 확인했으며, 동의 전이므로 최종 성공 판정은 보류 |
| 사진 드라이브·공유 갤러리·루틴 저장 | Firestore와 기존 로컬 캐시 | 완전 이전 전. 기존 UID로 호환 세션 사용. 저장소 연결 실패 시 안내하고 LMS는 유지 |
| 홍보·배너·후기·기존 운영 로그 | Firestore | 기존 데이터 유지. 제한된 읽기 fallback과 정상 원본을 요구하는 쓰기 사용 |
| 업로드 자료의 파일 본문 | Firebase Storage, 학습 메타데이터는 Supabase | 기존 파일/URL 유지. Supabase Storage로의 파일 이사는 별도 작업 |

따라서 Firebase 프로젝트·서비스 계정·기존 Storage를 제거하면 아직 사용하는 기능이 중단된다. 전환된 원장을 유지하면서 남은 기능을 차례로 옮겨야 한다.

## 검증

전환 경계 24개(세션 우선순위·UID 유지·계정 격리·자료 권한·Firestore 장애), 기존 가입/역할 18개, 기초 권한 74개, 학습 69개, 금융 68개, 결제 안내 32개, 로그인 연결 경합 검증이 통과했다. 운영 HTTP 45개도 통과했다. 별도 인증 HTTP에서는 Firebase 토큰 없는 Supabase 쿠키 요청, 회원 확인/호환 토큰의 동일 UID, 권한 클레임 미부여, 401/403, 개인 캐시 격리를 검증한다. 테스트 세션은 종료하며 실제 수강신청·입금·환불·정산을 생성하지 않는다.

운영 배포: `dpl_8PytKbstCsTmH3kLjRFbp6r9sU3Q` → https://aiedu1.vercel.app. 최종 운영 빌드·TypeScript 통과. 실제 소셜 로그인 완료는 위 두 항목의 남은 확인과 구분한다.
