begin;
do $$
declare a uuid:=gen_random_uuid();u uuid:=gen_random_uuid();c uuid:=gen_random_uuid();h uuid:=gen_random_uuid();e uuid;o uuid;n uuid;
begin
 insert into public.lms_profiles(id,display_name,email) values(a,'Temporary checkout verifier','checkout-check@example.com'),(u,'Temporary learner','checkout-learner@example.com');
 insert into public.lms_staff_members(profile_id,role) values(a,'admin');
 insert into public.lms_courses(id,slug,title,published) values(c,'checkout-check-'||c::text,'Temporary transaction fixture',true);
 insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,price_krw) values(h,c,'Temporary checkout','vod','open',2,25000);
 perform public.lms_checkout(jsonb_build_object('action','payment_guide','cohort_id',h,'guide','Temporary verification guide'),a);
 e:=public.lms_learning(jsonb_build_object('action','apply','cohort_id',h,'name','Temporary learner','phone','01000000000'),u);
 select id into o from public.lms_orders where enrollment_id=e;
 n:=public.lms_checkout(jsonb_build_object('action','payment_notice','order_id',o,'depositor_name','Temporary learner','amount_krw',25000,'paid_at',now(),'note','Rollback verification'),u);
 if (select status<>'pending' from public.lms_orders where id=o) or exists(select 1 from public.lms_payments where order_id=o) then raise exception 'Notice created receipt';end if;
 if n is null then raise exception 'No notice';end if;
 perform public.lms_learning(jsonb_build_object('action','status','id',e,'status','cancelled'),u);
 if (select status<>'cancelled' from public.lms_orders where id=o) then raise exception 'Cancelled application still payable';end if;
end $$;
rollback;
select 'PASS: hosted guide, enrollment, order, notice and cancellation; fixtures rolled back' as verification,
 (select max(version) from public.lms_schema_versions) as schema_version,
 (select count(*) from public.lms_profiles) as members,
 (select count(*) from public.lms_legacy_finance_records) as preserved_legacy,
 (select count(*) from public.lms_orders) as orders,
 (select count(*) from public.lms_payment_notices) as notices;
