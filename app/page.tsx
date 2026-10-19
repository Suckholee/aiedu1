import type { Metadata } from 'next';
import { AcademyLanding } from '@/components/platform/AcademyLanding';

export const metadata: Metadata = {
  title: '네오앤피터 에듀플랫폼 | 배움을 일상의 변화로',
  description: 'AI 업무 자동화부터 블로그와 숏폼 영상까지. 직접 만들며 배우는 네오앤피터의 실전 AI 교육을 만나보세요.',
};

export default function Page() { return <AcademyLanding/>; }
