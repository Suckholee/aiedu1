begin;
do $$
declare h public.lms_cohorts; u uuid; e uuid; first_u uuid; first_e uuid; o public.lms_orders; denied boolean:=false; occupied integer;
begin
 select * into strict h from public.lms_cohorts where legacy_course_id='ai-work-automation-1027';
 if h.capacity<>20 or h.reserved_seats<>7 or h.price_krw<>150000 then raise exception 'October catalog mismatch'; end if;
 select count(*) into occupied from public.lms_enrollments where cohort_id=h.id and status in ('applied','active','completed');
 -- Run while the real cohort is still a draft. Publication is temporary and rolled back.
 update public.lms_courses set published=true where id=h.course_id;
 update public.lms_cohorts set status='open' where id=h.id;
 for i in 1..(h.capacity-h.reserved_seats-occupied) loop
  u:=gen_random_uuid();
  insert into public.lms_profiles(id,display_name,email) values(u,'ROLLBACK ONLY verification','rollback-'||u::text||'@example.com');
  e:=public.lms_learning(jsonb_build_object('action','apply','cohort_id',h.id,'name','ROLLBACK ONLY verification','phone','01000000000','payment_method','무통장입금','note','Transaction-only enrollment test; never committed'),u);
  if i=1 then first_u:=u;first_e:=e;end if;
  select * into strict o from public.lms_orders where enrollment_id=e and status='pending';
  if o.amount_krw<>150000 then raise exception 'Order price mismatch'; end if;
  if exists(select 1 from public.lms_payments where order_id=o.id) then raise exception 'Unpaid order has receipt'; end if;
 end loop;
 if first_e is null then raise exception 'No test seat available'; end if;
 if public.lms_learning(jsonb_build_object('action','apply','cohort_id',h.id,'name','Retry','phone','01000000000'),first_u)<>first_e then raise exception 'Duplicate enrollment'; end if;
 u:=gen_random_uuid();insert into public.lms_profiles(id,display_name,email) values(u,'ROLLBACK ONLY overflow','rollback-'||u::text||'@example.com');
 begin
  perform public.lms_learning(jsonb_build_object('action','apply','cohort_id',h.id,'name','Overflow','phone','01000000000'),u);
 exception when raise_exception then
  if sqlerrm<>'정원이 마감되었습니다.' then raise;end if;denied:=true;
 end;
 if not denied then raise exception 'External seats oversold';end if;
 perform public.lms_learning(jsonb_build_object('action','status','id',first_e,'status','cancelled'),first_u);
 if (select status<>'cancelled' from public.lms_orders where enrollment_id=first_e) then raise exception 'Cancellation mismatch';end if;
 perform public.lms_learning(jsonb_build_object('action','apply','cohort_id',h.id,'name','Replacement','phone','01000000000'),u);
end $$;
rollback;
select 'PASS: October 27 enrollment, 150000 KRW orders, duplicate submission, 7 reserved seats, 13-seat limit, cancellation and replacement; ALL fixtures rolled back' as verification,
(select count(*) from public.lms_enrollments) as enrollments,
(select count(*) from public.lms_orders) as orders,
(select count(*) from public.lms_legacy_finance_records) as preserved_legacy;
