import type { Metadata } from 'next';
import Link from 'next/link';
import { refundPolicy } from '@/lib/lms/refund-policy';
import { merchant } from '@/lib/merchant';

export const metadata: Metadata = {
  title: '취소·환불 정책 | 네오앤피터 에듀플랫폼',
  description: '네오앤피터 오프라인 강의·특강의 취소·환불 기준, 신청 방법 및 처리기한을 안내합니다.',
};

export default function RefundPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-7 pb-12 leading-relaxed">
      <header className="space-y-3">
        <Link href="/courses" className="text-sm font-semibold text-indigo-700">← 교육과정 보기</Link>
        <p className="pt-3 text-sm font-semibold text-indigo-700">네오앤피터 에듀플랫폼</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">취소·환불 정책</h1>
        <p className="text-slate-600">{refundPolicy.scope}</p>
        <p className="text-sm text-slate-500">시행일: {refundPolicy.effectiveDate}</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-labelledby="refund-rules">
        <h2 id="refund-rules" className="px-5 py-4 text-lg font-bold sm:px-6">수강생 개인 사유로 취소하는 경우</h2>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">환불 요청 접수 시점별 수강료 반환 기준</caption>
          <thead className="bg-slate-50 text-slate-600"><tr><th scope="col" className="w-1/2 px-5 py-3 sm:px-6">요청 시점</th><th scope="col" className="px-5 py-3 sm:px-6">환불금액</th></tr></thead>
          <tbody>{refundPolicy.rules.map(([when, amount]) => <tr key={when} className="border-t border-slate-100"><th scope="row" className="px-5 py-4 font-medium sm:px-6">{when}</th><td className="px-5 py-4 sm:px-6">{amount}</td></tr>)}</tbody>
        </table>
      </section>

      {refundPolicy.sections.map(section => <section key={section.title} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold">{section.title}</h2><p className="text-sm text-slate-600">{section.text}</p></section>)}

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold">환불 접수·문의 연락처</h2><p className="text-sm text-slate-600">온라인 환불 요청 또는 아래 연락처로 접수해주세요.</p><p className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-indigo-700"><a href={merchant.phoneHref} className="underline">{merchant.phone}</a><a href={`mailto:${merchant.email}`} className="break-all underline">{merchant.email}</a></p></section>

      <nav aria-label="환불 관련 메뉴" className="flex flex-wrap gap-4 text-sm font-semibold text-indigo-700">
        <Link href="/my-learning#billing">내 강의실에서 환불 요청하기 →</Link>
        <Link href="/my-applications">내 신청·결제 목록 →</Link>
        <Link href="/service-policy">강의 제공 안내 →</Link>
      </nav>
    </article>
  );
}
