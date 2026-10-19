'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Play,ArrowLeft,ArrowRight,Film} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {ShortVideo} from '@/lib/lms/shorts-validation';
import styles from './ShortsShowcase.module.css';
const duration=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
export function ShortsShowcase(){
 const [videos,setVideos]=useState<ShortVideo[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<string|null>(null),[playError,setPlayError]=useState(false);
 const track=useRef<HTMLDivElement>(null),controller=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{controller.current?.abort();const c=new AbortController();controller.current=c;setLoading(true);try{const r=await fetch('/api/lms/shorts',{signal:AbortSignal.any([c.signal,AbortSignal.timeout(15000)]),cache:'no-store'});const body=await r.json();if(!r.ok)throw Error(body.error);if(c.signal.aborted)return;setVideos(body.shorts);setError('');setPlayError(false);}catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'영상을 불러오지 못했습니다.');}finally{if(!c.signal.aborted)setLoading(false);}},[]);
 useEffect(()=>{void load();return()=>controller.current?.abort();},[load]);
 const active=videos.find(v=>v.id===selected);
 return <section id="shorts" className={styles.section} aria-labelledby="shorts-title">
  <div className={styles.heading}><div><p className={styles.kicker}>/ AI IN EVERYDAY LIFE /</p><h2 id="shorts-title">짧은 영상 속,<br/>우리의 AI를 만나보세요.</h2><p className={styles.intro}>질문 하나가 일이 되고, 아이디어 하나가 변화가 되는 순간.<br/>네오앤피터의 이야기를 영상으로 전합니다.</p></div><div className={styles.arrows} aria-label="영상 목록 이동"><button aria-label="이전 쇼츠 보기" onClick={()=>track.current?.scrollBy({left:-340,behavior:'smooth'})}><ArrowLeft size={18}/></button><button aria-label="다음 쇼츠 보기" onClick={()=>track.current?.scrollBy({left:340,behavior:'smooth'})}><ArrowRight size={18}/></button></div></div>
  {loading&&!videos.length?<p className={styles.status} role="status">영상을 불러오고 있습니다.</p>:error?<div className={styles.status} role="alert"><p>{error}</p><button onClick={()=>void load()}>다시 불러오기</button></div>:videos.length?<div ref={track} className={styles.track} aria-label="네오앤피터 쇼츠 영상">{videos.map((video,index)=><button key={video.id} className={styles.card} aria-label={`${video.title} 재생, ${duration(video.duration_seconds)}`} onClick={()=>{setPlayError(false);setSelected(video.id);}}><div className={styles.poster}>
   {/* Posters load without downloading the video. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={video.poster_url} alt="" loading="lazy"/><span className={styles.play}><Play size={31} strokeWidth={1.3}/></span><span className={styles.duration}>{duration(video.duration_seconds)}</span><span className={styles.number}>0{index+1} / SHORT FILM</span></div><div className={styles.caption}><span>NEO &amp; PETER</span><h3>{video.title}</h3><p>{video.description}</p></div></button>)}</div>:<div className={styles.status}><Film size={24}/><p>새로운 영상을 준비하고 있습니다.</p></div>}
  <Dialog open={!!active} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className={styles.dialog}><DialogTitle className={styles.dialogTitle}>{active?.title}</DialogTitle><DialogDescription className={styles.dialogDescription}>{active?.description||'네오앤피터의 쇼츠 영상입니다.'}</DialogDescription>{active&&(playError?<div className={styles.status} role="alert"><p>영상을 재생하지 못했습니다.</p><button onClick={()=>void load()}>다시 연결하기</button></div>:<video key={active.video_url} className={styles.video} src={active.video_url} poster={active.poster_url} controls autoPlay playsInline preload="metadata" onError={()=>setPlayError(true)}>이 브라우저에서는 영상을 재생할 수 없습니다.</video>)}</DialogContent></Dialog>
 </section>;
}
