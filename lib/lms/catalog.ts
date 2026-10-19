import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LmsCourse,LmsCohort } from './types';
import type { PlatformCourse } from '@/lib/platform-types';
import { LmsError } from './access';
import { courseInstructorProfiles, hasWorkAutomationLanding, publicCourseDescription } from '@/lib/course-presentation';

export async function readCatalog() {
  const client=createAdminClient();
  const [courses,cohorts]=await Promise.all([
    client.from('lms_courses').select('*').order('created_at',{ascending:false}),
    client.from('lms_cohorts').select('*').order('starts_at',{ascending:false,nullsFirst:false}),
  ]);
  if(courses.error || cohorts.error) throw new LmsError('교육과정 데이터를 조회하지 못했습니다.',503);
  return {courses:courses.data as LmsCourse[],cohorts:cohorts.data as LmsCohort[]};
}

/** Compatibility DTO keeps old course URLs while templates and cohorts are separate. */
export function platformCourses(courses:LmsCourse[],cohorts:LmsCohort[]):PlatformCourse[] {
  return cohorts.filter(h=>h.status!=='cancelled').flatMap(h=>{
    const c=courses.find(c=>c.id===h.course_id);
    if(!c)return [];
    const old={...c.metadata,...h.metadata};
    const local=(value:string|null)=>value?new Date(value).toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}):'';
    const start=local(h.starts_at),end=local(h.ends_at);
    const curriculum=old.curriculum??[];
    const instructor={role:'',avatar:'',bio:'',...old.instructor,name:h.instructor_name||old.instructor?.name||'담당 강사'};
    return [{...old,id:h.legacy_course_id??h.id,title:h.title,subtitle:c.subtitle||c.title,description:publicCourseDescription(c.description),
      category:c.category||'업무자동화',level:c.level||'입문',price:Number(h.price_krw),originalPrice:Number(h.price_krw),
      discountRate:0,totalSeats:h.capacity??100000,remainingSeats:Math.max(0,(h.capacity??100000)-(h.reserved_seats??0)),studentCount:h.reserved_seats??0,
      published:c.published&&['open','closed','running','completed'].includes(h.status),
      enrollmentOpen:h.status==='open',
      startDate:start.slice(0,10),startTime:start.slice(11,16),endTime:end.slice(11,16),
      location:h.location,thumbnail:hasWorkAutomationLanding(h.legacy_course_id??h.id)?'/posters/ai-work-automation-cover.svg':c.thumbnail||old.thumbnail||'/images/learning_classroom.png',
      instructor,instructors:courseInstructorProfiles(instructor),
      rating:0,reviewCount:0,dDay:'',curriculum,lectureCount:curriculum.reduce((n,ch)=>n+ch.lessons.length,0),
      highlights:old.highlights??[],durationText:old.durationText??(h.delivery_mode==='vod'?'온라인 학습':`${start.slice(11,16)} ~ ${end.slice(11,16)}`),
    } as PlatformCourse];
  });
}
