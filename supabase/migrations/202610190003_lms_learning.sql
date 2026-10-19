begin;
alter table public.lms_enrollments
  add column contact_name text not null default '',
  add column contact_email text not null default '',
  add column contact_phone text not null default '',
  add column amount_krw bigint not null default 0 check(amount_krw>=0),
  add column notes jsonb not null default '[]' check(jsonb_typeof(notes)='array'),
  add column legacy_payload jsonb not null default '{}',
  add column updated_at timestamptz not null default now();
alter table public.lms_lessons
  add column legacy_material_id text unique,
  add column content_url text not null default '',
  add column archived boolean not null default false;
alter table public.lms_sessions add column archived boolean not null default false;
alter table public.lms_attendance add column recorded_by uuid references public.lms_profiles(id), add column note text not null default '';
alter table public.lms_lesson_progress add column updated_at timestamptz not null default now(), add column recorded_by uuid references public.lms_profiles(id);
alter table public.lms_audit_events add column details jsonb not null default '{}';
-- Content URLs are private. Public curriculum metadata is served through the app DTO.
revoke select on public.lms_lessons from anon, authenticated;
grant select(id,cohort_id,title,position,kind,required,legacy_material_id,archived) on public.lms_lessons to anon,authenticated;

create function public.lms_learning(command jsonb, actor uuid) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
  op text:=command->>'action'; staff boolean; target uuid; cohort uuid;
  p public.lms_profiles; h public.lms_cohorts; e public.lms_enrollments;
  occupied integer; next_status text; item jsonb; changed integer; previous text;
begin
  -- Share the lock with cohort capacity edits; every seat mutation uses this transaction.
  perform pg_advisory_xact_lock(hashtext('lms.management'));
  select * into p from public.lms_profiles where id=actor and status='active' for share;
  if not found then raise exception '활성 회원으로 로그인하세요.'; end if;
  select exists(select 1 from public.lms_staff_members where profile_id=actor and role in ('admin','operations')) into staff;
  if op='apply' then
    cohort:=(command->>'cohort_id')::uuid;
    select * into h from public.lms_cohorts where id=cohort for update;
    if not found or h.status<>'open' or not exists(select 1 from public.lms_courses where id=h.course_id and published) then raise exception '신청 가능한 기수가 아닙니다.'; end if;
    if p.email is null or p.email='' then raise exception '이메일이 확인된 계정이 필요합니다.'; end if;
    if length(trim(coalesce(command->>'name','')))=0 or length(coalesce(command->>'phone','')) not between 8 and 30 then raise exception '이름과 연락처를 입력하세요.'; end if;
    select * into e from public.lms_enrollments where cohort_id=cohort and learner_id=actor for update;
    if found and e.status not in ('rejected','cancelled','revoked') then return e.id; end if;
    select count(*) into occupied from public.lms_enrollments where cohort_id=cohort and status in ('applied','active','completed');
    if h.capacity is not null and occupied>=h.capacity then raise exception '정원이 마감되었습니다.'; end if;
    target:=coalesce(e.id,gen_random_uuid());
    insert into public.lms_enrollments(id,cohort_id,learner_id,contact_name,contact_email,contact_phone,amount_krw)
      values(target,cohort,actor,trim(command->>'name'),lower(p.email),command->>'phone',h.price_krw)
      on conflict(id) do update set status='applied',applied_at=now(),updated_at=now(),access_until=null,
        contact_name=excluded.contact_name,contact_email=excluded.contact_email,contact_phone=excluded.contact_phone,amount_krw=excluded.amount_krw;
  elsif op in ('status','note','attendance','attendance_batch','progress','access') then
    if op='attendance_batch' then
      if not staff then raise exception '교육 운영 권한이 필요합니다.'; end if;
      if jsonb_typeof(command->'records') is distinct from 'array' or jsonb_array_length(command->'records') not between 1 and 200 then raise exception '출결은 1~200명씩 저장하세요.'; end if;
      for item in select value from jsonb_array_elements(command->'records') loop
        perform public.lms_learning(jsonb_build_object('action','attendance','id',item->>'id','session_id',command->>'session_id','status',item->>'status','note',coalesce(item->>'note','')),actor);
      end loop;
      return (command->>'session_id')::uuid;
    end if;
    target:=(command->>'id')::uuid;
    select * into e from public.lms_enrollments where id=target for update;
    if not found then raise exception '수강신청 내역을 찾을 수 없습니다.'; end if;
    cohort:=e.cohort_id;
    select * into h from public.lms_cohorts where id=cohort for update;
    if not staff and (e.learner_id<>actor or op not in ('status','progress')) then raise exception '접근 권한이 없습니다.'; end if;
    if op='status' then
      next_status:=command->>'status';previous:=e.status;
      if not staff and (next_status<>'cancelled' or e.status not in ('applied','waitlisted')) then raise exception '신청 대기 중에만 직접 취소할 수 있습니다.'; end if;
      if not ((e.status='applied' and next_status in ('active','waitlisted','rejected','cancelled'))
        or(e.status='waitlisted' and next_status in ('active','rejected','cancelled'))
        or(e.status='active' and next_status in ('completed','revoked','cancelled'))
        or(e.status='completed' and next_status='revoked')) then raise exception '허용되지 않는 상태 변경입니다.'; end if;
      if next_status='active' then
        if h.status in ('draft','cancelled') then raise exception '운영 중인 기수만 승인할 수 있습니다.'; end if;
        select count(*) into occupied from public.lms_enrollments where cohort_id=cohort and id<>target and status in ('applied','active','completed');
        if h.capacity is not null and occupied>=h.capacity then raise exception '정원이 마감되었습니다.'; end if;
      end if;
      if next_status='completed' and (
        not exists(select 1 from public.lms_lessons where cohort_id=cohort and required and not archived)
        and not exists(select 1 from public.lms_sessions where cohort_id=cohort and not archived)
        or exists(select 1 from public.lms_lessons l where l.cohort_id=cohort and l.required and not l.archived and not exists(select 1 from public.lms_lesson_progress r where r.enrollment_id=target and r.lesson_id=l.id and r.progress_percent=100))
        or exists(select 1 from public.lms_sessions s where s.cohort_id=cohort and not s.archived and not exists(select 1 from public.lms_attendance a where a.enrollment_id=target and a.session_id=s.id and a.status in ('present','late','excused')))
      ) then raise exception '필수 차시 완료와 모든 회차 출석·지각·공결을 확인하세요.'; end if;
      update public.lms_enrollments set status=next_status,updated_at=now() where id=target;
    elsif op='note' then
      if length(trim(coalesce(command->>'note',''))) not between 1 and 2000 then raise exception '메모를 입력하세요.'; end if;
      update public.lms_enrollments set notes=notes||jsonb_build_array(jsonb_build_object('at',now(),'actor',actor,'text',command->>'note')),updated_at=now() where id=target;
    elsif op='access' then
      update public.lms_enrollments set access_until=(command->>'access_until')::timestamptz,updated_at=now() where id=target;
    elsif op='attendance' then
      if not staff then raise exception '교육 운영 권한이 필요합니다.'; end if;
      if e.status not in ('active','completed') then raise exception '승인된 수강생만 출결을 기록할 수 있습니다.'; end if;
      if not exists(select 1 from public.lms_sessions where id=(command->>'session_id')::uuid and cohort_id=cohort and not archived) then raise exception '해당 기수의 수업 회차를 선택하세요.'; end if;
      if coalesce(command->>'status','') not in ('present','late','absent','excused') then raise exception '출결 상태를 확인하세요.'; end if;
      insert into public.lms_attendance(enrollment_id,session_id,cohort_id,status,recorded_by,note)
        values(target,(command->>'session_id')::uuid,cohort,command->>'status',actor,coalesce(command->>'note',''))
        on conflict(enrollment_id,session_id) do update set status=excluded.status,recorded_at=now(),recorded_by=actor,note=excluded.note;
    elsif op='progress' then
      if e.status not in ('active','completed') or (not staff and e.access_until<=now()) then raise exception '유효한 수강권이 필요합니다.'; end if;
      if not exists(select 1 from public.lms_lessons where id=(command->>'lesson_id')::uuid and cohort_id=cohort and not archived) then raise exception '해당 기수의 학습 차시를 선택하세요.'; end if;
      if (command->>'percent') is null or (command->>'percent')::int not between 0 and 100 then raise exception '진도는 0~100으로 입력하세요.'; end if;
      if not staff and exists(select 1 from public.lms_lessons where id=(command->>'lesson_id')::uuid and kind='quiz') then raise exception '평가 진도는 담당자가 확인합니다.'; end if;
      insert into public.lms_lesson_progress(enrollment_id,lesson_id,cohort_id,progress_percent,completed_at,recorded_by)
        values(target,(command->>'lesson_id')::uuid,cohort,(command->>'percent')::int,case when (command->>'percent')::int=100 then now() end,actor)
        on conflict(enrollment_id,lesson_id) do update set progress_percent=case when staff then excluded.progress_percent else greatest(lms_lesson_progress.progress_percent,excluded.progress_percent) end,
          completed_at=case when (staff and excluded.progress_percent<100) then null when excluded.progress_percent=100 then coalesce(lms_lesson_progress.completed_at,now()) else lms_lesson_progress.completed_at end,updated_at=now(),recorded_by=actor;
    end if;
  elsif op in ('session','lesson','archive_session','archive_lesson') then
    if not staff then raise exception '교육 운영 권한이 필요합니다.'; end if;
    cohort:=(command->>'cohort_id')::uuid;target:=coalesce((command->>'id')::uuid,gen_random_uuid());
    if not exists(select 1 from public.lms_cohorts where id=cohort) then raise exception '기수를 선택하세요.'; end if;
    if op in ('session','archive_session') then
      if exists(select 1 from public.lms_sessions where id=target and cohort_id<>cohort) then raise exception '소속 기수는 변경할 수 없습니다.'; end if;
      if op='archive_session' then
        update public.lms_sessions set archived=coalesce((command->>'archived')::boolean,true) where id=target and cohort_id=cohort;
      else
        if length(trim(coalesce(command->>'title','')))=0 or (command->>'starts_at') is null or (command->>'ends_at') is null or (command->>'ends_at')::timestamptz<=(command->>'starts_at')::timestamptz then raise exception '회차 제목과 일정을 확인하세요.'; end if;
        if exists(select 1 from public.lms_sessions where cohort_id=cohort and id<>target and not archived and starts_at<(command->>'ends_at')::timestamptz and ends_at>(command->>'starts_at')::timestamptz) then raise exception '같은 기수의 회차 일정이 겹칩니다.'; end if;
        insert into public.lms_sessions(id,cohort_id,title,starts_at,ends_at,location) values(target,cohort,command->>'title',(command->>'starts_at')::timestamptz,(command->>'ends_at')::timestamptz,coalesce(command->>'location',''))
          on conflict(id) do update set title=excluded.title,starts_at=excluded.starts_at,ends_at=excluded.ends_at,location=excluded.location;
      end if;
    else
      if exists(select 1 from public.lms_lessons where id=target and cohort_id<>cohort) then raise exception '소속 기수는 변경할 수 없습니다.'; end if;
      if op='archive_lesson' then
        update public.lms_lessons set archived=coalesce((command->>'archived')::boolean,true) where id=target and cohort_id=cohort;
      else
        if length(trim(coalesce(command->>'title','')))=0 then raise exception '차시 제목을 입력하세요.'; end if;
        if coalesce(command->>'content_url','')<>'' and not (command->>'content_url' ~ '^https?://' or command->>'content_url' ~ '^/[^/]') then raise exception '학습 자료 링크를 확인하세요.'; end if;
        insert into public.lms_lessons(id,cohort_id,title,position,kind,required,content_url)
          values(target,cohort,command->>'title',(command->>'position')::int,command->>'kind',coalesce((command->>'required')::boolean,true),coalesce(command->>'content_url',''))
          on conflict(id) do update set title=excluded.title,position=excluded.position,kind=excluded.kind,required=excluded.required,content_url=excluded.content_url;
      end if;
    end if;
    get diagnostics changed=row_count;
    if changed=0 then raise exception '기록을 찾을 수 없습니다.'; end if;
  else raise exception '지원하지 않는 명령입니다.';
  end if;
  insert into public.lms_audit_events(actor_id,action,entity_type,entity_id,details)
    values(actor,'learning.'||op,op,target,jsonb_build_object('cohort_id',cohort,'previous_status',previous,'status',command->>'status'));
  return target;
end $$;
revoke all on function public.lms_learning(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_learning(jsonb,uuid) to service_role;
-- Operational notes and raw migration payloads stay server-only.
revoke select on public.lms_enrollments from authenticated;
grant select(id,legacy_id,cohort_id,learner_id,status,access_until,applied_at,contact_name,contact_email,contact_phone,amount_krw,updated_at) on public.lms_enrollments to authenticated;
insert into public.lms_schema_versions(version) values('202610190003');
commit;
