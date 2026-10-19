begin;
alter table public.lms_cohorts add column reserved_seats integer not null default 0 check(reserved_seats>=0 and (capacity is null or reserved_seats<=capacity));
comment on column public.lms_cohorts.reserved_seats is 'Legacy or external seats held separately from verified LMS enrollments; reduce when importing those learners.';
create or replace function public.lms_manage(command jsonb, actor uuid) returns uuid
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
    if (command->>'capacity')::int < coalesce((command->>'reserved_seats')::int,(select reserved_seats from public.lms_cohorts where id=target),0) + (select count(*) from public.lms_enrollments where cohort_id=target and status in ('applied','active','completed')) then raise exception '수강 인원보다 정원을 줄일 수 없습니다.'; end if;
    if command->>'status'<>'cancelled' and exists(select 1 from public.lms_cohorts c where c.id<>target and c.status<>'cancelled'
      and c.starts_at<end_at and c.ends_at>start_at and (
        (coalesce(command->>'location','')<>'' and c.location=command->>'location') or
        (coalesce(command->>'instructor_name','')<>'' and c.instructor_name=command->>'instructor_name')
      )) then raise exception '같은 강사 또는 장소의 수업 일정이 겹칩니다.'; end if;
    insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,starts_at,ends_at,capacity,reserved_seats,price_krw,location,instructor_name)
      values(target,(command->>'course_id')::uuid,command->>'title',command->>'delivery_mode',command->>'status',start_at,end_at,
        (command->>'capacity')::int,coalesce((command->>'reserved_seats')::int,(select reserved_seats from public.lms_cohorts where id=target),0),(command->>'price_krw')::bigint,coalesce(command->>'location',''),coalesce(command->>'instructor_name',''))
      on conflict(id) do update set title=excluded.title,delivery_mode=excluded.delivery_mode,status=excluded.status,starts_at=excluded.starts_at,
        ends_at=excluded.ends_at,capacity=excluded.capacity,reserved_seats=excluded.reserved_seats,price_krw=excluded.price_krw,location=excluded.location,instructor_name=excluded.instructor_name,updated_at=now();
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


create or replace function public.lms_learning_base(command jsonb, actor uuid) returns uuid
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
    if h.capacity is not null and occupied+h.reserved_seats>=h.capacity then raise exception '정원이 마감되었습니다.'; end if;
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
        if h.capacity is not null and occupied+h.reserved_seats>=h.capacity then raise exception '정원이 마감되었습니다.'; end if;
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

revoke all on function public.lms_learning_base(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_learning_base(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610190007');
commit;
