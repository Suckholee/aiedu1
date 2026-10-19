'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AcademyLanding.module.css';

const landingLinks = [['/#about','플랫폼 소개'],['/#programs','교육과정'],['/#instructors','강사진'],['/#content-calendar','일정·소식'],['/#faq','자주 묻는 질문'],['/my-applications','내 신청·결제']];
const calendarLinks = [['/calendar','일정'],['/#programs','교육과정'],['/education','플랫폼 소개'],['/reviews','수강후기'],['/materials','강의실 & 자료실'],['/my-learning','내 신청·학습 현황']];

export function AcademyHeader({landing=false}:{landing?:boolean}){
 const [login,setLogin]=useState(false);
 const [menu,setMenu]=useState(false);
 const {user,signOut,loading}=useAuth();
 const links=landing?landingLinks:calendarLinks;

 return <>
  {landing&&<a href="#landing-title" className={styles.skipLink}>본문으로 이동</a>}
  <header className={`academy-header ${landing?styles.header:''}`}>
   <Link href="/" className={`academy-brand ${landing?styles.brand:''}`}>네오앤피터{landing?<em>에듀플랫폼</em>:' 에듀플랫폼'}<span>NEO &amp; PETER · EDUCATION</span></Link>
   <nav id="academy-navigation" aria-label="주 메뉴" className={`academy-nav ${menu?'is-open':''} ${landing?styles.nav:''}`} onKeyDown={event=>{if(event.key==='Escape')setMenu(false);}}>
    {links.map(([href,label])=><Link key={href} href={href} onClick={()=>setMenu(false)}>{label}</Link>)}
   </nav>
   <div className="academy-header-actions">
    <button disabled={loading} onClick={()=>user&&!user.isGuest?void signOut():setLogin(true)} className={`academy-login ${landing?styles.login:''}`}>{loading?'확인 중':user&&!user.isGuest?'로그아웃':'로그인'}<ArrowUpRight size={15}/></button>
    <button aria-label={menu?'메뉴 닫기':'메뉴 열기'} aria-expanded={menu} aria-controls="academy-navigation" onClick={()=>setMenu(!menu)} className="academy-menu">{menu?<X/>:<Menu/>}</button>
   </div>
  </header>
  <AuthModal open={login} onOpenChange={setLogin}/>
 </>;
}
