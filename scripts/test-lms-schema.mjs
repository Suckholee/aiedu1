import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Isolated, disposable PostgreSQL. Never connects to Firebase or hosted Supabase.
const db = new PGlite();
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
let checks = 0;
async function count(table, expected) {
  const { rows } = await db.query(`select count(*)::int as n from public.${table}`);
  assert.equal(rows[0].n, expected, table);
  checks++;
}
async function asUser(n) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [n ? id(n) : '']);
  await db.exec(`set role ${n ? 'authenticated' : 'anon'}`);
}
async function denied(sql, code = '42501') {
  await assert.rejects(db.exec(sql), error => error.code === code);
  checks++;
}

try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/202610190001_lms_foundation.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/202610190002_lms_management.sql', import.meta.url), 'utf8'));
  for (let n = 1; n <= 6; n++) {
    await db.query('insert into auth.users values ($1)', [id(n)]);
    await db.query('insert into public.lms_profiles(id, auth_user_id, display_name) values ($1, $1, $2)', [id(n), `Test ${n}`]);
  }
  await db.exec(`
    insert into public.lms_staff_members values ('${id(3)}', 'admin'), ('${id(5)}', 'finance'), ('${id(6)}', 'operations');
    insert into public.lms_courses(id, slug, title, published) values
      ('${id(10)}', 'public-course', 'Public', true), ('${id(11)}', 'draft-course', 'Draft', false);
    insert into public.lms_cohorts(id, course_id, title, delivery_mode, status) values
      ('${id(20)}', '${id(10)}', 'Public cohort', 'blended', 'open'),
      ('${id(21)}', '${id(11)}', 'Private cohort', 'offline', 'draft');
    insert into public.lms_cohort_instructors values ('${id(20)}', '${id(4)}');
    insert into public.lms_lessons(id, cohort_id, title, position, kind) values
      ('${id(30)}', '${id(20)}', 'Lesson', 0, 'document'), ('${id(31)}', '${id(21)}', 'Draft lesson', 0, 'document');
    insert into public.lms_enrollments(id, cohort_id, learner_id, status) values
      ('${id(40)}', '${id(20)}', '${id(1)}', 'active'), ('${id(41)}', '${id(20)}', '${id(2)}', 'applied');
    insert into public.lms_sessions(id, cohort_id, title, starts_at, ends_at) values
      ('${id(50)}', '${id(20)}', 'Session', now(), now() + interval '1 hour'),
      ('${id(51)}', '${id(21)}', 'Other session', now(), now() + interval '1 hour');
    insert into public.lms_attendance values ('${id(40)}', '${id(50)}', '${id(20)}', 'present', now());
    insert into public.lms_lesson_progress values ('${id(40)}', '${id(30)}', '${id(20)}', 100, now());
    insert into public.lms_materials(cohort_id, title, storage_path, released_at) values
      ('${id(20)}', 'Released', 'test/released.pdf', now()),
      ('${id(20)}', 'Future', 'test/future.pdf', now() + interval '1 day');
    insert into public.lms_orders(id, enrollment_id, idempotency_key, amount_krw) values
      ('${id(60)}', '${id(40)}', 'order-a', 10000), ('${id(61)}', '${id(41)}', 'order-b', 10000);
    insert into public.lms_payments(id, order_id, provider, provider_payment_id, amount_krw, paid_at) values
      ('${id(70)}', '${id(60)}', 'test', 'payment-a', 10000, now());
    insert into public.lms_refunds(payment_id, idempotency_key, amount_krw, reason) values
      ('${id(70)}', 'refund-a', 1000, 'Test');
    insert into public.lms_audit_events(action, entity_type) values ('test', 'fixture');
  `);

  await asUser(null);
  for (const [table, expected] of [['lms_courses', 1], ['lms_cohorts', 1], ['lms_lessons', 1], ['lms_schema_versions', 2]]) await count(table, expected);
  await denied('select * from public.lms_profiles');
  await denied('select * from public.lms_materials');

  await asUser(1);
  for (const [table, expected] of [['lms_courses', 1], ['lms_profiles', 1], ['lms_enrollments', 1], ['lms_materials', 1], ['lms_orders', 1], ['lms_payments', 1], ['lms_refunds', 1], ['lms_attendance', 1], ['lms_lesson_progress', 1], ['lms_staff_members', 0], ['lms_audit_events', 0]]) await count(table, expected);
  await denied(`insert into public.lms_staff_members values ('${id(1)}', 'admin')`);
  await denied(`update public.lms_enrollments set status = 'completed'`);
  await denied('delete from public.lms_orders');

  await asUser(2);
  for (const [table, expected] of [['lms_materials', 0], ['lms_enrollments', 1], ['lms_orders', 1], ['lms_payments', 0], ['lms_refunds', 0], ['lms_attendance', 0], ['lms_lesson_progress', 0]]) await count(table, expected);

  await asUser(4);
  for (const [table, expected] of [['lms_enrollments', 2], ['lms_materials', 2], ['lms_sessions', 1], ['lms_profiles', 1], ['lms_orders', 0], ['lms_payments', 0], ['lms_attendance', 1]]) await count(table, expected);

  await asUser(5);
  await count('lms_orders', 2);
  await count('lms_payments', 1);
  await count('lms_materials', 0);
  await asUser(6);
  await count('lms_courses', 2);
  await count('lms_enrollments', 2);
  await count('lms_orders', 0);
  await asUser(3);
  for (const [table, expected] of [['lms_courses', 2], ['lms_cohorts', 2], ['lms_lessons', 2], ['lms_profiles', 6], ['lms_materials', 2], ['lms_orders', 2], ['lms_audit_events', 1]]) await count(table, expected);
  await denied('delete from public.lms_audit_events');

  await db.exec('reset role');
  await denied(`insert into public.lms_attendance values ('${id(40)}', '${id(51)}', '${id(20)}', 'present', now())`, '23503');
  await denied(`insert into public.lms_lesson_progress values ('${id(40)}', '${id(31)}', '${id(20)}', 50, null)`, '23503');
  await denied(`insert into public.lms_orders(enrollment_id, idempotency_key, amount_krw) values ('${id(40)}', 'order-a', 10000)`, '23505');
  await denied(`insert into public.lms_orders(enrollment_id, idempotency_key, amount_krw) values ('${id(40)}', 'negative', -1)`, '23514');

  await db.exec(`update public.lms_enrollments set status = 'revoked' where id = '${id(40)}'`);
  await asUser(1);
  await count('lms_materials', 0);
  await count('lms_orders', 1);
  await db.exec('reset role');
  await db.exec(`update public.lms_enrollments set status = 'active', access_until = now() - interval '1 day' where id = '${id(40)}'`);
  await asUser(1);
  await count('lms_materials', 0);
  await denied(`select public.lms_manage('{"action":"roles","id":"${id(1)}","roles":["admin"]}', '${id(3)}')`);
  await denied(`select public.lms_link_identity('forged', '${id(1)}', 'forged@example.com', 'Forged', null)`);
  await db.exec('reset role');
  const manage=async(command,actor=3)=>{
    const result=await db.query('select public.lms_manage($1::jsonb,$2::uuid) as id',[JSON.stringify(command),id(actor)]);
    checks++;return result.rows[0].id;
  };
  const blocked=async fn=>{await assert.rejects(fn,error=>error.code==='P0001');checks++;};
  const template=await manage({action:'course',slug:'management-course',title:'Management course',published:true});
  await manage({action:'course',id:template,slug:'management-course',title:'Updated course',published:false});
  await blocked(()=>manage({action:'course',slug:'forged',title:'Forged'},1));
  const cohort=await manage({action:'cohort',course_id:template,title:'First cohort',delivery_mode:'offline',status:'open',starts_at:'2026-12-01T09:00:00+09:00',ends_at:'2026-12-01T12:00:00+09:00',capacity:20,price_krw:10000,location:'Room A',instructor_name:'Teacher A'});
  await blocked(()=>manage({action:'cohort',course_id:template,title:'Conflict',delivery_mode:'offline',status:'open',starts_at:'2026-12-01T10:00:00+09:00',ends_at:'2026-12-01T11:00:00+09:00',capacity:20,price_krw:10000,location:'Room A'}));
  await blocked(()=>manage({action:'cohort',id:cohort,course_id:id(10),title:'Move cohort',delivery_mode:'vod',status:'open',capacity:20,price_krw:0}));
  await manage({action:'cohort',course_id:template,title:'Second cohort',delivery_mode:'vod',status:'draft',capacity:20,price_krw:0});
  await blocked(()=>manage({action:'roles',id:id(3),roles:[]}));
  await blocked(()=>manage({action:'member',id:id(3),display_name:'Admin',status:'suspended'}));
  await manage({action:'roles',id:id(2),roles:['operations']});
  await manage({action:'course',slug:'operations-course',title:'Operations',published:false},2);
  await blocked(()=>manage({action:'roles',id:id(1),roles:['admin']},2));
  await manage({action:'member',id:id(2),display_name:'Suspended',status:'suspended'});
  await blocked(()=>manage({action:'course',slug:'suspended-course',title:'Suspended'},2));
  await db.exec(`update public.lms_profiles set legacy_firebase_uid='verified-firebase-uid' where id='${id(1)}'`);
  const link=await db.query('select public.lms_link_identity($1,$2,$3,$4,$5) as id',['verified-firebase-uid',id(1),'test1@example.com','Verified',null]);
  assert.equal(link.rows[0].id,id(1));checks++;
  await blocked(()=>db.query('select public.lms_link_identity($1,$2,$3,$4,$5)',['verified-firebase-uid',id(2),'test1@example.com','Forged',null]));
  await asUser(2);
  await count('lms_profiles',0);
  console.log(`PASS: ${checks} LMS schema, RLS, role separation, entitlement, and integrity checks`);
} finally {
  await db.close();
}
