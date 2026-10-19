-- Runs only inside a rolled-back transaction. Never persists fixture members or courses.
begin;
do $$
declare staff uuid:=gen_random_uuid(); learner uuid:=gen_random_uuid(); course uuid:=gen_random_uuid(); cohort uuid:=gen_random_uuid(); e uuid; l uuid; s uuid;
begin
 insert into public.lms_profiles(id,display_name,email) values(staff,'Temporary LMS verifier','lms-verifier@example.com'),(learner,'Temporary learner','lms-learner@example.com');
 insert into public.lms_staff_members(profile_id,role) values(staff,'admin');
 insert into public.lms_courses(id,slug,title,published) values(course,'verify-'||course::text,'Temporary transaction fixture',true);
 insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,price_krw) values(cohort,course,'Transaction fixture','blended','open',1,25000);
 e:=public.lms_learning(jsonb_build_object('action','apply','cohort_id',cohort,'name','Temporary learner','phone','01000000000','company','Snapshot company','note','Snapshot note'),learner);
 if (select amount_krw<>25000 or company<>'Snapshot company' or learner_note<>'Snapshot note' from public.lms_enrollments where id=e) then raise exception 'Application snapshot mismatch'; end if;
 if public.lms_learning(jsonb_build_object('action','apply','cohort_id',cohort,'name','Duplicate','phone','01000000000'),learner)<>e then raise exception 'Duplicate enrollment'; end if;
 perform public.lms_learning(jsonb_build_object('action','status','id',e,'status','active'),staff);
 begin
  perform public.lms_learning(jsonb_build_object('action','status','id',e,'status','completed'),staff);
  raise exception using errcode='XX000',message='Premature completion accepted';
 exception when sqlstate 'P0001' then null;
 end;
 l:=public.lms_learning(jsonb_build_object('action','lesson','cohort_id',cohort,'title','Fixture lesson','position',0,'kind','document','required',true,'content_url','https://example.com/fixture'),staff);
 s:=public.lms_learning(jsonb_build_object('action','session','cohort_id',cohort,'title','Fixture session','starts_at','2026-10-20T09:00:00+09:00','ends_at','2026-10-20T10:00:00+09:00'),staff);
 perform public.lms_learning(jsonb_build_object('action','attendance_batch','session_id',s,'records',jsonb_build_array(jsonb_build_object('id',e,'status','present'))),staff);
 perform public.lms_learning(jsonb_build_object('action','progress','id',e,'lesson_id',l,'percent',100),learner);
 perform public.lms_learning(jsonb_build_object('action','status','id',e,'status','completed'),staff);
 if not exists(select 1 from public.lms_enrollments where id=e and status='completed') then raise exception 'Completion failed'; end if;
 if not exists(select 1 from public.lms_lesson_progress where enrollment_id=e and lesson_id=l and progress_percent=100) then raise exception 'Progress failed'; end if;
 if not exists(select 1 from public.lms_attendance where enrollment_id=e and session_id=s and status='present') then raise exception 'Attendance failed'; end if;
end $$;
rollback;
select 'PASS: hosted apply / approve / attendance / progress / completion; fixtures rolled back' as verification,
 (select max(version) from public.lms_schema_versions) as schema_version,
 (select count(*) from public.lms_profiles) as preserved_members,
 (select count(*) from public.lms_courses) as courses,
 (select count(*) from public.lms_enrollments) as enrollments;
