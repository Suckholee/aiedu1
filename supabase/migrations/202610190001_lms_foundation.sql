-- LMS foundation only. No existing Firebase data is read or changed.
-- Client writes are intentionally closed until transactional command APIs exist.
begin;

create schema if not exists lms_private;
revoke all on schema lms_private from public;
grant usage on schema lms_private to authenticated;

create table public.lms_schema_versions (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table public.lms_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  legacy_firebase_uid text unique,
  display_name text not null,
  email text,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

create table public.lms_staff_members (
  profile_id uuid not null references public.lms_profiles(id),
  role text not null check (role in ('admin', 'operations', 'finance')),
  primary key (profile_id, role)
);

create table public.lms_courses (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null default '',
  level text not null default 'beginner',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lms_cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id),
  legacy_course_id text unique,
  title text not null,
  delivery_mode text not null check (delivery_mode in ('offline', 'live', 'vod', 'blended')),
  status text not null default 'draft' check (status in ('draft', 'open', 'closed', 'running', 'completed', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer check (capacity > 0),
  price_krw bigint not null default 0 check (price_krw >= 0),
  completion_policy jsonb not null default '{}',
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index on public.lms_cohorts(course_id);

create table public.lms_cohort_instructors (
  cohort_id uuid not null references public.lms_cohorts(id),
  profile_id uuid not null references public.lms_profiles(id),
  primary key (cohort_id, profile_id)
);
create index on public.lms_cohort_instructors(profile_id);

-- Per-cohort curriculum snapshot. Public metadata never contains paid content URLs.
create table public.lms_lessons (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.lms_cohorts(id),
  title text not null,
  position integer not null check (position >= 0),
  kind text not null check (kind in ('video', 'live', 'document', 'practice', 'quiz')),
  required boolean not null default true,
  unique (cohort_id, position),
  unique (id, cohort_id)
);

create table public.lms_enrollments (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  cohort_id uuid not null references public.lms_cohorts(id),
  learner_id uuid not null references public.lms_profiles(id),
  status text not null default 'applied' check (status in ('applied', 'waitlisted', 'active', 'rejected', 'cancelled', 'completed', 'revoked')),
  access_until timestamptz,
  applied_at timestamptz not null default now(),
  unique (cohort_id, learner_id),
  unique (id, cohort_id)
);
create index on public.lms_enrollments(learner_id);

create table public.lms_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.lms_cohorts(id),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default '',
  unique (id, cohort_id),
  check (ends_at > starts_at)
);
create index on public.lms_sessions(cohort_id);

create table public.lms_attendance (
  enrollment_id uuid not null,
  session_id uuid not null,
  cohort_id uuid not null,
  status text not null check (status in ('present', 'late', 'absent', 'excused')),
  recorded_at timestamptz not null default now(),
  primary key (enrollment_id, session_id),
  foreign key (enrollment_id, cohort_id) references public.lms_enrollments(id, cohort_id),
  foreign key (session_id, cohort_id) references public.lms_sessions(id, cohort_id)
);
create index on public.lms_attendance(session_id);

create table public.lms_lesson_progress (
  enrollment_id uuid not null,
  lesson_id uuid not null,
  cohort_id uuid not null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  primary key (enrollment_id, lesson_id),
  foreign key (enrollment_id, cohort_id) references public.lms_enrollments(id, cohort_id),
  foreign key (lesson_id, cohort_id) references public.lms_lessons(id, cohort_id),
  check (completed_at is null or progress_percent = 100)
);
create index on public.lms_lesson_progress(lesson_id);

create table public.lms_materials (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.lms_cohorts(id),
  title text not null,
  storage_path text not null unique,
  released_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on public.lms_materials(cohort_id);

-- Monetary states are independent of learning states. Amounts are integer KRW.
create table public.lms_orders (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.lms_enrollments(id),
  legacy_order_id text unique,
  idempotency_key text not null unique,
  amount_krw bigint not null check (amount_krw >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'partially_refunded', 'refunded')),
  created_at timestamptz not null default now()
);
create index on public.lms_orders(enrollment_id);

create table public.lms_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.lms_orders(id),
  provider text not null,
  provider_payment_id text not null,
  amount_krw bigint not null check (amount_krw > 0),
  paid_at timestamptz not null,
  unique (provider, provider_payment_id)
);
create index on public.lms_payments(order_id);

create table public.lms_refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.lms_payments(id),
  idempotency_key text not null unique,
  amount_krw bigint not null check (amount_krw > 0),
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'processing', 'succeeded', 'failed')),
  created_at timestamptz not null default now()
);
create index on public.lms_refunds(payment_id);

create table public.lms_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.lms_profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  created_at timestamptz not null default now()
);

-- Private, narrowly scoped helpers avoid recursive policies on identity tables.
create function lms_private.profile_id() returns uuid
language sql stable security definer set search_path = ''
as $$ select id from public.lms_profiles where auth_user_id = (select auth.uid()) $$;

create function lms_private.has_role(roles text[]) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.lms_staff_members
  where profile_id = lms_private.profile_id() and role = any(roles)
) $$;

create function lms_private.teaches(target uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.lms_cohort_instructors
  where cohort_id = target and profile_id = lms_private.profile_id()
) $$;

create function lms_private.can_learn(target uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.lms_enrollments
  where cohort_id = target and learner_id = lms_private.profile_id()
    and status in ('active', 'completed') and (access_until is null or access_until > now())
) $$;

create function lms_private.can_access_course(target uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select lms_private.has_role(array['admin', 'operations']) or exists (
  select 1 from public.lms_cohorts c where c.course_id = target
    and (lms_private.teaches(c.id) or lms_private.can_learn(c.id))
) $$;

revoke all on all functions in schema lms_private from public, anon;
grant execute on all functions in schema lms_private to authenticated;

-- Explicit grants and RLS; no client INSERT/UPDATE/DELETE policies or grants.
do $$
declare target text;
begin
  foreach target in array array[
    'lms_schema_versions', 'lms_profiles', 'lms_staff_members', 'lms_courses',
    'lms_cohorts', 'lms_cohort_instructors', 'lms_lessons', 'lms_enrollments',
    'lms_sessions', 'lms_attendance', 'lms_lesson_progress', 'lms_materials',
    'lms_orders', 'lms_payments', 'lms_refunds', 'lms_audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke all on public.%I from public, anon, authenticated', target);
    execute format('grant select on public.%I to authenticated', target);
    execute format('grant all on public.%I to service_role', target);
  end loop;
end $$;

grant select on public.lms_schema_versions, public.lms_courses, public.lms_cohorts, public.lms_lessons to anon;
create policy version_read on public.lms_schema_versions for select to anon, authenticated using (true);
create policy public_courses on public.lms_courses for select to anon, authenticated using (published);
create policy public_cohorts on public.lms_cohorts for select to anon, authenticated using (
  status in ('open', 'closed', 'running', 'completed')
  and exists (select 1 from public.lms_courses c where c.id = course_id and c.published)
);
create policy public_lessons on public.lms_lessons for select to anon, authenticated using (
  exists (select 1 from public.lms_cohorts c where c.id = cohort_id)
);

create policy own_profile on public.lms_profiles for select to authenticated using (
  id = lms_private.profile_id() or lms_private.has_role(array['admin', 'operations', 'finance'])
);
create policy own_staff_role on public.lms_staff_members for select to authenticated using (
  profile_id = lms_private.profile_id() or lms_private.has_role(array['admin'])
);
create policy staff_courses on public.lms_courses for select to authenticated using (
  lms_private.can_access_course(id)
);
create policy cohort_access on public.lms_cohorts for select to authenticated using (
  lms_private.has_role(array['admin', 'operations']) or lms_private.teaches(id) or lms_private.can_learn(id)
);
create policy instructor_assignments on public.lms_cohort_instructors for select to authenticated using (
  profile_id = lms_private.profile_id() or lms_private.has_role(array['admin', 'operations'])
);
create policy roster_read on public.lms_enrollments for select to authenticated using (
  learner_id = lms_private.profile_id() or lms_private.has_role(array['admin', 'operations', 'finance'])
  or lms_private.teaches(cohort_id)
);
create policy sessions_read on public.lms_sessions for select to authenticated using (
  lms_private.can_learn(cohort_id) or lms_private.teaches(cohort_id)
  or lms_private.has_role(array['admin', 'operations'])
);
create policy attendance_read on public.lms_attendance for select to authenticated using (
  lms_private.has_role(array['admin', 'operations']) or lms_private.teaches(cohort_id)
  or exists (select 1 from public.lms_enrollments e where e.id = enrollment_id and e.learner_id = lms_private.profile_id())
);
create policy progress_read on public.lms_lesson_progress for select to authenticated using (
  lms_private.has_role(array['admin', 'operations']) or lms_private.teaches(cohort_id)
  or exists (select 1 from public.lms_enrollments e where e.id = enrollment_id and e.learner_id = lms_private.profile_id())
);
create policy materials_read on public.lms_materials for select to authenticated using (
  (released_at <= now() and lms_private.can_learn(cohort_id))
  or lms_private.teaches(cohort_id) or lms_private.has_role(array['admin', 'operations'])
);
create policy orders_read on public.lms_orders for select to authenticated using (
  lms_private.has_role(array['admin', 'finance']) or exists (
    select 1 from public.lms_enrollments e where e.id = enrollment_id and e.learner_id = lms_private.profile_id()
  )
);
create policy payments_read on public.lms_payments for select to authenticated using (
  exists (select 1 from public.lms_orders o where o.id = order_id)
);
create policy refunds_read on public.lms_refunds for select to authenticated using (
  exists (select 1 from public.lms_payments p where p.id = payment_id)
);
create policy audit_read on public.lms_audit_events for select to authenticated using (
  lms_private.has_role(array['admin'])
);

insert into public.lms_schema_versions(version) values ('202610190001');
commit;
