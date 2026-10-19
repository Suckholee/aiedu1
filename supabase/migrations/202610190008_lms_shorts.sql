begin;
create table public.lms_shorts (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title)) between 1 and 120),
 description text not null default '' check(length(description)<=1000),
 video_path text not null, poster_path text not null,
 duration_seconds integer not null check(duration_seconds between 1 and 600),
 position integer not null default 0 check(position between 0 and 10000),
 published boolean not null default false,
 created_by uuid not null references public.lms_profiles(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(video_path ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.mp4$'),
 check(poster_path ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(webp|jpg|png)$')
);
alter table public.lms_shorts enable row level security;
revoke all on public.lms_shorts from public,anon,authenticated,service_role;
grant select on public.lms_shorts to anon,authenticated,service_role;
create policy shorts_public on public.lms_shorts for select to anon,authenticated using(published);
create policy shorts_staff on public.lms_shorts for select to authenticated using(lms_private.has_role(array['admin','operations']));
create function public.lms_short_manage(command jsonb,actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid:=coalesce((command->>'id')::uuid,gen_random_uuid());begin
 perform pg_advisory_xact_lock(hashtext('lms.shorts'));
 if not exists(select 1 from public.lms_profiles p join public.lms_staff_members s on p.id=s.profile_id where p.id=actor and p.status='active' and s.role in ('admin','operations')) then raise exception '영상 관리 권한이 필요합니다.'; end if;
 if command->>'action'='publish' then
  update public.lms_shorts set published=(command->>'published')::boolean,updated_at=now() where id=target;
  if not found then raise exception '영상을 찾을 수 없습니다.';end if;
 elsif command->>'action'='save' then
  if command ? 'id' and not exists(select 1 from public.lms_shorts where id=target) then raise exception '영상을 찾을 수 없습니다.';end if;
  insert into public.lms_shorts(id,title,description,video_path,poster_path,duration_seconds,position,published,created_by)
  values(target,trim(command->>'title'),coalesce(command->>'description',''),command->>'video_path',command->>'poster_path',(command->>'duration_seconds')::int,coalesce((command->>'position')::int,0),coalesce((command->>'published')::boolean,false),actor)
  on conflict(id) do update set title=excluded.title,description=excluded.description,video_path=excluded.video_path,poster_path=excluded.poster_path,duration_seconds=excluded.duration_seconds,position=excluded.position,published=excluded.published,updated_at=now();
 else raise exception '지원하지 않는 영상 명령입니다.';end if;
 insert into public.lms_audit_events(actor_id,action,entity_type,entity_id) values(actor,'shorts.'||(command->>'action'),'short',target);
 return target;
end $$;
revoke all on function public.lms_short_manage(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.lms_short_manage(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610190008');
commit;
