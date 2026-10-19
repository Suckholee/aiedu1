begin;
alter table public.lms_profiles add column referral_code text unique;
create function lms_private.new_referral_code() returns text language plpgsql security definer set search_path='' as $$
declare code text;begin
 perform pg_advisory_xact_lock(hashtext('lms.referral.issue'));
 loop
  code:='NP-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  if not exists(select 1 from public.lms_profiles p where p.referral_code=code) then return code;end if;
 end loop;
end $$;
revoke all on function lms_private.new_referral_code() from public,anon,authenticated;
grant usage on schema lms_private to service_role;
grant execute on function lms_private.new_referral_code() to service_role;
update public.lms_profiles set referral_code=lms_private.new_referral_code() where referral_code is null;
alter table public.lms_profiles alter column referral_code set default lms_private.new_referral_code(),alter column referral_code set not null;
alter table public.lms_profiles add constraint referral_code_format check(referral_code ~ '^NP-[0-9A-F]{12}$');
create function lms_private.keep_referral_code() returns trigger language plpgsql set search_path='' as $$begin
 if new.referral_code is distinct from old.referral_code then raise exception '개인 추천코드는 변경할 수 없습니다.';end if;return new;
end $$;
create trigger keep_referral_code before update on public.lms_profiles for each row execute function lms_private.keep_referral_code();

create table public.lms_referrals (
 id uuid primary key default gen_random_uuid(),
 learner_id uuid not null references public.lms_profiles(id),
 referrer_id uuid not null references public.lms_profiles(id),
 enrollment_id uuid not null references public.lms_enrollments(id),
 order_id uuid not null unique references public.lms_orders(id),
 referral_code text not null,
 referrer_name text not null,
 created_at timestamptz not null default now(),
 check(learner_id<>referrer_id)
);
alter table public.lms_referrals enable row level security;
revoke all on public.lms_referrals from public,anon,authenticated;
grant select on public.lms_referrals to authenticated;
grant all on public.lms_referrals to service_role;
create policy own_application_referral on public.lms_referrals for select to authenticated
 using(learner_id=lms_private.profile_id() or lms_private.has_role(array['admin','operations','finance']));

-- Attribution, seat allocation and the order are committed together. Duplicate
-- requests cannot attach or change a referrer on an already-existing order.
alter function public.lms_learning(jsonb,uuid) rename to lms_learning_v9;
create function public.lms_learning(command jsonb,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid; code text:=upper(regexp_replace(coalesce(command->>'referral_code',''),'[[:space:]]','','g'));
 referrer public.lms_profiles; existing_current boolean; application public.lms_enrollments; target_order uuid; recorded_code text;
begin
 if command->>'action'<>'apply' then return public.lms_learning_v9(command,actor);end if;
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 if code ~ '^NP[0-9A-F]{12}$' then code:='NP-'||substr(code,3);end if;
 if code<>'' then
  select * into referrer from public.lms_profiles where referral_code=code and status='active' for share;
  if not found then raise exception '추천코드를 확인하세요.';end if;
  if referrer.id=actor then raise exception '본인의 추천코드는 사용할 수 없습니다.';end if;
 end if;
 select exists(select 1 from public.lms_enrollments where cohort_id=(command->>'cohort_id')::uuid and learner_id=actor and status not in ('rejected','cancelled','revoked')) into existing_current;
 target:=public.lms_learning_v9(command,actor);
 select * into application from public.lms_enrollments where id=target;
 select o.id into target_order from public.lms_orders o where o.enrollment_id=target and o.enrollment_applied_at=application.applied_at order by o.created_at desc limit 1;
 if existing_current then
  select r.referral_code into recorded_code from public.lms_referrals r where r.order_id=target_order;
  if code<>'' and code is distinct from recorded_code then raise exception '이미 접수된 신청의 추천인은 변경할 수 없습니다.';end if;
 elsif code<>'' then
  if target_order is null then raise exception '추천 정보를 연결할 주문을 확인하세요.';end if;
  insert into public.lms_referrals(learner_id,referrer_id,enrollment_id,order_id,referral_code,referrer_name)
   values(actor,referrer.id,target,target_order,code,referrer.display_name);
  insert into public.lms_audit_events(actor_id,action,entity_type,entity_id,details)
   values(actor,'referral.applied','order',target_order,jsonb_build_object('referrer_id',referrer.id,'referral_code',code));
 end if;
 return target;
end $$;
revoke all on function public.lms_learning(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_learning(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610190010');
commit;
