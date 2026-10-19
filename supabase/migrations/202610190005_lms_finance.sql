begin;
alter table public.lms_orders alter column enrollment_id drop not null;
alter table public.lms_orders add column enrollment_applied_at timestamptz, add column title text not null default '',
 add column customer_name text not null default '', add column customer_email text not null default '', add column customer_phone text not null default '', add column company text not null default '',
 add column review_status text not null default 'verified' check(review_status in ('needs_review','verified')), add column review_reference text not null default '',
 add column payment_method text not null default '', add column application_details jsonb not null default '{}';
create unique index lms_one_live_order_per_application on public.lms_orders(enrollment_id,enrollment_applied_at) where status<>'cancelled';
alter table public.lms_payments add column method text not null default '', add column evidence_reference text not null default '', add column recorded_by uuid references public.lms_profiles(id);
alter table public.lms_refunds add column result_reference text not null default '', add column completed_at timestamptz, add column recorded_by uuid references public.lms_profiles(id), add column revoke_access boolean not null default true;
create table public.lms_finance_imports(
 id uuid primary key default gen_random_uuid(), source text not null, source_digest text not null unique, payload jsonb not null,
 imported_by uuid not null references public.lms_profiles(id), created_at timestamptz not null default now()
);
create table public.lms_legacy_finance_records(
 id uuid primary key default gen_random_uuid(), import_id uuid not null references public.lms_finance_imports(id), source_key text not null,
 legacy_id text not null, raw jsonb not null, latest_raw jsonb, has_conflict boolean not null default false, created_at timestamptz not null default now(),unique(source_key,legacy_id)
);
alter table public.lms_orders add column legacy_record_id uuid unique references public.lms_legacy_finance_records(id);
create table public.lms_crm_notes(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.lms_orders(id), actor_id uuid not null references public.lms_profiles(id),
 body text not null check(length(body) between 1 and 2000),created_at timestamptz not null default now()
);
create table public.lms_settlements(
 id uuid primary key default gen_random_uuid(),idempotency_key text not null unique, cohort_id uuid references public.lms_cohorts(id),
 payee_name text not null, share_bps integer not null check(share_bps between 0 and 10000),tax_bps integer not null check(tax_bps between 0 and 10000),
 gross_krw bigint not null,tax_krw bigint not null,net_krw bigint not null, status text not null default 'confirmed' check(status in ('confirmed','recorded')),
 confirmed_by uuid not null references public.lms_profiles(id),confirmed_at timestamptz not null default now(),recorded_at timestamptz,result_reference text not null default '',
 check(net_krw=gross_krw-tax_krw)
);
create table public.lms_settlement_lines(
 id uuid primary key default gen_random_uuid(),settlement_id uuid not null references public.lms_settlements(id),order_id uuid not null references public.lms_orders(id),
 receipt_net_krw bigint not null,gross_krw bigint not null,tax_krw bigint not null,net_krw bigint not null,
 unique(settlement_id,order_id),check(net_krw=gross_krw-tax_krw)
);
create index on public.lms_crm_notes(order_id);create index on public.lms_settlement_lines(order_id);
do $$declare t text;begin foreach t in array array['lms_finance_imports','lms_legacy_finance_records','lms_crm_notes','lms_settlements','lms_settlement_lines'] loop
 execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);execute format('grant select on public.%I to authenticated',t);execute format('grant all on public.%I to service_role',t);
 execute format('create policy finance_read on public.%I for select to authenticated using (lms_private.has_role(array[''admin'',''finance'']))',t);
end loop;end $$;

create function lms_private.refresh_order(target uuid) returns void language plpgsql security definer set search_path='' as $$
declare gross bigint; returned bigint; amount bigint;begin
 select amount_krw into amount from public.lms_orders where id=target;
 select coalesce(sum(amount_krw),0) into gross from public.lms_payments where order_id=target;
 select coalesce(sum(r.amount_krw),0) into returned from public.lms_refunds r join public.lms_payments p on p.id=r.payment_id where p.order_id=target and r.status='succeeded';
 update public.lms_orders set status=case when gross>0 and returned=gross then 'refunded' when returned>0 then 'partially_refunded' when gross>=amount then 'paid' else 'pending' end where id=target and status<>'cancelled';
end $$;
create function lms_private.ensure_order(enrollment uuid,details jsonb default '{}') returns uuid language plpgsql security definer set search_path='' as $$
declare e public.lms_enrollments;target uuid;begin
 select * into e from public.lms_enrollments where id=enrollment for update;if not found then raise exception '수강신청을 찾을 수 없습니다.';end if;
 select id into target from public.lms_orders where enrollment_id=e.id and enrollment_applied_at=e.applied_at and status<>'cancelled';if found then return target;end if;
 insert into public.lms_orders(enrollment_id,enrollment_applied_at,idempotency_key,amount_krw,title,customer_name,customer_email,customer_phone,company,payment_method,application_details,status)
 values(e.id,e.applied_at,'enrollment:'||e.id::text||':'||e.applied_at::text,e.amount_krw,(select title from public.lms_cohorts where id=e.cohort_id),e.contact_name,e.contact_email,e.contact_phone,e.company,coalesce(details->>'payment_method',''),details,case when e.amount_krw=0 then 'paid' else 'pending' end) returning id into target;
 return target;
end $$;
-- Existing applications receive pending orders, never invented payment rows.
do $$declare e record;begin for e in select id from public.lms_enrollments loop perform lms_private.ensure_order(e.id);end loop;end $$;
alter function public.lms_learning(jsonb,uuid) rename to lms_learning_v4;
create function public.lms_learning(command jsonb,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid;begin
 target:=public.lms_learning_v4(command,actor);
 if command->>'action'='apply' then perform lms_private.ensure_order(target,jsonb_build_object('payment_method',command->>'payment_method','receipt_type',command->>'receipt_type','receipt_number',command->>'receipt_number','depositor_name',command->>'depositor_name'));end if;
 return target;
end $$;
revoke all on function public.lms_learning(jsonb,uuid) from public,anon,authenticated;grant execute on function public.lms_learning(jsonb,uuid) to service_role;
revoke all on function lms_private.refresh_order(uuid),lms_private.ensure_order(uuid,jsonb) from public,anon,authenticated;

create function public.lms_finance_import(payload jsonb,digest text,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare batch uuid;item jsonb;record_id uuid;old_raw jsonb;amount bigint;linked uuid;existing_order uuid;legacy_source text:='aiedu1-settlements';legacy text;begin
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 if not exists(select 1 from public.lms_profiles p join public.lms_staff_members s on s.profile_id=p.id where p.id=actor and p.status='active' and s.role in ('admin','finance')) then raise exception '회계 권한이 필요합니다.';end if;
 select id into batch from public.lms_finance_imports where source_digest=digest;if found then return batch;end if;
 if jsonb_typeof(payload->'records') is distinct from 'array' or jsonb_array_length(payload->'records')>1000 then raise exception '이전 기록은 1000건 이하로 가져오세요.';end if;
 insert into public.lms_finance_imports(source,source_digest,payload,imported_by) values(coalesce(payload->>'source','legacy'),digest,payload,actor) returning id into batch;
 for item in select value from jsonb_array_elements(payload->'records') loop
  legacy:=coalesce(nullif(item->>'id',''),'row-'||md5(item::text));
  select id,raw into record_id,old_raw from public.lms_legacy_finance_records where lms_legacy_finance_records.source_key=legacy_source and legacy_id=legacy;
  if found then
   if old_raw<>item and coalesce(payload->>'kind','')<>'repository_seed' then update public.lms_legacy_finance_records set has_conflict=true,latest_raw=item where id=record_id;end if;
   continue;
  end if;
  insert into public.lms_legacy_finance_records(import_id,source_key,legacy_id,raw) values(batch,legacy_source,legacy,item) returning id into record_id;
  -- Only a system-issued enrollment UUID can be linked automatically, never an email.
  linked:=null;existing_order:=null;
  if legacy ~ '^rec-lms-[0-9a-f-]{36}$' then
    select id into linked from public.lms_enrollments where id=substring(legacy from 9)::uuid;
    if linked is not null then existing_order:=lms_private.ensure_order(linked);end if;
  end if;
  if existing_order is not null and not exists(select 1 from public.lms_orders where id=existing_order and legacy_record_id is not null) then
   update public.lms_orders set legacy_record_id=record_id,legacy_order_id=coalesce(item->>'orderId','') where id=existing_order;
  else
   amount:=case when item->>'amount' ~ '^[0-9]{1,12}$' then (item->>'amount')::bigint else 0 end;
   insert into public.lms_orders(legacy_record_id,legacy_order_id,idempotency_key,amount_krw,title,customer_name,customer_email,customer_phone,company,review_status,payment_method,application_details)
   values(record_id,item->>'orderId','legacy:'||record_id::text,amount,coalesce(payload->'course_titles'->>(item->>'courseId'),item->>'courseId','이전 교육과정'),left(coalesce(item->>'applicantName','이전 회원'),200),left(coalesce(item->>'email',''),320),left(coalesce(item->>'phone',''),50),left(coalesce(item->>'company',''),200),'needs_review',coalesce(item->>'paymentMethod',''),'{}');
  end if;
 end loop;
 insert into public.lms_audit_events(actor_id,action,entity_type,entity_id,details) values(actor,'finance.import','import',batch,jsonb_build_object('records',jsonb_array_length(payload->'records')));
 return batch;
end $$;
revoke all on function public.lms_finance_import(jsonb,text,uuid) from public,anon,authenticated;grant execute on function public.lms_finance_import(jsonb,text,uuid) to service_role;

create function public.lms_finance(command jsonb,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare op text:=command->>'action';is_finance boolean;is_operations boolean;target uuid;order_id uuid;o public.lms_orders;p public.lms_payments;r public.lms_refunds;st public.lms_settlements;
 n bigint;gross bigint;reserved bigint;returned bigint;basis bigint;old_gross bigint;old_tax bigint;fee bigint;tax bigint;delta_fee bigint;delta_tax bigint;total_allocated bigint;
 item text;payee text;share integer;tax_rate integer;eligible integer:=0;old_command jsonb;
begin
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 if not exists(select 1 from public.lms_profiles where id=actor and status='active') then raise exception '활성 회원으로 로그인하세요.';end if;
 select exists(select 1 from public.lms_staff_members where profile_id=actor and role in ('admin','finance')) into is_finance;
 select is_finance or exists(select 1 from public.lms_staff_members where profile_id=actor and role='operations') into is_operations;
 if op in ('crm_note','crm_update') then
  if not is_operations then raise exception '운영 권한이 필요합니다.';end if;
 elsif op<>'refund_request' and not is_finance then raise exception '회계 권한이 필요합니다.';end if;
 if op in ('payment','review_order','link_enrollment','crm_note','crm_update','cancel_order') then
  order_id:=(command->>'order_id')::uuid;select * into o from public.lms_orders where id=order_id for update;if not found then raise exception '주문을 찾을 수 없습니다.';end if;target:=o.id;
  if op='payment' then
   n:=(command->>'amount_krw')::bigint;
   if n is null or n<=0 or length(trim(coalesce(command->>'reference','')))<3 or (command->>'paid_at') is null or (command->>'paid_at')::timestamptz>now()+interval '5 minutes' then raise exception '금액·실제 입금일·증빙번호를 확인하세요.';end if;
   select * into p from public.lms_payments where provider='manual' and provider_payment_id=command->>'reference';
   if found then if p.order_id<>o.id or p.amount_krw<>n or p.paid_at<>(command->>'paid_at')::timestamptz or p.method<>coalesce(command->>'method','') then raise exception '다른 결제에 사용된 증빙번호입니다.';end if;return p.id;end if;
   if o.review_status<>'verified' or o.status in ('cancelled','refunded','partially_refunded') then raise exception '확인된 미결제 주문만 입금 기록을 추가할 수 있습니다.';end if;
   select coalesce(sum(amount_krw),0) into gross from public.lms_payments where lms_payments.order_id=o.id;
   if gross+n>o.amount_krw then raise exception '주문 잔여 금액을 초과할 수 없습니다.';end if;
   insert into public.lms_payments(order_id,provider,provider_payment_id,amount_krw,paid_at,method,evidence_reference,recorded_by) values(o.id,'manual',command->>'reference',n,(command->>'paid_at')::timestamptz,coalesce(command->>'method',''),command->>'reference',actor) returning id into target;
   perform lms_private.refresh_order(o.id);
  elsif op='review_order' then
   if o.review_status='verified' then raise exception '이미 확인된 주문입니다.';end if;
   if length(trim(coalesce(command->>'reference','')))<3 then raise exception '검토 근거를 입력하세요.';end if;
   n:=(command->>'amount_krw')::bigint;if n is null or n<0 then raise exception '주문 금액을 확인하세요.';end if;
   update public.lms_orders set amount_krw=n,review_status='verified',review_reference=command->>'reference',title=coalesce(nullif(command->>'title',''),title),status=case when n=0 then 'paid' else 'pending' end where id=o.id;
  elsif op='link_enrollment' then
   if o.enrollment_id is not null then raise exception '이미 연결된 주문입니다.';end if;
   if not exists(select 1 from public.lms_enrollments where id=(command->>'enrollment_id')::uuid and amount_krw=o.amount_krw) then raise exception '금액이 일치하는 수강신청을 선택하세요.';end if;
   select id into target from public.lms_orders where enrollment_id=(command->>'enrollment_id')::uuid and enrollment_applied_at=(select applied_at from public.lms_enrollments where id=(command->>'enrollment_id')::uuid) and status<>'cancelled';
   if target is not null then
    if exists(select 1 from public.lms_payments where lms_payments.order_id=target) or exists(select 1 from public.lms_settlement_lines where lms_settlement_lines.order_id=target) or exists(select 1 from public.lms_orders where id=target and legacy_record_id is not null) then raise exception '연결 대상에 기존 결제·정산이 있습니다. 중복 주문을 검토하세요.';end if;
    update public.lms_orders set status='cancelled' where id=target;
   end if;
   update public.lms_orders set enrollment_id=(command->>'enrollment_id')::uuid,enrollment_applied_at=(select applied_at from public.lms_enrollments where id=(command->>'enrollment_id')::uuid) where id=o.id;target:=o.id;
  elsif op='crm_note' then
   if length(trim(coalesce(command->>'body',''))) not between 1 and 2000 then raise exception '상담 내용을 입력하세요.';end if;
   insert into public.lms_crm_notes(order_id,actor_id,body) values(o.id,actor,command->>'body') returning id into target;
  elsif op='crm_update' then
   update public.lms_orders set customer_name=command->>'customer_name',customer_email=coalesce(command->>'customer_email',''),customer_phone=coalesce(command->>'customer_phone',''),company=coalesce(command->>'company','') where id=o.id;
  elsif op='cancel_order' then
   if exists(select 1 from public.lms_payments where lms_payments.order_id=o.id) then raise exception '입금된 주문은 환불 절차로 처리하세요.';end if;
   if exists(select 1 from public.lms_settlement_lines where lms_settlement_lines.order_id=o.id) then raise exception '확정 정산이 있는 주문은 취소할 수 없습니다.';end if;
   update public.lms_orders set status='cancelled' where id=o.id;
  end if;
 elsif op='refund_request' then
  select * into p from public.lms_payments where id=(command->>'payment_id')::uuid for update;if not found then raise exception '결제 기록을 찾을 수 없습니다.';end if;
  select * into o from public.lms_orders where id=p.order_id for update;order_id:=o.id;
  if not is_finance and not exists(select 1 from public.lms_enrollments where id=o.enrollment_id and learner_id=actor) then raise exception '본인 결제만 환불 요청할 수 있습니다.';end if;
  n:=(command->>'amount_krw')::bigint;if n is null or n<=0 or length(trim(coalesce(command->>'reason','')))=0 then raise exception '환불 금액과 사유를 입력하세요.';end if;
  select * into r from public.lms_refunds where idempotency_key=command->>'idempotency_key';
  if found then if r.payment_id<>p.id or r.amount_krw<>n or r.reason<>command->>'reason' then raise exception '중복 요청 키의 내용이 다릅니다.';end if;return r.id;end if;
  select coalesce(sum(amount_krw),0) into reserved from public.lms_refunds where payment_id=p.id and status in ('requested','processing','succeeded');
  if reserved+n>p.amount_krw then raise exception '환불 가능한 잔여 결제액을 초과했습니다.';end if;
  insert into public.lms_refunds(payment_id,idempotency_key,amount_krw,reason,recorded_by,revoke_access) values(p.id,command->>'idempotency_key',n,command->>'reason',actor,case when is_finance then coalesce((command->>'revoke_access')::boolean,true) else true end) returning id into target;
 elsif op='refund_result' then
  select * into r from public.lms_refunds where id=(command->>'id')::uuid for update;if not found then raise exception '환불 요청을 찾을 수 없습니다.';end if;
  target:=r.id;
  if r.status in ('succeeded','failed') then
   if r.status=command->>'status' and r.result_reference=command->>'reference' then return r.id;end if;
   raise exception '완료된 환불 결과는 변경할 수 없습니다.';
  end if;
  if coalesce(command->>'status','') not in ('processing','succeeded','failed') or length(trim(coalesce(command->>'reference','')))<3 then raise exception '처리 상태와 증빙을 입력하세요.';end if;
  select * into p from public.lms_payments where id=r.payment_id;select * into o from public.lms_orders where id=p.order_id for update;order_id:=o.id;
  update public.lms_refunds set status=command->>'status',result_reference=command->>'reference',completed_at=case when command->>'status' in ('succeeded','failed') then now() end where id=r.id;
  if command->>'status'='succeeded' then
   perform lms_private.refresh_order(o.id);
   select coalesce(sum(rf.amount_krw),0) into returned from public.lms_refunds rf join public.lms_payments pay on pay.id=rf.payment_id where pay.order_id=o.id and rf.status='succeeded';
   select coalesce(sum(amount_krw),0) into gross from public.lms_payments where lms_payments.order_id=o.id;
   if r.revoke_access and gross>0 and returned=gross then update public.lms_enrollments set status='revoked',updated_at=now() where id=o.enrollment_id and applied_at=o.enrollment_applied_at and status in ('applied','waitlisted','active','completed');end if;
  end if;
 elsif op='settlement_confirm' then
  if jsonb_typeof(command->'order_ids') is distinct from 'array' or jsonb_array_length(command->'order_ids') not between 1 and 200 then raise exception '정산 주문은 1~200건씩 선택하세요.';end if;
  select * into st from public.lms_settlements where idempotency_key=command->>'idempotency_key';
  if found then
   if st.payee_name<>command->>'payee_name' or st.share_bps<>(command->>'share_bps')::int or st.tax_bps<>(command->>'tax_bps')::int then raise exception '중복 정산 키의 내용이 다릅니다.';end if;
   if (select count(*) from public.lms_settlement_lines where settlement_id=st.id)<>(select count(distinct value) from jsonb_array_elements_text(command->'order_ids')) or exists(select 1 from public.lms_settlement_lines where settlement_id=st.id and not(command->'order_ids' ? lms_settlement_lines.order_id::text)) then raise exception '중복 정산의 주문 구성이 다릅니다.';end if;
   return st.id;
  end if;
  payee:=trim(command->>'payee_name');share:=(command->>'share_bps')::int;tax_rate:=(command->>'tax_bps')::int;
  if length(coalesce(payee,'')) not between 1 and 200 or share is null or share not between 0 and 10000 or tax_rate is null or tax_rate not between 0 and 10000 then raise exception '정산 대상과 배분·공제 비율을 확인하세요.';end if;
  insert into public.lms_settlements(idempotency_key,payee_name,share_bps,tax_bps,gross_krw,tax_krw,net_krw,confirmed_by) values(command->>'idempotency_key',payee,share,tax_rate,0,0,0,actor) returning id into target;
  for item in select distinct value from jsonb_array_elements_text(command->'order_ids') loop
   select * into o from public.lms_orders where id=item::uuid for update;if not found or o.review_status<>'verified' or o.status='cancelled' then raise exception '확인된 주문만 정산할 수 있습니다.';end if;
   if exists(select 1 from public.lms_refunds rf join public.lms_payments pay on pay.id=rf.payment_id where pay.order_id=o.id and rf.status in ('requested','processing')) then raise exception '진행 중인 환불을 먼저 확인하세요.';end if;
   select coalesce(sum(amount_krw),0) into gross from public.lms_payments where lms_payments.order_id=o.id;
   select coalesce(sum(rf.amount_krw),0) into returned from public.lms_refunds rf join public.lms_payments pay on pay.id=rf.payment_id where pay.order_id=o.id and rf.status='succeeded';basis:=gross-returned;
   fee:=round(basis::numeric*share/10000);tax:=round(fee::numeric*tax_rate/10000);
   select coalesce(sum(l.gross_krw),0),coalesce(sum(l.tax_krw),0) into old_gross,old_tax from public.lms_settlement_lines l join public.lms_settlements ss on ss.id=l.settlement_id where l.order_id=o.id and ss.payee_name=payee;
   delta_fee:=fee-old_gross;delta_tax:=tax-old_tax;
   select coalesce(sum(gross_krw),0) into total_allocated from public.lms_settlement_lines where lms_settlement_lines.order_id=o.id;
   if delta_fee>0 and exists(select 1 from public.lms_settlement_lines sl join public.lms_settlements ss on ss.id=sl.settlement_id where sl.order_id=o.id and ss.status='confirmed' and sl.net_krw<0) then raise exception '환불 조정액의 회수·차감 기록을 먼저 확인하세요.';end if;
   if delta_fee>0 and total_allocated+delta_fee>basis then raise exception '다른 정산 대상을 포함한 배분액이 순수납액을 초과합니다.';end if;
   if delta_fee<>0 or delta_tax<>0 then eligible:=eligible+1;end if;
   insert into public.lms_settlement_lines(settlement_id,order_id,receipt_net_krw,gross_krw,tax_krw,net_krw) values(target,o.id,basis,delta_fee,delta_tax,delta_fee-delta_tax);
  end loop;
  if eligible=0 then raise exception '새로 확정할 정산액이 없습니다.';end if;
  update public.lms_settlements set gross_krw=(select sum(gross_krw) from public.lms_settlement_lines where settlement_id=target),tax_krw=(select sum(tax_krw) from public.lms_settlement_lines where settlement_id=target),net_krw=(select sum(net_krw) from public.lms_settlement_lines where settlement_id=target) where id=target;
 elsif op='settlement_record' then
  select * into st from public.lms_settlements where id=(command->>'id')::uuid for update;if not found then raise exception '정산 명세를 찾을 수 없습니다.';end if;target:=st.id;
  if st.status='recorded' then if st.result_reference=command->>'reference' then return target;end if;raise exception '기록 완료한 명세는 변경할 수 없습니다.';end if;
  if length(trim(coalesce(command->>'reference','')))<3 then raise exception '지급·회수·차감 증빙을 입력하세요.';end if;
  if (command->>'recorded_at') is null or (command->>'recorded_at')::timestamptz>now()+interval '5 minutes' then raise exception '실제 처리일을 확인하세요.';end if;
  update public.lms_settlements set status='recorded',result_reference=command->>'reference',recorded_at=(command->>'recorded_at')::timestamptz where id=target;
 else raise exception '지원하지 않는 명령입니다.';end if;
 insert into public.lms_audit_events(actor_id,action,entity_type,entity_id,details) values(actor,'finance.'||op,op,target,jsonb_build_object('order_id',order_id,'amount_krw',command->'amount_krw'));
 return target;
end $$;
revoke all on function public.lms_finance(jsonb,uuid) from public,anon,authenticated;grant execute on function public.lms_finance(jsonb,uuid) to service_role;
-- Financial facts and statements are only writable through validated definer commands.
revoke insert,update,delete on public.lms_orders,public.lms_payments,public.lms_refunds,public.lms_finance_imports,public.lms_legacy_finance_records,public.lms_crm_notes,public.lms_settlements,public.lms_settlement_lines from service_role;
insert into public.lms_schema_versions(version) values('202610190005');
commit;
