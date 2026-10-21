import {WORK_AUTOMATION_COURSE_ID} from '@/lib/course-presentation';

export function WorkAutomationSchedule({courseId}:{courseId?:string|null}) {
  if (courseId !== WORK_AUTOMATION_COURSE_ID) return null;
  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-800">
    <p className="font-bold">완전 입문자는 13시까지 와주세요</p>
    <p>세팅 코칭 13:00~14:00 · 필요한 프로그램 설치와 실습 환경 설정을 도와드립니다.</p>
    <p>14:00~17:00 · AI 업무자동화 본 강의</p>
  </div>;
}
