begin;
create table lms_private.guest_lookup_challenges (
 id uuid primary key, email text not null, code_hash text not null, ip_hash text not null,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '10 minutes',
 attempts integer not null default 0, verified_at timestamptz, session_hash text unique, session_expires_at timestamptz
);
alter table lms_private.guest_lookup_challenges enable row level security;
revoke all on lms_private.guest_lookup_challenges from public,anon,authenticated;
create index guest_lookup_email_time on lms_private.guest_lookup_challenges(email,created_at);
create index guest_lookup_ip_time on lms_private.guest_lookup_challenges(ip_hash,created_at);
create function public.lms_guest_lookup(command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare op text:=command->>'action'; challenge lms_private.guest_lookup_challenges; result jsonb;
begin
 if op='request' then
  perform pg_advisory_xact_lock(hashtext('lms.guest.lookup.request'));
  delete from lms_private.guest_lookup_challenges where created_at<now()-interval '1 day';
  if exists(select 1 from lms_private.guest_lookup_challenges where email=command->>'email' and created_at>now()-interval '60 seconds')
   or (select count(*) from lms_private.guest_lookup_challenges where email=command->>'email' and created_at>now()-interval '15 minutes')>=3
   or (select count(*) from lms_private.guest_lookup_challenges where ip_hash=command->>'ip_hash' and created_at>now()-interval '15 minutes')>=10
  then return jsonb_build_object('limited',true);end if;
  update lms_private.guest_lookup_challenges set expires_at=now() where email=command->>'email' and verified_at is null;
  insert into lms_private.guest_lookup_challenges(id,email,code_hash,ip_hash)
   values((command->>'id')::uuid,command->>'email',command->>'code_hash',command->>'ip_hash');
  return jsonb_build_object('sent',true);
 elsif op='verify' then
  select * into challenge from lms_private.guest_lookup_challenges where id=(command->>'id')::uuid for update;
  if not found or challenge.verified_at is not null or challenge.expires_at<=now() or challenge.attempts>=5 then return jsonb_build_object('verified',false);end if;
  update lms_private.guest_lookup_challenges set attempts=attempts+1 where id=challenge.id;
  if challenge.code_hash is distinct from command->>'code_hash' then return jsonb_build_object('verified',false);end if;
  update lms_private.guest_lookup_challenges set verified_at=now(),session_hash=command->>'session_hash',session_expires_at=now()+interval '30 minutes' where id=challenge.id;
  return jsonb_build_object('verified',true);
 elsif op in ('list','logout') then
  select * into challenge from lms_private.guest_lookup_challenges where session_hash=command->>'session_hash' and verified_at is not null and session_expires_at>now() for update;
  if not found then return jsonb_build_object('unauthorized',true);end if;
  if op='logout' then
   update lms_private.guest_lookup_challenges set session_hash=null,session_expires_at=now() where id=challenge.id;
   return jsonb_build_object('ok',true);
  end if;
  select coalesce(jsonb_agg(row_to_json(item) order by item.created_at desc),'[]'::jsonb) into result from (
   select o.id,coalesce(o.legacy_order_id,'LMS-'||upper(replace(o.id::text,'-',''))) as number,
    o.title,o.amount_krw,o.status,o.review_status,o.created_at,o.payment_method,
    e.status as enrollment_status,(o.enrollment_applied_at=e.applied_at) as current_application,
    h.starts_at,h.location,h.payment_guide,e.cohort_id,e.id as enrollment_id,
    coalesce((select sum(p.amount_krw) from public.lms_payments p where p.order_id=o.id),0) as received_krw,
    case when o.status='pending' then greatest(0,o.amount_krw-coalesce((select sum(p.amount_krw) from public.lms_payments p where p.order_id=o.id),0)) else 0 end as due_krw
   from public.lms_orders o join public.lms_enrollments e on e.id=o.enrollment_id join public.lms_cohorts h on h.id=e.cohort_id
   where lower(e.contact_email)=challenge.email and exists(select 1 from lms_private.guest_applications g where g.receipt->>'id'=o.id::text)
  ) item;
  return jsonb_build_object('orders',result,'expiresAt',challenge.session_expires_at);
 end if;
 raise exception '지원하지 않는 요청입니다.';
end $$;
revoke all on function public.lms_guest_lookup(jsonb) from public,anon,authenticated;
grant execute on function public.lms_guest_lookup(jsonb) to service_role;
insert into public.lms_schema_versions(version) values('202610200002');
commit;
