begin;
-- Existing members keep all identity, role, order and contact data. Only future
-- identities require onboarding; existing members get a non-blocking reminder.
alter table public.lms_profiles
 add column industry text not null default '',
 add column job_title text not null default '',
 add column profile_completed_at timestamptz,
 add column privacy_consent_version text,
 add column privacy_consented_at timestamptz,
 add column service_alimtalk_opt_in boolean not null default false,
 add column marketing_opt_in boolean not null default false,
 add column contact_preferences_updated_at timestamptz,
 add column onboarding_required boolean not null default false;
alter table public.lms_profiles alter column onboarding_required set default true;

create table public.lms_contact_consents (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.lms_profiles(id),
 privacy_version text not null,
 service_alimtalk_opt_in boolean not null,
 marketing_opt_in boolean not null,
 recorded_at timestamptz not null default now()
);
alter table public.lms_contact_consents enable row level security;
revoke all on public.lms_contact_consents from public,anon,authenticated;
grant select on public.lms_contact_consents to authenticated;
grant all on public.lms_contact_consents to service_role;
create policy own_contact_consents on public.lms_contact_consents for select to authenticated
 using(profile_id=lms_private.profile_id() or lms_private.has_role(array['admin']));

-- Only the authenticated server supplies actor. Members cannot alter identities,
-- permissions or other profiles, and consent timestamps are always server-owned.
create function public.lms_save_own_profile(command jsonb,actor uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare p public.lms_profiles; name text:=trim(command->>'display_name'); mobile text:=command->>'phone'; sector text:=command->>'industry'; prefs_changed boolean;
begin
 select * into p from public.lms_profiles where id=actor and status='active' for update;
 if not found then raise exception '활성 회원으로 로그인하세요.';end if;
 if (command - array['display_name','phone','industry','company','job_title','privacy_version','consent_to_privacy','service_alimtalk_opt_in','marketing_opt_in']) <> '{}'::jsonb then raise exception '변경할 수 없는 회원 정보입니다.';end if;
 if name is null or length(name) not between 2 and 100 or mobile is null or mobile !~ '^010[0-9]{8}$' then raise exception '이름과 휴대전화 번호를 확인하세요.';end if;
 if sector is null or sector not in ('외식·식음료','유통·쇼핑몰','교육·강의','콘텐츠·마케팅','IT·소프트웨어','전문서비스·컨설팅','제조·건설','의료·복지','문화·예술','공공·비영리','학생·취업 준비','기타') then raise exception '업종을 선택하세요.';end if;
 if length(coalesce(command->>'company',''))>200 or length(coalesce(command->>'job_title',''))>100 then raise exception '소속·직무 입력 길이를 확인하세요.';end if;
 if command->>'privacy_version' is distinct from '2026-10-19.v1' or command->'consent_to_privacy' is distinct from 'true'::jsonb then raise exception '개인정보 수집·이용 동의가 필요합니다.';end if;
 if jsonb_typeof(command->'service_alimtalk_opt_in') is distinct from 'boolean' or jsonb_typeof(command->'marketing_opt_in') is distinct from 'boolean' then raise exception '연락 수신 설정을 확인하세요.';end if;
 prefs_changed:=p.phone is distinct from mobile or p.privacy_consent_version is distinct from command->>'privacy_version'
  or p.service_alimtalk_opt_in is distinct from (command->>'service_alimtalk_opt_in')::boolean
  or p.marketing_opt_in is distinct from (command->>'marketing_opt_in')::boolean;
 update public.lms_profiles set display_name=name,phone=mobile,industry=sector,
  company=trim(coalesce(command->>'company','')),job_title=trim(coalesce(command->>'job_title','')),
  profile_completed_at=coalesce(p.profile_completed_at,now()),onboarding_required=false,
  privacy_consent_version=command->>'privacy_version',
  privacy_consented_at=case when p.privacy_consent_version is distinct from command->>'privacy_version' then now() else p.privacy_consented_at end,
  service_alimtalk_opt_in=(command->>'service_alimtalk_opt_in')::boolean,
  marketing_opt_in=(command->>'marketing_opt_in')::boolean,
  contact_preferences_updated_at=case when prefs_changed then now() else p.contact_preferences_updated_at end,
  updated_at=now() where id=actor;
 if prefs_changed then
  insert into public.lms_contact_consents(profile_id,privacy_version,service_alimtalk_opt_in,marketing_opt_in)
   values(actor,command->>'privacy_version',(command->>'service_alimtalk_opt_in')::boolean,(command->>'marketing_opt_in')::boolean);
 end if;
 insert into public.lms_audit_events(actor_id,action,entity_type,entity_id)
  values(actor,case when p.profile_completed_at is null then 'member.profile_completed' else 'member.profile_updated' end,'profile',actor);
 return actor;
end $$;
revoke all on function public.lms_save_own_profile(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_save_own_profile(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610190009');
commit;
