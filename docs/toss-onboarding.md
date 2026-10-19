# 토스페이먼츠 신청·연결 상태

2026-10-19. 네오앤피터의 기존 사업자등록증을 확인하여 일반 결제 / 자체 개발 사이트 / https://aiedu1.vercel.app 로 신규 신청을 시작했다. 사업자 확인, 신청자 연락처, 이메일 인증까지 완료했고 대표자 휴대폰 본인인증 단계는 사용자가 직접 진행한다. 민감한 본인인증 정보는 저장소에 기록하지 않는다.

현재 PG 상태는 `registration_pending`, checkoutEnabled=false. 카드 승인·자동 환불·토스 정산 조회는 아직 연결하지 않았다. 테스트/운영 키 확보 후 서버 승인 API, 금액·주문 검증, 멱등 취소 API, 검증된 웹훅, 결제대사 및 운영 심사를 별도 완료해야 한다. 서버 키는 승인된 Vercel Production 환경에서만 관리하고 클라이언트 번들·소스·문서에 넣지 않는다. 계약 동의·가입 비용·본인 인증은 사용자가 최종 확인한다.

공식 참고: https://docs.tosspayments.com/guides/v2/payment-window/integration , https://docs.tosspayments.com/reference , https://docs.tosspayments.com/reference/using-api/api-keys .
