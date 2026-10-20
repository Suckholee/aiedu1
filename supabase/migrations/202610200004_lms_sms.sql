begin;
create table public.lms_sms_settings(id integer primary key check(id=1),enabled boolean not null default false,updated_at timestamptz not null default now());
insert into public.lms_sms_settings(id) values(1);
create table public.lms_sms_jobs(
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.lms_orders(id),
 kind text not null check(kind in ('application','payment_reminder')),dedupe_key text not null unique,
 status text not null default 'pending' check(status in ('pending','processing','accepted','failed','unknown','skipped')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 requested_by uuid references public.lms_profiles(id),provider_message_id text,message_text text,error_code text
);
alter table public.lms_sms_settings enable row level security;
alter table public.lms_sms_jobs enable row level security;
revoke all on public.lms_sms_settings,public.lms_sms_jobs from public,anon,authenticated;
grant select,update on public.lms_sms_settings to service_role;
grant select,update on public.lms_sms_jobs to service_role;
create function lms_private.queue_application_sms() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.enrollment_id is not null and new.legacy_record_id is null and exists(select 1 from public.lms_sms_settings where enabled) then
  insert into public.lms_sms_jobs(order_id,kind,dedupe_key) values(new.id,'application','application:'||new.id::text) on conflict(dedupe_key) do nothing;
 end if;return new;
end $$;
create trigger lms_application_sms after insert on public.lms_orders for each row execute function lms_private.queue_application_sms();
revoke all on function lms_private.queue_application_sms() from public,anon,authenticated;
create function public.lms_sms_queue(command jsonb,actor uuid) returns integer language plpgsql security definer set search_path='' as $$
declare target uuid; kind text:=command->>'kind'; added integer:=0; n integer;
begin
 if not exists(select 1 from public.lms_staff_members where profile_id=actor and role in ('admin','operations')) then raise exception '관리자·운영 권한이 필요합니다.';end if;
 if kind not in ('application','payment_reminder') or jsonb_array_length(command->'order_ids') not between 1 and 20 then raise exception '발송 종류와 대상(최대 20명)을 확인하세요.';end if;
 if not exists(select 1 from public.lms_sms_settings where enabled) then raise exception '문자 서비스 연결 후 발송을 활성화해주세요.';end if;
 perform pg_advisory_xact_lock(hashtext('lms.sms.queue'));
 for target in select value::uuid from jsonb_array_elements_text(command->'order_ids') loop
  if exists(select 1 from public.lms_orders o join public.lms_enrollments e on e.id=o.enrollment_id where o.id=target and o.enrollment_applied_at=e.applied_at and e.status in ('applied','active','completed') and o.status in ('pending','paid')
   and (kind='application' or o.status='pending' and o.review_status='verified' and o.amount_krw>(select coalesce(sum(amount_krw),0) from public.lms_payments where order_id=o.id)))
   and not exists(select 1 from public.lms_sms_jobs j where j.order_id=target and j.created_at>now()-interval '1 hour' and j.status in ('pending','processing','accepted','unknown')) then
   insert into public.lms_sms_jobs(order_id,kind,dedupe_key,requested_by) values(target,kind,kind||':'||target::text||case when kind='payment_reminder' then ':'||to_char(now() at time zone 'Asia/Seoul','YYYY-MM-DD') else '' end,actor) on conflict(dedupe_key) do nothing;
   get diagnostics n=row_count;added:=added+n;
  end if;
 end loop;return added;
end $$;
create function public.lms_sms_claim() returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.lms_sms_jobs;payload jsonb;
begin
 if not exists(select 1 from public.lms_sms_settings where enabled) then return null;end if;
 update public.lms_sms_jobs set status='unknown',error_code='interrupted_check_provider',updated_at=now() where status='processing' and updated_at<now()-interval '5 minutes';
 select * into job from public.lms_sms_jobs where status='pending' order by created_at for update skip locked limit 1;
 if not found then return null;end if;
 select jsonb_build_object('id',job.id,'order_id',o.id,'kind',job.kind,'name',e.contact_name,'phone',e.contact_phone,'title',o.title,'starts_at',h.starts_at,'location',h.location,
  'guest',p.auth_user_id is null,'number',coalesce(o.legacy_order_id,'LMS-'||upper(replace(o.id::text,'-',''))),
  'payable',o.status='pending' and o.review_status='verified' and o.amount_krw>coalesce((select sum(amount_krw) from public.lms_payments where order_id=o.id),0),
  'due',greatest(0,o.amount_krw-coalesce((select sum(amount_krw) from public.lms_payments where order_id=o.id),0))) into payload
 from public.lms_orders o join public.lms_enrollments e on e.id=o.enrollment_id join public.lms_profiles p on p.id=e.learner_id join public.lms_cohorts h on h.id=e.cohort_id
 where o.id=job.order_id and o.enrollment_applied_at=e.applied_at and e.status in ('applied','active','completed') and o.status in ('pending','paid');
 if payload is null or job.created_at<now()-interval '1 day' or (job.kind='payment_reminder' and not (payload->>'payable')::boolean) then
  update public.lms_sms_jobs set status='skipped',updated_at=now(),error_code='not_current_or_payable' where id=job.id;return jsonb_build_object('skipped',true);
 end if;
 update public.lms_sms_jobs set status='processing',updated_at=now() where id=job.id;
 return payload;
end $$;
revoke all on function public.lms_sms_queue(jsonb,uuid),public.lms_sms_claim() from public,anon,authenticated;
grant execute on function public.lms_sms_queue(jsonb,uuid),public.lms_sms_claim() to service_role;
insert into public.lms_schema_versions(version) values('202610200004');
commit;
