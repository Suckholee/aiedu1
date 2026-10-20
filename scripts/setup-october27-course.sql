begin;
do $$
declare actor uuid; course uuid; cohort uuid;
begin
 select p.id into strict actor from public.lms_profiles p join public.lms_staff_members s on s.profile_id=p.id where p.email='peter15975345@gmail.com' and p.status='active' and s.role='admin';
 select id into course from public.lms_courses where slug='ai-work-automation-1027';
 if course is not null then raise exception 'October course already exists; review instead of overwriting'; end if;
 course:=public.lms_manage(jsonb_build_object('action','course','slug','ai-work-automation-1027','title','AI 업무자동화 실전 마스터 클래스','subtitle','10월 27일 화요 특강 · 설치 지원 1시간 + 본 강의 3시간','description',E'AI 업무자동화 실전 마스터 클래스\n\n일시: 2026년 10월 27일(화) 17:00~21:00 (설치 지원 17:00~18:00 / 본 강의 18:00~21:00)\n장소: 위든타워 3층\n강사진: 이석호 · 조영빈 · 박재범 대표\n신규 수강료: 150,000원\n\n로그인 후 수강신청을 접수하고, 내 신청·결제 목록에서 주문과 납부 안내를 확인하세요. 신청 접수와 입금 확인은 별도 처리됩니다.','category','업무자동화','level','입문','published',false,'thumbnail','/images/ai_consulting_workflow.jpg'),actor);
 cohort:=public.lms_manage(jsonb_build_object('action','cohort','course_id',course,'title','AI 업무자동화 실전 마스터 클래스 (10월 27일 화요 특강)','delivery_mode','offline','status','draft','starts_at','2026-10-27T17:00:00+09:00','ends_at','2026-10-27T21:00:00+09:00','capacity',20,'reserved_seats',7,'price_krw',150000,'location','위든타워 3층','instructor_name','이석호 · 조영빈 · 박재범 대표'),actor);
 update public.lms_cohorts set legacy_course_id='ai-work-automation-1027',metadata=jsonb_build_object('durationText','설치 지원 17~18시 · 본 강의 18~21시','badge','10/27 화요 특강','instructor',jsonb_build_object('avatar','/instructors/ai/lee-seokho-editorial-v1.png','role','어니스톤 · neoNpeter','bio','이석호 · 조영빈 · 박재범 대표 공동 강의'),'highlights',jsonb_build_array('AI를 업무에 적용하고 싶은 분','실전 업무자동화에 관심 있는 분')) where id=cohort;
end $$;
commit;
select slug,published from public.lms_courses where slug='ai-work-automation-1027';
select legacy_course_id,status,capacity,reserved_seats,price_krw from public.lms_cohorts where legacy_course_id='ai-work-automation-1027';
