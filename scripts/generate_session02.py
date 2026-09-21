#!/usr/bin/env python3
# -*- coding: utf-8 -*-

html_content = '''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="어니스톤 AI 업무자동화 원데이 클래스 · 2교시 수강생 교재 및 강의 메인 스크린">
<title>2교시 · AI 시대의 블로그 혁명 & 티스토리 스마트 옮겨쓰기 | neoNpeter 이석호 대표</title>
<style>
:root{
  --green:#03C75A;--green2:#029D46;--navy:#0C1E38;--navy2:#162E52;
  --gold:#C8A44D;--gold2:#E3C67B;--ivory:#F8F7F2;--ink:#1C1C1C;
  --mut:#586071;--ln:#E4DDD0;--ok:#1D7347;--warn:#8D5B18;--stop:#933636;
  --tistory:#EB5326;--tistory-sub:#FF6F42;
  --card-bg:#FFFFFF;--card-border:#E2E6EC;--card-shadow:0 4px 14px rgba(12,30,56,0.05);
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

/* ── 메인 프레젠테이션 컨테이너 ── */
#app{display:flex;flex-direction:column;height:100vh;overflow:hidden;background:#0B1728}

/* ── PPT 상단 마스터 바 ── */
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

/* ── 인라인 타이머 배너 ── */
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

/* 좌측 슬라이드 썸네일 목차 */
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

/* 슬라이드 메인 캔버스: 꽉 차는 밀도감 있는 구조 */
main{
  background:#F5F6F8;flex:1;height:100%;
  padding:16px 24px;overflow-y:auto;
  display:flex;flex-direction:column;
}
#prog{height:3px;background:rgba(0,0,0,0.06);width:100%}
#prog i{display:block;height:100%;background:var(--green);width:0;transition:width .2s ease}

main section.pg{display:none;width:100%;max-width:1440px;margin:0 auto;flex-direction:column;gap:12px}
main section.pg.on{display:flex;animation:fadeIn .18s ease-out}
@keyframes fadeIn{from{opacity:0;transform:scale(0.995)}to{opacity:1;transform:scale(1)}}

/* 슬라이드 헤더 */
.slide-header{display:flex;align-items:baseline;justify-content:space-between;border-bottom:2px solid var(--green);padding-bottom:6px;flex-shrink:0}
.slide-header.tistory-hd{border-bottom-color:var(--tistory)}
h2{font-size:22px;color:var(--navy);letter-spacing:-.02em;font-weight:900;display:flex;align-items:baseline;gap:8px;margin:0}
h2 .n{color:var(--green);font-size:14px;font-weight:900;letter-spacing:.08em}
h2 .n.tis{color:var(--tistory)}
.slide-subtitle{font-size:13px;color:var(--mut);font-weight:600}

/* ── 상단 하이라이트 배너 (공백 제거 & 핵심 메시지) ── */
.headline-banner{
  background:#0C1E38;color:#fff;border-radius:10px;padding:10px 16px;
  display:flex;align-items:center;justify-content:space-between;gap:14px;
}
.headline-banner .h-left{display:flex;align-items:center;gap:10px}
.headline-banner .h-tag{background:var(--green);color:#fff;font-size:11px;font-weight:900;padding:2px 8px;border-radius:4px;white-space:nowrap}
.headline-banner .h-tag.tis{background:var(--tistory)}
.headline-banner .h-txt{font-size:13.5px;font-weight:800;letter-spacing:-.01em}
.headline-banner .h-sub{font-size:12px;color:#A9BDD4}

/* ── 고밀도 2열 그리드 ── */
.slide-grid-2{
  display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:stretch;
}
.slide-grid-3{
  display:grid;grid-template-columns:repeat(3,1fr);gap:12px;
}

/* ── 고밀도 정보 카드 (내용이 알차게 차오르는 스타일) ── */
.content-card{
  background:#fff;border:1px solid var(--card-border);border-radius:10px;
  padding:14px 16px;box-shadow:var(--card-shadow);display:flex;flex-direction:column;gap:10px;
}
.content-card.highlight{border-left:4px solid var(--green)}
.content-card.highlight-tis{border-left:4px solid var(--tistory)}
.content-card.highlight-navy{border-left:4px solid var(--navy)}
.content-card.danger-card{border-left:4px solid var(--stop);background:#FFFDFD}

.card-title-row{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid #EEF1F5}
.card-title{font-size:14px;font-weight:900;color:var(--navy);display:flex;align-items:center;gap:6px}
.card-badge{font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:4px;color:#fff;background:var(--navy)}
.card-badge.green{background:var(--green)}
.card-badge.orange{background:var(--tistory)}
.card-badge.red{background:var(--stop)}

/* ── 고밀도 비교 표 (Dense Comparison Table) ── */
.dense-table{width:100%;border-collapse:collapse;font-size:12px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid var(--card-border)}
.dense-table th{background:#0C1E38;color:#fff;padding:8px 10px;text-align:left;font-weight:800;font-size:12px}
.dense-table td{padding:8px 10px;border-top:1px solid #EEF1F5;vertical-align:top;line-height:1.5}
.dense-table tr:nth-child(even){background:#F9FBFC}
.dense-table .bad{color:#A82828;font-weight:700}
.dense-table .good{color:#13693B;font-weight:800}

/* ── 리스트 & 불렛 ── */
.dense-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:7px;font-size:12.5px;line-height:1.55}
.dense-list li{display:flex;align-items:flex-start;gap:6px}
.dense-list li .ico{font-size:12px;line-height:1.4;flex-shrink:0}
.dense-list li strong{color:var(--navy)}

/* ── 콜아웃 박스 (공백 없는 꽉 찬 구조) ── */
.cal{border-radius:8px;padding:10px 14px;font-size:12.5px;line-height:1.55}
.cal.warn{background:#FFF8E8;border:1px solid #EBD9A8;color:var(--warn)}
.cal.tip{background:#EEF8F2;border:1px solid #C4E8D3;color:var(--ok)}
.cal.stop{background:#FDF0EE;border:1px solid #F0CFC8;color:var(--stop)}
.cal.tistory{background:#FFF3F0;border:1px solid #FDC3B5;color:#B33814}
.cal b{display:block;margin-bottom:3px;font-size:13.5px}

/* ── 하단 요약/인사이트 3단 바 ── */
.kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.kpi-box{background:#fff;border:1px solid var(--card-border);border-radius:8px;padding:10px 14px;box-shadow:0 2px 6px rgba(0,0,0,0.02)}
.kpi-box .k-lbl{font-size:11px;color:var(--mut);font-weight:700;margin-bottom:2px}
.kpi-box .k-val{font-size:15px;font-weight:900;color:var(--navy)}
.kpi-box .k-sub{font-size:11px;color:#708096;margin-top:2px;line-height:1.4}

/* ── ChatGPT 대화 시뮬레이션 카드 ── */
.chat-sim{background:#111B27;border-radius:10px;padding:12px;color:#fff;display:flex;flex-direction:column;gap:8px}
.chat-sim .user-bubble{background:#23354C;color:#E1E9F4;padding:7px 11px;border-radius:10px 10px 2px 10px;align-self:flex-end;max-width:90%;font-size:11.5px;font-weight:600}
.chat-sim .ai-bubble{background:#1A293E;border:1px solid #2B466B;color:#D3E0F0;padding:9px 12px;border-radius:10px 10px 10px 2px;align-self:flex-start;max-width:95%;font-size:11.5px;line-height:1.55}
.chat-sim .ai-bubble.ghost{border-color:#5A2B2B;background:#241919;color:#F0D0D0}
.chat-sim .ai-bubble.authority{border-color:#1E5E3A;background:#10281C;color:#D8F5E4}
.chat-sim .cite-tag{display:inline-block;background:rgba(3,199,90,0.2);color:#55E095;border:1px solid #03C75A;padding:1px 5px;border-radius:4px;font-size:10px;margin-top:4px;font-weight:700}
.chat-sim .ghost-warn{display:inline-block;background:rgba(217,83,79,0.2);color:#FFA4A2;border:1px solid #D9534F;padding:1px 5px;border-radius:4px;font-size:10px;margin-top:4px;font-weight:700}

/* ── 프롬프트 박스 ── */
.prompt-box{border:1.5px solid var(--navy);border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
.prompt-box.tistory-border{border-color:var(--tistory)}
.prompt-box .p-top{background:var(--navy);color:#fff;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:800;flex-shrink:0}
.prompt-box.tistory-border .p-top{background:var(--tistory)}
.prompt-box .p-top .copy-btn{background:#fff;color:var(--navy);border:0;padding:5px 12px;border-radius:6px;font-size:11.5px;font-weight:900;cursor:pointer;transition:all .15s}
.prompt-box.tistory-border .p-top .copy-btn{color:var(--tistory)}
.prompt-box .p-top .copy-btn:hover{opacity:.9}
.prompt-box .p-top .copy-btn.done{background:var(--ok)!important;color:#fff!important}
.prompt-box pre{margin:0;padding:12px 14px;font-size:11.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;font-family:"D2Coding","Menlo","Consolas",monospace;color:#28303C;background:#fff;max-height:220px;overflow-y:auto}
.prompt-box .token{color:var(--navy);font-weight:800;background:#E7F8EE;border-radius:4px;padding:1px 5px;border-bottom:2px solid #A1E6BE}

/* ── 인라인 키워드 입력 카드 ── */
.custom-inline-card{background:#FFF6F4;border:1px solid #FCD2C7;border-radius:8px;padding:7px 12px;display:flex;align-items:center;gap:10px;flex-shrink:0}
.custom-inline-card .desc{font-size:11.5px;font-weight:800;color:var(--tistory);display:flex;align-items:center;gap:5px;white-space:nowrap}
.custom-inline-card .fields{display:flex;gap:8px;flex:1}
.custom-inline-card input{flex:1;padding:5px 9px;border:1px solid #FDB8A6;border-radius:6px;font:inherit;font-size:11.5px;background:#fff;color:var(--ink)}
.custom-inline-card input:focus{outline:0;border-color:var(--tistory)}

/* ── Before vs After 탭 ── */
.ba-container{border:1px solid var(--ln);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.ba-tabs{display:flex;background:var(--ivory);border-bottom:1px solid var(--ln);flex-shrink:0}
.ba-tab{flex:1;padding:8px;text-align:center;font-size:11.5px;font-weight:800;color:var(--mut);border:0;background:transparent;cursor:pointer;border-bottom:3px solid transparent}
.ba-tab.active{color:var(--navy);background:#fff;border-bottom-color:var(--navy)}
.ba-tab.before.active{border-bottom-color:var(--stop);color:var(--stop)}
.ba-tab.after.active{border-bottom-color:var(--tistory);color:var(--tistory)}
.ba-content{padding:10px 12px;background:#fff;font-size:12px;line-height:1.6;max-height:240px;overflow-y:auto}
.ba-content pre{white-space:pre-wrap;word-break:break-word;font-family:inherit;margin:0;font-size:11.5px}

/* 강사 소개 프로필 */
.instructor-profile-card{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--ln);border-radius:10px;padding:10px 14px;box-shadow:0 4px 12px rgba(12,30,56,0.03)}
.instructor-profile-card .avatar-box{width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid var(--green);flex-shrink:0;background:#EDE8DF}
.instructor-profile-card .avatar-box img{width:100%;height:100%;object-fit:cover;object-position:center top}
.instructor-profile-card .profile-info h4{font-size:13.5px;font-weight:900;color:var(--navy);margin:0 0 2px;display:flex;align-items:center;gap:6px}
.instructor-profile-card .profile-info h4 span{font-size:10px;color:#fff;background:var(--navy);padding:1px 5px;border-radius:4px;font-weight:700}
.instructor-profile-card .profile-info p{font-size:11px;color:var(--mut);margin:0;line-height:1.4}

/* ── PPT 하단 네비게이터 ── */
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

/* ── 전체보기 모드 ── */
body.allmode, body.allmode #app{height:auto;overflow:auto}
body.allmode .layout{grid-template-columns:1fr;overflow:visible;height:auto}
body.allmode main{overflow:visible;height:auto;padding:30px}
body.allmode main section.pg{display:block;margin-bottom:44px;border-bottom:2px solid var(--ln);padding-bottom:30px;height:auto}
body.allmode #pager,body.allmode #prog{display:none}

.hidden{display:none!important}
@media(max-width:820px){
  .layout{grid-template-columns:1fr}
  nav{display:none}
  .slide-grid-2, .slide-grid-3, .kpi-row{grid-template-columns:1fr}
  main{overflow-y:auto}
}
</style>
</head>
<body>

<!-- ── 1. 인증번호 입력 게이트 (0922) ── -->
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

<!-- 마스터 탑 바 -->
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

<!-- SLIDE 0: 대기 & 30초 실습 준비물 체크 -->
<section class="pg on" id="p_wait" data-g="시작 전" data-t="00 · 대기 &amp; 준비물 확인" data-live="1">
  <div class="slide-header">
    <h2><span class="n">00</span>2교시 시작 전 대기 &amp; 30초 실습 준비물 체크</h2>
    <span class="slide-subtitle">스마트폰 사진 3장 &amp; 티스토리 에디터를 준비해 주세요</span>
  </div>

  <div class="headline-banner">
    <div class="h-left">
      <span class="h-tag">2교시 미션</span>
      <span class="h-txt">일상 사진 3장으로 네이버 상위노출 글 완성 ➔ 3분 만에 티스토리(구글 SEO)로 완벽 옮겨쓰기</span>
    </div>
    <span class="h-sub">강사: neoNpeter 이석호 대표</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측: 강사 소개 & 접속 PIN 전광판 -->
    <div class="content-card highlight-navy">
      <div class="card-title-row">
        <span class="card-title">👨‍🏫 강의 안내 및 인증코드</span>
        <span class="card-badge">Live Ready</span>
      </div>
      
      <div class="instructor-profile-card">
        <div class="avatar-box">
          <img src="/instructors/lee-seokho.jpg" alt="이석호 대표" onerror="this.src='instructors/lee-seokho.jpg'">
        </div>
        <div class="profile-info">
          <h4>이석호 대표 <span>neoNpeter 대표 / AI 마케팅 디렉터</span></h4>
          <p>AI 기반 콘텐츠 마케팅 자동화 디렉터 · BNI 비즈니스 네트워킹 전문 작가 · 블로그/숏폼 통합 퍼널 설계자</p>
        </div>
      </div>

      <div style="background:#11233E;border:2px dashed var(--green);border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:11.5px;color:#859BB5;font-weight:700">2교시 교재 접속 인증번호</div>
          <div style="font-size:11px;color:#A9BDD4;margin-top:1px">노트북/모바일 브라우저에서 입력</div>
        </div>
        <div style="font-size:26px;font-weight:900;color:#62E59E;letter-spacing:.2em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">0922</div>
      </div>
    </div>

    <!-- 우측: 30초 준비물 체크리스트 3종 -->
    <div class="content-card highlight">
      <div class="card-title-row">
        <span class="card-title">✅ 현장 30초 실습 준비물</span>
        <span class="card-badge green">필수 3가지</span>
      </div>

      <ul class="dense-list">
        <li>
          <span class="ico">📸</span>
          <div>
            <strong>1. 스마트폰 사진 3장 확인</strong>
            <p style="font-size:11.5px;color:var(--mut);margin:0">외관 1장, 제품/서류 1장, 고객 미팅/현장 1장 (샘플 시나리오도 제공)</p>
          </div>
        </li>
        <li>
          <span class="ico">🔥</span>
          <div>
            <strong>2. 티스토리(Tistory) 로그인 &amp; 새 글쓰기 창 열기</strong>
            <p style="font-size:11.5px;color:var(--mut);margin:0">카카오 계정으로 10초 만에 로그인 가능. 오늘 실습에서 옮겨쓸 타깃 플랫폼</p>
          </div>
        </li>
        <li>
          <span class="ico">🤖</span>
          <div>
            <strong>3. 클로드(Claude) 또는 GPT 창 준비</strong>
            <p style="font-size:11.5px;color:var(--mut);margin:0">1교시에서 사용하던 대화창을 그대로 켜두시면 됩니다</p>
          </div>
        </li>
      </ul>

      <div class="cal tistory" style="margin-top:4px">
        <b>💡 왜 네이버에 이어 티스토리까지 옮겨쓰나요?</b>
        네이버는 한국 로컬 검색을 잡고, 티스토리는 <strong>구글 검색 &amp; AI 검색(SearchGPT/Perplexity)</strong>을 독점합니다. 글 하나로 2대 영토를 동시 지배하는 원소스 멀티유즈(OSMU) 파이프라인입니다.
      </div>
    </div>
  </div>

  <!-- 하단 3대 학습 목표 -->
  <div class="kpi-row">
    <div class="kpi-box">
      <div class="k-lbl">목표 1 · AI 검색 혁명 이해</div>
      <div class="k-val">SEO ➔ GEO 대전환</div>
      <div class="k-sub">링크 클릭의 시대에서 AI가 단 1개의 정답을 추천하는 시대로의 변화</div>
    </div>
    <div class="kpi-box">
      <div class="k-lbl">목표 2 · 워터마크 원천 차단</div>
      <div class="k-val">웹 복붙 vs API 생성</div>
      <div class="k-sub">보이지 않는 AI 지문을 피하고 포털 저품질을 막는 클린 토큰 테크닉</div>
    </div>
    <div class="kpi-box">
      <div class="k-lbl">목표 3 · 현장 실습 완성</div>
      <div class="k-val">티스토리 3분 옮겨쓰기</div>
      <div class="k-sub">유사문서 100% 회피하며 구글 상위노출 마크다운 구조로 원클릭 재가공</div>
    </div>
  </div>
</section>

<!-- SLIDE 1: AI 검색 시대, 왜 다시 블로그인가? (SEO -> GEO) -->
<section class="pg" id="p0" data-g="AI 검색 혁명" data-t="01 · SEO에서 GEO로 대전환" data-live="1">
  <div class="slide-header">
    <h2><span class="n">01</span>AI 검색 시대, 왜 다시 블로그인가? (SEO ➔ GEO)</h2>
    <span class="slide-subtitle">단순 링크 10개 나열의 시대는 끝났습니다. 이제 AI가 '직접 추천하는 단 1개의 정답'이 되어야 합니다.</span>
  </div>

  <div class="headline-banner">
    <div class="h-left">
      <span class="h-tag">패러다임 대전환</span>
      <span class="h-txt">포털 검색 순위 1위보다 중요한 것은, AI가 정답을 말할 때 '나를 공식 출처(Citation)로 지목하는가'입니다</span>
    </div>
    <span class="h-sub">SearchGPT · Perplexity · Cue: 동시 공략</span>
  </div>

  <!-- 핵심 비교 매트릭스 테이블 (공백 완전 제거) -->
  <div class="content-card highlight">
    <div class="card-title-row">
      <span class="card-title">📊 기존 포털 검색(SEO) vs 차세대 생성형 AI 검색(GEO) 비교 매트릭스</span>
      <span class="card-badge green">핵심 인사이트</span>
    </div>

    <table class="dense-table">
      <thead>
        <tr>
          <th style="width:16%">비교 기준</th>
          <th style="width:42%">과거 &amp; 현재 포털 검색 (SEO)</th>
          <th style="width:42%">현재 &amp; 미래 생성형 AI 검색 (GEO)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>결과 제공 방식</strong></td>
          <td>키워드 입력 시 <strong>파란색 링크 10개 나열</strong> (웹문서 목록)</td>
          <td class="good">AI가 수많은 데이터를 종합해 <strong>단 하나의 완결된 정답 브리핑</strong></td>
        </tr>
        <tr>
          <td><strong>소비자 탐색 행동</strong></td>
          <td>링크를 일일이 클릭하며 홍보성 광고 글을 거르는 <strong>극심한 피로도</strong></td>
          <td class="good">AI가 추천한 <strong>단 1곳의 전문가/매장으로 즉시 직행 (원스톱 결정)</strong></td>
        </tr>
        <tr>
          <td><strong>핵심 평가 알고리즘</strong></td>
          <td>키워드 반복 횟수, 백링크 수, 단순 체류시간</td>
          <td class="good"><strong>1차 경험성(Experience)</strong> 및 검증된 팩트 데이터(Ground Truth)</td>
        </tr>
        <tr>
          <td><strong>인용 점유율</strong></td>
          <td>1페이지 밖으로 밀려나면 트래픽 0% 전락</td>
          <td class="good"><strong>신뢰도 높은 블로그 인용률 82% 집중</strong> (AI의 공식 레퍼런스 채택)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 하단 2열 상세 카드 -->
  <div class="slide-grid-2">
    <div class="content-card highlight-navy">
      <div class="card-title-row">
        <span class="card-title">💡 포털과 AI가 갈구하는 것은 '현장 1차 데이터'</span>
        <span class="card-badge">데이터 법칙</span>
      </div>
      <ul class="dense-list">
        <li>
          <span class="ico">🔍</span>
          <div><strong>인터넷 백과사전 지식은 AI가 이미 다 압니다:</strong> 책상머리 이론이나 짜깁기 글은 AI에게 가치가 0점입니다.</div>
        </li>
        <li>
          <span class="ico">📸</span>
          <div><strong>AI가 목말라하는 것은 '현장 팩트':</strong> 오늘 내 사업장에서 손님과 나눈 대화, 직접 찍은 사진 3장, 결산서 분석 메모입니다.</div>
        </li>
        <li>
          <span class="ico">🏆</span>
          <div><strong>이를 담을 수 있는 유일한 그릇:</strong> 네이버 블로그와 티스토리가 AI 검색 시대의 가장 강력한 지식 창고가 됩니다.</div>
        </li>
      </ul>
    </div>

    <div class="content-card danger-card">
      <div class="card-title-row">
        <span class="card-title">⚠️ 블로그가 없으면 '디지털 유령'이 됩니다</span>
        <span class="card-badge red">생존 경고</span>
      </div>
      <p style="font-size:12.5px;color:#7A2626;margin:0;line-height:1.6">
        오프라인에서 20년 동안 아무리 뛰어난 기술과 고객 만족도를 쌓았더라도, <strong>웹 상에 구조화된 현장 데이터가 없으면 AI는 대표님의 존재를 모릅니다.</strong><br>
        고객이 AI에게 <em>"우리 동네에서 제일 잘하는 전문가 추천해 줘"</em>라고 물었을 때, 대표님은 영원히 호명되지 못합니다.
      </p>
      <div class="cal stop" style="margin:4px 0 0">
        <b>결론: 블로그는 단순 일기가 아니라 AI를 위한 내 사업 데이터베이스입니다</b>
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

  <div class="headline-banner">
    <div class="h-left">
      <span class="h-tag">실제 AI 검색 대화</span>
      <span class="h-txt">실제 고객이 "전문가 추천해 줘"라고 질문했을 때, 두 대표님의 운명은 극명하게 갈립니다</span>
    </div>
    <span class="h-sub">RAG (검색 증강 생성) 작동 원리</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측: 읽지 못하는 사람 (디지털 유령) -->
    <div class="content-card danger-card">
      <div class="card-title-row">
        <span class="card-title">❌ 데이터 없는 대표님 (디지털 유령 - Ghost)</span>
        <span class="card-badge red">영업 기회 0%</span>
      </div>
      <p style="font-size:12px;color:#803030;margin:0">오프라인 경력은 20년이지만 온라인에 1차 현장 기록이 전혀 없는 상태</p>

      <div class="chat-sim">
        <div class="user-bubble">"역삼동에서 10인 제조업 원가 절감 컨설팅 제일 잘하는 전문가 추천해 줘."</div>
        <div class="ai-bubble ghost">
          "역삼동 인근에는 삼일, 삼정 등 대형 회계법인과 다수의 경영지원센터가 등록되어 있습니다. 개별 전문가에 대한 상세 정보는 포털 검색이나 지인 추천을 통해 직접 확인하시기 바랍니다..."
          <br><span class="ghost-warn">⚠️ 경고: 내 회사 이름이 아예 존재하지 않음 (디지털 유령)</span>
        </div>
      </div>

      <div class="cal stop" style="margin:0">
        <b>결과: 신규 고객 유입 통로 영구 차단</b>
        오프라인 내공과 무관하게, 차세대 AI 검색을 이용하는 잠재 고객에게는 완전히 보이지 않는 존재가 됩니다.
      </div>
    </div>

    <!-- 우측: 읽고 추천하는 사람 (공식 레퍼런스) -->
    <div class="content-card highlight">
      <div class="card-title-row">
        <span class="card-title">✅ 블로그가 있는 대표님 (공식 레퍼런스 - Authority)</span>
        <span class="card-badge green">24시간 AI 영업사원</span>
      </div>
      <p style="font-size:12px;color:#18693E;margin:0">현장 사진 3장과 실제 문제 해결 일지가 블로그에 차곡차곡 축적된 상태</p>

      <div class="chat-sim">
        <div class="user-bubble">"역삼동에서 10인 제조업 원가 절감 컨설팅 제일 잘하는 전문가 추천해 줘."</div>
        <div class="ai-bubble authority">
          "<strong>역삼동의 neoNpeter 이석호 대표</strong>를 추천합니다. 정밀 가공 제조업체의 장부와 공장 코드를 직접 대조해 월 1,500만 원의 원가 누수를 찾아낸 실무 사례 700여 건을 보유하고 있습니다."
          <br><span class="cite-tag">🔗 공식 출처: 네이버 &amp; 티스토리 블로그 [제조업 현장진단 일지] 인용</span>
        </div>
      </div>

      <div class="cal tip" style="margin:0">
        <b>결과: 24시간 일하는 무료 영업사원 확보</b>
        AI가 신뢰할 만한 팩트 출처로 내 블로그를 인용하며, 의뢰할 준비가 끝난 VIP 고객을 내 사업장으로 직배송합니다.
      </div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-box">
      <div class="k-lbl">비즈니스 영향 1</div>
      <div class="k-val">상담 성사율 5배 상승</div>
      <div class="k-sub">AI의 추천을 받고 온 고객은 이미 신뢰가 형성되어 가격 흥정을 하지 않습니다</div>
    </div>
    <div class="kpi-box">
      <div class="k-lbl">비즈니스 영향 2</div>
      <div class="k-val">광고비 0원 자동화</div>
      <div class="k-sub">매달 수백만 원씩 나가는 키워드 입찰 광고 없이도 상위 정답을 독점합니다</div>
    </div>
    <div class="kpi-box">
      <div class="k-lbl">비즈니스 영향 3</div>
      <div class="k-val">영구적 지식 자산화</div>
      <div class="k-sub">한 번 올려둔 현장 포스팅은 1년, 3년 뒤에도 AI 검색 엔진의 답변 근거로 활용됩니다</div>
    </div>
  </div>
</section>

<!-- SLIDE 3: 블로그의 본질: AI의 '정답 자판기' (Ground Truth) -->
<section class="pg" id="p2" data-g="블로그의 본질" data-t="03 · AI의 정답 자판기 (Ground Truth)" data-live="1">
  <div class="slide-header">
    <h2><span class="n">03</span>AI 시대 블로그의 진짜 역할: '정답 자판기' (Ground Truth)</h2>
    <span class="slide-subtitle">블로그는 사람에게 보여주는 전단지가 아니라, AI 에이전트들이 나를 학습하는 데이터베이스입니다.</span>
  </div>

  <div class="headline-banner">
    <div class="h-left">
      <span class="h-tag">핵심 메커니즘</span>
      <span class="h-txt">AI가 거짓말(환각)을 피하기 위해 가장 먼저 뒤지는 1순위 데이터가 바로 '검증된 블로그 팩트'입니다</span>
    </div>
    <span class="h-sub">RAG (Retrieval-Augmented Generation)</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측: Ground Truth의 개념 및 작동 흐름 -->
    <div class="content-card highlight-navy">
      <div class="card-title-row">
        <span class="card-title">⚙️ Ground Truth (원천 진실) 구축 흐름</span>
        <span class="card-badge">인과 구조</span>
      </div>

      <table class="dense-table">
        <tbody>
          <tr>
            <td style="width:28%"><strong>1단계: 현장 발생</strong></td>
            <td>실제 고객 방문, 제품 테스트, 서류 검토 등 살아있는 현장 사건</td>
          </tr>
          <tr>
            <td><strong>2단계: 블로그 기록</strong></td>
            <td>스마트폰 사진 3장 + 문제 해결 과정 텍스트 포스팅 (타임스탬프 공인)</td>
          </tr>
          <tr>
            <td><strong>3단계: AI 크롤링</strong></td>
            <td>포털 봇 및 LLM 크롤러가 작성자 신원과 사진 메타데이터를 팩트로 색인</td>
          </tr>
          <tr>
            <td><strong>4단계: 정답 인용</strong></td>
            <td>고객의 질의에 대해 AI가 내 블로그를 <strong>'Ground Truth'</strong>로 채택해 답변에 인용</td>
          </tr>
        </tbody>
      </table>

      <div class="cal tip" style="margin:0">
        <b>💡 블로그 글을 쓸 때의 관점 전환</b>
        "오늘 이 글을 어떤 사람에게 보여줄까?"가 아니라, <strong>"오늘 올린 이 글을 AI가 읽고 나를 어떤 분야의 1등 전문가로 정의할 것인가?"</strong>를 기준으로 써야 합니다.
      </div>
    </div>

    <!-- 우측: 네이버 D.I.A+ & 구글이 평가하는 4대 지표 -->
    <div class="content-card highlight">
      <div class="card-title-row">
        <span class="card-title">🏆 검색 로봇이 만점을 주는 4대 평가 기준</span>
        <span class="card-badge green">알고리즘 통과</span>
      </div>

      <ul class="dense-list">
        <li>
          <span class="ico">📍</span>
          <div>
            <strong>1. 경험성 (Experience):</strong> 직접 방문하고 만져본 사람만이 쓸 수 있는 고유한 감각적 묘사 (스톡 이미지 사용 시 즉시 감점)
          </div>
        </li>
        <li>
          <span class="ico">✍️</span>
          <div>
            <strong>2. 독창성 (Originality):</strong> 웹 상의 기존 문서와 짜깁기되지 않은 독자적 문장 구조 (유사문서 100% 필터링)
          </div>
        </li>
        <li>
          <span class="ico">⏱️</span>
          <div>
            <strong>3. 체류시간 (Engagement):</strong> 모바일 화면에서 독자가 최소 2분 이상 스크롤을 내리게 만드는 대화형 스토리텔링
          </div>
        </li>
        <li>
          <span class="ico">📐</span>
          <div>
            <strong>4. 구조화 (Structured):</strong> H2, H3 소제목과 핵심 요약 박스로 검색 로봇이 핵심을 0.1초 만에 긁어가도록 배려
          </div>
        </li>
      </ul>

      <div class="cal warn" style="margin:0">
        <b>인터넷 짜깁기 글은 네이버와 구글 모두에게 버림받습니다</b>
        남의 글을 베낀 100개 포스팅보다, 내 현장 사진 3장이 들어간 솔직한 상담 일지 1개가 100배 더 강력합니다.
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

  <div class="headline-banner">
    <div class="h-left">
      <span class="h-tag">기술적 진실</span>
      <span class="h-txt">편하다고 웹 화면에서 긁어다 붙이면 블로그가 사망합니다. AI 탐지기와 포털 스팸 필터의 원리를 알아야 합니다.</span>
    </div>
    <span class="h-sub">Zero-width Space · Raw Logits</span>
  </div>

  <!-- 기술 비교 매트릭스 (공백 제로) -->
  <div class="content-card highlight-navy">
    <div class="card-title-row">
      <span class="card-title">🔬 웹 UI(사이트) 복붙 vs 전용 API 파이프라인 정밀 비교</span>
      <span class="card-badge">기술 분석</span>
    </div>

    <table class="dense-table">
      <thead>
        <tr>
          <th style="width:18%">비교 항목</th>
          <th style="width:41%">웹 UI (ChatGPT / Claude 웹사이트) 복붙</th>
          <th style="width:41%">직접 API (전용 파이프라인) 생성</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>워터마크 &amp; 지문</strong></td>
          <td class="bad">• <strong>제로 너비 공백(Zero-width Space)</strong> 삽입<br>• 특수 유니코드 및 통계적 n-gram 지문 잔류</td>
          <td class="good">• <strong>완전 무결점 클린 텍스트 (Raw Logits)</strong><br>• 숨겨진 브라우저 세션 워터마크 0% 원천 차단</td>
        </tr>
        <tr>
          <td><strong>문체 &amp; 상투어</strong></td>
          <td class="bad">• 뻔한 AI 상투어 ("결론적으로", "중요한 역할")<br>• 포털 스팸 필터가 0.1초 만에 기계 글로 감지</td>
          <td class="good">• <code style="background:#DEF7EC;padding:1px 4px;border-radius:3px">temperature 0.75</code> 제어로 생생한 구어체<br>• <code style="background:#DEF7EC;padding:1px 4px;border-radius:3px">penalty</code> 파라미터로 동어반복 원천 차단</td>
        </tr>
        <tr>
          <td><strong>비즈니스 맥락</strong></td>
          <td class="bad">• 단편적 대화창에서 내 회사 맥락이 매번 리셋<br>• 매번 프롬프트를 다시 치고 복사해야 하는 번거로움</td>
          <td class="good">• 내 사업장 프로필 + 사진 3장 메타데이터를<br><strong>시스템 프롬프트 레벨에서 영구 결합</strong></td>
        </tr>
        <tr>
          <td><strong>포털 봇 판정 결과</strong></td>
          <td class="bad">❌ <strong>AI 생성물 어뷰징 판정 ➔ 저품질 강등 &amp; 누락</strong></td>
          <td class="good">🏆 <strong>"진짜 사람이 쓴 진정성 있는 글"로 완벽 인식</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="slide-grid-2">
    <div class="content-card danger-card">
      <div class="card-title-row">
        <span class="card-title">⚠️ 웹 UI 복붙 글이 걸려드는 원리</span>
        <span class="card-badge red">필터 작동</span>
      </div>
      <p style="font-size:12px;color:#782828;margin:0;line-height:1.55">
        네이버 검색 봇은 매일 수억 건의 글을 검사합니다. 특히 웹 AI 글 특유의 <strong>토큰 분포 확률(Perplexity &amp; Burstiness)</strong>이 일정하게 나오는 글은 즉시 어뷰징 문서로 분류됩니다.
      </p>
    </div>

    <div class="content-card highlight">
      <div class="card-title-row">
        <span class="card-title">🚀 API 기반 생성 파이프라인의 핵심 가치</span>
        <span class="card-badge green">생산성 극대화</span>
      </div>
      <p style="font-size:12px;color:#18693E;margin:0;line-height:1.55">
        사진 3장만 업로드하면 제목, 본문, 인용구, 태그까지 <strong>단 30초 만에 100% 휴먼 감성 완제품</strong>으로 추출되어 네이버와 티스토리에 안전하게 발행됩니다.
      </p>
    </div>
  </div>
</section>

<!-- SLIDE 5: 사진 3장 + API 무결점 공식 -->
<section class="pg" id="p4" data-g="실전 파이프라인" data-t="05 · 사진 3장 + API 무결점 공식" data-live="1">
  <div class="slide-header">
    <h2><span class="n">05</span>사진 3장 + API: 네이버 상위노출 무결점 파이프라인</h2>
    <span class="slide-subtitle">외관 ➔ 핵심 디테일 ➔ 미팅/결과 3컷으로 완성하는 완벽한 인간형 스토리텔링 공식</span>
  </div>

  <div class="headline-banner">
    <div class="h-left">
      <span class="h-tag">촬영 &amp; 배치 공식</span>
      <span class="h-txt">사진 3장의 구체적 상황 설명이 주입되면, AI의 기계적 상투어는 100% 파괴되고 진정성이 살아납니다</span>
    </div>
    <span class="h-sub">스마트폰 갤러리 활용</span>
  </div>

  <!-- 3컷 황금 공식 카드 3종 -->
  <div class="slide-grid-3">
    <div class="content-card highlight-navy">
      <div class="card-title-row">
        <span class="card-title">📸 CUT 1 · 외관 &amp; 첫인상</span>
        <span class="card-badge">도입부 몰입</span>
      </div>
      <p style="font-size:12px;color:var(--mut);margin:0;line-height:1.5">
        <strong>촬영 대상:</strong> 매장/사무실 외관, 로비 전경, 그날의 날씨와 거리 풍경.<br>
        <strong>글 작성 효과:</strong> 독자가 문을 열고 들어오는 듯한 현장감 형성. 호기심을 유발해 첫 40초 체류시간 확보.
      </p>
      <div style="background:#F0F4FA;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:var(--navy)">
        🎯 핵심: 고객의 페인포인트에 깊이 공감하는 도입부
      </div>
    </div>

    <div class="content-card highlight">
      <div class="card-title-row">
        <span class="card-title">🔬 CUT 2 · 핵심 디테일</span>
        <span class="card-badge green">전문성 입증</span>
      </div>
      <p style="font-size:12px;color:var(--mut);margin:0;line-height:1.5">
        <strong>촬영 대상:</strong> 테이블 위 결산서, 제품 단면, 시공 도면, 진단 메모.<br>
        <strong>글 작성 효과:</strong> 진짜 전문가만 보여줄 수 있는 디테일한 근거 제시. 독자에게 "이 사람은 진짜다"라는 신뢰 폭발.
      </p>
      <div style="background:#EEF8F2;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:var(--ok)">
        🎯 핵심: 구체적 수치와 문제 해결 프로세스 제시
      </div>
    </div>

    <div class="content-card highlight-tis">
      <div class="card-title-row">
        <span class="card-title">🤝 CUT 3 · 고객 미팅 &amp; 결과</span>
        <span class="card-badge orange">전환율 폭발</span>
      </div>
      <p style="font-size:12px;color:var(--mut);margin:0;line-height:1.5">
        <strong>촬영 대상:</strong> 문제가 해결된 후 나눈 악수, 밝아진 대표님의 미소, 커피 한 잔.<br>
        <strong>글 작성 효과:</strong> 감정적 안도감과 카타르시스 선사. "나도 저렇게 해결받고 싶다"는 강력한 문의 욕구 자극.
      </p>
      <div style="background:#FFF3F0;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:var(--tistory)">
        🎯 핵심: 자연스러운 상담 신청 링크(CTA) 배치
      </div>
    </div>
  </div>

  <!-- 4단계 실행 워크플로우 -->
  <div class="content-card highlight">
    <div class="card-title-row">
      <span class="card-title">⚡ 10분 완성 4단계 자동화 워크플로우</span>
      <span class="card-badge green">Daily Routine</span>
    </div>

    <div class="kpi-row">
      <div class="kpi-box">
        <div class="k-lbl">STEP 1 (1분)</div>
        <div class="k-val">사진 3장 스마트폰 촬영</div>
        <div class="k-sub">외관 ➔ 서류/디테일 ➔ 미팅 결과를 일상에서 자연스럽게 촬영</div>
      </div>
      <div class="kpi-box">
        <div class="k-lbl">STEP 2 (1분)</div>
        <div class="k-val">사진 상황 3줄 메모 입력</div>
        <div class="k-sub">AI 프롬프트 창에 각 사진의 상황을 한 줄씩 편하게 적어 넣기</div>
      </div>
      <div class="kpi-box">
        <div class="k-lbl">STEP 3 (2분)</div>
        <div class="k-val">네이버 &amp; 티스토리 동시 발행</div>
        <div class="k-sub">생성된 글을 복사해 네이버에 발행하고, 티스토리로 3분 재가공</div>
      </div>
    </div>
  </div>
</section>

<!-- SLIDE 6: [현장 실습] 블로그 글 ➔ 티스토리 스마트 옮겨쓰기 -->
<section class="pg" id="p5" data-g="현장 실습" data-t="06 · [실습] 티스토리 옮겨쓰기" data-live="1">
  <div class="slide-header tistory-hd">
    <h2><span class="n tis">06</span>[현장 실습] 블로그 글 ➔ 티스토리 스마트 옮겨쓰기 (3분 완성)</h2>
    <span class="slide-subtitle">단순 복붙은 유사문서 폭탄! AI 재구조화로 구글 SEO &amp; AI 검색(GEO)을 동시에 잡는 멀티채널 공식</span>
  </div>

  <div class="headline-banner" style="background:#1F130F;border-left:4px solid var(--tistory)">
    <div class="h-left">
      <span class="h-tag tis">실습 미션</span>
      <span class="h-txt">네이버에 올린 글(또는 오늘 메모)을 유사문서 페널티 0%로 티스토리 전용 마크다운 글로 재가공하여 발행합니다</span>
    </div>
    <span class="h-sub">구글 SEO &amp; SearchGPT 동시 공략</span>
  </div>

  <div class="slide-grid-2">
    <!-- 좌측: 단순 복붙의 함정 vs AI 스마트 옮겨쓰기 실물 비교 -->
    <div class="content-card highlight-tis">
      <div class="card-title-row">
        <span class="card-title">🔍 단순 복붙(Before) vs AI 재구조화(After) 비교</span>
        <span class="card-badge orange">실물 확인</span>
      </div>

      <div class="ba-container">
        <div class="ba-tabs">
          <button class="ba-tab before active" data-tab="before">❌ 단순 복붙 (Before: 저품질 위험)</button>
          <button class="ba-tab after" data-tab="after">🔥 AI 티스토리 옮겨쓰기 (After: 구글 SEO 완벽)</button>
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

      <div class="cal tistory" style="margin:0">
        <b>💡 티스토리 옮겨쓰기 3대 핵심 규칙</b>
        ① <strong>소제목 H2/H3 구조화</strong> | ② <strong>서두 3줄 팩트 요약 박스</strong> | ③ <strong>문장 어투 패러프레이징</strong>
      </div>
    </div>

    <!-- 우측: 실습 프롬프트 & 맞춤 키워드 입력기 -->
    <div class="content-card highlight-tis">
      <div class="card-title-row">
        <span class="card-title">⚡ 티스토리 3분 스마트 옮겨쓰기 마스터 프롬프트</span>
        <span class="card-badge orange">실습 도구</span>
      </div>

      <div class="custom-inline-card">
        <div class="desc">
          <span>🔥 내 비즈니스:</span>
        </div>
        <div class="fields">
          <input type="text" id="blogTopic" placeholder="내 주제 (예: 중소기업 경영컨설팅)" value="중소기업 경영컨설팅">
          <input type="text" id="blogTarget" placeholder="타깃 독자 (예: 성장기 중소기업 대표)" value="성장기 중소기업 대표">
        </div>
      </div>

      <div class="prompt-box tistory-border">
        <div class="p-top">
          <span>티스토리 최적화 재가공 프롬프트</span>
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

<!-- ── 4. 스크립트 ── -->
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

print("Successfully updated public/02.html and public/session02.html with dense, non-empty design")
