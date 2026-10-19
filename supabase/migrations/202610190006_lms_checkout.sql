begin;
alter table public.lms_cohorts add column payment_guide text not null default '' check(length(payment_guide)<=2000);
create table public.lms_payment_notices(
 id uuid primary key default gen_random_uuid(),order_id uuid not null unique references public.lms_orders(id),
 learner_id uuid not null references public.lms_profiles(id),depositor_name text not null check(length(depositor_name) between 1 and 200),
 amount_krw bigint not null check(amount_krw>0),paid_at timestamptz not null,note text not null default '' check(length(note)<=1000),created_at timestamptz not null default now()
);
alter table public.lms_payment_notices enable row level security;
revoke all on public.lms_payment_notices from public,anon,authenticated,service_role;
grant select on public.lms_payment_notices to authenticated,service_role;
create policy notice_read on public.lms_payment_notices for select to authenticated using(lms_private.has_role(array['admin','finance']) or exists(select 1 from public.lms_profiles p where p.id=learner_id and p.auth_user_id=auth.uid() and p.status='active'));
create function public.lms_checkout(command jsonb,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare action text:=command->>'action';o public.lms_orders;e public.lms_enrollments;n public.lms_payment_notices;target uuid;amount bigint;received bigint;
begin
 if not exists(select 1 from public.lms_profiles where id=actor and status='active') then raise exception '활성 회원이 필요합니다.';end if;
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 if action='payment_guide' then
  if not exists(select 1 from public.lms_staff_members where profile_id=actor and role in ('admin','operations','finance')) then raise exception '운영 권한이 필요합니다.';end if;
  if length(coalesce(command->>'guide',''))>2000 then raise exception '결제 안내는 2000자 이하로 입력하세요.';end if;
  update public.lms_cohorts set payment_guide=btrim(coalesce(command->>'guide','')) where id=(command->>'cohort_id')::uuid returning id into target;
  if target is null then raise exception '기수를 찾을 수 없습니다.';end if;
 elsif action='payment_notice' then
  select * into o from public.lms_orders where id=(command->>'order_id')::uuid for update;
  select * into e from public.lms_enrollments where id=o.enrollment_id;
  if e.id is null or e.learner_id<>actor then raise exception '본인 주문만 확인 요청할 수 있습니다.';end if;
  select * into n from public.lms_payment_notices where order_id=o.id;
  if n.id is not null then
   if n.depositor_name=btrim(command->>'depositor_name') and n.amount_krw=(command->>'amount_krw')::bigint and n.paid_at=(command->>'paid_at')::timestamptz and n.note=btrim(coalesce(command->>'note','')) then return n.id;end if;
   raise exception '이미 입금 확인을 요청했습니다. 변경 사항은 담당자에게 알려주세요.';
  end if;
  if o.enrollment_applied_at<>e.applied_at or e.status not in ('applied','active','completed') or o.status<>'pending' or o.review_status<>'verified' then raise exception '현재 결제 가능한 신청이 아닙니다.';end if;
  select coalesce(sum(amount_krw),0) into received from public.lms_payments where order_id=o.id;
  amount:=(command->>'amount_krw')::bigint;
  if amount is null or amount<=0 or amount>o.amount_krw-received then raise exception '미수납 금액 이내로 입력하세요.';end if;
  if length(btrim(coalesce(command->>'depositor_name',''))) not between 1 and 200 or length(coalesce(command->>'note',''))>1000 or (command->>'paid_at')::timestamptz is null or (command->>'paid_at')::timestamptz>now()+interval '5 minutes' then raise exception '실제 입금자명과 입금일을 확인하세요.';end if;
  insert into public.lms_payment_notices(order_id,learner_id,depositor_name,amount_krw,paid_at,note) values(o.id,actor,btrim(command->>'depositor_name'),amount,(command->>'paid_at')::timestamptz,btrim(coalesce(command->>'note',''))) returning id into target;
 else raise exception '지원하지 않는 명령입니다.';
 end if;
 insert into public.lms_audit_events(actor_id,action,entity_type,entity_id,details) values(actor,action,case when action='payment_guide' then 'cohort' else 'payment_notice' end,target,jsonb_build_object('action',action));
 return target;
end $$;
revoke all on function public.lms_checkout(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_checkout(jsonb,uuid) to service_role;
-- Keep historical paid orders intact. Cancel unused orders when their application is cancelled/rejected.
alter function public.lms_learning(jsonb,uuid) rename to lms_learning_v5;
create function public.lms_learning(command jsonb,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid;begin
 target:=public.lms_learning_v5(command,actor);
 if command->>'action'='status' and command->>'status' in ('cancelled','rejected','revoked') then
  update public.lms_orders o set status='cancelled' from public.lms_enrollments e where e.id=target and o.enrollment_id=e.id and o.enrollment_applied_at=e.applied_at and o.status='pending' and not exists(select 1 from public.lms_payments p where p.order_id=o.id) and not exists(select 1 from public.lms_settlement_lines l where l.order_id=o.id);
 end if;return target;
end $$;
revoke all on function public.lms_learning(jsonb,uuid) from public,anon,authenticated;grant execute on function public.lms_learning(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610190006');
commit;
