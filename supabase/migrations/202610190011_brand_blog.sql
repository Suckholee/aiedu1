begin;
create table public.brand_blog_settings (
 id integer primary key default 1 check(id=1),enabled boolean not null default true,auto_publish boolean not null default true,
 keywords jsonb not null default '["AI 업무자동화","AI 블로그","바이브코딩","AI 교육","콘텐츠 브랜딩"]'::jsonb check(jsonb_typeof(keywords)='array' and jsonb_array_length(keywords) between 1 and 12),
 updated_at timestamptz not null default now()
);
insert into public.brand_blog_settings(id) values(1);
create table public.brand_blog_posts (
 id uuid primary key default gen_random_uuid(),slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]{0,159}$'),
 title text not null check(length(btrim(title)) between 1 and 120),excerpt text not null check(length(excerpt) between 1 and 350),
 category text not null check(category in ('ai','workflow','content','platform')),
 sections jsonb not null check(jsonb_typeof(sections)='array' and jsonb_array_length(sections) between 3 and 7),
 takeaways jsonb not null check(jsonb_typeof(takeaways)='array' and jsonb_array_length(takeaways) between 2 and 5),
 tags jsonb not null default '[]',sources jsonb not null check(jsonb_typeof(sources)='array' and jsonb_array_length(sources) between 2 and 5),
 trend_summary text not null default '',status text not null default 'draft' check(status in ('draft','published','archived')),
 generated boolean not null default true,generation_day date unique,source_key text unique,
 published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(status<>'published' or published_at is not null)
);
create index on public.brand_blog_posts(published_at desc) where status='published';
create table public.brand_blog_runs (
 id uuid primary key default gen_random_uuid(),job_day date not null unique,status text not null check(status in ('running','succeeded','failed')),
 attempts integer not null default 1 check(attempts between 1 and 3),token uuid not null default gen_random_uuid(),
 started_at timestamptz not null default now(),finished_at timestamptz,error text not null default '',
 post_id uuid references public.brand_blog_posts(id),model text not null default '',input_tokens integer,output_tokens integer
);
-- Reads in public routes use only the publishable key and these row policies.
alter table public.brand_blog_posts enable row level security;
alter table public.brand_blog_runs enable row level security;
alter table public.brand_blog_settings enable row level security;
revoke all on public.brand_blog_posts,public.brand_blog_runs,public.brand_blog_settings from public,anon,authenticated,service_role;
grant select on public.brand_blog_posts to anon,authenticated,service_role;
grant select on public.brand_blog_runs,public.brand_blog_settings to service_role;
create policy brand_blog_published on public.brand_blog_posts for select to anon,authenticated using(status='published' and published_at<=now());
create policy brand_blog_staff on public.brand_blog_posts for select to authenticated using(lms_private.has_role(array['admin','operations']));

create function public.brand_blog_claim(trigger_kind text,actor uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.brand_blog_runs;day date:=(now() at time zone 'Asia/Seoul')::date;
begin
 perform pg_advisory_xact_lock(hashtext('brand.blog'));
 if trigger_kind not in ('cron','manual') then raise exception '실행 종류를 확인하세요.';end if;
 if trigger_kind='manual' and not exists(select 1 from public.lms_profiles profile join public.lms_staff_members s on s.profile_id=profile.id where profile.id=actor and profile.status='active' and s.role in ('admin','operations')) then raise exception '블로그 운영 권한이 필요합니다.';end if;
 if trigger_kind='cron' and not (select enabled from public.brand_blog_settings where id=1) then return jsonb_build_object('claimed',false,'reason','자동 게시가 일시 중지되어 있습니다.');end if;
 select * into r from public.brand_blog_runs where job_day=day for update;
 if found then
  if r.status='succeeded' then return jsonb_build_object('claimed',false,'reason','오늘의 글이 이미 생성되었습니다.','post_id',r.post_id);end if;
  if r.status='running' and r.started_at>now()-interval '5 minutes' then return jsonb_build_object('claimed',false,'reason','글을 생성하고 있습니다. 잠시 후 확인해주세요.');end if;
  if r.attempts>=3 then return jsonb_build_object('claimed',false,'reason','오늘의 실행 한도 3회를 사용했습니다. 원인을 확인하고 다음 날 다시 실행하세요.');end if;
  update public.brand_blog_runs set status='running',attempts=attempts+1,token=gen_random_uuid(),started_at=now(),finished_at=null,error='' where id=r.id returning * into r;
 else
  insert into public.brand_blog_runs(job_day,status) values(day,'running') returning * into r;
 end if;
 return jsonb_build_object('claimed',true,'run_id',r.id,'token',r.token,'day',day);
end $$;
create function public.brand_blog_finish(run_id uuid,lease_token uuid,article jsonb,model_name text,usage jsonb default '{}') returns uuid
language plpgsql security definer set search_path='' as $$
declare r public.brand_blog_runs;post uuid;autopublish boolean;
begin
 perform pg_advisory_xact_lock(hashtext('brand.blog'));
 select * into r from public.brand_blog_runs where id=run_id and token=lease_token and status='running' for update;
 if not found or r.started_at<now()-interval '5 minutes' then raise exception '이 실행의 처리 시간이 만료되었습니다.';end if;
 if not exists(select 1 from public.brand_blog_settings where id=1 and enabled) and article->>'trigger_kind'='cron' then raise exception '자동 게시가 중지되었습니다.';end if;
 select auto_publish into autopublish from public.brand_blog_settings where id=1;
 insert into public.brand_blog_posts(slug,title,excerpt,category,sections,takeaways,tags,sources,trend_summary,status,generation_day,source_key,published_at)
 values(article->>'slug',article->>'title',article->>'excerpt',article->>'category',article->'sections',article->'takeaways',article->'tags',article->'sources',article->>'trend_summary',case when autopublish then 'published' else 'draft' end,r.job_day,article->>'source_key',case when autopublish then now() end) returning id into post;
 update public.brand_blog_runs set status='succeeded',finished_at=now(),post_id=post,model=left(model_name,100),input_tokens=(usage->>'input_tokens')::int,output_tokens=(usage->>'output_tokens')::int where id=r.id;
 insert into public.lms_audit_events(action,entity_type,entity_id,details) values('blog.generated','blog_post',post,jsonb_build_object('run_id',r.id,'automatic_publish',autopublish));
 return post;
end $$;
create function public.brand_blog_fail(run_id uuid,lease_token uuid,reason text) returns void
language plpgsql security definer set search_path='' as $$
begin update public.brand_blog_runs set status='failed',finished_at=now(),error=left(reason,1000) where id=run_id and token=lease_token and status='running';end $$;
create function public.brand_blog_manage(command jsonb,actor uuid) returns void
language plpgsql security definer set search_path='' as $$
declare p public.brand_blog_posts;article jsonb:=command->'article';
begin
 perform pg_advisory_xact_lock(hashtext('brand.blog'));
 if not exists(select 1 from public.lms_profiles profile join public.lms_staff_members s on s.profile_id=profile.id where profile.id=actor and profile.status='active' and s.role in ('admin','operations')) then raise exception '블로그 운영 권한이 필요합니다.';end if;
 if command->>'action'='settings' then
  update public.brand_blog_settings set enabled=(command->>'enabled')::boolean,auto_publish=(command->>'auto_publish')::boolean,keywords=command->'keywords',updated_at=now() where id=1;
 elsif command->>'action'='edit' then
  select * into p from public.brand_blog_posts where id=(command->>'id')::uuid for update;
  if not found then raise exception '글을 찾을 수 없습니다.';end if;
  if p.updated_at is distinct from (command->>'updated_at')::timestamptz then raise exception '다른 변경이 있습니다. 최신 글을 다시 불러오세요.';end if;
  update public.brand_blog_posts set title=article->>'title',excerpt=article->>'excerpt',category=article->>'category',sections=article->'sections',takeaways=article->'takeaways',tags=article->'tags',trend_summary=article->>'trend_summary',status=command->>'status',published_at=case when command->>'status'='published' then coalesce(p.published_at,now()) else p.published_at end,updated_at=clock_timestamp() where id=p.id;
 else raise exception '지원하지 않는 블로그 명령입니다.';end if;
 insert into public.lms_audit_events(actor_id,action,entity_type,entity_id) values(actor,'blog.'||(command->>'action'),'blog_post',p.id);
end $$;
revoke all on function public.brand_blog_claim(text,uuid),public.brand_blog_finish(uuid,uuid,jsonb,text,jsonb),public.brand_blog_fail(uuid,uuid,text),public.brand_blog_manage(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.brand_blog_claim(text,uuid),public.brand_blog_finish(uuid,uuid,jsonb,text,jsonb),public.brand_blog_fail(uuid,uuid,text),public.brand_blog_manage(jsonb,uuid) to service_role;
insert into public.lms_schema_versions(version) values('202610190011');
commit;
