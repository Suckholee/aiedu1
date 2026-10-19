import type {LmsCohort,LmsCourse} from './types';
export const enrollmentNames={applied:'신청',waitlisted:'대기',active:'승인',rejected:'반려',cancelled:'취소',completed:'수료',revoked:'수강권 회수'} as const;
export const attendanceNames={present:'출석',late:'지각',absent:'결석',excused:'공결'} as const;
export type EnrollmentStatus=keyof typeof enrollmentNames;
export type AttendanceStatus=keyof typeof attendanceNames;
export interface LearningEnrollment {
 payment?:{order_id:string;number:string;status:string;amount_krw:number;notice_requested:boolean};
 id:string;legacy_id:string|null;cohort_id:string;learner_id:string;status:EnrollmentStatus;access_until:string|null;applied_at:string;
 contact_name:string;contact_email:string;contact_phone:string;company?:string;learner_note?:string;amount_krw:number;notes:{at:string;text:string;actor?:string}[];
}
export interface LearningSession {id:string;cohort_id:string;title:string;starts_at:string;ends_at:string;location:string;archived:boolean}
export interface LearningLesson {id:string;cohort_id:string;title:string;position:number;kind:'video'|'live'|'document'|'practice'|'quiz';required:boolean;content_url:string;archived:boolean;legacy_material_id:string|null}
export interface LearningAttendance {enrollment_id:string;session_id:string;cohort_id:string;status:AttendanceStatus;note:string;recorded_at:string}
export interface LearningProgress {enrollment_id:string;lesson_id:string;cohort_id:string;progress_percent:number;completed_at:string|null}
export interface LearningData {courses:LmsCourse[];cohorts:LmsCohort[];enrollments:LearningEnrollment[];sessions:LearningSession[];lessons:LearningLesson[];attendance:LearningAttendance[];progress:LearningProgress[];actor_id:string;staff:boolean}
export const canStudy=(e:LearningEnrollment)=>['active','completed'].includes(e.status)&&(!e.access_until||Date.parse(e.access_until)>Date.now());
export function learningSummary(data:LearningData,e:LearningEnrollment){
 const lessons=data.lessons.filter(l=>l.cohort_id===e.cohort_id&&!l.archived);
 const sessions=data.sessions.filter(s=>s.cohort_id===e.cohort_id&&!s.archived);
 const complete=lessons.filter(l=>data.progress.some(p=>p.enrollment_id===e.id&&p.lesson_id===l.id&&p.progress_percent===100)).length;
 const percent=lessons.length?Math.round(lessons.reduce((n,l)=>n+(data.progress.find(p=>p.enrollment_id===e.id&&p.lesson_id===l.id)?.progress_percent??0),0)/lessons.length):0;
 const attended=sessions.filter(s=>data.attendance.some(a=>a.enrollment_id===e.id&&a.session_id===s.id&&a.status!=='absent')).length;
 return {complete,percent,attended,lessons:lessons.length,sessions:sessions.length};
}
