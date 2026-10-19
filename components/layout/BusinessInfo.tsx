import { merchant } from '@/lib/merchant';

export function BusinessInfo({ className = '' }: { className?: string }) {
  return (
    <div aria-label="판매자 사업자 정보" className={`text-xs leading-6 ${className}`}>
      <dl className="flex flex-wrap gap-x-5 gap-y-1">
        <div className="flex gap-2"><dt>상호명</dt><dd>{merchant.name}</dd></div>
        <div className="flex gap-2"><dt>대표자</dt><dd>{merchant.representative}</dd></div>
        <div className="flex gap-2"><dt>사업자등록번호</dt><dd>{merchant.registrationNumber}</dd></div>
        <div className="flex basis-full gap-2"><dt className="shrink-0">사업장 주소</dt><dd>{merchant.address}</dd></div>
        <div className="flex gap-2"><dt>대표전화</dt><dd><a href={merchant.phoneHref} className="underline underline-offset-4">{merchant.phone}</a></dd></div>
        <div className="flex min-w-0 gap-2"><dt className="shrink-0">이메일</dt><dd className="min-w-0 break-all"><a href={`mailto:${merchant.email}`} className="underline underline-offset-4">{merchant.email}</a></dd></div>
      </dl>
    </div>
  );
}
