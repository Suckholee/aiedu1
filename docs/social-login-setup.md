# 카카오톡·구글 로그인 연결

상태 (2026-10-19): 운영 사이트 https://aiedu1.vercel.app 에 배포했다. 네오앤피터 앱과 Supabase Kakao 공급자 연결을 저장하고 운영 카카오 실로그인·회원 생성·새로고침 세션 복원·관리자 접근 차단·로그아웃을 확인했다. 이 문서는 비밀 값을 포함하지 않는다.

## 사용할 계정과 앱

- Supabase: `ztfrqwpuypxbcimefcgw` (`aiedu1`).
- 카카오 연결 앱: [네오앤피터 / 1512890](https://developers.kakao.com/console/app/1512890). 사용자가 기존 앱이 있다고 알려준 뒤 앱 목록에서 동일 서비스 이름의 비즈 앱을 확인했다.
- 카카오 로그인 ON. 닉네임·이메일 필수 동의, 프로필 사진 선택 동의. 기존 REST API 키와 활성 Client Secret을 사용했으며 키 재발급은 하지 않았다.
- Google: 기존 Firebase Google 공급자와 UID를 유지하고, 서버에서 검증한 신원으로 Supabase 세션을 발급한다. 기존 회원·관리자 역할을 보존한다.

## 카카오 설정 적용 범위

사용자의 명시적 승인 후 아래 설정을 적용했다. Kakao 앱 자격증명은 Supabase 공급자 설정에 저장했으며 Vercel에는 전달하지 않았다.

1. 네오앤피터 앱의 카카오 로그인을 활성화한다.
2. 필요한 기본 프로필·이메일 동의항목을 확인한다. 메시지 전송·친구 목록 등 로그인과 무관한 권한은 추가하지 않는다.
3. 해당 앱의 REST API key와 Kakao Login Client Secret을 Supabase Kakao 공급자 설정에 저장한다. 키를 Git·브라우저 번들·채팅에 넣지 않는다.
4. 카카오 Redirect URI에 `https://ztfrqwpuypxbcimefcgw.supabase.co/auth/v1/callback`을 등록한다.
5. Supabase에 실제 앱 callback을 허용한다. 로컬 검증 주소는 `http://localhost:3100/auth/callback`, 배포 주소는 `https://aiedu1.vercel.app/auth/callback`이다. Site URL은 `https://aiedu1.vercel.app`이다. 무제한 wildcard 허용은 사용하지 않는다.
6. 실제 카카오 계정으로 로그인·취소·로그아웃·재접속을 검증한다. 이메일 미제공 계정을 허용할지 공급자 설정과 수강 신청에 필요한 연락처 흐름을 함께 결정한다. 이메일 없이 로그인은 가능하도록 코드에서 처리하지만 이메일이 필요한 기존 신청 업무는 별도 확인이 필요하다.

Kakao Developers에서 앱 키 확인 중 새 Secret을 발급하거나 변경해야 한다면 기존 연동 영향을 검토한다. 기존 키를 임의로 교체하지 않는다.

## 코드 흐름

- 로그인 모달: 노란 카카오톡 버튼과 구글 버튼을 제공한다.
- `/api/auth/providers`: 공개 키로 실제 Kakao 공급자 활성 상태만 조회한다. 미설정 공급자를 동작하는 것처럼 표시하지 않고 시작 시 준비 중 안내를 제공한다.
- 카카오: Supabase OAuth PKCE → `/auth/callback` 코드 교환 → `/auth/complete` → 서버가 검증한 Supabase 사용자를 회원에 연결.
- `/api/lms/firebase-session`: 검증된 카카오 세션과 연결된 회원만 사용 가능하다. 기존 블로그·드라이브·실습 호환을 위해 같은 legacy Firebase UID 또는 새 회원용 `supabase_<UUID>`로 Firebase custom token을 발급한다. 브라우저가 이 토큰으로 Firebase에 로그인한다. 관리자 역할은 토큰에 넣지 않고 Supabase 역할 테이블에서 확인한다.
- 새 카카오 회원은 기본 수강생으로 생성한다. 기존 회원은 검증된 Supabase Auth UUID가 연결된 경우에만 기존 UID를 재사용한다. 앱 코드에서 이메일만으로 기존 회원을 합치지 않는다.
- Kakao 호환 Firebase 토큰으로 기존 플랫폼 API를 호출할 때도 현재 Supabase 세션이 같은 회원인지 확인한다. Supabase 세션 없이 남은 Firebase 토큰만으로 사용하지 못하게 한다.
- 리다이렉트는 사이트 내부 경로만 허용한다. 토큰·제공자 오류 원문을 URL에 넣지 않는다. 로그아웃은 현재 기기의 세션을 종료하고 관리자 화면의 데이터를 지운다.

## 검증 범위

프로덕션 빌드, DB·권한 검증 74개, HTTP 검증 26개를 실행했다. HTTP 검증에는 비로그인 custom token 발급 차단, CSRF, callback 오류와 외부 리다이렉트 차단, 공급자 상태 응답 범위가 포함된다. 운영 HTTP 검증 26개도 통과했다. 카카오 OAuth 성공 후 Supabase 활성 회원(기본 수강생)과 Firebase 호환 세션 생성을 확인했고, 새로고침 복원과 관리자 접근 차단 및 로그아웃을 확인했다. 카카오 테스트에서는 선택 프로필 사진 제공에 동의하지 않아도 정상 로그인했다. 구글 로그인은 운영 도메인에서 실제 지정 관리자 계정으로 확인했다. 회원 관리 화면에 기존 7명과 신규 카카오 수강생 1명, 총 8명이 표시되며 지정 계정만 관리자다.

공식 기준: [Supabase Kakao 로그인](https://supabase.com/docs/guides/auth/social-login/auth-kakao), [Kakao 로그인 사전 설정](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite).
