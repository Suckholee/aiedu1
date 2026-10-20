begin;
-- Guest records never attach to an existing account by an unverified email.
create table lms_private.guest_applications (
 request_id uuid primary key, payload jsonb not null, receipt jsonb not null
);
alter table lms_private.guest_applications enable row level security;
revoke all on lms_private.guest_applications from public,anon,authenticated;
create function public.lms_guest_application(command jsonb, request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare guest uuid; target uuid; application public.lms_enrollments; receipt jsonb; previous lms_private.guest_applications; purchase public.lms_orders;
begin
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 select * into previous from lms_private.guest_applications g where g.request_id=lms_guest_application.request_id;
 if found then
  if previous.payload<>command then raise exception '신청 정보가 변경되었습니다. 새로고침 후 다시 신청하세요.';end if;
  return previous.receipt;
 end if;
 insert into public.lms_profiles(display_name,email,phone,company)
 values(command->>'name',command->>'email',command->>'phone',command->>'company') returning id into guest;
 target:=public.lms_learning(command||jsonb_build_object('action','apply'),guest);
 select * into application from public.lms_enrollments where id=target;
 select * into purchase from public.lms_orders where enrollment_id=target and enrollment_applied_at=application.applied_at order by created_at desc limit 1;
 if purchase.id is null then raise exception '주문 생성에 실패했습니다.';end if;
 receipt:=jsonb_build_object('id',purchase.id,'orderId',coalesce(purchase.legacy_order_id,'LMS-'||upper(replace(purchase.id::text,'-',''))),'amount',purchase.amount_krw,'status',application.status,'paymentStatus','미결제','appliedAt',application.applied_at);
 insert into lms_private.guest_applications values(request_id,command,receipt);
 return receipt;
end $$;
revoke all on function public.lms_guest_application(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_guest_application(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610200001');
commit;
