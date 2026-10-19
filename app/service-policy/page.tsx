import type { Metadata } from 'next';
import Link from 'next/link';
import { merchant } from '@/lib/merchant';

export const metadata: Metadata = {
  title: '강의 제공 안내 | 네오앤피터 에듀플랫폼',
  description: '오프라인 강의의 제공 일시·장소, 신청·납부 확인, 수강 승인과 자료 이용 방법을 안내합니다.',
};

export default function ServicePolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-7 pb-12 leading-relaxed">
      <header className="space-y-3">
        <Link href="/courses" className="text-sm font-semibold text-indigo-700">← 교육과정 보기</Link>
        <p className="pt-3 text-sm font-semibold text-indigo-700">네오앤피터 에듀플랫폼</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">강의 제공 안내</h1>
        <p className="text-slate-600">현재 판매하는 오프라인 강의·특강의 제공 방법을 안내합니다.</p>
      </header>
      {[
        ['제공 방식과 배송비', '수강신청한 오프라인 강의를 교육과정 상세 화면에 안내된 장소에서 제공합니다. 실물 상품을 배송하지 않으며 배송비는 없습니다.'],
        ['제공 일시와 수강료', '각 과정 상세 화면에 표시된 강의 일시·시간·장소와 수강료를 확인한 뒤 신청해주세요. 강의는 해당 일정에 진행되며, 별도 유료 도구나 서비스 구독이 필요한 경우 과정의 준비물 안내에서 확인할 수 있습니다.'],
        ['신청·납부 확인과 수강 승인', '신청 접수, 납부 확인, 최종 수강 승인은 별도로 처리합니다. 신청 후 같은 계정의 ‘내 신청·결제 목록’에서 주문별 납부 안내와 처리 상태를 확인해주세요. 신청서 제출만으로 결제나 수강 승인이 완료되지는 않습니다.'],
        ['강의실과 자료 이용', '승인된 과정은 ‘내 강의실·학습 현황’에서 확인합니다. 강의 자료는 과정별 게시 일정과 수강 권한에 따라 제공되며, 해당 과정의 강의실과 자료실에서 이용할 수 있습니다.'],
      ].map(([title, text]) => <section key={title} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold">{title}</h2><p className="text-sm text-slate-600">{text}</p></section>)}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">취소·변경 및 문의</h2>
        <p className="text-sm text-slate-600">취소·일정 변경과 환불은 <Link href="/refund-policy" className="font-semibold text-indigo-700 underline">취소·환불 정책</Link>에 따라 처리합니다. 신청·수강 안내 또는 환불 접수는 아래 연락처로 문의하실 수 있습니다.</p>
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-indigo-700"><a href={merchant.phoneHref} className="underline">{merchant.phone}</a><a href={`mailto:${merchant.email}`} className="break-all underline">{merchant.email}</a></p>
      </section>
      <nav aria-label="수강 관련 메뉴" className="flex flex-wrap gap-4 text-sm font-semibold text-indigo-700"><Link href="/courses">교육과정 →</Link><Link href="/my-applications">내 신청·결제 목록 →</Link><Link href="/my-learning">내 강의실 →</Link></nav>
    </article>
  );
}
