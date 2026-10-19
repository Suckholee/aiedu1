import Link from 'next/link';
import { refundPolicy } from '@/lib/lms/refund-policy';

export function RefundPolicyNotice() {
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
      <summary className="cursor-pointer font-semibold text-indigo-700">취소·환불 기준 확인 · 개강 전 전액 환불</summary>
      <p className="mt-3">{refundPolicy.scope}</p>
      <ul className="mt-2 space-y-1">
        {refundPolicy.rules.map(([when, amount]) => <li key={when}>{when}: {amount}</li>)}
      </ul>
      <p className="mt-3">{refundPolicy.sections[0].text}</p>
      <p className="mt-2">{refundPolicy.sections[1].text}</p>
      <p className="mt-2">{refundPolicy.sections[2].text}</p>
      <p className="mt-2">{refundPolicy.sections[3].text}</p>
      <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-indigo-700 underline underline-offset-4">전체 환불 정책 보기 (새 탭)</Link>
    </details>
  );
}
