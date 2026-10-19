begin;
alter table public.lms_enrollments add column company text not null default '', add column learner_note text not null default '';
-- Keep the applied command unchanged and wrap it to preserve additional form fields.
alter function public.lms_learning(jsonb,uuid) rename to lms_learning_base;
create function public.lms_learning(command jsonb,actor uuid) returns uuid
language plpgsql security definer set search_path=''
as $$
declare target uuid; s public.lms_sessions;
begin
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 if command->>'action'='archive_session' and command->>'archived'='false' then
   select * into s from public.lms_sessions where id=(command->>'id')::uuid;
   if exists(select 1 from public.lms_sessions where cohort_id=s.cohort_id and id<>s.id and not archived and starts_at<s.ends_at and ends_at>s.starts_at) then raise exception '복원할 회차의 일정이 기존 회차와 겹칩니다.'; end if;
 end if;
 target:=public.lms_learning_base(command,actor);
 if command->>'action'='apply' then
   if length(coalesce(command->>'company',''))>200 or length(coalesce(command->>'note',''))>2000 then raise exception '소속 또는 신청 메모 길이를 확인하세요.'; end if;
   update public.lms_enrollments set company=coalesce(command->>'company',''),learner_note=coalesce(command->>'note','')
     where id=target and applied_at>=transaction_timestamp();
 end if;
 return target;
end $$;
revoke all on function public.lms_learning(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_learning(jsonb,uuid) to service_role;
grant select(company,learner_note) on public.lms_enrollments to authenticated;
insert into public.lms_schema_versions(version) values('202610190004');
commit;
