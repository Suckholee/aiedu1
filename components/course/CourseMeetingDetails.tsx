import {WorkAutomationSchedule} from './WorkAutomationSchedule';
import {Calendar} from 'lucide-react';
import {CourseVenue} from './CourseVenue';
import {PLATFORM_BUILDING_WORKSHOP as workshop} from '@/lib/platform-building-workshop';
export function CourseMeetingDetails({startsAt,endsAt,location,courseId}:{startsAt?:string|null;endsAt?:string|null;location?:string|null;courseId?:string|null}){
 const day=(value:string)=>new Date(value).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'});
 const time=(value:string)=>new Date(value).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false});
 const schedule=courseId===workshop.slug?workshop.schedule:startsAt?`${day(startsAt)} ${time(startsAt)}${endsAt?` ~ ${day(startsAt)===day(endsAt)?'':`${day(endsAt)} `}${time(endsAt)}`:''}`:'일시 별도 안내';
 return <div className="space-y-3 text-sm text-slate-600"><div className="flex items-start gap-2"><Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true"/><div><p className="text-xs text-slate-500">교육 일시</p><p className="mt-1">{schedule}</p></div></div><WorkAutomationSchedule courseId={courseId}/><CourseVenue location={location||'장소 안내 예정'}/></div>;
}
