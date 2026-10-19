// Intended checkout provider, not evidence of an approved payment or a chosen method.
export const TOSS_PAYMENT_CHANNEL = '토스페이먼츠';

export const BANK_TRANSFER_PAYMENT_METHOD = '무통장입금';
export const BANK_TRANSFER_ACCOUNT = {
  bank: 'NH농협은행',
  number: '302-2154-5774-81',
  holder: '이석호',
} as const;

export const DEFAULT_BANK_TRANSFER_GUIDE = `${BANK_TRANSFER_ACCOUNT.bank} ${BANK_TRANSFER_ACCOUNT.number}\n예금주: ${BANK_TRANSFER_ACCOUNT.holder}\n신청자 이름으로 입금 후 주문 상세에서 입금 확인을 요청해주세요. 담당자가 실제 입금을 확인한 뒤 결제 상태에 반영합니다.`;
