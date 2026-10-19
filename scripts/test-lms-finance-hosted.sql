begin;
do $$
declare a uuid:=gen_random_uuid(); u uuid:=gen_random_uuid(); c uuid:=gen_random_uuid(); h uuid:=gen_random_uuid(); e uuid; o uuid; p uuid; r uuid; s uuid; d uuid;
begin
 insert into public.lms_profiles(id,display_name,email) values(a,'Temporary finance verifier','finance-verifier@example.com'),(u,'Temporary learner','finance-learner@example.com');
 insert into public.lms_staff_members(profile_id,role) values(a,'finance');
 insert into public.lms_courses(id,slug,title,published) values(c,'finance-check-'||c::text,'Temporary finance fixture',true);
 insert into public.lms_cohorts(id,course_id,title,delivery_mode,status,capacity,price_krw) values(h,c,'Transaction fixture','vod','open',1,100000);
 e:=public.lms_learning(jsonb_build_object('action','apply','cohort_id',h,'name','Temporary learner','phone','01000000000'),u);
 select id into o from public.lms_orders where enrollment_id=e;
 if o is null then raise exception 'No automatic order'; end if;
 p:=public.lms_finance(jsonb_build_object('action','payment','order_id',o,'amount_krw',100000,'reference','rollback-payment-'||o,'method','계좌이체','paid_at',now()),a);
 s:=public.lms_finance(jsonb_build_object('action','settlement_confirm','order_ids',jsonb_build_array(o),'payee_name','Temporary instructor','share_bps',7000,'tax_bps',330,'idempotency_key',gen_random_uuid()),a);
 r:=public.lms_finance(jsonb_build_object('action','refund_request','payment_id',p,'amount_krw',40000,'reason','Temporary rollback check','idempotency_key',gen_random_uuid(),'revoke_access',true),u);
 perform public.lms_finance(jsonb_build_object('action','refund_result','id',r,'status','succeeded','reference','rollback-refund-'||r),a);
 d:=public.lms_finance(jsonb_build_object('action','settlement_confirm','order_ids',jsonb_build_array(o),'payee_name','Temporary instructor','share_bps',7000,'tax_bps',330,'idempotency_key',gen_random_uuid()),a);
 if (select gross_krw<>70000 from public.lms_settlements where id=s) or (select gross_krw<>-28000 from public.lms_settlements where id=d) then raise exception 'Statement adjustment mismatch'; end if;
 if (select status<>'partially_refunded' from public.lms_orders where id=o) then raise exception 'Refund calculation mismatch'; end if;
end $$;
rollback;
select 'PASS: hosted enrollment/order/payment/refund/settlement adjustment; all fixtures rolled back' as verification,
 (select max(version) from public.lms_schema_versions) as schema_version,
 (select count(*) from public.lms_profiles) as preserved_members,
 (select count(*) from public.lms_orders) as orders,
 (select count(*) from public.lms_payments) as payments,
 (select count(*) from pg_tables where schemaname='public' and tablename like 'lms_%' and rowsecurity) as rls_tables;
