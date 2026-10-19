'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Check, Plus } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './AcademyLanding.module.css';
import {ShortsShowcase} from '@/components/shorts/ShortsShowcase';
import { PLATFORM_BUILDING_WORKSHOP as workshop } from '@/lib/platform-building-workshop';
import { BlogTeaser } from '@/components/brand-blog/BlogTeaser';
import { BusinessInfo } from '@/components/layout/BusinessInfo';

const areas = [
  { title: '반복하는 일에,\n새로운 여유를.', category: 'AI 업무 자동화', image: '/images/teaching/cho-work-automation-workshop-v1.png', alt: '조영빈 대표가 업무자동화를 설명하는 AI 재구성 강의 장면', description: '대화와 메모를 보고서로. 나의 업무 흐름에 맞는 AI 활용을 직접 익힙니다.', outcome: '문서 작성 · 업무 워크플로우' },
  { title: '나의 이야기가,\n콘텐츠가 되도록.', category: 'AI 블로그 & 콘텐츠', image: '/images/teaching/peter-blog-workshop-v1.png', alt: '피터 이석호 대표가 사진과 블로그 작성을 지도하는 AI 재구성 강의 장면', description: '사진 한 장, 일상의 경험에서 시작해 나다운 블로그 콘텐츠를 완성합니다.', outcome: '아이디어 정리 · 블로그 제작' },
  { title: '짧은 영상으로,\n더 넓은 세상에.', category: 'AI 숏폼 영상', image: '/images/teaching/neo-shortform-workshop-v1.png', alt: '네오 박재범 대표가 카메라 촬영을 시연하는 AI 재구성 강의 장면', description: '아이디어에 이미지와 목소리를 더해 나의 비즈니스를 알리는 영상을 만듭니다.', outcome: '콘텐츠 기획 · 숏폼 제작' },
];

const instructors = [
  { name: '조영빈', role: '어니스톤 대표', topic: '경영 현장에서 시작하는\n실전 업무 자동화.', image: '/instructors/ai/cho-youngbin-editorial-v1.png', position: 'center top', label: 'CLAUDE · WORKFLOW' },
  { name: '이석호', role: '피터 · neoNpeter 대표', topic: '나의 언어로 완성하는\n블로그와 콘텐츠.', image: '/instructors/ai/lee-seokho-editorial-v1.png', position: 'center top', label: 'AI · BLOG AUTOMATION' },
  { name: '박재범', role: '네오 · neoNpeter 대표', topic: '아이디어를 세상에 전하는\nAI 숏폼 영상.', image: '/instructors/ai/park-jaebeom-editorial-v1.png', position: 'center top', label: 'AI · SHORT-FORM VIDEO' },
];

const questions = [
  ['AI를 처음 배우는데 괜찮을까요?', '처음 시작하는 분도 따라올 수 있도록, 내 업무와 일상에 가까운 예제로 함께 실습합니다. 과정별 상세 안내에서 수준과 준비사항을 확인해주세요.'],
  ['회원가입은 어떻게 하나요?', '카카오톡 또는 Google 계정으로 로그인하면 회원가입이 진행됩니다. 가입 후 같은 계정으로 로그인하면 신청 내역과 학습 현황을 이어서 확인할 수 있습니다.'],
  ['수강신청과 결제 내역은 어디서 확인하나요?', '교육과정에서 모집 중인 강의를 선택해 신청하세요. 로그인 후 ‘내 신청·결제 목록’에서 신청 내용과 결제 안내, 처리 상태를 확인할 수 있습니다.'],
  ['수업 자료와 학습 진도는 어디서 보나요?', '수강 권한이 승인된 과정은 ‘내 강의실·학습 현황’에서 확인할 수 있습니다. 과정에 제공되는 자료와 차시별 학습 내역도 함께 볼 수 있습니다.'],
];

export function AcademyLanding() {
  const { data, ready, error, refresh } = usePlatform();
  const courses = data.courses.filter(course => course.published).slice(0, 3);
  const posts = data.promotionPosts.filter(post => post.status === '게시 완료')
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 3);

  return <div className={styles.home}>
    <section className={styles.hero} aria-labelledby="landing-title">
      <Image src="/images/teaching/instructors-classroom-hero-v1.png" alt="조영빈·이석호·박재범 강사진이 함께 수업을 진행하는 AI 재구성 장면" fill preload sizes="100vw" className={styles.heroImage}/>
      <div className={styles.heroShade}/>
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>NEO &amp; PETER · AI EDUCATION</p>
        <h1 id="landing-title">배움의 시작,<br/>일상의 변화.</h1>
        <p className={styles.motto}>LEARN TODAY. <span>CREATE TOMORROW.</span></p>
        <div className={styles.heroAside}><p>막막했던 업무가 가벼워지고,<br/>나의 이야기가 콘텐츠가 되는 시간.<br/>작은 배움을, 일상의 새로운 가능성으로.</p><a href="#programs" className={styles.outlineButton}>교육과정 살펴보기 <ArrowUpRight size={18}/></a></div>
      </div>
      <a href="#about" className={styles.scrollCue}><ArrowDown size={14}/> SCROLL TO DISCOVER</a>
      <span className={styles.imageCaption}>실제 강사진 사진 기반 AI 재구성</span>
    </section>

    <section id="about" className={`${styles.section} ${styles.about}`} aria-labelledby="about-title">
      <div><p className={styles.kicker}>/ ABOUT NEO &amp; PETER /</p><h2 id="about-title">배우는 데서 끝나지 않는,<br/>내 것이 되는 AI.</h2><div className={styles.aboutImage}><Image src="/images/teaching/instructors-collaboration-v1.png" alt="네오앤피터 강사진이 함께 실습을 지도하는 AI 재구성 장면" fill sizes="(max-width: 800px) 100vw, 45vw"/></div></div>
      <div className={styles.aboutCopy}><p className={styles.wordmark}>LEARN.<br/><span>MAKE. SHARE.</span></p><p>기술의 이름을 외우는 것보다,<br/>내 일에 한 번 써보는 경험이 더 중요하니까.</p><p>보고서를 쓰고, 블로그를 만들고, 짧은 영상을 완성하며<br className={styles.desktopBreak}/> 오늘 배운 것을 내일의 일상으로 가져갑니다.</p><ul className={styles.principles}>{['처음부터 차근차근', '직접 만들며 배우고', '나의 일에 연결하기'].map(text => <li key={text}><Check size={15}/>{text}</li>)}</ul><Link href="/education" className={styles.textLink}>네오앤피터 알아보기 <ArrowUpRight size={17}/></Link></div>
    </section>

    <section id="programs" className={`${styles.section} ${styles.programs}`} aria-labelledby="programs-title">
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>/ LEARNING PROGRAMS /</p><h2 id="programs-title">지금의 나에게 필요한,<br/>다음 배움.</h2></div><p>처음이어도, 더 잘하고 싶어도.<br/>업무 자동화부터 블로그와 숏폼까지.<br/>배움의 출발점을 함께 찾아갑니다.</p></div>
      <div className={styles.areaGrid}>{areas.map((area, index) => <article className={styles.area} key={area.category}>
        <Link href="/courses" className={styles.areaImage} aria-label={`${area.category} 교육과정 살펴보기`}><Image src={area.image} alt={area.alt} fill style={{objectPosition:'center top'}} sizes="(max-width: 800px) 100vw, 33vw"/><span className={styles.imageNumber}>0{index + 1}</span><span className={styles.imageArrow}><ArrowUpRight size={20}/></span></Link>
        <p className={styles.areaCategory}>{area.category}</p><h3>{area.title}</h3><p className={styles.areaDescription}>{area.description}</p><p className={styles.areaOutcome}>{area.outcome}</p>
      </article>)}</div>
      <p className={styles.programImageNote}>실제 강사진의 사진과 교육 내용을 바탕으로 AI로 재구성한 강의 장면입니다.</p>
      <div className={styles.enrollmentHeading}><h3>지금 만날 수 있는 교육과정</h3><Link href="/courses" className={styles.textLink}>전체 교육과정 <ArrowUpRight size={16}/></Link></div>
      {!ready || error ? <div className={styles.empty} role="status"><p>{error ? '교육과정 정보를 불러오지 못했습니다.' : '모집 일정을 확인하고 있습니다.'}</p>{error && <button onClick={() => void refresh()} className={styles.textLink}>다시 확인하기 <ArrowUpRight size={16}/></button>}</div> : courses.length ? <div className={styles.courseList}>{courses.filter(course => course.id !== workshop.slug).map(course => <Link key={course.id} href={`/courses/${course.id}`} className={styles.courseRow}><span>{course.category}</span><h4>{course.title}</h4><span>{course.startDate} · {course.startTime}</span><ArrowUpRight size={20}/></Link>)}</div> : <div className={styles.empty}><div><strong>다음 교육과정을 준비하고 있습니다.</strong><p>새로운 모집 소식은 교육과정과 일정에서 확인해주세요.</p></div><Link href="/calendar" className={styles.textLink}>일정 확인하기 <ArrowUpRight size={17}/></Link></div>}
      <div className={styles.courseList}><Link href={workshop.href} className={styles.courseRow}><span>2회 · 총 8시간</span><h4>{workshop.title}</h4><span>{workshop.schedule} · {workshop.price.toLocaleString()}원</span><ArrowUpRight size={20}/></Link></div>
    </section>

    <BlogTeaser/>

    <section id="instructors" className={`${styles.section} ${styles.instructors}`} aria-labelledby="instructors-title">
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>/ MEET YOUR INSTRUCTORS /</p><h2 id="instructors-title">현장을 아는 사람들,<br/>당신의 시작을 함께합니다.</h2></div><p>서로 다른 경험, 하나의 방향.<br/>직접 해내는 배움을 함께 만듭니다.</p></div>
      <div className={styles.instructorGrid}>{instructors.map((person, index) => <article key={person.name} className={styles.instructor}>
        <div className={styles.portrait}><Image src={person.image} alt={`${person.role} ${person.name} · 원본 사진 기반 AI 가공 프로필`} fill sizes="(max-width: 600px) 85vw, 30vw" style={{objectPosition:person.position}}/><span>0{index + 1} / INSTRUCTOR</span></div><div className={styles.instructorIdentity}><h3>{person.name}<span>{person.role}</span></h3></div><p className={styles.instructorTopic}>{person.topic}</p><p className={styles.instructorLabel}>{person.label}</p>
      </article>)}</div>
      <p className={styles.portraitNote}>실제 강사진의 원본 사진을 바탕으로 AI 가공한 이미지입니다.</p>
    </section>

    <ShortsShowcase/>

    <section className={styles.journey} aria-labelledby="journey-title"><div className={styles.journeyInner}>
      <div><p className={styles.kicker}>/ YOUR LEARNING JOURNEY /</p><h2 id="journey-title">한 번의 배움이,<br/>내 일의 변화가 되도록.</h2><p className={styles.journeyCopy}>나에게 맞는 과정을 찾는 순간부터<br/>직접 만든 결과물을 다시 꺼내보는 날까지.</p><Link href="/my-learning" className={styles.outlineButton}>내 강의실로 이동 <ArrowUpRight size={17}/></Link></div>
      <ol className={styles.steps}><li><span>01</span><div><h3>나에게 맞는 배움을 찾고</h3><p>교육 내용과 일정을 살펴보고, 모집 중인 과정에 신청합니다.</p><Link href="/courses">교육과정 보기 <ArrowUpRight size={14}/></Link></div></li><li><span>02</span><div><h3>직접 만들며 익히고</h3><p>수강이 승인되면 강의 자료와 실습으로 나만의 결과물을 만듭니다.</p><Link href="/materials">강의실 &amp; 자료실 <ArrowUpRight size={14}/></Link></div></li><li><span>03</span><div><h3>나의 변화를 이어갑니다</h3><p>내 학습 현황과 진도를 확인하며, 배운 것을 업무와 일상에 연결합니다.</p><Link href="/my-learning">내 학습 현황 <ArrowUpRight size={14}/></Link></div></li></ol>
    </div></section>

    <section id="content-calendar" className={`${styles.section} ${styles.updates}`} aria-labelledby="updates-title"><div className={styles.sectionHeading}><div><p className={styles.kicker}>/ NEWS &amp; CALENDAR /</p><h2 id="updates-title">우리의 다음 이야기가<br/>시작되는 날짜.</h2></div><Link href="/calendar" className={styles.textLink}>전체 일정 보기 <ArrowUpRight size={17}/></Link></div>
      {courses.filter(course => course.enrollmentOpen && course.startDate).map(course => <Link key={course.id} href={`/courses/${encodeURIComponent(course.id)}`} className={styles.newsRow}><time dateTime={course.startDate}>{course.startDate.replaceAll('-', '.')}</time><span>{course.remainingSeats > 0 ? '수강생 모집' : '정원 마감'}</span><div><h3>{course.title}</h3><p>{course.startTime} ~ {course.endTime} · {course.location} · ₩{course.price.toLocaleString()}</p></div><ArrowUpRight size={20}/></Link>)}
      {workshop.sessions.map((session,index)=><Link key={session.date} href={workshop.href} className={styles.newsRow}><time dateTime={session.date}>{session.date.replaceAll('-', '.')}</time><span>교육 예정 · {index+1}회차</span><div><h3>{workshop.title}</h3><p>{session.title} · {workshop.location} · 14:00~18:00</p></div><ArrowUpRight size={20}/></Link>)}
      {posts.length ? <div className={styles.newsList}>{posts.map(post => <Link key={post.id} href="/calendar" className={styles.newsRow}><time dateTime={post.date}>{post.date.replaceAll('-', '.')}</time><span>{post.channel}</span><h3>{post.title}</h3><ArrowUpRight size={20}/></Link>)}</div> : <p className={styles.newsEmpty}>{!ready ? '새로운 소식을 확인하고 있습니다.' : data.sync?.legacy === 'unavailable' || error ? '소식을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.' : '새로운 교육 소식을 준비하고 있습니다. 전체 일정에서 다음 만남을 확인해주세요.'}</p>}
    </section>

    <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title"><div><p className={styles.kicker}>/ BEFORE YOUR FIRST CLASS /</p><h2 id="faq-title">궁금한 이야기를<br/>먼저 만나보세요.</h2></div><div className={styles.questions}>{questions.map(([question,answer]) => <details key={question}><summary>{question}<Plus size={19}/></summary><p>{answer}</p></details>)}</div></section>
    <section className={styles.closing}><p className={styles.kicker}>/ YOUR NEXT CHAPTER /</p><h2>이제, 당신의<br/>가능성을 펼칠 차례.</h2><Link href="/courses" className={styles.outlineButton}>나의 다음 배움 찾아보기 <ArrowUpRight size={19}/></Link></section>
    <footer className={styles.footer}><div><Link href="/" className={styles.footerBrand}>네오앤피터 <span>에듀플랫폼</span><small>NEO &amp; PETER · EDUCATION</small></Link><p>배움에서 실천까지. 우리의 가능성이 자라는 곳.</p></div><nav aria-label="하단 메뉴"><Link href="/education">플랫폼 소개</Link><Link href="/courses">교육과정</Link><Link href="/blog">Blog</Link><Link href="/calendar">일정</Link><Link href="/my-applications">내 신청·결제 목록</Link><Link href="/refund-policy">취소·환불 정책</Link><Link href="/service-policy">강의 제공 안내</Link></nav><p className={styles.copyright}>어니스톤 · neoNpeter<br/>© {new Date().getFullYear()} NEO &amp; PETER. All rights reserved.</p><BusinessInfo className={styles.businessInfo}/></footer>
    <Link href="/courses" className={styles.floatingCta}><span>NEO &amp; PETER</span><strong>교육과정 · 수강신청</strong><span className={styles.floatingPlus}><Plus size={24}/></span></Link>
  </div>;
}
