import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {BLOG_CATEGORIES,blogDate,type BlogPost} from '@/lib/brand-blog/types';
import styles from './BlogMosaic.module.css';

type Entry=Pick<BlogPost,'slug'|'title'|'excerpt'|'category'|'published_at'>&Partial<Pick<BlogPost,'sections'|'takeaways'|'trend_summary'>>;
const photos={ai:'/images/teaching/instructors-collaboration-v1.png',workflow:'/images/teaching/instructors-classroom-hero-v1.png',content:'/images/teaching/peter-blog-workshop-v1.png',platform:'/images/teaching/instructors-collaboration-v1.png'};
export function BlogMosaic({posts,compact=false}:{posts:Entry[];compact?:boolean}){
 if(!posts.length)return null;
 const first=posts[0];
 const entry=(i:number)=>posts[i]??first;
 const url=(post:Entry,anchor='')=>`/blog/${post.slug}${anchor}`;
 const stamp=(post:Entry)=>post.published_at?blogDate(post.published_at):'NEO & PETER JOURNAL';
 const secondary=entry(1),note=entry(2),blue=entry(3),paper=entry(4),practice=entry(5);
 const section=first.sections?.[0],insight=first.sections?.[1];
 return <div className={`${styles.board} ${compact?styles.compact:''}`} aria-label="블로그 이야기 모자이크">
  <Link href={url(first)} className={`${styles.tile} ${styles.lead}`} data-story-block="lead">
   <div className={styles.eyebrow}><span>{BLOG_CATEGORIES[first.category]}</span><span>01 / LATEST</span></div>
   <div className={styles.leadBody}><h2>{first.title}</h2><p>{first.excerpt}</p></div>
   <div className={styles.bottom}><time dateTime={first.published_at??undefined}>{stamp(first)}</time><ArrowUpRight aria-hidden="true"/></div>
  </Link>
  <Link href={url(secondary)} className={`${styles.tile} ${styles.photo}`} data-story-block="photo" aria-label={`${secondary.title} 읽기`}>
   <img src={photos[secondary.category]} alt="" className={styles.photoImage}/>
   <div className={styles.photoShade}/>
   <div className={styles.eyebrow}><span>{posts[1]?BLOG_CATEGORIES[secondary.category]:'이야기 속으로'}</span><ArrowUpRight aria-hidden="true"/></div>
   <div className={styles.photoCaption}>{posts[1]?<h2>{secondary.title}</h2>:<><span className={styles.photoMotto}>LEARN TODAY.<br/>CREATE TOMORROW.</span><span className={styles.photoCredit}>네오앤피터 · AI 교육 콘셉트</span></>}</div>
  </Link>
  <Link href={url(note,posts[2]?'':section?'#section-1':'')} className={`${styles.tile} ${styles.note}`} data-story-block="note">
   <div className={styles.eyebrow}><span>{posts[2]?BLOG_CATEGORIES[note.category]:'이 글의 첫 관점'}</span><ArrowUpRight aria-hidden="true"/></div>
   <h2>{posts[2]?note.title:section?.heading??first.title}</h2>
  </Link>
  <Link href={url(blue,posts[3]?'':'#why-it-matters')} className={`${styles.tile} ${styles.blue}`} data-story-block="insight">
   <div className={styles.eyebrow}><span>{posts[3]?BLOG_CATEGORIES[blue.category]:'WHY IT MATTERS'}</span><ArrowUpRight aria-hidden="true"/></div>
   <div><h2>{posts[3]?blue.title:'지금, 이 변화에 주목하는 이유.'}</h2><p>{posts[3]?blue.excerpt:first.trend_summary??first.excerpt}</p></div>
   <span className={styles.small}>{posts[3]?stamp(blue):'01 / 이 글 더 읽기'}</span>
  </Link>
  <Link href={url(paper,posts[4]?'':insight?'#section-2':'')} className={`${styles.tile} ${styles.paper}`} data-story-block="context">
   <div className={styles.eyebrow}><span>{posts[4]?BLOG_CATEGORIES[paper.category]:'같은 글, 한 걸음 더'}</span><ArrowUpRight aria-hidden="true"/></div>
   <div><h2>{posts[4]?paper.title:insight?.heading??'내 일에 연결하는 새로운 관점.'}</h2><p>{posts[4]?paper.excerpt:insight?.paragraphs[0]??first.excerpt}</p></div>
   <span className={styles.small}>{posts[4]?stamp(paper):'01 / 본문에서 이어 읽기'}</span>
  </Link>
  <Link href={url(practice,posts[5]?'':'#next-practice')} className={`${styles.tile} ${styles.practice}`} data-story-block="practice">
   <div className={styles.eyebrow}><span>{posts[5]?BLOG_CATEGORIES[practice.category]:'이 글의 작은 실습'}</span><ArrowUpRight aria-hidden="true"/></div>
   <h2>{posts[5]?practice.title:first.takeaways?.[0]??'읽은 아이디어를 내 일로 옮겨보세요.'}</h2>
  </Link>
 </div>;
}
