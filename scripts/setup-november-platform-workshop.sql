-- Creates a draft only. Open enrollment after the public application UI is deployed.
begin;
do $$
declare actor uuid; course uuid; cohort uuid; orders_before bigint; enrollments_before bigint;
begin
 select p.id into strict actor from public.lms_profiles p join public.lms_staff_members s on s.profile_id=p.id where p.email='peter15975345@gmail.com' and p.status='active' and s.role='admin';
 perform pg_advisory_xact_lock(hashtext('lms.management'));
 if exists(select 1 from public.lms_courses where slug='my-platform-1102') then raise exception 'Workshop already exists; inspect before changing'; end if;
 select count(*) into orders_before from public.lms_orders;
 select count(*) into enrollments_before from public.lms_enrollments;
 course:=public.lms_manage(jsonb_build_object('action','course','slug','my-platform-1102','title','나만의 플랫폼 만들기','subtitle','AI 블로그 홍보 페이지 공통 실습 4시간 + 개인 프로젝트 코칭 4시간','description',E'1회차: 2026년 11월 1일(일) 14:00~18:00\nAI 블로그 홍보 페이지 만들기: 홍보 화면, 글 작성·조회·수정·삭제, AI 초안 검토·저장, 배포\n\n2회차: 2026년 11월 8일(일) 14:00~18:00\n개인 프로젝트 맞춤 코칭: 목표와 핵심 기능 선정, 개별 구현·오류 해결, 결과 공유\n\n장소: 위든타워 3층\n2회 전체 수강료: 800,000원\n신청 접수와 결제 완료는 별도 처리됩니다.','category','개발·백엔드','level','입문','published',false,'thumbnail','/posters/my-platform-1102.png'),actor);
 cohort:=public.lms_manage(jsonb_build_object('action','cohort','course_id',course,'title','나만의 플랫폼 만들기 (11월 1일·8일, 2회)','delivery_mode','offline','status','draft','starts_at','2026-11-01T14:00:00+09:00','ends_at','2026-11-08T18:00:00+09:00','capacity',null,'reserved_seats',0,'price_krw',800000,'location','위든타워 3층','instructor_name',''),actor);
 update public.lms_cohorts set legacy_course_id='my-platform-1102',metadata=jsonb_build_object('durationText','2회 · 총 8시간','badge','11/1·8 일요 과정','scheduleText','11월 1일·8일 (일) 14:00~18:00') where id=cohort;
 perform public.lms_learning(jsonb_build_object('action','session','cohort_id',cohort,'title','AI 블로그 홍보 페이지 만들기','starts_at','2026-11-01T14:00:00+09:00','ends_at','2026-11-01T18:00:00+09:00','location','위든타워 3층'),actor);
 perform public.lms_learning(jsonb_build_object('action','session','cohort_id',cohort,'title','개인 프로젝트 맞춤 코칭','starts_at','2026-11-08T14:00:00+09:00','ends_at','2026-11-08T18:00:00+09:00','location','위든타워 3층'),actor);
 if orders_before<>(select count(*) from public.lms_orders) or enrollments_before<>(select count(*) from public.lms_enrollments) then raise exception 'Existing applications or orders changed'; end if;
end $$;
commit;
select c.slug,c.published,h.status,h.price_krw,h.starts_at,h.ends_at,(select count(*) from public.lms_sessions s where s.cohort_id=h.id and not s.archived) sessions from public.lms_courses c join public.lms_cohorts h on h.course_id=c.id where c.slug='my-platform-1102';
