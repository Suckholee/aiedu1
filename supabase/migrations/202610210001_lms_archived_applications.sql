-- Reversible exclusion of test applications; existing records remain visible by default.
alter table public.lms_enrollments add column if not exists archived boolean not null default false;
