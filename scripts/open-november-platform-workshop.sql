-- Run after the enrollment UI is deployed. Existing applications and orders stay intact.
begin;
do $$
declare actor uuid; c public.lms_courses; h public.lms_cohorts;
begin
 select p.id into strict actor from public.lms_profiles p join public.lms_staff_members s on s.profile_id=p.id where p.email='peter15975345@gmail.com' and p.status='active' and s.role='admin';
 select * into strict c from public.lms_courses where slug='my-platform-1102';
 select * into strict h from public.lms_cohorts where legacy_course_id='my-platform-1102' and course_id=c.id;
 if h.price_krw<>800000 or h.starts_at<>'2026-11-01T14:00:00+09:00'::timestamptz or h.ends_at<>'2026-11-08T18:00:00+09:00'::timestamptz then raise exception 'Review workshop details before opening'; end if;
 if (select count(*) from public.lms_sessions where cohort_id=h.id and not archived)<>2 then raise exception 'Two sessions are required'; end if;
 perform public.lms_manage(to_jsonb(c)||jsonb_build_object('action','course','published',true),actor);
 perform public.lms_manage(to_jsonb(h)||jsonb_build_object('action','cohort','status','open'),actor);
end $$;
commit;
select c.title,c.published,h.status,h.price_krw from public.lms_courses c join public.lms_cohorts h on h.course_id=c.id where c.slug='my-platform-1102';
