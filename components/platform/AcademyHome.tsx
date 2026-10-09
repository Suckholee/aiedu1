'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { PromotionCalendar } from './PromotionCalendar';
export function AcademyHome() {
  const { data } = usePlatform();
  return <div className="academy-home">
    <section className="academy-hero" aria-label="AI 교육 소개">
      <Image src="/images/learning_classroom.png" alt="노트북으로 함께 학습하는 교육 현장 이미지" fill priority sizes="100vw" className="object-cover"/>
      <div className="academy-hero-shade"/>
      <div className="academy-hero-content"><p className="academy-eyebrow">AI EDUCATION · CREATE YOUR NEXT</p><h1>배움의 시작,<br/>일상의 변화.</h1><p className="academy-hero-motto">LEARN TODAY. <span>CREATE TOMORROW.</span></p><div className="academy-hero-bottom"><a href="#content-calendar" className="academy-outline-link">일정 <ArrowDown size={18}/></a><p>아이디어가 콘텐츠가 되고,<br/>작은 배움이 새로운 가능성이 되는 곳.<br/>우리의 다음 이야기를 함께 만들어갑니다.</p></div></div>
      <span className="academy-image-caption">AI EDUCATION / LEARNING TOGETHER</span>
    </section>
    <div className="academy-ticker"><span>LEARN.</span><span>MAKE.</span><span>SHARE.</span><p>함께 배우고, 만들고, 세상에 전하다.</p><ArrowUpRight size={24}/></div>
    <section id="content-calendar" className="academy-calendar-section"><div className="academy-section-intro"><p className="academy-eyebrow">/ OUR CONTENT CALENDAR /</p><p>우리의 이야기가<br/><strong>세상과 만나는 날짜.</strong></p></div><PromotionCalendar/></section>
    <section id="programs" className="academy-programs"><div className="academy-section-heading"><div><p className="academy-eyebrow">/ LEARNING PROGRAMS /</p><h2>오늘의 배움이,<br/>내일의 가능성으로.</h2></div><Link href="/courses">전체 교육과정 <ArrowUpRight size={18}/></Link></div><div className="academy-course-grid">{data.courses.filter(c=>c.published).slice(0,3).map((course,i)=><Link key={course.id} href={`/courses/${course.id}`} className="academy-course"><div className="academy-course-image"><Image src={course.thumbnail} alt={course.title} fill sizes="(max-width: 700px) 100vw, 33vw" className="object-cover"/><span>0{i+1}</span><ArrowUpRight size={22}/></div><p>{course.category} · {course.level}</p><h3>{course.title}</h3><div className="academy-course-date"><span>{course.startDate} · {course.startTime}</span><span>과정 살펴보기 ↗</span></div></Link>)}</div></section>
    <section className="academy-closing"><p className="academy-eyebrow">/ YOUR NEXT CHAPTER /</p><h2>다음 이야기는,<br/>함께 시작합니다.</h2><Link href="/courses">나에게 맞는 교육과정 찾기 <ArrowUpRight size={20}/></Link></section>
    <footer className="academy-footer"><Link href="/">네오앤피터 에듀플랫폼<span>NEO & PETER · EDUCATION</span></Link><p>배움에서 실천까지. 우리의 가능성이 자라는 곳.</p><div><Link href="/calendar">일정</Link><Link href="/my-learning">내 신청·학습 현황</Link></div></footer>
  </div>;
}
