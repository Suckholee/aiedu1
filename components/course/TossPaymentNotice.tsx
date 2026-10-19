import { CreditCard } from 'lucide-react';

/** Replace with the live Toss payment UI when server approval is connected. */
export function TossPaymentNotice() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm">
      <p className="flex items-center gap-2 font-bold text-indigo-950">
        <CreditCard className="size-5 shrink-0" aria-hidden="true" />
        토스페이먼츠 결제 준비 중
      </p>
      <p className="mt-2 leading-relaxed text-slate-600">
        현재는 수강신청만 접수되며 결제는 진행되지 않습니다.
        온라인 결제가 연결되면 토스페이먼츠 결제 화면에서 결제수단을 선택할 수 있습니다.
      </p>
    </div>
  );
}
