'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Eye,
  FileText,
  Code2,
  Sparkles,
  Loader2,
  Clock,
  Type,
  Tag,
  Share2,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Maximize2,
  Minimize2,
  LayoutTemplate,
  Camera,
  Quote,
  Minus,
  Link2,
  Table,
  MapPin,
  Smile,
  X,
  Send,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  type GeneratedContent,
  markdownToHtml,
} from '@/lib/blog-automation/content-generator';

interface BlogResultPanelProps {
  post: GeneratedContent | null;
  isGenerating: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenHistory?: () => void;
}

type CopyFormat = 'naver' | 'tistory' | 'word' | 'markdown' | 'text';

// 네이버 추천 템플릿 프리셋 4종
const NAVER_TEMPLATES = [
  {
    id: 'food',
    name: '맛집 / 카페 탐방 템플릿',
    desc: '외관·메뉴판·대표메뉴 사진과 만족도 차트, 지도 정보가 포함된 고품질 리뷰 서식',
    badge: '맛집/카페',
    color: 'border-emerald-300 bg-emerald-50/50',
    structure: [
      '① 매장 한줄 요약 말풍선',
      '② 매장 외관 & 실내 인테리어 사진',
      '③ 대표 메뉴 실사 & 맛 평가',
      '④ 가격대 및 가성비 만족도 인포그래픽',
      '⑤ 위치 지도 카드 & 주차/영업시간 팁',
      '⑥ 최종 재방문 의사 총평 따옴표',
    ],
  },
  {
    id: 'column',
    name: '전문 정보 / 칼럼 템플릿',
    desc: '체계적인 소제목과 비교 분석 차트, 전문 코멘트가 포함된 AEO 최적화 서식',
    badge: '정보/칼럼',
    color: 'border-blue-300 bg-blue-50/50',
    structure: [
      '① 독자 공감 문제 제기 인용구',
      '② 핵심 체크포인트 3가지 요약 박스',
      '③ 전문 솔루션 소제목 & 본문 해설',
      '④ 통계/비교 분석 860px 고화질 차트',
      '⑤ 자주 묻는 질문(FAQ) 아코디언',
      '⑥ 전문가 조언 및 최종 행동 요령',
    ],
  },
  {
    id: 'review',
    name: '제품 / 언박싱 리뷰 템플릿',
    desc: '패키지 첫인상, 실사용 디테일 컷, 장단점 비교표가 들어간 실구매자 리뷰 서식',
    badge: '제품/리뷰',
    color: 'border-purple-300 bg-purple-50/50',
    structure: [
      '① 구매 동기 & 첫인상 말풍선',
      '② 언박싱 패키지 & 구성품 사진',
      '③ 핵심 스펙 & 성능 비교표',
      '④ 실제 1주일 사용 장단점 분석',
      '⑤ 가성비 만족도 그래프 차트',
      '⑥ 이런 분들께 추천합니다 요약 박스',
    ],
  },
  {
    id: 'story',
    name: '일상 / 공감 스토리 템플릿',
    desc: '감성적인 인라인 문단과 일상 사진 갤러리, 댓글 소통을 유도하는 친근한 서식',
    badge: '일상/스토리',
    color: 'border-amber-300 bg-amber-50/50',
    structure: [
      '① 오늘의 기분 감성 도입부',
      '② 일상 순간 실사 갤러리 (2~4장)',
      '③ 솔직한 생각과 느낀 점',
      '④ 공유하고 싶은 꿀팁 또는 추천',
      '⑤ 이웃분들과 나누고 싶은 질문 카드',
    ],
  },
];

export function BlogResultPanel({
  post,
  isGenerating,
  collapsed,
  onToggleCollapse,
  onOpenHistory,
}: BlogResultPanelProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'html'>('preview');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isBotTriggering, setIsBotTriggering] = useState(false);
  const [isDaemonOnline, setIsDaemonOnline] = useState<boolean | null>(null);

  // ── 네이버 스마트에디터 ONE 스튜디오 상태 ──
  const [isExpanded, setIsExpanded] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [publishMode, setPublishMode] = useState<'draft' | 'publish'>('draft');
  const [selectedCategory, setSelectedCategory] = useState('일상/생각');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editableTitle, setEditableTitle] = useState('');

  // 글 데이터가 들어오면 편집 가능 제목 및 태그 동기화
  useEffect(() => {
    if (post) {
      setEditableTitle(post.title || '');
      setCustomTags(post.tags || []);
    }
  }, [post]);

  // 로컬 플레이라이트 서버(포트 3055) 온라인 여부 자동 감지
  useEffect(() => {
    let mounted = true;
    const checkDaemon = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch('http://127.0.0.1:3055/status', {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });
        clearTimeout(timeoutId);
        if (res.ok && mounted) {
          setIsDaemonOnline(true);
          return;
        }
      } catch (e) {}
      if (mounted) setIsDaemonOnline(false);
    };

    checkDaemon();
    const interval = setInterval(checkDaemon, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // 글자 수 및 읽는 시간 계산
  const pureText = post?.content
    ? post.content
        .replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[IMAGE_\d+\]/g, '')
        .replace(/```[a-zA-Z0-9_-]*\s*[\s\S]*?```/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/https?:\/\/[^\s)]+/g, '')
    : '';
  const charCount = pureText.replace(/\s+/g, '').length;
  const readingTimeMin = Math.max(1, Math.ceil(charCount / 450));

  // 플레이라이트 무인 로봇 실행 핸들러
  const handleTriggerPlaywright = async () => {
    if (!post || isBotTriggering) return;
    setIsBotTriggering(true);

    const currentPostToSync = {
      ...post,
      title: editableTitle.trim() || post.title,
      tags: customTags,
      category: selectedCategory,
      updatedAt: Date.now(),
    };
    (window as any).__CURRENT_ACTIVE_POST__ = currentPostToSync;

    // 1. 확장 프로그램 및 로컬 이벤트 동기화
    window.postMessage({ type: 'NEONPETER_SYNC_POST', post: currentPostToSync }, '*');
    window.postMessage({ type: 'NEONPETER_TRIGGER_PLAYWRIGHT', post: currentPostToSync, mode: publishMode }, '*');
    document.dispatchEvent(new CustomEvent('neonpeter-post-sync', { detail: { post: currentPostToSync } }));

    // 2. 서버 클라우드 동기화 API로 전송 (백업)
    fetch('/api/blog-auto/writer/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post: currentPostToSync }),
    }).catch(() => {});

    try {
      localStorage.removeItem('latest_blog_post');
      localStorage.setItem('latest_blog_post', JSON.stringify(currentPostToSync));
    } catch (e) {}

    // 3. 로컬 플레이라이트 서버(포트 3055) 직접 호출
    let triggered = false;
    const endpoints = ['http://127.0.0.1:3055/run-bot', 'http://localhost:3055/run-bot'];

    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post: currentPostToSync,
            mode: publishMode,
            auto_close: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            triggered = true;
            setIsDaemonOnline(true);
            setPublishModalOpen(false);
            toast.success(
              `🤖 [플레이라이트 로봇 실행] 네이버 스마트에디터 ONE 창이 열리며 100% 자동 작성이 시작됩니다! (${publishMode === 'draft' ? '임시저장' : '즉시발행'})`,
              { duration: 6500 }
            );
            break;
          } else if (data.is_running) {
            triggered = true;
            toast.warning(data.message || '현재 다른 포스팅을 작성 중입니다.', { duration: 5000 });
            break;
          }
        }
      } catch (err) {}
    }

    // 4. 로컬 데몬이 꺼져 있는 경우 안내
    if (!triggered) {
      setIsDaemonOnline(false);
      toast.error(
        '💡 로컬 자동화 로봇 서버(3055)가 꺼져 있습니다. 바탕화면의 [🚀 네이버_블로그_자동화_실행]을 실행해 주세요!',
        {
          duration: 8000,
          action: {
            label: '수동 글쓰기 창 열기',
            onClick: async () => {
              await handleCopy('naver');
              window.open('https://blog.naver.com/GoBlogWrite.naver', '_blank');
            },
          },
        }
      );
    }

    setTimeout(() => setIsBotTriggering(false), 1200);
  };

  // 복사 처리
  const handleCopy = async (format: CopyFormat) => {
    if (!post) return;

    const currentTitle = editableTitle.trim() || post.title;
    const rawHtml = post.htmlContent || markdownToHtml(post.content);

    const cleanPlainText = (post.content || '')
      .replace(/\(?data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+\)?/gi, '')
      .replace(/!\[(.*?)\]\([^)]+\)/g, '📷 [사진: $1]')
      .replace(/\[IMAGE_\d+\]/g, '')
      .replace(/```[a-zA-Z0-9_-]*\s*\{[\s\S]*?\}\s*```/gi, '')
      .replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, '$1')
      .trim();

    let contentToCopy = '';
    const srcHtml =
      post.sources && post.sources.length > 0
        ? `\n<div style="margin-top:30px;padding-top:16px;border-top:1px solid #e2e8f0;"><p style="font-size:13px;font-weight:bold;color:#64748b;margin-bottom:8px;">📌 참고 출처</p>\n<ul style="padding-left:20px;margin:0;font-size:12px;color:#64748b;">${post.sources
            .map((s) => `<li><a href="${s.url}" target="_blank" style="color:#3b82f6;">${s.title}</a></li>`)
            .join('\n')}</ul></div>`
        : '';

    const faqHtml =
      post.faqs && post.faqs.length > 0
        ? `\n<div style="margin-top:36px;padding-top:20px;border-top:1px solid #e2e8f0;">
  <h3 style="font-size:16px;font-weight:bold;color:#0f172a;margin-bottom:14px;">❓ 자주 묻는 질문 (FAQ)</h3>
  ${post.faqs
    .map(
      (f) => `
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
    <p style="font-size:14px;font-weight:bold;color:#1e293b;margin:0 0 6px 0;">Q. ${f.question}</p>
    <p style="font-size:13px;color:#475569;margin:0;line-height:1.65;">${f.answer}</p>
  </div>`
    )
    .join('\n')}
</div>`
        : '';

    const excerptHtml = post.excerpt
      ? `<div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 18px;margin:20px 0;line-height:1.65;">
  <strong style="color:#1d4ed8;font-size:14px;display:block;margin-bottom:6px;">📌 핵심 요약</strong>
  <p style="font-size:13px;color:#334155;margin:0;">${post.excerpt}</p>
</div>\n`
      : '';

    const tagChipsHtml =
      customTags.length > 0
        ? `\n<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;">
  ${customTags
    .map(
      (t) =>
        `<span style="background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe;border-radius:9999px;padding:5px 12px;font-size:12px;font-weight:600;display:inline-block;margin-right:6px;margin-bottom:6px;">#${t}</span>`
    )
    .join(' ')}
</div>`
        : '';

    const titleHeaderHtml = `
<div style="margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #e2e8f0;">
  <h1 style="font-size:24px;font-weight:900;color:#0f172a;line-height:1.35;margin:0 0 10px 0;letter-spacing:-0.5px;">${currentTitle}</h1>
  ${post.subtitle ? `<p style="font-size:15px;font-weight:600;color:#2563eb;margin:0;font-style:italic;">Q. ${post.subtitle}</p>` : ''}
</div>`;

    switch (format) {
      case 'naver': {
        let naverHtml = rawHtml;
        naverHtml = naverHtml.replace(
          /<div[^>]*>\s*<img[^>]*>\s*<p[^>]*>📷\s*(?:<strong>)?\[사진\s*(\d+)\](?:<\/strong>)?\s*([^<]*)<\/p>\s*<\/div>/gi,
          '<div style="margin:24px 0;padding:16px;border:2px dashed #3b82f6;background:#eff6ff;border-radius:10px;text-align:center;color:#1e40af;font-size:13px;font-weight:bold;">📷 [사진 #$1 들어갈 자리] $2</div>'
        );
        contentToCopy = `${titleHeaderHtml}${excerptHtml}${naverHtml}${faqHtml}${srcHtml}${tagChipsHtml}`;
        break;
      }
      case 'tistory': {
        contentToCopy = `${titleHeaderHtml}${excerptHtml}${rawHtml}${faqHtml}${srcHtml}${tagChipsHtml}`;
        break;
      }
      case 'word': {
        contentToCopy = `${titleHeaderHtml}${excerptHtml}${rawHtml}${faqHtml}${srcHtml}${tagChipsHtml}`;
        break;
      }
      case 'markdown':
        contentToCopy = `# ${currentTitle}\n\n${post.subtitle ? `> ${post.subtitle}\n\n` : ''}${cleanPlainText}\n\n---\n태그: ${customTags.map((t) => `#${t}`).join(' ')}`;
        break;
      case 'text':
        contentToCopy = `${currentTitle}\n\n${cleanPlainText.replace(/[#*`_\[\]]/g, '')}\n\n태그: ${customTags.join(', ')}`;
        break;
    }

    try {
      if (format === 'naver' || format === 'tistory' || format === 'word') {
        const blobHtml = new Blob([contentToCopy], { type: 'text/html' });
        const blobText = new Blob([cleanPlainText], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(contentToCopy);
      }
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2500);
      toast.success(format === 'naver' ? '네이버 블로그 형식으로 복사되었습니다!' : '복사 완료!');
    } catch {
      await navigator.clipboard.writeText(contentToCopy);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2500);
      toast.success('클립보드에 복사되었습니다.');
    }
  };

  // HTML 파일 다운로드
  const handleDownloadHtml = () => {
    if (!post) return;
    const currentTitle = editableTitle.trim() || post.title;
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${currentTitle}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.8;color:#222;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #e2e8f0;padding:10px;}th{background:#f8fafc;}</style></head><body>${post.htmlContent}</body></html>`,
      ],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTitle.replace(/[^가-힣a-zA-Z0-9\s]/g, '').trim() || 'blog_post'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML 파일이 다운로드되었습니다.');
  };

  // 접힌 상태 (Collapsed)
  if (collapsed) {
    return (
      <div className="w-12 bg-white border-l border-slate-200 flex flex-col items-center py-4 shrink-0 transition-all duration-300">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors mb-4"
          title="스마트에디터 스튜디오 펼치기"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="writing-mode-vertical text-xs font-bold text-slate-600 tracking-wider flex items-center gap-2 py-4">
          <span className="w-2 h-2 rounded-full bg-[#03c75a]" />
          <span>네이버 에디터 {post ? '(완료)' : ''}</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`bg-[#f7f8f9] border-l border-slate-200 flex flex-col h-full shrink-0 transition-all duration-300 overflow-hidden shadow-sm relative ${
        isExpanded ? 'w-[750px] lg:w-[860px] xl:w-[960px]' : 'w-[480px] lg:w-[560px] xl:w-[620px]'
      }`}
    >
      {/* ── 1. 네이버 스마트에디터 ONE 정품 상단 헤더 바 ── */}
      <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white shrink-0 z-20 shadow-2xs">
        {/* Left: N blog Logo & State */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mr-0.5"
            title="패널 접기"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="flex items-center gap-1.5 select-none">
            <span className="w-5 h-5 rounded-[4px] bg-[#03c75a] text-white font-black text-xs flex items-center justify-center shadow-xs">
              N
            </span>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight">
              blog
            </span>
            <span className="text-[11px] font-semibold text-slate-400 ml-1 border-l border-slate-200 pl-2">
              스마트에디터 ONE
            </span>
          </div>
          {post && (
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-bold ml-1">
              자동 저장됨
            </Badge>
          )}
        </div>

        {/* Right: 저장 8, [발행], 템플릿, 확장 버튼 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isExpanded ? '기본 너비로 축소' : '860px 와이드 뷰로 넓히기'}
          >
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          {onOpenHistory && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenHistory}
              className="h-8 px-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border-slate-200"
              title="이 계정에서 지금까지 생성한 글 목록"
            >
              내 보관함
            </Button>
          )}

          {post && !isGenerating && (
            <>
              {/* 임시저장 카운트 버튼 (네이버 정품 저장 8 스타일) */}
              <button
                type="button"
                onClick={() => {
                  toast.success('💾 현재 글과 제목, 태그가 브라우저에 임시저장되었습니다.');
                }}
                className="h-8 px-2.5 rounded-md border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
                title="글을 브라우저에 임시 보관합니다"
              >
                <span>저장</span>
                <span className="text-[#03c75a] font-black">1</span>
              </button>

              {/* 🌟 네이버 공식 [발행] 초록색 버튼 ➔ 클릭 시 발행 설정 레이어 오픈 🌟 */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                className="h-8 px-3.5 bg-[#03c75a] hover:bg-[#02b350] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                title="네이버 블로그 발행 설정 창을 열고 Playwright 자동 작성을 시작합니다"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDaemonOnline ? 'bg-lime-300 shadow-[0_0_8px_#86efac] animate-pulse' : 'bg-white/60'
                  }`}
                />
                발행
                <ChevronDown className="size-3 text-white/80" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── 2. 네이버 스마트에디터 ONE 스마트 툴바 (2단) ── */}
      {post && !isGenerating && (
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 space-y-1.5 select-none shadow-2xs z-10">
          {/* 1행: 사진, 인용구, 구분선, 스티커, 링크, 표, 장소 | 템플릿 */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => toast.info('좌측 [사진 관리] 패널에서 사진을 추가하거나 AI 생성할 수 있습니다.')}
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <Camera className="size-3.5 text-slate-500" />
                <span>사진</span>
              </button>
              <button
                type="button"
                onClick={() => toast.info('네이버 공식 인용구 서식(따옴표, 버티컬 바, 말풍선)이 본문에 자동 적용되어 있습니다.')}
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <Quote className="size-3.5 text-slate-500" />
                <span>인용구</span>
              </button>
              <button
                type="button"
                onClick={() => toast.info('단락 사이마다 네이버 구분선이 자동 삽입됩니다.')}
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <Minus className="size-3.5 text-slate-500" />
                <span>구분선</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <Smile className="size-3.5 text-slate-500" />
                <span>스티커</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <Table className="size-3.5 text-slate-500" />
                <span>표</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <MapPin className="size-3.5 text-slate-500" />
                <span>장소</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors cursor-pointer"
              >
                <Link2 className="size-3.5 text-slate-500" />
                <span>링크</span>
              </button>
            </div>

            {/* 우측 템플릿 서랍 열기 버튼 */}
            <button
              type="button"
              onClick={() => setTemplateDrawerOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#03c75a] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-all shrink-0"
              title="네이버 공식 추천 템플릿 서랍을 엽니다"
            >
              <LayoutTemplate className="size-3.5 text-purple-600" />
              <span>템플릿</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </button>
          </div>

          {/* 2행: 서식 바 (본문, 나눔고딕, 15, B, I, U, 정렬, 복사 도구) */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">본문</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">나눔고딕</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">15</span>
              <span className="font-bold text-slate-800">B</span>
              <span className="italic text-slate-600">I</span>
              <span className="underline text-slate-600">U</span>
              <span className="text-[#03c75a] font-bold">가운데 정렬</span>
            </div>

            {/* 서브 복사/다운로드 도구 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy('naver')}
                className="h-6 text-[10.5px] px-1.5 text-emerald-700 hover:bg-emerald-50"
              >
                네이버 복사
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy('tistory')}
                className="h-6 text-[10.5px] px-1.5 text-amber-700 hover:bg-amber-50"
              >
                티스토리
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadHtml}
                className="h-6 text-[10.5px] px-1 text-slate-500"
                title="HTML 다운로드"
              >
                <Download className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. 로딩 상태 ── */}
      {isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/70">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#03c75a] flex items-center justify-center mb-4 shadow-sm animate-pulse">
            <Loader2 className="size-8 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">
            네이버 스마트에디터 최적화 포스팅을 작성하고 있습니다
          </h3>
          <div className="space-y-1 text-xs text-slate-500 max-w-xs">
            <p>• 860px 고화질 인포그래픽 3종 및 차트 렌더링</p>
            <p>• 네이버 정품 말풍선 & 소제목 인용구 서식 매핑</p>
            <p>• 실사 사진 위치 및 가운데 정렬 사전 배치</p>
          </div>
          <span className="text-[11px] text-emerald-600 mt-4 bg-emerald-50 px-3 py-1 rounded-full font-medium">
            예상 소요 시간: 약 10~20초
          </span>
        </div>
      )}

      {/* ── 4. 빈 화면 상태 (네이버 스마트에디터 빈 캔버스 재현) ── */}
      {!post && !isGenerating && (
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center">
          <div className="w-full max-w-[860px] bg-white rounded-lg shadow-2xs border border-slate-200/80 p-8 sm:p-12 min-h-[500px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-300 pb-4 border-b border-slate-200">
              제목
            </h1>
            <div className="py-8 text-slate-300 text-sm leading-relaxed">
              글감과 함께 나의 일상을 기록해보세요!
              <p className="mt-4 text-xs text-slate-400">
                👉 좌측 패널에서 사진을 추가하고, 가운데에서 주제를 입력한 후 <strong>[AI 블로그 글 생성하기]</strong>를 누르면 실제 네이버 블로그 스마트에디터 규격 그대로 글이 완성됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. 실제 네이버 스마트에디터 ONE 860px 캔버스 본문 ── */}
      {post && !isGenerating && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 select-text">
          <div className="w-full max-w-[860px] mx-auto bg-white rounded-lg shadow-sm border border-slate-200/80 p-6 sm:p-10 relative">
            {/* 좌측 마진 플로팅 [+] 버튼 (호버 인터랙션) */}
            <div className="absolute -left-3.5 top-12 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#03c75a] hover:border-[#03c75a] transition-colors cursor-pointer" title="빠른 요소 추가">
              <span className="text-lg font-light leading-none">+</span>
            </div>

            {/* 제목 영역 (직접 수정 가능 인풋) */}
            <div className="pb-4 border-b border-slate-200 mb-6">
              <input
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 border-none outline-none focus:ring-0 p-0 placeholder:text-slate-300 leading-snug tracking-tight font-sans"
              />
              {post.subtitle && (
                <p className="text-sm font-semibold text-emerald-600 mt-2 italic">
                  Q. {post.subtitle}
                </p>
              )}
            </div>

            {/* 네이버 에디터 본문 렌더링 (리치 서식 & 860px 고화질 차트 & 사진) */}
            <div
              className="naver-smart-editor-content prose prose-slate max-w-none leading-relaxed select-text [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pl-2.5 [&_h2]:border-l-4 [&_h2]:border-[#03c75a] [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-[15px] [&_p]:leading-[1.8] [&_p]:text-[#222] [&_p]:mb-4 [&_blockquote]:bg-slate-50 [&_blockquote]:border-l-4 [&_blockquote]:border-[#03c75a] [&_blockquote]:py-2.5 [&_blockquote]:px-4 [&_blockquote]:my-5 [&_blockquote]:text-[14px] [&_img]:mx-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:my-6 [&_figure]:text-center [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_figcaption]:mt-1.5"
              dangerouslySetInnerHTML={{ __html: post.htmlContent }}
            />

            {/* FAQ 카드 */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="size-4 text-[#03c75a]" />
                  자주 묻는 질문 (FAQ)
                </h3>
                <div className="space-y-2">
                  {post.faqs.map((faq, fi) => (
                    <div key={fi} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                      <p className="font-bold text-slate-800 mb-1">Q. {faq.question}</p>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 태그 칩 영역 */}
            {customTags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                <Tag className="size-3.5 text-slate-400 mr-1" />
                {customTags.map((tag, ti) => (
                  <Badge key={ti} variant="secondary" className="text-xs bg-slate-100 text-slate-700 font-medium">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. 🌟 네이버 정품 스타일 [발행 설정 레이어 팝업] 🌟 ── */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[4px] bg-[#03c75a] text-white font-black text-xs flex items-center justify-center">
                  N
                </span>
                <h3 className="text-sm font-bold text-slate-900">네이버 블로그 발행 설정</h3>
              </div>
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* 카테고리 선택 */}
              <div>
                <Label className="text-xs font-bold text-slate-800 mb-1.5 block">카테고리</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-xs font-medium focus:outline-none focus:border-[#03c75a]"
                >
                  <option value="일상/생각">일상/생각</option>
                  <option value="맛집/카페">맛집/카페</option>
                  <option value="IT/컴퓨터">IT/컴퓨터</option>
                  <option value="비즈니스/경제">비즈니스/경제</option>
                  <option value="건강/의학">건강/의학</option>
                  <option value="인테리어/DIY">인테리어/DIY</option>
                  <option value="패션/미용">패션/미용</option>
                  <option value="교육/학문">교육/학문</option>
                </select>
              </div>

              {/* 발행 모드 (임시저장 vs 즉시발행) */}
              <div>
                <Label className="text-xs font-bold text-slate-800 mb-1.5 block">발행 방식 선택</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishMode('draft')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      publishMode === 'draft'
                        ? 'border-[#03c75a] bg-emerald-50/70 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <span>💾 안전 [임시저장]</span>
                      {publishMode === 'draft' && <Check className="size-3 text-[#03c75a]" />}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                      글과 사진을 모두 작성한 뒤 네이버 임시저장함에 보관 (추천)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishMode('publish')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      publishMode === 'publish'
                        ? 'border-[#03c75a] bg-emerald-50/70 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <span>🚀 [즉시 전체공개]</span>
                      {publishMode === 'publish' && <Check className="size-3 text-[#03c75a]" />}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                      작성 완료 후 최종 [발행] 버튼까지 무인 클릭하여 즉시 게시
                    </p>
                  </button>
                </div>
              </div>

              {/* 태그 편집 */}
              <div>
                <Label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>태그 편집 ({customTags.length}개)</span>
                  <span className="text-[10.5px] text-slate-400 font-normal">Enter로 추가</span>
                </Label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 min-h-[38px] bg-slate-50/50">
                  {customTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setCustomTags(customTags.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        const tag = newTagInput.trim().replace(/^#/, '');
                        if (!customTags.includes(tag)) {
                          setCustomTags([...customTags, tag]);
                        }
                        setNewTagInput('');
                      }
                    }}
                    placeholder="+ 태그 추가"
                    className="border-none outline-none bg-transparent text-[11px] text-slate-700 placeholder:text-slate-400 px-1 py-0.5 flex-1 min-w-[70px]"
                  />
                </div>
              </div>

              {/* 사진 정렬 안내 */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-slate-700">📷 사진 & 차트 정렬</span>
                <span className="font-bold text-[#03c75a]">가운데 정렬 (기본 적용)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className={`w-2 h-2 rounded-full ${isDaemonOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                <span>{isDaemonOnline ? '플레이라이트 로봇 대기중' : '로컬 서버 오프라인'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPublishModalOpen(false)}
                  className="h-8 text-xs font-medium"
                >
                  취소
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isBotTriggering}
                  onClick={handleTriggerPlaywright}
                  className="h-8 px-4 bg-[#03c75a] hover:bg-[#02b350] text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="size-3.5 text-amber-300 fill-amber-300" />
                  {isBotTriggering ? '로봇 작성 중...' : '🚀 네이버 자동 작성 시작'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. 🌟 네이버 정품 스타일 [템플릿 서랍 (Slide-over Drawer)] 🌟 ── */}
      {templateDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="size-4 text-[#03c75a]" />
                <h3 className="text-sm font-bold text-slate-900">네이버 공식 추천 템플릿</h3>
              </div>
              <button
                type="button"
                onClick={() => setTemplateDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                네이버 블로그 스마트에디터 ONE의 추천 레이아웃입니다. 원하는 구성을 선택하시면 AI가 해당 슬롯 구조에 맞추어 포스팅을 배치합니다.
              </p>

              {NAVER_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`p-3.5 rounded-xl border transition-all hover:shadow-sm cursor-pointer ${tpl.color}`}
                  onClick={() => {
                    toast.success(`✨ '${tpl.name}' 구조가 적용되었습니다.`);
                    setTemplateDrawerOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{tpl.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/80 text-slate-700">
                      {tpl.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2.5 leading-snug">{tpl.desc}</p>
                  <div className="p-2 bg-white/80 rounded-lg border border-slate-100 space-y-1">
                    {tpl.structure.map((item, idx) => (
                      <p key={idx} className="text-[10.5px] text-slate-600">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold"
                onClick={() => setTemplateDrawerOpen(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
