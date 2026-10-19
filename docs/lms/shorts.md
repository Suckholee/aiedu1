# 홈페이지 쇼츠 영상

관리 경로: `/admin/shorts` (관리자·교육 운영 권한)
공개 경로: `/#shorts`, `GET /api/lms/shorts`

관리자는 MP4 파일을 선택하면 영상의 3초 지점에서 표지가 자동으로 만들어집니다. 제목·설명·표지·표시 순서·공개 여부를 수정하거나 기존 영상을 교체할 수 있습니다. 업로드 제한은 영상 50MB·10분, 표지 5MB입니다. 게시 해제는 기록을 삭제하지 않고 홈페이지 노출만 중단합니다.

영상과 표지는 Supabase의 private `lms-shorts` 버킷에 저장합니다. 공개 목록은 게시된 항목에만 1시간 유효한 재생 URL을 발급합니다. 관리 API는 Supabase 회원의 관리자·교육 운영 역할을 확인하고, 업로드는 서버가 발급한 경로별 서명으로 Storage에 직접 전송해 Vercel 요청 본문 제한을 피합니다. 원본은 Git이나 Vercel 빌드에 포함하지 않습니다.

DB: `202610190008_lms_shorts.sql`. 변경은 역할을 검사하는 `lms_short_manage` 함수와 감사 기록을 거칩니다. 초안은 일반 회원·비회원에게 조회되지 않습니다.

첫 등록 영상은 `쇼츠영상` 폴더의 두 원본입니다. 기존 바로가기가 가리키던 파일이 없어서 원본 출력 폴더에서 동일한 영상을 복사해 복구했습니다.

- `ai q&a.mp4` → `final-20261019-091608.mp4`
- `ai는 어디서 찾는가.mp4` → `final-20261019-093227.mp4`

검증: `node scripts/test-lms-shorts.mjs`, `LMS_TEST_BASE=https://aiedu1.vercel.app node scripts/test-lms-shorts-http.mjs`. 첫 두 영상은 관리자 세션으로 실제 업로드 티켓 → Storage 업로드 → 등록 API를 거쳐 추가했습니다. 최초 등록 도구 `scripts/import-local-shorts.mjs`는 `output/shorts/ai-qna.webp`, `output/shorts/ai-where.webp` 표지를 사용하며, 같은 제목이 이미 있으면 덮어쓰지 않습니다.

## 블로그 자동화 영상 추가 (2026-10-19)

- `블로그자동화.mp4` → `final-20261019-102708.mp4` (45.9초, 1080×1920, H.264/AAC, 약 8.6MB).
- 바로가기가 가리키던 파일이 없어 `gahoseokho/output/blog-auto-short/out/`의 동일한 최종본을 복사해 복구했다.
- 3초 지점의 프레임을 `output/shorts/blog-automation.webp`로 추출해 표지로 사용한다.
- 제목: 블로그 자동화. 기존 두 영상 다음 순서(2)에 공개한다. 기존 영상·기록은 유지한다.
- 기존 관리자 업로드·등록 API로 반영하며, 랜딩페이지는 Supabase의 공개 목록을 읽으므로 화면 코드 변경 없이 반영된다.
- 운영 사이트에서 세 영상의 공개 목록·접근 권한·MP4 부분 요청·표지를 검사했고, Chrome에서 블로그 자동화 영상의 화면 진행과 오디오 재생을 확인했다. 증빙: `output/shorts/blog-automation-production.png`.
