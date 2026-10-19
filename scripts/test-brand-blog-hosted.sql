-- Verifies installed routines against a temporary article; nothing is committed.
begin;
do $$
declare r jsonb;p uuid;token uuid;actor uuid;
begin
 select profile.id into strict actor from public.lms_profiles profile join public.lms_staff_members staff on staff.profile_id=profile.id where profile.email='peter15975345@gmail.com' and staff.role='admin' and profile.status='active';
 r:=public.brand_blog_claim('manual',actor);
 if not coalesce((r->>'claimed')::boolean,false) then raise exception 'Run this check before the first real generation';end if;
 if (public.brand_blog_claim('manual',actor)->>'claimed')::boolean then raise exception 'Concurrent claim was allowed';end if;
 p:=public.brand_blog_finish((r->>'run_id')::uuid,(r->>'token')::uuid,jsonb_build_object('slug','temporary-brand-blog-verification','title','Temporary verification only','excerpt','Rolled back before visibility','category','ai','sections',jsonb_build_array(jsonb_build_object('heading','One','paragraphs',jsonb_build_array('Fixture'),'source_ids',jsonb_build_array('S1')),jsonb_build_object('heading','Two','paragraphs',jsonb_build_array('Fixture'),'source_ids',jsonb_build_array('S1')),jsonb_build_object('heading','Three','paragraphs',jsonb_build_array('Fixture'),'source_ids',jsonb_build_array('S2'))),'takeaways',jsonb_build_array('One','Two'),'tags',jsonb_build_array('Fixture'),'sources',jsonb_build_array(jsonb_build_object('id','S1','title','Reference one','url','https://blog.google/'),jsonb_build_object('id','S2','title','Reference two','url','https://github.blog/')),'trend_summary','Fixture only','source_key','temporary-verification','trigger_kind','manual'),'fixture','{}'::jsonb);
 if (public.brand_blog_claim('manual',actor)->>'claimed')::boolean then raise exception 'Same-day duplicate was allowed';end if;
 if not exists(select 1 from public.brand_blog_posts where id=p and status='published') then raise exception 'Automatic publication failed';end if;
end $$;
rollback;
select 'PASS: installed daily lease, duplicate prevention and publication; fixture rolled back' result;
