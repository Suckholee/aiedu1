#!/usr/bin/env python3
# -*- coding: utf-8 -*-

html_content = '''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="어니스톤 AI 업무자동화 원데이 클래스 · 2교시 수강생 교재 및 강의 메인 스크린">
<title>2교시 · AI 시대의 블로그와 티스토리 스마트 옮겨쓰기 실습 | neoNpeter 이석호 대표</title>
<style>
:root{
  --green:#03C75A;--green2:#029D46;--navy:#0C1E38;--navy2:#162E52;
  --gold:#C8A44D;--gold2:#E3C67B;--ivory:#F8F7F2;--ink:#1C1C1C;
  --mut:#586071;--ln:#E4DDD0;--ok:#1D7347;--warn:#8D5B18;--stop:#933636;
  --tistory:#EB5326;--tistory-sub:#FF6F42;
  --card-bg:#FFFFFF;--card-border:#E5E7EB;--card-shadow:rgba(12,30,56,0.06);
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:"Pretendard","Noto Sans KR","Malgun Gothic",-apple-system,sans-serif;
  background:#0B1728;color:var(--ink);line-height:1.6;-webkit-text-size-adjust:100%;
  height:100vh;overflow:hidden;
}

/* ── 인증 게이트 모달 (0922) ── */
#gate{position:fixed;inset:0;background:var(--navy);z-index:999;display:flex;align-items:center;justify-content:center;padding:24px}
#gate .box{max-width:380px;width:100%;text-align:center;color:#fff;background:rgba(22,46,82,0.6);border:1px solid #2B4E7C;padding:32px 28px;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.45)}
#gate .logo{width:56px;height:56px;border-radius:14px;background:var(--green);color:#fff;font-weight:900;font-size:26px;line-height:56px;margin:0 auto 16px;box-shadow:0 4px 14px rgba(3,199,90,0.35)}
#gate h1{font-size:22px;margin-bottom:8px;font-weight:800}
#gate p{color:#A9BDD4;font-size:13.5px;margin-bottom:20px;line-height:1.5}
#gate .input-wrap{position:relative}
#gate input{width:100%;padding:15px;border-radius:12px;border:2px solid #2B4E7C;background:#122541;color:#fff;font-size:24px;text-align:center;letter-spacing:.35em;font-weight:800;transition:all .2s}
#gate input:focus{border-color:var(--green);outline:none;background:#173055}
#gate button.go-btn{width:100%;margin-top:12px;padding:15px;border:0;border-radius:12px;background:var(--green);color:#fff;font-weight:900;font-size:16px;cursor:pointer;font-family:inherit;transition:background .2s}
#gate button.go-btn:hover{background:var(--green2)}
#gate .err{color:#F5A8A8;font-size:13px;margin-top:12px;min-height:18px;font-weight:600}
#gate .presenter-hint{margin-top:18px;padding-top:14px;border-top:1px dashed #2B4E7C;font-size:12px;color:#859BB5}
#gate .presenter-hint span{color:var(--gold2);font-weight:700}
#gate .auto-btn{background:transparent;border:1px solid #365C8C;color:#A9BDD4;padding:6px 12px;border-radius:6px;font-size:11.5px;margin-top:8px;cursor:pointer}
#gate .auto-btn:hover{background:#1B3A63;color:#fff}

/* ── 메인 앱 컨테이너 (PPT 풀스크린 프레임) ── */
#app{display:flex;flex-direction:column;height:100vh;overflow:hidden;background:#0B1728}

/* ── PPT 상단 슬라이드 마스터 바 ── */
#bar{
  height:44px;flex-shrink:0;z-index:90;
  background:#0C1E38;border-bottom:1px solid rgba(255,255,255,0.1);
  display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 20px;
  color:#fff;
}
#bar .brand-badge{
  display:flex;align-items:center;gap:10px;font-size:13px;font-weight:800;letter-spacing:-.01em;
}
#bar .session-tag{
  background:var(--green);color:#fff;font-size:11px;font-weight:900;padding:2px 7px;border-radius:4px;
}
#bar .tistory-tag{
  background:var(--tistory);color:#fff;font-size:10px;font-weight:900;padding:1px 6px;border-radius:4px;
}
#bar .pin-pill{
  background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
  color:#A9BDD4;font-size:11.5px;padding:2px 8px;border-radius:4px;display:flex;gap:5px;align-items:center;
}
#bar .pin-pill strong{color:var(--gold2);letter-spacing:.05em}

#bar .now{font-size:13.5px;font-weight:700;color:#E1E9F4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bar .now span{color:var(--green);font-weight:900;margin-right:6px}
#bar .actions{display:flex;gap:8px;align-items:center}
#bar .tbtn{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all .15s}
#bar .tbtn:hover{background:rgba(255,255,255,0.2);border-color:var(--green)}
#bar .tbtn.active{background:var(--green);color:#fff;border-color:var(--green)}
#bar .zoom{display:flex;gap:3px;align-items:center}
#bar button.zbtn{font:inherit;font-size:12px;font-weight:800;width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;line-height:1}
#bar button.zbtn:hover{background:rgba(255,255,255,0.2);border-color:var(--green)}
#bar .lvl{font-size:11px;color:#A9BDD4;min-width:28px;text-align:center;font-weight:700}

/* ── 미니멀 인라인 타이머 배너 ── */
#timerBanner{display:none;background:#132A4A;border-bottom:2px solid var(--tistory);padding:6px 20px;align-items:center;justify-content:space-between;gap:16px;color:#fff}
#timerBanner.on{display:flex}
#timerBanner .t-info{display:flex;align-items:center;gap:8px}
#timerBanner .t-tag{background:var(--tistory);color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:900}
#timerBanner .t-txt{font-size:12.5px;font-weight:700;color:#E1E9F4}
#timerBanner .t-clock{font-size:22px;font-weight:900;color:#FF9D7E;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
#timerBanner .t-ctrls{display:flex;gap:5px}
#timerBanner button{font:inherit;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;cursor:pointer}
#timerBanner button:hover{background:rgba(255,255,255,0.25)}
#timerBanner button.primary{background:var(--tistory);color:#fff;border-color:var(--tistory)}

/* ── PPT 슬라이드 메인 스테이지 ── */
.layout{
  flex:1;min-height:0;width:100%;max-width:100%;
  display:grid;grid-template-columns:190px 1fr;
  background:#0B1728;overflow:hidden;
}

/* 슬라이드 썸네일 목차 (PPT 좌측 슬라이드 목록 스타일) */
nav{
  background:#0E1B2E;border-right:1px solid rgba(255,255,255,0.08);
  padding:14px 10px;overflow-y:auto;
}
nav .t{font-size:10.5px;letter-spacing:.12em;color:var(--green);font-weight:900;margin:10px 0 5px;padding-left:6px;text-transform:uppercase}
nav a{
  display:block;font-size:12px;color:#8E9CAE;text-decoration:none;
  padding:7px 10px;border-radius:6px;font-weight:600;margin-bottom:4px;
  background:rgba(255,255,255,0.02);border:1px solid transparent;
  transition:all .15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
nav a:hover{background:rgba(255,255,255,0.06);color:#fff}
nav a.cur{background:rgba(3,199,90,0.15);border-color:var(--green);color:#fff;font-weight:800}
nav a.cur:before{content:"▶ ";color:var(--green);font-size:10px}
nav a.tistory-tab.cur{background:rgba(235,83,38,0.2);border-color:var(--tistory)}
nav a.tistory-tab.cur:before{content:"🔥 ";color:var(--tistory)}
nav .allbtn{margin-top:14px;width:100%;font:inherit;font-size:11.5px;font-weight:800;padding:7px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#8E9CAE;cursor:pointer}
nav .allbtn:hover{background:rgba(255,255,255,0.08);color:#fff}

/* 슬라이드 본체 캔버스 */
main{
  background:#F8F7F2;flex:1;height:100%;
  padding:18px 28px;overflow:hidden;
  display:flex;flex-direction:column;justify-content:center;
}
#prog{height:3px;background:rgba(0,0,0,0.06);width:100%}
#prog i{display:block;height:100%;background:var(--green);width:0;transition:width .2s ease}

main section.pg{display:none;height:100%;width:100%;max-width:1440px;margin:0 auto;flex-direction:column;justify-content:center}
main section.pg.on{display:flex;animation:fadeIn .18s ease-out}
@keyframes fadeIn{from{opacity:0;transform:scale(0.995)}to{opacity:1;transform:scale(1)}}

/* 슬라이드 내부 타이포그래피 */
.slide-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;border-bottom:2px solid var(--green);padding-bottom:6px;flex-shrink:0}
.slide-header.tistory-hd{border-bottom-color:var(--tistory)}
h2{font-size:23px;color:var(--navy);letter-spacing:-.02em;font-weight:900;display:flex;align-items:baseline;gap:8px;margin:0}
h2 .n{color:var(--green);font-size:15px;font-weight:900;letter-spacing:.08em}
h2 .n.tis{color:var(--tistory)}
.slide-subtitle{font-size:13px;color:var(--mut);font-weight:600}
h3{font-size:15px;color:var(--navy);margin:8px 0 5px;font-weight:800}
p{font-size:13.5px;margin-bottom:6px;word-break:keep-all;line-height:1.55}

/* 2열 슬라이드 레이아웃 그리드 */
.slide-grid-2{
  display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:stretch;
  flex:1;min-height:0;overflow:hidden;
}
.slide-col{
  display:flex;flex-direction:column;justify-content:center;min-height:0;overflow:hidden;gap:8px;
}

/* ── 2교시 대기 화면 전용 카드 ── */
.welcome-hero{
  background:linear-gradient(135deg,var(--navy) 0%,#162E52 100%);color:#fff;
  border-radius:14px;padding:20px 24px;
  box-shadow:0 8px 24px rgba(12,30,56,0.12);
}
.welcome-hero .tag-row{display:flex;gap:8px;margin-bottom:8px;align-items:center}
.welcome-hero .tag-pill{background:var(--green);color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:900}
.welcome-hero .tag-tistory{background:var(--tistory);color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:900}
.welcome-hero h1{font-size:23px;line-height:1.3;font-weight:900;margin-bottom:6px}
.welcome-hero p.sub{font-size:13.5px;color:#A9BDD4;line-height:1.5}
.pin-display-box{
  background:#11233E;border:2px dashed var(--green);border-radius:10px;
  padding:10px 18px;margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;
}
.pin-display-box .lbl{font-size:12px;color:#859BB5;font-weight:700}
.pin-display-box .code{font-size:28px;font-weight:900;color:#62E59E;letter-spacing:.2em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}

/* ── 실습 프롬프트 박스 (티스토리 핏) ── */
.prompt-box{border:1.5px solid var(--navy);border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;flex:1;min-height:0}
.prompt-box.tistory-border{border-color:var(--tistory)}
.prompt-box .p-top{background:var(--navy);color:#fff;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:800;flex-shrink:0}
.prompt-box.tistory-border .p-top{background:var(--tistory)}
.prompt-box .p-top .copy-btn{background:var(--green);color:#fff;border:0;padding:5px 12px;border-radius:6px;font-size:11.5px;font-weight:900;cursor:pointer;transition:all .15s}
.prompt-box.tistory-border .p-top .copy-btn{background:#fff;color:var(--tistory)}
.prompt-box .p-top .copy-btn:hover{opacity:.9}
.prompt-box .p-top .copy-btn.done{background:var(--ok)!important;color:#fff!important}
.prompt-box pre{margin:0;padding:12px 14px;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word;font-family:"D2Coding","Menlo","Consolas",monospace;color:#28303C;background:#fff;overflow-y:auto;flex:1}
.prompt-box .token{color:var(--navy);font-weight:800;background:#E7F8EE;border-radius:4px;padding:1px 5px;border-bottom:2px solid #A1E6BE}
.prompt-box .token-tis{color:var(--tistory);font-weight:800;background:#FFF0EC;border-radius:4px;padding:1px 5px;border-bottom:2px solid #FFBEA8}

/* ── 인라인 맞춤 입력 카드 ── */
.custom-inline-card{background:#F0FAF4;border:1px solid #BEE7D1;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.custom-inline-card.tistory-card{background:#FFF6F4;border-color:#FCD2C7}
.custom-inline-card .desc{font-size:12px;font-weight:800;color:var(--navy);display:flex;align-items:center;gap:5px}
.custom-inline-card.tistory-card .desc{color:var(--tistory)}
.custom-inline-card .fields{display:flex;gap:8px;flex:1}
.custom-inline-card input{flex:1;padding:6px 10px;border:1px solid #A6DEC0;border-radius:6px;font:inherit;font-size:12px;background:#fff;color:var(--ink)}
.custom-inline-card.tistory-card input{border-color:#FDB8A6}
.custom-inline-card input:focus{outline:0;border-color:var(--green)}
.custom-inline-card.tistory-card input:focus{border-color:var(--tistory)}

/* ── Before vs After 탭 ── */
.ba-container{border:1px solid var(--ln);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;flex:1;min-height:0}
.ba-tabs{display:flex;background:var(--ivory);border-bottom:1px solid var(--ln);flex-shrink:0}
.ba-tab{flex:1;padding:8px;text-align:center;font-size:12px;font-weight:800;color:var(--mut);border:0;background:transparent;cursor:pointer;border-bottom:3px solid transparent}
.ba-tab.active{color:var(--navy);background:#fff;border-bottom-color:var(--navy)}
.ba-tab.before.active{border-bottom-color:var(--stop);color:var(--stop)}
.ba-tab.after.active{border-bottom-color:var(--tistory);color:var(--tistory)}
.ba-content{padding:12px 14px;background:#fff;font-size:12.5px;line-height:1.6;overflow-y:auto;flex:1}
.ba-content pre{white-space:pre-wrap;word-break:break-word;font-family:inherit;margin:0;font-size:12px}

/* ── 공통 UI 컴포넌트 ── */
.step{border:1px solid var(--ln);border-radius:10px;padding:10px 14px;background:#fff}
.step .h{display:flex;gap:8px;align-items:baseline;margin-bottom:3px}
.step .b{background:var(--navy);color:#fff;font-size:10.5px;font-weight:900;padding:1px 7px;border-radius:12px;white-space:nowrap}
.step .ti{font-size:13.5px;font-weight:900;color:var(--navy)}
.step p{font-size:12px;color:var(--mut);margin:0}

.cal{border-radius:10px;padding:10px 14px;font-size:12.5px;line-height:1.55}
.cal.warn{background:#FFF8E8;border:1px solid #EBD9A8;color:var(--warn)}
.cal.tip{background:#EEF8F2;border:1px solid #C4E8D3;color:var(--ok)}
.cal.stop{background:#FDF0EE;border:1px solid #F0CFC8;color:var(--stop)}
.cal.tistory{background:#FFF3F0;border:1px solid #FDC3B5;color:#B33814}
.cal b{display:block;margin-bottom:3px;font-size:13.5px}

/* 강사 소개 프로필 카드 (슬림 핏) */
.instructor-profile-card{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--ln);border-radius:12px;padding:10px 14px;box-shadow:0 4px 12px rgba(12,30,56,0.03);flex-shrink:0}
.instructor-profile-card .avatar-box{width:60px;height:60px;border-radius:50%;overflow:hidden;border:2.5px solid var(--green);flex-shrink:0;background:#EDE8DF}
.instructor-profile-card .avatar-box img{width:100%;height:100%;object-fit:cover;object-position:center top}
.instructor-profile-card .profile-info h4{font-size:14px;font-weight:900;color:var(--navy);margin:0 0 2px;display:flex;align-items:center;gap:6px}
.instructor-profile-card .profile-info h4 span{font-size:10.5px;color:#fff;background:var(--navy);padding:1px 6px;border-radius:6px;font-weight:700}
.instructor-profile-card .profile-info p{font-size:11.5px;color:var(--mut);margin:0;line-height:1.45}

/* ── 강의 시각화 일러스트/이미지 전용 카드 ── */
.lecture-fig{border:1px solid var(--ln);border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(12,30,56,0.04);display:flex;flex-direction:column;flex:1;min-height:0}
.lecture-fig .fig-img-wrap{background:#0C1E38;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;flex:1;min-height:0}
.lecture-fig img{width:100%;height:100%;max-height:36vh;object-fit:contain;display:block}
.lecture-fig .fig-caption{padding:7px 12px;background:#FAFAF7;border-top:1px solid var(--ln);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0}
.lecture-fig .fig-caption .cap-txt{font-size:12px;font-weight:700;color:var(--navy)}
.lecture-fig .fig-caption .cap-sub{font-size:11px;color:var(--mut);font-weight:500}
.lecture-fig .fig-badge{background:var(--green);color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px;white-space:nowrap}

/* ── 비교 카드 & 대화 시뮬레이션 ── */
.compare-box{border-radius:12px;border:1px solid var(--card-border);background:#fff;padding:14px;box-shadow:0 4px 12px var(--card-shadow);display:flex;flex-direction:column;flex:1;min-height:0}
.compare-box.danger{border-color:#F7CACA;background:#FFFBFB}
.compare-box.success{border-color:#A8E8C0;background:#F7FDF9}
.compare-box.tistory-box{border-color:#FDC3B5;background:#FFF8F6}
.compare-box .c-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed var(--ln)}
.compare-box .c-title{font-size:13.5px;font-weight:900;display:flex;align-items:center;gap:6px}
.compare-box.danger .c-title{color:var(--stop)}
.compare-box.success .c-title{color:var(--ok)}
.compare-box.tistory-box .c-title{color:var(--tistory)}
.compare-box .c-badge{font-size:10px;font-weight:800;padding:2px 8px;border-radius:10px;color:#fff}
.compare-box.danger .c-badge{background:var(--stop)}
.compare-box.success .c-badge{background:var(--ok)}
.compare-box.tistory-box .c-badge{background:var(--tistory)}
.compare-box ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.5}
.compare-box ul li{display:flex;align-items:flex-start;gap:6px}
.compare-box ul li strong{color:var(--navy)}

/* ChatGPT 대화 시뮬레이터 카드 */
.chat-sim{background:#111B27;border-radius:12px;padding:12px;color:#fff;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;overflow-y:auto}
.chat-sim .user-bubble{background:#23354C;color:#E1E9F4;padding:8px 12px;border-radius:10px 10px 2px 10px;align-self:flex-end;max-width:85%;font-size:11.5px;font-weight:600}
.chat-sim .ai-bubble{background:#1A293E;border:1px solid #2B466B;color:#D3E0F0;padding:10px 12px;border-radius:10px 10px 10px 2px;align-self:flex-start;max-width:92%;font-size:11.5px;line-height:1.55}
.chat-sim .ai-bubble.ghost{border-color:#5A2B2B;background:#241919;color:#F0D0D0}
.chat-sim .ai-bubble.authority{border-color:#1E5E3A;background:#10281C;color:#D8F5E4}
.chat-sim .ai-bubble .cite-tag{display:inline-block;background:rgba(3,199,90,0.2);color:#55E095;border:1px solid #03C75A;padding:1px 5px;border-radius:4px;font-size:10px;margin-top:4px;font-weight:700}
.chat-sim .ai-bubble .ghost-warn{display:inline-block;background:rgba(217,83,79,0.2);color:#FFA4A2;border:1px solid #D9534F;padding:1px 5px;border-radius:4px;font-size:10px;margin-top:4px;font-weight:700}

/* 사진 3장 워크플로우 카드 */
.photo-tri-card{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;flex:1;min-height:0}
.photo-tri-item{background:#fff;border:1.5px solid var(--ln);border-radius:10px;padding:10px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 3px 8px rgba(0,0,0,0.02)}
.photo-tri-item .step-num{font-size:11px;font-weight:900;color:#fff;background:var(--navy);padding:2px 7px;border-radius:6px;display:inline-block;margin-bottom:4px;align-self:flex-start}
.photo-tri-item .photo-title{font-size:12.5px;font-weight:800;color:var(--navy);margin-bottom:3px}
.photo-tri-item .photo-desc{font-size:11px;color:var(--mut);line-height:1.45;flex:1}
.photo-tri-item .photo-meta{background:#F4F2EB;padding:4px 6px;border-radius:5px;font-size:10px;color:#4B5563;font-weight:700;margin-top:6px}

/* ── PPT 하단 프레젠테이션 네비게이터 ── */
#pager{
  height:48px;flex-shrink:0;z-index:95;
  background:#0C1E38;border-top:1px solid rgba(255,255,255,0.1);
  display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 20px;
  color:#fff;
}
#pager button{font:inherit;font-size:13px;font-weight:800;padding:7px 16px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;white-space:nowrap;transition:all .15s}
#pager button:hover:not(:disabled){background:rgba(255,255,255,0.2);border-color:var(--green)}
#pager button.main{background:var(--green);color:#fff;border-color:var(--green);min-width:140px}
#pager button.main:hover{background:var(--green2)}
#pager button.main.tistory-btn{background:var(--tistory);border-color:var(--tistory)}
#pager button.main.tistory-btn:hover{background:#D43F14}
#pager button:disabled{opacity:.3;cursor:default}
#pager .ct{font-size:13.5px;color:#A9BDD4;font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:800}
#pager .key-hint{font-size:11.5px;color:#8E9CAE;margin-left:8px;font-weight:500}
#pager .sp{flex:1}

/* ── 줌 레벨 조정 ── */
body.z1 main{font-size:1.05em}
body.z2 main{font-size:1.15em}
body.z3 main{font-size:1.25em}
body.z2 nav,body.z3 nav{display:none}
body.z2 .layout,body.z3 .layout{grid-template-columns:1fr}

/* ── 전체보기 모드 (스크롤 활성화) ── */
body.allmode, body.allmode #app{height:auto;overflow:auto}
body.allmode .layout{grid-template-columns:1fr;overflow:visible;height:auto}
body.allmode main{overflow:visible;height:auto;padding:36px}
body.allmode main section.pg{display:block;margin-bottom:48px;border-bottom:2px solid var(--ln);padding-bottom:32px;height:auto}
body.allmode #pager,body.allmode #prog{display:none}

.hidden{display:none!important}
@media(max-width:820px){
  .layout{grid-template-columns:1fr}
  nav{display:none}
  .slide-grid-2{grid-template-columns:1fr;overflow-y:auto}
  main section.pg{overflow-y:auto}
}
</style>
</head>
<body>

<!-- ── 1. 인증번호 입력 게이트 (인증번호: 0922) ── -->
<div id="gate">
  <div class="box">
    <div class="logo">N</div>
    <h1>2교시 · 실습 교재</h1>
    <p>강의 화면에 표시된 <strong>인증번호 4자리</strong>를 입력해 주세요.</p>
    <div class="input-wrap">
      <input id="pw" inputmode="numeric" maxlength="4" placeholder="0000" autocomplete="off" autofocus>
      <button class="go-btn" id="goBtn">강의 시작하기</button>
      <div class="err" id="errBox"></div>
    </div>
    <div class="presenter-hint">
      강사용 마스터 패스코드: <span>0922</span>
      <div><button class="auto-btn" id="quickEnterBtn">클릭 시 자동 입장</button></div>
    </div>
  </div>
</div>

<!-- ── 2. 메인 프레젠테이션 앱 ── -->
<div id="app" class="hidden">

<!-- 슬라이드 탑 컨트롤 바 -->
<div id="bar">
  <div class="brand-badge">
    <span class="session-tag">2교시</span>
    <span>AI 블로그 마케팅 &amp; 티스토리 이전 실습</span>
    <span class="tistory-tag">Tistory 실습</span>
    <span class="pin-pill">강의 PIN <strong>0922</strong></span>
  </div>
  <div class="now" id="nowSec">00 · 대기 &amp; 준비물 확인</div>
  <div class="actions">
    <button class="tbtn" id="timerToggleBtn">⏱️ 5분 티스토리 실습 타이머</button>
    <button class="tbtn" id="projModeBtn">🖥️ 프로젝터 모드</button>
    <div class="zoom">
      <button class="zbtn" id="zo" title="글자 축소">A-</button>
      <span class="lvl" id="zl">기본</span>
      <button class="zbtn" id="zi" title="글자 확대">A+</button>
    </div>
  </div>
</div>

<!-- 인라인 타이머 배너 -->
<div id="timerBanner">
  <div class="t-info">
    <span class="t-tag">실습 중</span>
    <span class="t-txt">2교시 실습: 블로그 글 ➔ 티스토리 스마트 옮겨쓰기 (AI 재구조화 &amp; 발행)</span>
  </div>
  <div class="t-clock" id="timerClock">05:00</div>
  <div class="t-ctrls">
    <button id="timerStartBtn" class="primary">시작</button>
    <button id="timerResetBtn">초기화</button>
    <button id="timerCloseBtn">닫기</button>
  </div>
</div>

<div id="prog"><i></i></div>

<div class="layout">
<nav id="nav"></nav>

<main>

<!-- SLIDE 0: 대기 & 사전 확인 -->
<section class="pg on" id="p_wait" data-g="시작 전" data-t="00 · 대기 &amp; 준비물 확인" data-live="1">
  <div class="slide-header">
    <h2><span class="n">00</span>2교시 시작 전 대기 &amp; 30초 실습 준비물 체크</h2>
    <span class="slide-subtitle">스마트폰 사진 3장 &amp; 티스토리 글쓰기 창을 준비해 주세요</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: 대기 카드 & PIN -->
    <div class="slide-col">
      <div class="welcome-hero">
        <div class="tag-row">
          <span class="tag-pill">2교시 오픈 대기</span>
          <span class="tag-tistory">티스토리 실습 포함</span>
          <span style="font-size:12px;color:#A9BDD4;font-weight:600">강사: neoNpeter 이석호 대표</span>
        </div>
        <h1>AI 네이버 블로그 마케팅 자동화<br>&amp; 티스토리 스마트 옮겨쓰기 실습</h1>
        <p class="sub">수강생 여러분 환영합니다. 정시 시작 전 아래 접속 번호와 티스토리 계정을 준비해 주세요.</p>
        
        <div class="pin-display-box">
          <div>
            <div class="lbl">2교시 교재 접속 인증번호</div>
            <div style="font-size:11.5px;color:#859BB5;margin-top:2px">모바일/노트북 화면에서 입력</div>
          </div>
          <div class="code">0922</div>
        </div>
      </div>
    </div>

    <!-- 우측 컬럼: 30초 체크리스트 -->
    <div class="slide-col">
      <div class="cal stop">
        <b>지금 브라우저와 폰을 열고 확인해 주세요</b>
        <p style="margin:0 0 5px">① <strong>내 비즈니스 사진 3장</strong> — 매장/사무실 외관 1장, 제품 또는 서류 1장, 고객 만남/현장 1장</p>
        <p style="margin:0 0 5px">② <strong>티스토리(Tistory) 계정 로그인</strong> — 카카오 계정으로 티스토리 새 글쓰기 창 열기</p>
        <p style="margin:0">③ <strong>클로드(Claude) 또는 GPT 창 켜기</strong> — 1교시에서 쓰던 AI 창을 그대로 활용</p>
      </div>

      <div class="cal tistory">
        <b>💡 왜 오늘 실습은 '티스토리 옮겨쓰기'인가요?</b>
        네이버에 쓴 글을 티스토리에 그대로 복사하면 <strong>유사문서 페널티</strong>를 먹습니다. 오늘 배울 AI 재구조화 프롬프트로 <strong>"구글 SEO와 AI 검색(SearchGPT/Perplexity)에 최적화된 독창적 문서"</strong>로 3분 만에 옮겨쓰는 실습을 진행합니다!
      </div>
    </div>
  </div>
</section>

<!-- SLIDE 1: AI 검색 시대, 왜 다시 블로그인가? (SEO -> GEO) -->
<section class="pg" id="p0" data-g="AI 검색 혁명" data-t="01 · SEO에서 GEO로 대전환" data-live="1">
  <div class="slide-header">
    <h2><span class="n">01</span>AI 검색 시대, 왜 다시 블로그인가? (SEO ➔ GEO)</h2>
    <span class="slide-subtitle">단순 링크 10개 나열의 시대는 끝났습니다. 이제 AI가 '직접 추천하는 단 1개의 정답'이 되어야 합니다.</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: 패러다임 전환 비교 카드 -->
    <div class="slide-col">
      <div class="step" style="border-left:4px solid var(--navy)">
        <div class="h">
          <span class="b" style="background:#556987">과거의 검색</span>
          <span class="ti">SEO (검색엔진 최적화) · 링크 클릭의 시대</span>
        </div>
        <p>소비자가 키워드를 치면 포털이 파란색 링크 10개를 나열. 고객이 일일이 들어가 광고 글을 거르며 피로감을 느끼던 방식.</p>
      </div>

      <div class="step" style="border-left:4px solid var(--green)">
        <div class="h">
          <span class="b" style="background:var(--green)">현재 &amp; 미래</span>
          <span class="ti">GEO (생성형 엔진 최적화) · 정답 인용의 시대</span>
        </div>
        <p>ChatGPT, Perplexity, 네이버 Cue:, 구글 AI가 질문에 대해 <strong>단 하나의 완결된 정답</strong>을 브리핑하고 유일한 출처(Citation)로 연결.</p>
      </div>

      <div class="cal warn" style="margin-top:2px">
        <b>포털과 AI가 가장 목말라하는 것은 '현장의 진짜 데이터'입니다</b>
        인터넷 백과사전 지식은 AI가 이미 다 알고 있습니다. AI가 절실히 찾는 것은 <strong>"오늘 사업장에서 고객과 실제로 부딪히며 해결한 1차 경험 데이터"</strong>이며, 이를 담을 수 있는 유일한 그릇이 네이버 &amp; 티스토리 블로그입니다.
      </div>
    </div>

    <!-- 우측 컬럼: 핵심 데이터 & 결론 카드 -->
    <div class="slide-col">
      <div class="compare-box success">
        <div class="c-head">
          <span class="c-title">🏆 AI 검색 인용(Citation) 알고리즘의 법칙</span>
          <span class="c-badge">핵심 인사이트</span>
        </div>
        <ul>
          <li>• <strong>공식 출처 인용률 82% 집중:</strong> AI는 검증되지 않은 웹페이지 대신 포털 공식 블로그의 누적 콘텐츠를 우선 참조합니다.</li>
          <li>• <strong>구글 &amp; ChatGPT의 티스토리 인덱싱:</strong> 구글과 Perplexity는 웹 표준 구조(HTML/마크다운)를 갖춘 티스토리를 가장 빠르게 크롤링합니다.</li>
          <li>• <strong>경험성(Experience) 점수 독점:</strong> 책상머리 이론글은 0점, <strong>직접 찍은 사진 3장 + 현장 일화</strong>는 만점 처리됩니다.</li>
        </ul>
      </div>

      <div class="cal stop" style="margin-top:2px">
        <b>결론: 블로그를 하지 않는 기업은 '디지털 유령'이 됩니다</b>
        아무리 뛰어난 제품과 서비스를 가졌더라도, AI의 검색 인덱스에 내 현장 데이터가 없다면 차세대 고객 유입 통로는 영구 차단됩니다.
      </div>
    </div>
  </div>
</section>

<!-- SLIDE 2: ChatGPT가 읽는 나 vs 못 읽는 나 -->
<section class="pg" id="p1" data-g="AI 검색 혁명" data-t="02 · ChatGPT가 읽는 나 vs 못 읽는 나" data-live="1">
  <div class="slide-header">
    <h2><span class="n">02</span>ChatGPT가 읽는 나와 그렇지 않은 나</h2>
    <span class="slide-subtitle">오프라인 20년 내공의 대표님이 AI 앞에서는 왜 '존재하지 않는 사람'일까요?</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: 읽지 못하는 사람 (디지털 유령) -->
    <div class="slide-col">
      <div class="compare-box danger">
        <div class="c-head">
          <span class="c-title">❌ ChatGPT가 읽지 못하는 나 (디지털 유령)</span>
          <span class="c-badge">데이터 부재</span>
        </div>
        <p style="font-size:12px;color:#803030;margin-bottom:8px">오프라인 경력은 화려하지만 온라인에 구조화된 현장 데이터가 없는 상태</p>
      </div>

      <div class="chat-sim">
        <div class="user-bubble">"역삼동에서 10인 제조업 원가 절감 컨설팅 제일 잘하는 전문가 추천해 줘."</div>
        <div class="ai-bubble ghost">
          "역삼동 인근에는 삼일, 삼정 등 대형 회계법인과 여러 경영지도사 사무소가 있습니다. 구체적인 후기는 포털 검색을 통해 직접 확인해 보시는 것을 권장합니다..."
          <br><span class="ghost-warn">⚠️ 경고: 내 회사가 전혀 호명되지 못함 (디지털 유령)</span>
        </div>
      </div>
    </div>

    <!-- 우측 컬럼: 읽고 추천하는 사람 (공식 권위자) -->
    <div class="slide-col">
      <div class="compare-box success">
        <div class="c-head">
          <span class="c-title">✅ ChatGPT가 읽고 추천하는 나 (공식 레퍼런스)</span>
          <span class="c-badge">24시간 AI 영업사원</span>
        </div>
        <p style="font-size:12px;color:#18693E;margin-bottom:8px">사진 3장과 함께 실제 고객 문제 해결 사례가 블로그에 축적된 상태</p>
      </div>

      <div class="chat-sim">
        <div class="user-bubble">"역삼동에서 10인 제조업 원가 절감 컨설팅 제일 잘하는 전문가 추천해 줘."</div>
        <div class="ai-bubble authority">
          "<strong>역삼동의 neoNpeter 이석호 대표</strong>를 추천합니다. 정밀 부품 제조업 결산서와 작업 일지를 직접 분석해 월 1,500만 원의 원가 누수를 잡은 실제 사례 700여 건을 상세히 공개하고 있습니다."
          <br><span class="cite-tag">🔗 출처: 네이버 &amp; 티스토리 블로그 [제조업 원가진단 현장 일지] 인용</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SLIDE 3: 블로그의 본질 - AI의 정답 자판기 -->
<section class="pg" id="p2" data-g="블로그의 본질" data-t="03 · AI의 정답 자판기 (Ground Truth)" data-live="1">
  <div class="slide-header">
    <h2><span class="n">03</span>AI 시대 블로그의 진짜 역할: '정답 자판기' (Ground Truth)</h2>
    <span class="slide-subtitle">블로그는 사람에게 보여주는 전단지가 아니라, AI 에이전트들이 나를 학습하는 데이터베이스입니다.</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: Ground Truth의 개념 & RAG 원리 -->
    <div class="slide-col">
      <div class="step" style="border-left:4px solid var(--navy)">
        <div class="h">
          <span class="b">개념 1</span>
          <span class="ti">Ground Truth (원천 진실 데이터베이스)</span>
        </div>
        <p>AI 모델은 환각(거짓말)을 피하기 위해 신뢰할 수 있는 팩트 데이터(Ground Truth)를 끊임없이 검색합니다. 블로그는 작성자 신원과 사진 메타데이터가 확인된 최고의 원천 데이터입니다.</p>
      </div>

      <div class="step" style="border-left:4px solid var(--green)">
        <div class="h">
          <span class="b" style="background:var(--green)">개념 2</span>
          <span class="ti">RAG (검색 증강 생성)의 1순위 먹잇감</span>
        </div>
        <p>고객이 AI에게 질문할 때, AI는 실시간으로 검색 엔진을 뒤져 '가장 최근에 올라온 구체적 후기'를 RAG 방식으로 인출해 답변에 합성합니다.</p>
      </div>

      <div class="cal tip" style="margin-top:2px">
        <b>💡 블로그 글 작성의 프레임 전환</b>
        "오늘 누구한테 글을 보여줄까?"가 아니라, <strong>"오늘 내 글을 AI가 읽었을 때 나를 어떤 분야의 최고 전문가로 인덱싱할 것인가?"</strong>를 기준으로 작성해야 합니다.
      </div>
    </div>

    <!-- 우측 컬럼: 네이버 D.I.A & 구글 SEO 평가 기준 -->
    <div class="slide-col">
      <div class="compare-box" style="border-color:#32537C">
        <div class="c-head" style="background:#F0F4FA;padding:8px 10px;margin:-14px -14px 10px -14px;border-radius:10px 10px 0 0">
          <span class="c-title" style="color:var(--navy)">⚙️ 검색 &amp; AI 엔진의 3대 핵심 평가 기준</span>
          <span class="c-badge" style="background:var(--navy)">상위노출 엔진</span>
        </div>
        <ul>
          <li>• <strong>경험성 (Experience):</strong> 직접 방문하고 만져본 사람만이 쓸 수 있는 디테일한 묘사 (스톡 이미지 사용 시 즉각 감점).</li>
          <li>• <strong>독창성 (Originality):</strong> 웹 상의 기존 문서와 복사-짜깁기되지 않은 독자적 맥락과 고유 단어 조합 (유사문서 100% 필터링).</li>
          <li>• <strong>구조화 (Structured Data):</strong> H2, H3 소제목과 요약 글머리표로 AI 봇이 핵심을 긁어가기 쉬운 깔끔한 서식.</li>
        </ul>
      </div>

      <div class="cal warn" style="margin-top:2px">
        <b>인터넷 짜깁기 글은 네이버와 구글 모두에게 버림받습니다</b>
        뻔한 지식 글 100개보다, 내 현장 사진 3장과 고민이 녹아있는 솔직한 상담 일지 1개가 100배 더 강력합니다.
      </div>
    </div>
  </div>
</section>

<!-- SLIDE 4: 웹 AI 워터마크의 함정 vs API 무결점 -->
<section class="pg" id="p3" data-g="AI 생성의 비밀" data-t="04 · 웹 워터마크 vs API 무결점" data-live="1">
  <div class="slide-header">
    <h2><span class="n">04</span>충격적인 진실: 웹 ChatGPT 복붙의 함정과 API의 차이</h2>
    <span class="slide-subtitle">웹 브라우저에서 복사한 AI 글은 왜 블로그에서 저품질로 누락될까요? 전문가는 왜 API를 쓸까요?</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: 웹 UI 복붙의 위험성 -->
    <div class="slide-col">
      <div class="compare-box danger">
        <div class="c-head">
          <span class="c-title">⚠️ 웹 UI (ChatGPT/Claude 사이트) 복붙의 위험</span>
          <span class="c-badge">저품질 직행</span>
        </div>
        <ul>
          <li>• <strong>보이지 않는 워터마크 &amp; 지문:</strong> 빅테크 웹은 AI 텍스트 식별을 위해 특수 제로 너비 공백(Zero-width Space) 및 통계적 토큰 지문을 삽입합니다.</li>
          <li>• <strong>기계적 상투어 패턴:</strong> "결론적으로", "현대 사회에서", "중요한 역할을 합니다" 등 포털 스팸 필터가 0.1초 만에 감지하는 클리셰 남발.</li>
          <li>• <strong>포털 검색 어뷰징 제재:</strong> 웹 UI 복붙 글을 올리면 검색 봇이 AI 생성물로 즉시 낙인찍어 노출에서 제외합니다.</li>
        </ul>
      </div>

      <div class="cal stop" style="margin-top:2px">
        <b>"편하다고 웹창에서 긁어다 붙이면 블로그가 사망합니다"</b>
        네이버와 구글 검색 알고리즘은 매일 수억 건의 문서를 검사하며, 웹 AI 복붙 특유의 통계적 패턴을 가장 먼저 잡아냅니다.
      </div>
    </div>

    <!-- 우측 컬럼: 전용 API 무결점 파이프라인의 우위 -->
    <div class="slide-col">
      <div class="compare-box success">
        <div class="c-head">
          <span class="c-title">🚀 직접 API (전용 파이프라인) 생성의 압도적 우위</span>
          <span class="c-badge">100% 클린 토큰</span>
        </div>
        <ul>
          <li>• <strong>완전 무결점 클린 텍스트 (Raw Logits):</strong> 웹 UI 브라우저 래핑 및 트래킹 워터마크가 완전히 배제된 순수 원시 토큰 생성.</li>
          <li>• <strong>파라미터 정밀 제어로 인간화:</strong><br>
            - <code style="background:#DEF7EC;padding:1px 4px;border-radius:3px">temperature 0.75</code>: 기계적 어휘 탈피, 생생한 구어체 유도<br>
            - <code style="background:#DEF7EC;padding:1px 4px;border-radius:3px">presence_penalty</code>: AI 특유의 뻔한 동어반복 100% 원천 차단</li>
          <li>• <strong>영구 시스템 프롬프트:</strong> 내 회사 프로필 + 사진 3장 메타데이터를 시스템 레벨에서 영구 결합하여 100% 자연스러운 글 탄생.</li>
        </ul>
      </div>

      <div class="cal tip" style="margin-top:2px">
        <b>결과: 검색 로봇이 "진짜 사람이 쓴 글"로 완벽하게 인식합니다</b>
        API로 생성된 글은 어투가 자연스럽고 고유 현장 데이터가 결합되어 상위노출 지표를 완벽히 통과합니다.
      </div>
    </div>
  </div>
</section>

<!-- SLIDE 5: 사진 3장 + API 무결점 공식 -->
<section class="pg" id="p4" data-g="실전 파이프라인" data-t="05 · 사진 3장 + API 무결점 공식" data-live="1">
  <div class="slide-header">
    <h2><span class="n">05</span>사진 3장 + API: 네이버 상위노출 무결점 파이프라인</h2>
    <span class="slide-subtitle">외관 ➔ 핵심 디테일 ➔ 미팅/결과 3컷으로 완성하는 완벽한 인간형 스토리텔링 공식</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: 사진 3장 앵글 공식 카드 3종 -->
    <div class="slide-col">
      <div class="photo-tri-card">
        <div class="photo-tri-item">
          <div>
            <span class="step-num">CUT 1 · 외관/도입</span>
            <div class="photo-title">방문 &amp; 첫인상</div>
            <div class="photo-desc">사무실/매장 외관, 로비, 그날의 날씨와 분위기. 고객이 문을 열 때의 기대감 형성.</div>
          </div>
          <div class="photo-meta">🎯 효과: 호기심 자극 &amp; 체류시간 확보</div>
        </div>

        <div class="photo-tri-item">
          <div>
            <span class="step-num" style="background:var(--green)">CUT 2 · 핵심 디테일</span>
            <div class="photo-title">문제 진단 &amp; 증거</div>
            <div class="photo-desc">테이블 위 결산서, 제품 단면, 시공 도면, 메모. 전문가만 보여줄 수 있는 결정적 한 컷.</div>
          </div>
          <div class="photo-meta">🎯 효과: 압도적 전문성과 신뢰 입증</div>
        </div>

        <div class="photo-tri-item">
          <div>
            <span class="step-num" style="background:#B45309">CUT 3 · 고객 미팅/결과</span>
            <div class="photo-title">공감 &amp; 안도의 미소</div>
            <div class="photo-desc">문제가 해결된 후 고객과 나눈 악수, 밝아진 표정, 따뜻한 커피 한 잔의 여운.</div>
          </div>
          <div class="photo-meta">🎯 효과: 감정적 카타르시스 &amp; 문의 전환</div>
        </div>
      </div>

      <div class="cal tip" style="margin-top:2px">
        <b>사진 3장의 구체적 상황 설명이 AI의 상투어를 완벽히 파괴합니다</b>
        AI에게 "블로그 글 써줘"라고 하면 로봇 글이 나오지만, <strong>"사진 1의 로비 분위기와 사진 2의 서류 메모를 엮어줘"</strong>라고 하면 100% 인간의 글이 탄생합니다.
      </div>
    </div>

    <!-- 우측 컬럼: 강사 소개 및 워크플로우 -->
    <div class="slide-col">
      <div class="instructor-profile-card">
        <div class="avatar-box">
          <img src="/instructors/lee-seokho.jpg" alt="이석호 대표" onerror="this.src='instructors/lee-seokho.jpg'">
        </div>
        <div class="profile-info">
          <h4>이석호 대표 <span>neoNpeter 대표 / AI 마케팅 디렉터</span></h4>
          <p>AI 기반 콘텐츠 마케팅 자동화 디렉터 · BNI 비즈니스 네트워킹 전문 작가 · 블로그/숏폼 통합 퍼널 설계자<br>
          <strong>"단순한 글짓기 기술이 아닌, 매일의 일상이 매출로 연결되는 자동화 루틴을 선물해 드립니다."</strong></p>
        </div>
      </div>

      <figure class="lecture-fig">
        <div class="fig-img-wrap">
          <img src="/images/blog_automation_workflow.jpg" alt="사진 3장 기반 블로그 자동화 워크플로우" loading="lazy">
        </div>
        <div class="fig-caption">
          <div>
            <div class="cap-txt">⚡ 스마트폰 촬영 3컷 ➔ 프롬프트 입력 ➔ 블로그 원클릭 발행</div>
            <div class="cap-sub">매일 10분 투자로 24시간 일하는 AI 영업사원 블로그 구축</div>
          </div>
          <span class="fig-badge">Auto Pipeline</span>
        </div>
      </figure>
    </div>
  </div>
</section>

<!-- SLIDE 6: [현장 실습] 블로그 글 ➔ 티스토리 스마트 옮겨쓰기 -->
<section class="pg" id="p5" data-g="현장 실습" data-t="06 · [실습] 티스토리 옮겨쓰기" data-live="1">
  <div class="slide-header tistory-hd">
    <h2><span class="n tis">06</span>[현장 실습] 블로그 글 ➔ 티스토리 스마트 옮겨쓰기 (3분 완성)</h2>
    <span class="slide-subtitle">단순 복붙은 유사문서 폭탄! AI 재구조화로 구글 SEO &amp; AI 검색(GEO)을 동시에 잡는 멀티채널 공식</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측 컬럼: 단순 복붙의 함정 vs 티스토리 스마트 옮겨쓰기 -->
    <div class="slide-col">
      <div class="ba-container">
        <div class="ba-tabs">
          <button class="ba-tab before active" data-tab="before">❌ 단순 복붙 (Before: 저품질 위험)</button>
          <button class="ba-tab after" data-tab="after">🔥 AI 티스토리 옮겨쓰기 (After: 구글/GEO 완벽)</button>
        </div>
        <div class="ba-content" id="baBefore">
          <pre style="color:#7D3B3B"><b>[위험] 네이버 글을 티스토리에 그대로 복사했을 때:</b>
1. ⚠️ <b>유사문서(Duplicate Content) 직행:</b> 네이버와 구글/다음 검색 봇이 '표절/도용 문서'로 판정하여 양쪽 블로그 동반 노출 누락.
2. ⚠️ <b>HTML 쓰레기 태그 오염:</b> 네이버 스마트에디터 전용 서식 태그가 그대로 딸려와 티스토리 모바일 화면 깨짐 및 페이지 로딩 지연.
3. ⚠️ <b>구글 SEO 태그 결여:</b> H2, H3 제목 태그와 요약 불렛이 없어 구글 검색 로봇과 AI가 정답으로 파싱하지 못함.</pre>
        </div>
        <div class="ba-content" id="baAfter" style="display:none">
          <pre style="color:#1C4E34;font-weight:600"><b>[완벽] AI로 재가공하여 티스토리에 옮겨쓴 결과물:</b>

<h2>1. 서두 핵심 요약 (AI 검색 정답 박스)</h2>
- <b>진단 대상:</b> 10인 규모 정밀 가공 제조업
- <b>핵심 문제:</b> 공장 생산성이 아닌 '원가 집계 전산 코드 누락'
- <b>최종 성과:</b> 30분 장부 진단으로 월 1,500만 원 불필요 누수 차단

[사진 1 삽입 권장: 현장 본사 로비]
화려한 사무실보다 더 중요한 것은 문을 열고 들어가는 사람의 진심입니다...

<h2>2. 현장에서 발견한 3대 원가 누수 지점</h2>
대부분의 대표님들은 공장 기계 탓을 하시지만, 실제 장부를 펼쳐보면...

[사진 2 삽입 권장: 테이블 위 결산서 분석 메모]
- 원자재 매입단가 실시간 미반영
- 외주 임가공비 중복 계상 오류...

<h2>3. 결론 및 실무 조언</h2>
[사진 3 삽입 권장: 미팅 후 악수]
컨설팅은 거창한 이론이 아닙니다. 대표님의 땀방울이 온전히 통장에 남도록 가시를 뽑아드리는 일입니다.

태그: #중소기업경영진단 #원가절감 #제조업컨설팅 #구글SEO #티스토리마케팅</pre>
        </div>
      </div>

      <div class="cal tistory">
        <b>💡 티스토리 스마트 옮겨쓰기의 3대 핵심 규칙</b>
        <p style="margin:0 0 3px">① <strong>소제목 H2/H3 구조화:</strong> 구글 로봇이 목차를 인식할 수 있게 문단별 핵심 제목 부여</p>
        <p style="margin:0 0 3px">② <strong>3줄 팩트 요약 박스:</strong> 글 맨 위에 요약 박스를 두어 SearchGPT/Perplexity가 정답으로 인용하게 유도</p>
        <p style="margin:0">③ <strong>문장 어투 패러프레이징:</strong> 원문의 핵심 팩트는 유지하되 문맥을 변주하여 유사문서 100% 회피</p>
      </div>
    </div>

    <!-- 우측 컬럼: 맞춤 키워드 입력 & 티스토리 옮겨쓰기 전용 프롬프트 -->
    <div class="slide-col">
      <div class="custom-inline-card tistory-card">
        <div class="desc">
          <span>🔥 내 비즈니스 입력:</span>
        </div>
        <div class="fields">
          <input type="text" id="blogTopic" placeholder="내 업종/주제 (예: 역삼동 세무사 / 제조업 경영진단)" value="중소기업 경영컨설팅">
          <input type="text" id="blogTarget" placeholder="타깃 독자 / 목표 (예: 구글 SEO & 티스토리)" value="성장기 중소기업 대표">
        </div>
      </div>

      <div class="prompt-box tistory-border">
        <div class="p-top">
          <span>티스토리 3분 스마트 옮겨쓰기 마스터 프롬프트</span>
          <button class="copy-btn" id="copyPromptBtn">프롬프트 복사</button>
        </div>
        <pre id="promptTemplateText">당신은 구글 SEO와 티스토리(Tistory) 플랫폼 알고리즘, 그리고 최신 AI 검색(SearchGPT/Perplexity) 인용 원리에 정통한 멀티채널 테크니컬 에디터입니다.
아래 제공되는 [원본 글 / 핵심 메모]를 바탕으로, 네이버-티스토리 간 유사문서(Duplicate) 페널티를 완벽히 회피하면서 구글 상위노출과 AI 정답 인용을 동시에 달성하는 [티스토리 최적화 포스팅]으로 새롭게 옮겨써 주세요.

[포스팅 정보]
- 메인 주제/키워드: <span class="token token-topic">중소기업 경영컨설팅</span>
- 타깃 독자: <span class="token token-target">성장기 중소기업 대표</span>
- 플랫폼: 티스토리 (구글 SEO & 다음 검색 & AI 인용 타깃)

[원본 글 또는 현장 상황 메모]
- 상황 1 (도입/외관): 고객사 본사 로비에 도착했을 때의 차분하고 기대감 넘치는 분위기
- 상황 2 (본문/디테일): 회의실 테이블에 펼쳐진 경영 진단 체크리스트와 꼼꼼한 분석 메모
- 상황 3 (마무리/미팅): 대표님과 악수를 나누며 후속 전략에 대해 깊이 공감하고 웃는 모습

[티스토리 옮겨쓰기 작성 원칙]
1. [유사문서 100% 회피]: 원본의 팩트와 메시지는 유지하되, 문장 구조와 도입 스토리텔링 각도를 신선하게 재구성해 주세요.
2. [AI 검색용 3줄 브리핑]: 본문 맨 위에 구글 스니펫과 AI 챗봇이 정답으로 긁어가기 좋은 [핵심 3줄 요약 박스]를 배치해 주세요.
3. [구글 SEO 헤딩 태그]: 본문 문단을 <h2> 소제목과 <h3> 세부항목으로 명확히 구분하고, 중요 키워드를 볼드체로 강조해 주세요.
4. [사진 삽입 가이드]: [사진 1 삽입 권장: 외관], [사진 2 삽입 권장: 디테일], [사진 3 삽입 권장: 미팅] 위치를 명시해 주세요.
5. [티스토리 검색 태그]: 구글 및 다음 검색에서 높은 유입을 만드는 핵심 태그 8개를 추천해 주세요.</pre>
      </div>
    </div>
  </div>
</section>

</main>
</div>

<!-- ── 3. 하단 네비게이터 페이저 ── -->
<div id="pager">
  <button id="prevBtn" disabled>&larr; 이전 슬라이드</button>
  <span class="ct" id="pageIndicator">1 / 7</span>
  <span class="key-hint">(단축키: ← / → 방향키, Space)</span>
  <div class="sp"></div>
  <button class="main" id="nextBtn">다음 슬라이드 &rarr;</button>
</div>

</div>

<!-- ── 4. 스크립트: 인증, 페이저, 타이머, 실시간 치환 ── -->
<script>
(function(){
  var AUTH_CODE = '0922';

  // ── 1. 슬라이드 페이징 제어 ──
  var pages = Array.from(document.querySelectorAll('main section.pg'));
  var curIndex = 0;
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var pageIndicator = document.getElementById('pageIndicator');
  var nowSecEl = document.getElementById('nowSec');
  var progBar = document.querySelector('#prog i');
  var navEl = document.getElementById('nav');

  // 사이드바 목차 자동 생성
  var curGroup = '';
  pages.forEach(function(p, i){
    var g = p.getAttribute('data-g') || '';
    var t = p.getAttribute('data-t') || ('0' + i);
    if (g && g !== curGroup) {
      curGroup = g;
      var grpEl = document.createElement('div');
      grpEl.className = 't';
      grpEl.textContent = g;
      navEl.appendChild(grpEl);
    }
    var a = document.createElement('a');
    a.href = '#' + p.id;
    a.textContent = t;
    a.setAttribute('data-idx', i);
    if (p.id === 'p5') a.classList.add('tistory-tab');
    if (p.getAttribute('data-live')) a.classList.add('live');
    a.addEventListener('click', function(e){
      e.preventDefault();
      goToPage(i);
    });
    navEl.appendChild(a);
  });

  var allBtn = document.createElement('button');
  allBtn.className = 'allbtn';
  allBtn.textContent = '전체 펼쳐보기';
  allBtn.addEventListener('click', function(){
    document.body.classList.toggle('allmode');
    this.textContent = document.body.classList.contains('allmode') ? '슬라이드 모드로 전환' : '전체 펼쳐보기';
  });
  navEl.appendChild(allBtn);

  function updatePageDisplay() {
    if (document.body.classList.contains('allmode')) return;
    pages.forEach(function(p, i){
      if (i === curIndex) {
        p.classList.add('on');
      } else {
        p.classList.remove('on');
      }
    });

    var navLinks = navEl.querySelectorAll('a[data-idx]');
    navLinks.forEach(function(a){
      if (parseInt(a.getAttribute('data-idx'), 10) === curIndex) {
        a.classList.add('cur');
      } else {
        a.classList.remove('cur');
      }
    });

    prevBtn.disabled = (curIndex === 0);
    nextBtn.disabled = (curIndex === pages.length - 1);
    pageIndicator.textContent = (curIndex + 1) + ' / ' + pages.length;

    var curTitle = pages[curIndex].getAttribute('data-t') || '';
    nowSecEl.textContent = curTitle;

    if (pages[curIndex].id === 'p5') {
      nextBtn.classList.add('tistory-btn');
    } else {
      nextBtn.classList.remove('tistory-btn');
    }

    var pct = ((curIndex + 1) / pages.length) * 100;
    if (progBar) progBar.style.width = pct + '%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToPage(idx) {
    if (idx >= 0 && idx < pages.length) {
      curIndex = idx;
      updatePageDisplay();
    }
  }

  // ── 2. 인증 및 게이트 제어 ──
  var gate = document.getElementById('gate');
  var app = document.getElementById('app');
  var pwInput = document.getElementById('pw');
  var goBtn = document.getElementById('goBtn');
  var errBox = document.getElementById('errBox');
  var quickEnterBtn = document.getElementById('quickEnterBtn');

  function unlock() {
    gate.classList.add('hidden');
    app.classList.remove('hidden');
    sessionStorage.setItem('aiedu_auth_passed_session02', '1');
    updatePageDisplay();
  }

  // URL 파라미터 확인 (?pw=0922 or ?master=true)
  var params = new URLSearchParams(window.location.search);
  if (params.get('pw') === AUTH_CODE || params.get('master') === 'true' || sessionStorage.getItem('aiedu_auth_passed_session02') === '1' || sessionStorage.getItem('aiedu_auth_passed') === '1') {
    unlock();
  }

  function handleAuth() {
    var val = pwInput.value.trim();
    if (val === AUTH_CODE) {
      unlock();
    } else {
      errBox.textContent = '인증번호가 맞지 않습니다. (강의 화면을 확인해 주세요)';
      pwInput.value = '';
      pwInput.focus();
    }
  }

  goBtn.addEventListener('click', handleAuth);
  pwInput.addEventListener('keyup', function(e){
    if (e.key === 'Enter') handleAuth();
  });
  if (quickEnterBtn) {
    quickEnterBtn.addEventListener('click', function(){
      pwInput.value = AUTH_CODE;
      unlock();
    });
  }

  prevBtn.addEventListener('click', function(){ goToPage(curIndex - 1); });
  nextBtn.addEventListener('click', function(){ goToPage(curIndex + 1); });

  // 키보드 방향키 넘김 지원
  window.addEventListener('keydown', function(e){
    if (!gate.classList.contains('hidden')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goToPage(curIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToPage(curIndex - 1);
    }
  });

  // ── 3. 폰트 줌 및 프로젝터 와이드 모드 ──
  var zoomLevels = ['', 'z1', 'z2', 'z3'];
  var zoomLabels = ['기본', '1단계', '2단계 (프로젝터)', '3단계 (초대형)'];
  var currentZoomIdx = 0;
  var zlEl = document.getElementById('zl');
  var ziBtn = document.getElementById('zi');
  var zoBtn = document.getElementById('zo');
  var projModeBtn = document.getElementById('projModeBtn');

  function applyZoom(idx) {
    zoomLevels.forEach(function(cls){ if(cls) document.body.classList.remove(cls); });
    currentZoomIdx = Math.max(0, Math.min(zoomLevels.length - 1, idx));
    if (zoomLevels[currentZoomIdx]) {
      document.body.classList.add(zoomLevels[currentZoomIdx]);
    }
    zlEl.textContent = zoomLabels[currentZoomIdx];
  }

  ziBtn.addEventListener('click', function(){ applyZoom(currentZoomIdx + 1); });
  zoBtn.addEventListener('click', function(){ applyZoom(currentZoomIdx - 1); });
  if (projModeBtn) {
    projModeBtn.addEventListener('click', function(){
      if (currentZoomIdx >= 2) {
        applyZoom(0);
        projModeBtn.textContent = '🖥️ 프로젝터 모드';
      } else {
        applyZoom(2);
        projModeBtn.textContent = '🖥️ 표준 모드 복귀';
      }
    });
  }

  // ── 4. 미니멀 5분 실습 타이머 ──
  var timerToggleBtn = document.getElementById('timerToggleBtn');
  var timerBanner = document.getElementById('timerBanner');
  var timerClock = document.getElementById('timerClock');
  var timerStartBtn = document.getElementById('timerStartBtn');
  var timerResetBtn = document.getElementById('timerResetBtn');
  var timerCloseBtn = document.getElementById('timerCloseBtn');
  var timerDuration = 300;
  var timerLeft = timerDuration;
  var timerTimer = null;
  var timerRunning = false;

  function renderTimer() {
    var m = Math.floor(timerLeft / 60);
    var s = timerLeft % 60;
    timerClock.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    if (timerLeft <= 30) {
      timerClock.style.color = '#C0392B';
    } else {
      timerClock.style.color = '#FF9D7E';
    }
  }

  function startTimer() {
    if (timerRunning) {
      clearInterval(timerTimer);
      timerRunning = false;
      timerStartBtn.textContent = '재개';
      return;
    }
    timerRunning = true;
    timerStartBtn.textContent = '일시정지';
    timerTimer = setInterval(function(){
      if (timerLeft > 0) {
        timerLeft--;
        renderTimer();
      } else {
        clearInterval(timerTimer);
        timerRunning = false;
        timerStartBtn.textContent = '시작';
        alert('⏰ 5분 티스토리 실습 시간이 종료되었습니다!');
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerTimer);
    timerRunning = false;
    timerLeft = timerDuration;
    timerStartBtn.textContent = '시작';
    renderTimer();
  }

  timerToggleBtn.addEventListener('click', function(){
    timerBanner.classList.toggle('on');
    timerToggleBtn.classList.toggle('active');
  });
  timerStartBtn.addEventListener('click', startTimer);
  timerResetBtn.addEventListener('click', resetTimer);
  timerCloseBtn.addEventListener('click', function(){
    timerBanner.classList.remove('on');
    timerToggleBtn.classList.remove('active');
  });

  // ── 5. 실습 프롬프트 키워드 실시간 자동 치환 ──
  var topicInput = document.getElementById('blogTopic');
  var targetInput = document.getElementById('blogTarget');
  var promptPre = document.getElementById('promptTemplateText');
  var copyPromptBtn = document.getElementById('copyPromptBtn');

  function updatePromptTokens() {
    var topic = topicInput.value.trim() || '중소기업 경영컨설팅';
    var target = targetInput.value.trim() || '성장기 중소기업 대표';
    document.querySelectorAll('.token-topic').forEach(function(el){ el.textContent = topic; });
    document.querySelectorAll('.token-target').forEach(function(el){ el.textContent = target; });
  }

  if (topicInput && targetInput) {
    topicInput.addEventListener('input', updatePromptTokens);
    targetInput.addEventListener('input', updatePromptTokens);
  }

  if (copyPromptBtn && promptPre) {
    copyPromptBtn.addEventListener('click', function(){
      var textToCopy = promptPre.innerText || promptPre.textContent;
      navigator.clipboard.writeText(textToCopy).then(function(){
        copyPromptBtn.textContent = '✓ 복사완료!';
        copyPromptBtn.classList.add('done');
        setTimeout(function(){
          copyPromptBtn.textContent = '프롬프트 복사';
          copyPromptBtn.classList.remove('done');
        }, 2000);
      });
    });
  }

  // ── 6. Before vs After 탭 토글 ──
  var tabBefore = document.querySelector('.ba-tab.before');
  var tabAfter = document.querySelector('.ba-tab.after');
  var contentBefore = document.getElementById('baBefore');
  var contentAfter = document.getElementById('baAfter');

  if (tabBefore && tabAfter) {
    tabBefore.addEventListener('click', function(){
      tabBefore.classList.add('active');
      tabAfter.classList.remove('active');
      contentBefore.style.display = 'block';
      contentAfter.style.display = 'none';
    });
    tabAfter.addEventListener('click', function(){
      tabAfter.classList.add('active');
      tabBefore.classList.remove('active');
      contentAfter.style.display = 'block';
      contentBefore.style.display = 'none';
    });
  }

  updatePageDisplay();
})();
</script>
</body>
</html>
'''

with open('/Users/VIBRA_PETER/dev/aiedu1/public/02.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with open('/Users/VIBRA_PETER/dev/aiedu1/public/session02.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Successfully updated public/02.html and public/session02.html with Tistory exercise")
