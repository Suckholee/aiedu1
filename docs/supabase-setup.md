# LMS Supabase 연결 및 적용

상태 (2026-10-19): 대상 프로젝트에 기반 SQL과 회원·학사 관리 SQL을 적용했다. 회원 7명을 보존 이전하고 지정된 최초 관리자 1명을 설정했다. 로컬 프로덕션 빌드에서 실제 Google 로그인 → 검증된 Firebase 신원 → Supabase 세션 → 관리자 과정 화면 연결을 확인했다. 명시적 승인 후 서버 키를 Vercel Production에만 저장하고 https://aiedu1.vercel.app 에 배포했다. 카카오 공급자 연결과 운영 실로그인·회원 생성·권한 차단·로그아웃을 확인했다.

수강신청·출결·진도 전환 및 추가 SQL 003/004 적용·검증은 [학습 운영 전환 기록](./lms-learning-migration.md)을 따른다.

## 현재 연결 확인 결과

- 프로젝트: [aiedu1 / Honestone](https://supabase.com/dashboard/project/ztfrqwpuypxbcimefcgw), Tokyo 리전, 대시보드 상태 Healthy.
- 적용 전 확인: public 테이블 0개, Auth 회원 0명, 기존 마이그레이션 테이블 없음.
- 적용: 대시보드 SQL Editor에서 저장소의 `202610190001_lms_foundation.sql` 실행. RLS 활성화 옵션으로 적용.
- 적용 후 확인: 테이블 17개, RLS 활성화 17개. 회원·역할·과정·기수 변경은 서버 전용 명령 함수로 제한.
- `pnpm check:supabase`: 실제 Auth 설정 API와 버전 `202610190002` 조회 확인.
- `pnpm test:lms-schema`: 격리된 PostgreSQL 검증 74개 통과. 마지막 관리자 해제·중지 방지, 운영자 권한 범위, 일정 중복 검사 포함.
- `pnpm test:lms-http`: 로컬 프로덕션 서버에서 익명·CSRF·위조 토큰·공개 응답·소셜 로그인 경로 검증 26개 통과.
- Next.js 프로덕션 빌드: `pnpm exec next build --webpack` 통과. 이 실행 환경에서 Turbopack의 자식 프로세스 포트 바인딩이 제한되어 webpack 빌드로 검증.
- `.env.local`에 Project URL·Publishable key와 서버 전용 키 저장. 파일 권한 600, Git 제외. 브라우저 번들에 서버 키가 포함되지 않았음을 검사.
- Vercel Development·Production에 공개 URL과 Publishable key 설정 확인. Preview는 아직 공개 Supabase 변수가 없으며 운영 전용 배포 범위에 포함하지 않음. 서버 키는 사용자 승인에 따라 **Production에만** 민감 환경변수로 저장. Preview·Development에는 저장하지 않음.
- Vercel 기본 Turbopack 프로덕션 빌드 통과. 운영 HTTP 검사 26개 통과. Storage·결제·평가·수료·정산 서버 통합은 후속 단계.

**두 SQL을 SQL Editor에서 직접 적용했으므로 Supabase CLI의 마이그레이션 원장에는 아직 등록하지 않았다.** 실제 적용 확인은 `lms_schema_versions`에 기록되어 있다. 이후 CLI를 연결할 때 `supabase migration repair 202610190001 202610190002 202610190003 202610190004 --status applied`로 원장에 등록하고 이력을 검증한 뒤 다음 마이그레이션을 적용한다. 적용된 SQL을 다시 실행하지 않는다.

## 1. 프로젝트 선택

대상 프로젝트는 위 `aiedu1`로 지정했다. 이번 적용은 로그인된 브라우저를 통해 수행했으며 Codex Supabase 플러그인 연결은 확인되지 않았다. 후속 자동 관리를 위해서는 Supabase 플러그인 또는 CLI를 계정에 연결한다.

기존 프로젝트를 사용할 경우 먼저 스키마·Auth·마이그레이션 이력·다른 앱 사용 여부를 조사한다. `lms_` 테이블과 `lms_private` 스키마 이름 충돌을 확인하고 기존 데이터 백업을 확보한 뒤 적용한다.

플러그인 연결은 Codex가 프로젝트를 관리할 수 있게 하는 연결이다. **사이트 런타임의 URL·키 설정, DB 적용, 로그인 전환은 별도의 작업**이다.

## 2. 환경변수

Supabase 프로젝트의 Connect/API 설정에서 Project URL과 Publishable key를 확인한다. `.env.supabase.example`의 항목을 기존 `.env.local`에 추가한다. Firebase 환경변수를 덮어쓰지 않는다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Secret key는 이후 서버 전용 결제·이전 코드에서만 사용한다. `NEXT_PUBLIC_` 접두사를 붙이지 않고 채팅·Git에 입력하지 않는다. 현재 연결 검사는 Secret key 없이 실행한다. 공개 키와 Secret key의 역할은 [공식 API 키 문서](https://supabase.com/docs/guides/getting-started/api-keys)를 따른다.

Vercel에는 개발/Preview/Production 중 의도한 환경에 같은 공개 변수 이름을 설정하고 다시 배포해야 한다. 공개 변수는 Next.js 빌드에 포함되므로 로컬 설정만으로 배포 환경이 갱신되지 않는다.

## 3. 기반 DB 적용

검토할 파일: `supabase/migrations/202610190001_lms_foundation.sql`.

Supabase 연결 도구로 대상 프로젝트에 마이그레이션으로 적용하는 것을 우선한다. Supabase CLI를 사용할 경우 CLI 로그인, `supabase init`, 프로젝트 연결 후 이력과 적용 대상을 확인한다. 기존 원격 프로젝트의 이전 마이그레이션이 있다면 먼저 해당 이력·스키마를 동기화한다.

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
supabase db push
```

위 명령은 이후 CLI를 연결해 후속 마이그레이션을 적용할 때의 절차다. 이번 기반 SQL은 이미 적용했으므로 먼저 위에 설명한 `migration repair`와 이력 확인을 수행한다. 이 저장소에는 CLI 바이너리·CLI 연결 정보·`config.toml`을 아직 추가하지 않았다. `supabase init`은 CLI 설치 후 처음 한 번 실행한다. `db push`는 실제 원격 DB를 바꾸므로 프로젝트 확인과 dry-run 후 수행한다. 운영 DB에 `db reset --linked`를 실행하지 않는다.

마이그레이션은 기반 16개 테이블을 생성한다. 사용자 직접 쓰기는 허용하지 않는다. 최초 관리자 권한과 프로필은 신원을 확인한 뒤 서버 관리 경로로 부여한다. 기존 Firebase 데이터를 자동으로 읽거나 복사하지 않는다.

## 4. 검증

```sh
pnpm test:lms-schema
pnpm check:supabase
pnpm exec tsc --noEmit
```

- `test:lms-schema`: 메모리 내 PostgreSQL 검증. 원격 DB·운영 데이터에 접근하지 않음.
- `check:supabase`: 공개 키로 Auth 설정 API와 DB 기반 버전을 읽음. 데이터 쓰기 없음. 미설정이면 오류 종료하며 연결 완료로 표시하지 않음.
- 버전 조회 성공은 전체 LMS 완성을 뜻하지 않음. 실제 사용자 세션·역할·Storage·업무 흐름을 추가 검증해야 함.

## 5. 회원·로그인 전환 구현

`lib/supabase/client.ts`는 브라우저 클라이언트, `server.ts`는 사용자 세션을 사용하는 서버 클라이언트다. `session.ts`를 `proxy.ts`의 `/admin`·`/api/lms` 경로에 연결했다. 기존 localhost 리다이렉트도 유지한다.

기존 블로그·드라이브·실습 데이터의 Firebase UID를 보존하기 위해 Google 로그인 UI는 기존 Firebase 공급자를 사용한다. `/api/lms/session`은 토큰의 프로젝트·서명·폐기 여부, Google 공급자, 이메일 검증 여부를 확인한 뒤 기존 Firebase UID의 회원에 Supabase Auth UUID를 연결한다. Supabase 관리 API의 `generateLink`로 이메일을 발송하지 않고 일회 토큰을 생성하고 서버에서 검증해 쿠키 세션을 설정한다. 토큰과 링크를 응답·로그에 노출하지 않는다. LMS 관리 API는 Supabase `getUser()`와 DB의 활성 회원·역할을 매번 확인한다.

기존 Firebase 토큰을 Supabase 토큰으로 간주하지 않는다. 기존 회원 연결은 검증된 Firebase UID로 처리하고 이메일만으로 다른 회원을 귀속하지 않는다. 한 Firebase UID에 다른 Supabase UUID가 연결되는 경우 거부한다. 이용 중지 계정은 세션과 업무 API에서 차단한다. 완전한 Supabase Google OAuth 공급자 전환은 기존 실습 기능 이전과 함께 후속 단계로 진행할 수 있다.

## 6. 보존 이전과 저장소 범위

`scripts/export-lms-source.mjs`는 Firestore 교육 데이터와 필요한 회원 신원 필드만 읽고 `.local-data/backups`에 권한 600 백업을 만든다. `scripts/import-lms-source.mjs`는 Firebase UID 기준으로 없는 회원만 생성하고 지정된 인증된 계정에만 최초 관리자 역할을 부여한다. 이전 manifest는 `lms_migration_runs`에 저장한다. 재실행 검증에서 신규 회원 생성 0명, 기존 7명 유지가 확인됐다.

이전 원본: `.local-data/backups/lms-source-1792337062559.json`. 교육과정·신청·교안은 원본에서 0건이었다. 홍보 기록과 운영 로그는 기존 Firestore에 유지한다. 브라우저 localStorage의 정산·장부와 실습 도구 데이터도 유지한다.

과정·기수는 Supabase가 기준이다. 기존 `/api/platform`은 공개 화면 호환용으로 Supabase 기수를 기존 과정 DTO로 변환하며 기존 주소는 `legacy_course_id`로 유지한다. 과정 변경을 Firebase에 다시 쓰는 경로는 차단했다. 추가 학습 운영 전환에서 신청·출결·진도·차시 메타데이터를 Supabase로 옮기고 원자적 좌석 처리를 적용했다. 자료 파일과 홍보는 기존 저장소를 유지한다. 결제·환불·정산 통합은 후속 단계다.

새 신청은 서버 접수 성공 후 기존 로컬 정산 화면에 반영한다. 백엔드 실패를 무시하고 성공으로 표시하던 경로를 제거했다. 결제 수단 선택만으로 결제 완료를 기록하지 않으며, 새 신청은 미결제 상태로 시작한다. 기존 정산 기록의 상태와 금액은 변경하지 않는다.

## 7. 운영 배포 완료

공개 설정 동기화: `node scripts/sync-lms-vercel-env.mjs` (완료).

사용자가 서버 키의 Production 전용 저장과 네오앤피터 카카오 앱 연결·배포를 명시적으로 승인했다. `node scripts/sync-lms-vercel-env.mjs --server-production`으로 **Production에만** `SUPABASE_SECRET_KEY`를 저장했다. Preview·Development에는 서버 키를 저장하지 않았다.

작업 변경 55개 파일을 HEAD 기반 별도 배포 폴더에 모아 기존의 무관한 변경과 미추적 파일을 제외했다. Vercel 빌드 성공 후 `vercel promote`로 운영 도메인에 반영했다.

- 운영: https://aiedu1.vercel.app
- 배포: `dpl_3yczez6JnAy5YrjVwMJNQEFgb1HU`
- 배포 URL: https://aiedu1-r6cyouvir-peter15975345-8667s-projects.vercel.app
- 이전 배포: `dpl_HsJtPyAKv44geEWALhNEDbMb7xEB` (필요 시 Vercel promote로 복구)
- 운영 사이트에서 익명 접근·CSRF·위조 토큰 차단·공개 응답·관리 경로 HTTP 검사 26개 통과.
- 운영 구글 관리자 로그인과 회원 관리 조회 성공. 기존 이전 회원 7명과 카카오 신규 수강생 1명, 총 8명이며 지정 Google 계정만 관리자다.
- Vercel 환경 목록 확인: 서버 키는 Production에만 존재하고 Preview·Development에는 없음.

## 8. 남은 구현

추가 요구인 카카오톡·구글 두 로그인 버튼과 Kakao PKCE·회원 연결 코드를 구현했다. 네오앤피터 카카오 앱 `1512890`의 로그인을 활성화하고 기존 앱 자격증명을 Supabase에 연결했다. 운영 카카오 로그인·세션 복원·일반 회원 권한 차단·로그아웃을 검증했다. 세부 적용 범위는 [소셜 로그인 연결](./social-login-setup.md)에 정리했다.

전체 업무 흐름·후속 이전·단계별 완료 기준은 [LMS 설계](./lms-architecture.md)를 따른다. 이번 배포는 회원·권한·과정·기수 관리와 카카오·구글 로그인을 포함한다. 다음 단계에서 수강 신청·학습 운영, 결제·환불, 평가·수료, 정산 순으로 확장한다. 현재 기반 SQL만으로 정원 경쟁·환불 잔액·수료 조건이 완성됐다고 보지 않는다.
