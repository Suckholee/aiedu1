/** Cohort with an existing, dedicated promotional landing page. */
export const WORK_AUTOMATION_COURSE_ID = 'ai-work-automation-1027';

export function hasWorkAutomationLanding(courseId: string) {
  return courseId === WORK_AUTOMATION_COURSE_ID;
}

export interface CourseInstructorProfile {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  topic?: string;
  imagePosition?: string;
}

export const WORK_AUTOMATION_INSTRUCTORS: CourseInstructorProfile[] = [
  {
    name: '조영빈 대표',
    role: '어니스톤 대표 · 전문경영자문컨설턴트',
    avatar: '/instructors/cho-youngbin.png',
    bio: '중소기업 인증·정책자금·경영혁신 컨설팅과 강의를 운영하며, 현장에서 바로 적용할 수 있는 Claude 기반 비즈니스 자동화 실행 흐름을 설계합니다.',
    topic: '클로드를 통한 업무 자동화',
    imagePosition: 'center 62%',
  },
  {
    name: '이석호 대표',
    role: '피터 · neoNpeter 대표 · AI 교육 전문가',
    avatar: '/instructors/lee-seokho.jpg',
    bio: '실무 교육 경험을 바탕으로, 사진 한 장에서 내 말투가 담긴 블로그 콘텐츠를 완성하는 방법과 초보자를 위한 AI 활용 흐름을 안내합니다.',
    topic: 'AI와 블로그 시작하기',
    imagePosition: 'center 28%',
  },
  {
    name: '박재범 대표',
    role: '네오 · neoNpeter 대표 · AI 콘텐츠 디렉터',
    avatar: '/instructors/park-jaebeom.jpg',
    bio: 'AI 실전 강의와 콘텐츠 기획 경험을 바탕으로, 사진·영상·링크를 활용한 홍보 숏폼 콘텐츠와 비즈니스 자동화 제작 노하우를 안내합니다.',
    topic: 'AI로 숏폼 장착하기',
    imagePosition: 'center 28%',
  },
];

export function courseInstructorProfiles(instructor: CourseInstructorProfile): CourseInstructorProfile[] {
  const sharedClass = WORK_AUTOMATION_INSTRUCTORS.every(profile =>
    instructor.name.includes(profile.name.replace(' 대표', '')),
  );
  return sharedClass ? WORK_AUTOMATION_INSTRUCTORS : [instructor];
}

/** Keep operational capacity notes out of learner-facing course introductions. */
export function publicCourseDescription(description?: string | null) {
  return (description ?? '')
    .split(/\r?\n/)
    .filter(line => !/^\s*(?:총\s*정원|정원|잔여\s*좌석|남은\s*좌석|기존\s*(?:신청|예약)(?:\s*(?:인원|좌석))?)\s*[:：]/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
