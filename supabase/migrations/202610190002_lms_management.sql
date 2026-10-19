begin;
alter table public.lms_profiles add column status text not null default 'active' check (status in ('active','suspended'));
alter table public.lms_profiles add column photo_url text;
alter table public.lms_profiles add column last_seen_at timestamptz;
alter table public.lms_profiles add column updated_at timestamptz not null default now();
alter table public.lms_courses add column subtitle text not null default '';
alter table public.lms_courses add column thumbnail text not null default '';
alter table public.lms_courses add column metadata jsonb not null default '{}';
alter table public.lms_courses add column updated_at timestamptz not null default now();
alter table public.lms_cohorts add column location text not null default '';
alter table public.lms_cohorts add column instructor_name text not null default '';
alter table public.lms_cohorts add column metadata jsonb not null default '{}';
alter table public.lms_cohorts add column updated_at timestamptz not null default now();

create table public.lms_migration_runs (
  id text primary key,
  source text not null,
  source_digest text not null,
  counts jsonb not null,
  verified_at timestamptz not null default now()
);
alter table public.lms_migration_runs enable row level security;
revoke all on public.lms_migration_runs from public, anon, authenticated;
grant all on public.lms_migration_runs to service_role;

create or replace function lms_private.profile_id() returns uuid
language sql stable security definer set search_path = ''
as $$ select id from public.lms_profiles where auth_user_id = (select auth.uid()) and status = 'active' $$;

-- Used only after the server verifies a Firebase token and Supabase session.
-- Firebase UID is the continuity proof; email alone never claims a legacy profile.
create function public.lms_link_identity(firebase_uid text, auth_id uuid, verified_email text, member_name text, avatar_url text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare member public.lms_profiles; result uuid;
begin
  perform pg_advisory_xact_lock(hashtext('lms.identity.' || firebase_uid));
  select * into member from public.lms_profiles where legacy_firebase_uid = firebase_uid for update;
  if found then
    if member.status <> 'active' then raise exception '이용이 중지된 회원입니다.'; end if;
    if member.auth_user_id is not null and member.auth_user_id <> auth_id then raise exception '회원 연결 정보가 일치하지 않습니다.'; end if;
    update public.lms_profiles set auth_user_id = auth_id, email = verified_email,
      display_name = case when member_name <> '' then member_name else display_name end,
      photo_url = avatar_url, last_seen_at = now(), updated_at = now() where id = member.id;
    result := member.id;
  else
    if exists(select 1 from public.lms_profiles where auth_user_id = auth_id) then raise exception '이미 연결된 계정입니다.'; end if;
    insert into public.lms_profiles(auth_user_id,legacy_firebase_uid,display_name,email,photo_url,last_seen_at)
      values(auth_id,firebase_uid,coalesce(nullif(member_name,''),'수강생'),verified_email,avatar_url,now()) returning id into result;
    insert into public.lms_audit_events(actor_id,action,entity_type,entity_id) values(result,'member.join','profile',result);
  end if;
  return result;
end $$;
revoke all on function public.lms_link_identity(text,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.lms_link_identity(text,uuid,text,text,text) to service_role;

-- All management commands are serialized so schedule and last-admin checks are atomic.
create function public.lms_manage(command jsonb, actor uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  op text := command->>'action';
  target uuid;
  staff boolean;
  admin boolean;
  previous_admin boolean;
  active_admins integer;
  start_at timestamptz;
  end_at timestamptz;
  member_status text;
begin
  perform pg_advisory_xact_lock(hashtext('lms.management'));
  select exists(select 1 from public.lms_staff_members s join public.lms_profiles p on p.id=s.profile_id
    where p.id=actor and p.status='active' and s.role='admin') into admin;
  select admin or exists(select 1 from public.lms_staff_members s join public.lms_profiles p on p.id=s.profile_id
    where p.id=actor and p.status='active' and s.role='operations') into staff;
  if not staff then raise exception '관리 권한이 필요합니다.'; end if;
  target := coalesce(nullif(command->>'id','')::uuid,gen_random_uuid());
  if op = 'course' then
    if command ? 'id' and not exists(select 1 from public.lms_courses where id=target) then raise exception '과정을 찾을 수 없습니다.'; end if;
    if length(trim(coalesce(command->>'title',''))) = 0 then raise exception '과정명을 입력하세요.'; end if;
    insert into public.lms_courses(id,slug,title,subtitle,description,category,level,published,thumbnail)
      values(target,command->>'slug',trim(command->>'title'),coalesce(command->>'subtitle',''),coalesce(command->>'description',''),
        coalesce(command->>'category',''),coalesce(command->>'level','입문'),coalesce((command->>'published')::boolean,false),coalesce(command->>'thumbnail',''))
      on conflict(id) do update set slug=excluded.slug,title=excluded.title,subtitle=excluded.subtitle,description=excluded.description,
        category=excluded.category,level=excluded.level,published=excluded.published,thumbnail=excluded.thumbnail,updated_at=now();
  elsif op = 'cohort' then
    if command ? 'id' and not exists(select 1 from public.lms_cohorts where id=target) then raise exception '기수를 찾을 수 없습니다.'; end if;
    start_at := nullif(command->>'starts_at','')::timestamptz;
    end_at := nullif(command->>'ends_at','')::timestamptz;
    if (start_at is null) <> (end_at is null) or (start_at is not null and end_at<=start_at) then raise exception '수업 시작·종료 시각을 확인하세요.'; end if;
    if command->>'delivery_mode' <> 'vod' and start_at is null then raise exception '수업 일정을 입력하세요.'; end if;
    if not exists(select 1 from public.lms_courses where id=(command->>'course_id')::uuid) then raise exception '과정을 선택하세요.'; end if;
    if exists(select 1 from public.lms_cohorts where id=target and course_id<>(command->>'course_id')::uuid) then raise exception '기수의 소속 과정은 변경할 수 없습니다.'; end if;
    if (command->>'capacity')::int < (select count(*) from public.lms_enrollments where cohort_id=target and status in ('applied','active','completed')) then raise exception '수강 인원보다 정원을 줄일 수 없습니다.'; end if;
    if command->>'status'<>'cancelled' and exists(select 1 from public.lms_cohorts c where c.id<>target and c.status<>'cancelled'
      and c.starts_at<end_at and c.ends_at>start_at and (
        (coalesce(command->>'location','')<>'' and c.location=command->>'location') or
        (coalesce(command->>'instructor_name','')<>'' and c.instructor_name=command->>'instructor_name')
      )) then raise exception '같은 강사 또는 장소의 수업 일정이 겹칩니다.'; end if;
    insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,starts_at,ends_at,capacity,price_krw,location,instructor_name)
      values(target,(command->>'course_id')::uuid,command->>'title',command->>'delivery_mode',command->>'status',start_at,end_at,
        (command->>'capacity')::int,(command->>'price_krw')::bigint,coalesce(command->>'location',''),coalesce(command->>'instructor_name',''))
      on conflict(id) do update set title=excluded.title,delivery_mode=excluded.delivery_mode,status=excluded.status,starts_at=excluded.starts_at,
        ends_at=excluded.ends_at,capacity=excluded.capacity,price_krw=excluded.price_krw,location=excluded.location,instructor_name=excluded.instructor_name,updated_at=now();
  elsif op in ('member','roles') then
    if not admin then raise exception '관리자 권한이 필요합니다.'; end if;
    select status into member_status from public.lms_profiles where id=target for update;
    if not found then raise exception '회원을 찾을 수 없습니다.'; end if;
    select exists(select 1 from public.lms_staff_members where profile_id=target and role='admin') into previous_admin;
    select count(distinct p.id) into active_admins from public.lms_profiles p join public.lms_staff_members s on s.profile_id=p.id where s.role='admin' and p.status='active';
    if op='roles' then
      if jsonb_typeof(command->'roles')<>'array' or exists(select 1 from jsonb_array_elements_text(command->'roles') v where v not in ('admin','operations','finance')) then raise exception '올바른 역할을 선택하세요.'; end if;
      if previous_admin and member_status='active' and active_admins<=1 and not (command->'roles' ? 'admin') then raise exception '마지막 관리자 권한은 해제할 수 없습니다.'; end if;
      delete from public.lms_staff_members where profile_id=target;
      insert into public.lms_staff_members(profile_id,role) select target,v from (select distinct jsonb_array_elements_text(command->'roles') as v) roles;
    else
      if previous_admin and member_status='active' and active_admins<=1 and command->>'status'='suspended' then raise exception '마지막 관리자는 중지할 수 없습니다.'; end if;
      update public.lms_profiles set display_name=command->>'display_name',phone=coalesce(command->>'phone',''),company=coalesce(command->>'company',''),status=command->>'status',updated_at=now() where id=target;
    end if;
  else raise exception '지원하지 않는 명령입니다.';
  end if;
  insert into public.lms_audit_events(actor_id,action,entity_type,entity_id)
    values(actor,'manage.'||op,op,target);
  return target;
end $$;
revoke all on function public.lms_manage(jsonb,uuid) from public, anon, authenticated;
grant execute on function public.lms_manage(jsonb,uuid) to service_role;

insert into public.lms_schema_versions(version) values ('202610190002');
commit;
