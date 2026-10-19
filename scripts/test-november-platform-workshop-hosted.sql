-- Transaction-only production verification. All fixture changes are rolled back.
begin;
do $$
declare cohort public.lms_cohorts; learner uuid:=gen_random_uuid(); enrollment uuid; duplicate uuid; orders_before bigint; applications_before bigint; command jsonb;
begin
 select * into strict cohort from public.lms_cohorts where legacy_course_id='my-platform-1102';
 if cohort.price_krw<>800000 or cohort.starts_at<>'2026-11-01T14:00:00+09:00'::timestamptz or cohort.ends_at<>'2026-11-08T18:00:00+09:00'::timestamptz then raise exception 'Workshop schedule or price mismatch'; end if;
 if (select count(*) from public.lms_sessions where cohort_id=cohort.id and not archived and (starts_at,ends_at) in (('2026-11-01T14:00:00+09:00'::timestamptz,'2026-11-01T18:00:00+09:00'::timestamptz),('2026-11-08T14:00:00+09:00'::timestamptz,'2026-11-08T18:00:00+09:00'::timestamptz)))<>2 then raise exception 'Session schedule mismatch'; end if;
 select count(*) into orders_before from public.lms_orders;
 select count(*) into applications_before from public.lms_enrollments;
 insert into public.lms_profiles(id,display_name,email,status) values(learner,'Temporary workshop verification','temporary-workshop-'||learner::text||'@example.com','active');
 update public.lms_courses set published=true where id=cohort.course_id;
 update public.lms_cohorts set status='open' where id=cohort.id;
 command:=jsonb_build_object('action','apply','cohort_id',cohort.id,'name','Temporary workshop verification','phone','01000000000','payment_method','무통장입금');
 enrollment:=public.lms_learning(command,learner);duplicate:=public.lms_learning(command,learner);
 if enrollment<>duplicate then raise exception 'Repeated application created a duplicate'; end if;
 if not exists(select 1 from public.lms_orders where enrollment_id=enrollment and amount_krw=800000 and status='pending' and payment_method='무통장입금') then raise exception 'Pending order mismatch'; end if;
 if (select count(*) from public.lms_orders)<>orders_before+1 or (select count(*) from public.lms_enrollments)<>applications_before+1 then raise exception 'Unexpected application or order mutation'; end if;
 if exists(select 1 from public.lms_payments where order_id in (select id from public.lms_orders where enrollment_id=enrollment)) then raise exception 'Application fabricated a payment'; end if;
end $$;
rollback;
select 'PASS: schedule, 800000 KRW pending bank order, duplicate prevention; temporary learner/application/order rolled back' result;
