begin;
create table lms_private.roster_code_attempts(ip_hash text not null,created_at timestamptz not null default now());
alter table lms_private.roster_code_attempts enable row level security;
revoke all on lms_private.roster_code_attempts from public,anon,authenticated;
create index roster_code_attempts_ip_time on lms_private.roster_code_attempts(ip_hash,created_at);
create function public.lms_roster_code_attempt(ip_hash text,failed boolean) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtext('lms.roster.code'),hashtext(ip_hash));
 delete from lms_private.roster_code_attempts where created_at<now()-interval '15 minutes';
 if (select count(*) from lms_private.roster_code_attempts a where a.ip_hash=lms_roster_code_attempt.ip_hash)>=5 then return false;end if;
 if failed then insert into lms_private.roster_code_attempts(ip_hash) values(ip_hash);end if;
 return true;
end $$;
revoke all on function public.lms_roster_code_attempt(text,boolean) from public,anon,authenticated;
grant execute on function public.lms_roster_code_attempt(text,boolean) to service_role;
insert into public.lms_schema_versions(version) values('202610200003');
commit;
