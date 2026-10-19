import Image from 'next/image';
import type { CourseInstructorProfile } from '@/lib/course-presentation';

export function CourseInstructorProfiles({ profiles }: { profiles: CourseInstructorProfile[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3" data-course-instructors>
      {profiles.map(profile => (
        <article key={profile.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
          {profile.topic && <p className="mb-5 rounded-xl bg-violet-100 px-3 py-2 text-xs font-bold text-violet-800">{profile.topic}</p>}
          <div className="relative mb-4 size-24 overflow-hidden rounded-2xl bg-white">
            {profile.avatar && <Image src={profile.avatar} alt={profile.name} fill sizes="96px" unoptimized={!profile.avatar.startsWith('/')} className="object-cover" style={{ objectPosition: profile.imagePosition ?? 'center' }}/>}
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{profile.name}</h3>
          <p className="mt-2 text-xs font-semibold leading-6 text-violet-700">{profile.role}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{profile.bio}</p>
        </article>
      ))}
    </div>
  );
}
