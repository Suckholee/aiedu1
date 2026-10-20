'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { BANK_TRANSFER_ACCOUNT } from '@/lib/lms/payment-channel';

export function BankTransferNotice({ forOrder = false, guest = false }: { forOrder?: boolean; guest?: boolean }) {
  const account = BANK_TRANSFER_ACCOUNT;

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(account.number.replace(/-/g, ''));
      toast.success('계좌번호를 복사했습니다.');
    } catch {
      toast.error('계좌번호를 직접 복사해주세요.');
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm">
      <p className="font-bold text-indigo-950">계좌이체 안내</p>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-slate-700">
        <dt className="text-slate-500">은행</dt>
        <dd className="font-semibold">{account.bank}</dd>
        <dt className="text-slate-500">계좌번호</dt>
        <dd className="flex flex-wrap items-center gap-2">
          <span className="break-all font-semibold tabular-nums">{account.number}</span>
          <button type="button" onClick={() => void copyAccount()} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
            <Copy className="size-3.5" aria-hidden="true" />
            계좌번호 복사
          </button>
        </dd>
        <dt className="text-slate-500">예금주</dt>
        <dd className="font-semibold">{account.holder}</dd>
      </dl>
      <p className="leading-relaxed text-slate-600">
        {guest ? '접수 확인서의 수강료를 신청자 이름으로 입금해주세요. 대기·취소된 신청은 입금하지 마세요. 입금 후 담당자에게 접수번호와 입금자명을 알려주세요.' : forOrder
          ? '위의 남은 납부 금액을 신청자 이름으로 입금한 뒤, 아래에서 입금 확인을 요청해주세요.'
          : '먼저 수강신청을 접수한 뒤 주문 상세에서 납부 가능 여부와 금액을 확인하고, 신청자 이름으로 입금해주세요. 대기·취소된 신청은 입금하지 마세요.'}
      </p>
      <p className="text-xs leading-relaxed text-slate-500">담당자가 실제 입금을 확인한 뒤 결제 상태에 반영합니다. 카드·간편결제는 준비 중입니다.</p>
    </div>
  );
}
