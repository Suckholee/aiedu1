'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
export function AcademyHeader(){
 const [login,setLogin]=useState(false); const [menu,setMenu]=useState(false); const {user,signOut}=useAuth();
 return <><header className="academy-header"><Link href="/" className="academy-brand">네오앤피터 에듀플랫폼<span>NEO & PETER · EDUCATION</span></Link><nav aria-label="주 메뉴" className={menu?'academy-nav is-open':'academy-nav'}><Link onClick={()=>setMenu(false)} href="/calendar">일정</Link><Link onClick={()=>setMenu(false)} href="/#programs">교육과정</Link><Link href="/education">플랫폼 소개</Link><Link href="/reviews">수강후기</Link><Link href="/materials">강의실 &amp; 자료실</Link><Link href="/my-learning">내 신청·학습 현황</Link></nav><div className="academy-header-actions"><button onClick={()=>user&&!user.isGuest?void signOut():setLogin(true)} className="academy-login">{user&&!user.isGuest?'로그아웃':'Google 로그인'}<ArrowUpRight size={15}/></button><button aria-label={menu?'메뉴 닫기':'메뉴 열기'} onClick={()=>setMenu(!menu)} className="academy-menu">{menu?<X/>:<Menu/>}</button></div></header><AuthModal open={login} onOpenChange={setLogin}/></>;
}
