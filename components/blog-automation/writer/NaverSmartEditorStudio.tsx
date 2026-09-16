'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Camera,
  Quote,
  Minus,
  Smile,
  Table,
  MapPin,
  Link2,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
  Globe,
  Tag,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  BookOpen,
  Target,
  FileCode,
  PenLine,
  HelpCircle,
  Monitor,
  Smartphone,
  X,
  Send,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  BLOG_SKILLS,
  CORE_BLOG_SKILLS,
  getSkillById,
  type BlogSkillId,
  type BlogSkill,
  type BlogPlatform,
} from '@/lib/blog-automation/blog-skills';
import { OneToOneMeetingPanel } from './OneToOneMeetingPanel';
import type { BlogCopyFormula, BlogTone } from '@/lib/blog-automation/types';
import type { BlogProfile } from '@/lib/blog-automation/profile-storage';
import {
  type GeneratedContent,
  markdownToHtml,
} from '@/lib/blog-automation/content-generator';
import type { UploadedPhoto } from './PhotoUploadPanel';

export interface NaverSmartEditorStudioProps {
  // 템플릿 파라미터 상태
  skillId: BlogSkillId;
  onSkillChange: (skillId: BlogSkillId) => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  platform: BlogPlatform;
  onPlatformChange: (platform: BlogPlatform) => void;
  targetAudience: string;
  onTargetAudienceChange: (audience: string) => void;
  copyFormula: BlogCopyFormula;
  onCopyFormulaChange: (formula: BlogCopyFormula) => void;
  tone: BlogTone;
  onToneChange: (tone: BlogTone) => void;
  requiredKeywords: string;
  onRequiredKeywordsChange: (keywords: string) => void;
  customFields: Record<string, string>;
  onCustomFieldsChange: (fields: Record<string, string>) => void;
  customInstructions: string;
  onCustomInstructionsChange: (instructions: string) => void;

  // 생성 및 결과 상태
  post: GeneratedContent | null;
  onPostChange?: (post: GeneratedContent) => void;
  isGenerating: boolean;
  onGenerate: () => void;

  // 사진 및 보조
  photos: UploadedPhoto[];
  photosCount: number;
  onOpenAutoPilot?: () => void;
  onOpenHistory?: () => void;

  // 프로필 및 드라이브
  currentProfile?: BlogProfile | null;
  allProfiles?: BlogProfile[];
  onSwitchProfile?: (profile: BlogProfile) => void;
  onGoToDrive?: () => void;
  onSaveAsProfileTemplate?: () => void;
}

const TONE_OPTIONS: { value: BlogTone; label: string; emoji: string }[] = [
  { value: 'friendly', label: '친근한 (~해요, 이모지)', emoji: '😊' },
  { value: 'professional', label: '전문적 (정중한 경어, 신뢰)', emoji: '👔' },
  { value: 'casual', label: '캐주얼 (편안한 대화체)', emoji: '✌️' },
  { value: 'informative', label: '정보형 (구조적 핵심 요약)', emoji: '📖' },
  { value: 'persuasive', label: '설득형 (공감 유도, 강한 CTA)', emoji: '💡' },
];

const COPY_FORMULA_OPTIONS: { value: BlogCopyFormula; label: string; desc: string }[] = [
  { value: 'auto', label: '자동 (추천)', desc: '유형 기본 공식 적용' },
  { value: 'PAS', label: 'PAS 공식', desc: '문제 → 자극 → 해결' },
  { value: 'AIDA', label: 'AIDA 공식', desc: '주의 → 관심 → 욕구 → 행동' },
  { value: 'BAB', label: 'BAB 공식', desc: '이전 → 이후 → 연결' },
  { value: 'FAB', label: 'FAB 공식', desc: '기능 → 장점 → 혜택' },
];

const AUDIENCE_PRESETS = [
  '20대 직장인',
  '30대 자기개발러',
  '수출입/무역 실무자',
  '해외직구/셀러',
  '외화 투자자/재테크',
  '자영업/소상공인',
  '대학생/취준생',
  '육아맘/학부모',
  'MZ세대',
  '시니어/은퇴자',
];

export function NaverSmartEditorStudio({
  skillId,
  onSkillChange,
  topic,
  onTopicChange,
  platform,
  onPlatformChange,
  targetAudience,
  onTargetAudienceChange,
  copyFormula,
  onCopyFormulaChange,
  tone,
  onToneChange,
  requiredKeywords,
  onRequiredKeywordsChange,
  customFields,
  onCustomFieldsChange,
  customInstructions,
  onCustomInstructionsChange,
  post,
  onPostChange,
  isGenerating,
  onGenerate,
  photos,
  photosCount,
  onOpenAutoPilot,
  onOpenHistory,
  currentProfile,
  allProfiles,
  onSwitchProfile,
  onGoToDrive,
  onSaveAsProfileTemplate,
}: NaverSmartEditorStudioProps) {
  // ── UI 인터랙션 상태 ──
  const [isTemplateDrawerOpen, setTemplateDrawerOpen] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [viewDevice, setViewDevice] = useState<'pc' | 'mobile'>('pc');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // ── 발행 설정 모달 상태 ──
  const [targetCategory, setTargetCategory] = useState('사주/운세');
  const [publishActionType, setPublishActionType] = useState<'draft' | 'publish'>('draft');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isTriggeringBot, setIsTriggeringBot] = useState(false);
  const [isDaemonOnline, setIsDaemonOnline] = useState(false);
  const [botMessage, setBotMessage] = useState<string | null>(null);

  // ── 환율 자동조회 로딩 상태 ──
  const [isFetchingExchange, setIsFetchingExchange] = useState(false);

  const currentSkill = useMemo(() => getSkillById(skillId), [skillId]);

  // 글이나 스킬 변경 시 기본 카테고리 및 태그 동기화
  useEffect(() => {
    if (skillId === 'saju') setTargetCategory('사주/운세');
    else if (skillId === 'restaurant') setTargetCategory('맛집/카페');
    else if (skillId === 'beauty') setTargetCategory('뷰티/미용');
    else if (skillId === 'exchange') setTargetCategory('비즈니스/경제');
    else if (skillId === 'itservice') setTargetCategory('IT/컴퓨터');
    else setTargetCategory('일상/생각');
  }, [skillId]);

  useEffect(() => {
    if (post?.tags && post.tags.length > 0) {
      setTagsList(post.tags);
    } else if (requiredKeywords) {
      const parsed = requiredKeywords
        .split(/[,#\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      setTagsList(parsed);
    }
  }, [post, requiredKeywords]);

  // ── 크롬 확장 프로그램 및 서버 실시간 동기화 핸들러 ──
  const [isSyncing, setIsSyncing] = useState(false);

  const syncPostToExtensionAndServer = async (silent = false) => {
    const postToSync = post
      ? {
          ...post,
          title: topic.trim() || post.title,
          tags: tagsList,
          images: photos.map((p) => ({
            name: p.name,
            url: p.url,
            caption: p.caption,
            description: p.description,
          })),
          updatedAt: Date.now(),
        }
      : {
          title: topic.trim(),
          content: '',
          htmlContent: '',
          tags: tagsList,
          images: photos.map((p) => ({
            name: p.name,
            url: p.url,
            caption: p.caption,
            description: p.description,
          })),
          updatedAt: Date.now(),
        };

    if (!postToSync.title && !postToSync.content) {
      if (!silent) toast.error('동기화할 글 제목이나 내용이 없습니다.');
      return;
    }

    setIsSyncing(true);

    try {
      // 1. 브라우저 글로벌 및 LocalStorage 저장
      (window as any).__CURRENT_ACTIVE_POST__ = postToSync;
      try {
        localStorage.setItem('latest_blog_post', JSON.stringify(postToSync));
        localStorage.setItem('latest_blog_photos', JSON.stringify(postToSync.images || []));
        localStorage.setItem('latest_blog_title', postToSync.title);
      } catch (e) {}

      // 2. 크롬 확장 프로그램 content.js로 postMessage 및 CustomEvent 전달
      window.postMessage({ type: 'NEONPETER_SYNC_POST', post: postToSync }, '*');
      document.dispatchEvent(new CustomEvent('neonpeter-post-sync', { detail: { post: postToSync } }));

      // 3. 서버 클라우드 sync API로 지속성 저장 (CORS & Firestore 보관)
      await fetch('/api/blog-auto/writer/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: postToSync }),
      });

      if (!silent) {
        toast.success('⚡ 크롬 확장 프로그램 및 서버에 최신 글 데이터가 완벽 동기화되었습니다!');
      }
    } catch (err: any) {
      if (!silent) {
        toast.error('동기화 중 오류: ' + err.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // post 데이터가 변경될 때마다 크롬 확장에 자동 백그라운드 동기화
  useEffect(() => {
    if (post) {
      syncPostToExtensionAndServer(true);
    }
  }, [post]);

  // 로컬 데몬 서버(3055) 상태 체크
  useEffect(() => {
    const checkDaemon = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3055/status');
        const data = await res.json();
        setIsDaemonOnline(data.status === 'online');
      } catch (e) {
        setIsDaemonOnline(false);
      }
    };
    checkDaemon();
    const timer = setInterval(checkDaemon, 8000);
    return () => clearInterval(timer);
  }, []);

  // 환율 자동조회 핸들러
  const handleAutoFetchExchange = async () => {
    setIsFetchingExchange(true);
    try {
      const res = await fetch('/api/blog-auto/writer/fetch-exchange-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOrTopic: topic || customFields.period || '최근 이번 주',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        onCustomFieldsChange({
          ...customFields,
          period: json.data.period || customFields.period || '',
          exchangeRates: json.data.exchangeRates || '',
          globalIssues: json.data.globalIssues || '',
        });
        toast.success('✨ AI가 실시간 관세청 고시환율 및 최신 세계정세를 성공적으로 불러왔습니다!');
      } else {
        toast.error('환율 정보를 불러오지 못했습니다. 직접 입력하거나 비워두시면 AI가 생성 시 직접 탐색합니다.');
      }
    } catch (e: any) {
      toast.error('환율 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingExchange(false);
    }
  };

  const handlePresetClick = (preset: string) => {
    if (!targetAudience) {
      onTargetAudienceChange(preset);
    } else if (!targetAudience.includes(preset)) {
      onTargetAudienceChange(`${targetAudience}, ${preset}`);
    }
  };

  // Playwright 봇 자동 실행 핸들러
  const handleExecutePlaywrightBot = async () => {
    const activePost = post || {
      title: topic,
      content: '',
      htmlContent: '',
      tags: tagsList,
    };

    if (!activePost.title?.trim()) {
      toast.error('발행할 블로그 제목 또는 주제를 입력해주세요.');
      return;
    }

    setIsTriggeringBot(true);
    setBotMessage('🤖 로컬 Playwright 자동화 봇에 작업을 전달하는 중...');

    try {
      const payload = {
        action: publishActionType,
        category: targetCategory,
        post: {
          title: activePost.title,
          content: activePost.content || '',
          htmlContent: (activePost as any).htmlContent || (activePost.content ? markdownToHtml(activePost.content) : ''),
          tags: tagsList,
          images: photos.map((p) => ({
            name: p.name,
            url: p.url,
            caption: p.caption,
            description: p.description,
          })),
        },
      };

      const res = await fetch('http://127.0.0.1:3055/run-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          publishActionType === 'publish'
            ? '🚀 [Playwright] 네이버 블로그 즉시 발행이 시작되었습니다! 크롬 화면을 확인하세요.'
            : '💾 [Playwright] 네이버 블로그 안전 임시저장이 시작되었습니다!'
        );
        setBotMessage(data.message || '네이버 스마트에디터 ONE 자동 작성 진행 중...');
        setTimeout(() => setPublishModalOpen(false), 2000);
      } else {
        throw new Error(data.error || 'Playwright 봇 구동 요청 실패');
      }
    } catch (err: any) {
      console.warn('Playwright 데몬 연결 불가, 백업 동기화 수행:', err.message);
      setBotMessage('로컬 봇 연결 실패: 데몬(port 3055)이 실행 중인지 확인하세요.');
      toast.error('로컬 데몬 서버(3055)가 오프라인입니다. 터미널에서 server.py를 가동해주세요.');
    } finally {
      setIsTriggeringBot(false);
    }
  };

  // 복사 핸들러
  const handleCopy = async (format: 'naver' | 'text') => {
    if (!post) {
      toast.error('복사할 생성된 글이 없습니다.');
      return;
    }
    try {
      if (format === 'naver') {
        const html = post.htmlContent || markdownToHtml(post.content);
        const blob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([post.content], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob,
          }),
        ]);
        toast.success('📋 네이버 스마트에디터 ONE 서식 그대로 복사되었습니다!');
      } else {
        await navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
        toast.success('📋 텍스트가 클립보드에 복사되었습니다.');
      }
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (e) {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="flex-1 bg-[#f4f4f4] flex flex-col h-full overflow-hidden select-none font-sans relative">
      {/* ═════════════════════════════════════════════════════════════════════
          1. 최상단 네이버 블로그 헤더 (N blog + 저장 + 발행)
      ═════════════════════════════════════════════════════════════════════ */}
      <header className="h-[52px] bg-white border-b border-[#e5e7eb] px-3 sm:px-5 flex items-center justify-between shrink-0 z-30 shadow-2xs gap-2 overflow-x-auto no-scrollbar">
        {/* 좌측: N blog 공식 로고 & 워크스페이스/프로필 스위처 */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink">
          <div className="flex items-center gap-1.5 cursor-pointer select-none shrink-0 whitespace-nowrap" onClick={onGoToDrive}>
            <div className="w-6 h-6 rounded bg-[#03c75a] flex items-center justify-center text-white font-black text-xs shadow-xs tracking-tighter">
              N
            </div>
            <span className="font-extrabold text-[#191919] text-base tracking-tight">blog</span>
            <span className="ml-1 text-[11px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50 whitespace-nowrap">
              AI 스튜디오
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

          {/* 프로필 선택기 */}
          {allProfiles && allProfiles.length > 0 ? (
            <div className="relative group shrink min-w-0">
              <select
                value={currentProfile?.id || ''}
                onChange={(e) => {
                  const p = allProfiles.find((x) => x.id === e.target.value);
                  if (p && onSwitchProfile) onSwitchProfile(p);
                }}
                className="h-7 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2 pr-6 appearance-none cursor-pointer focus:outline-hidden max-w-[180px] sm:max-w-[240px] truncate"
              >
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.clientName ? `(${p.clientName})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1 shrink-0 whitespace-nowrap">
              <span>🥐 사주블로그</span>
              <span className="text-slate-400">(담당: 이석호)</span>
            </span>
          )}

          {onGoToDrive && (
            <button
              type="button"
              onClick={onGoToDrive}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors ml-1 font-medium shrink-0 whitespace-nowrap"
              title="드라이브 허브로 이동"
            >
              <span>📂</span>
              <span>드라이브 허브</span>
            </button>
          )}
        </div>

        {/* 우측: AI 글 생성 버튼, 오토파일럿, 저장 카운터, 녹색 [발행 ▾] 버튼 */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
          {/* AI 생성 버튼 */}
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isGenerating || !topic.trim()}
            onClick={onGenerate}
            className="h-8 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>AI가 글 작성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>AI 블로그 글 생성</span>
              </>
            )}
          </Button>

          {onOpenAutoPilot && (
            <button
              type="button"
              onClick={onOpenAutoPilot}
              className="h-8 px-2.5 rounded-md border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-xs font-bold text-purple-700 flex items-center gap-1 transition-all shrink-0 whitespace-nowrap"
              title="오토파일럿 대량 자동 생성"
            >
              <Zap className="size-3 text-purple-600" />
              <span className="hidden sm:inline">오토파일럿</span>
            </button>
          )}

          {/* 크롬 확장 프로그램 수동 동기화 버튼 */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => syncPostToExtensionAndServer(false)}
            className="h-8 px-2.5 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs shrink-0 whitespace-nowrap"
            title="크롬 확장 프로그램과 서버로 현재 글을 즉시 동기화합니다"
          >
            <RefreshCw className={`size-3 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>동기화</span>
          </button>

          {/* 저장 카운터 버튼 */}
          <button
            type="button"
            onClick={() => {
              if (onOpenHistory) onOpenHistory();
              else toast.success('💾 현재 작성 중인 글이 브라우저에 임시저장되었습니다.');
            }}
            className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap"
            title="임시저장 및 보관함"
          >
            <span>저장</span>
            <span className="text-[#03c75a] font-black">{post ? '1' : '0'}</span>
          </button>

          {/* 네이버 공식 초록색 [발행 ▾] 버튼 ➔ 클릭 시 발행 설정 레이어 팝업 */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setPublishModalOpen(true)}
            className="h-8 px-4 bg-[#03c75a] hover:bg-[#02b350] text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap"
            title="네이버 블로그 발행 설정 및 Playwright 자동 작성 시작"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDaemonOnline ? 'bg-lime-300 shadow-[0_0_8px_#86efac] animate-pulse' : 'bg-white/60'
              }`}
            />
            <span>발행</span>
            <ChevronDown className="size-3 text-white/90" />
          </Button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════
          2. 스마트에디터 ONE 2단 툴바 (이미지 2 툴바 100% 반영)
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-[#e5e7eb] px-3 sm:px-5 py-1.5 shrink-0 select-none shadow-2xs z-20 space-y-1 overflow-x-auto no-scrollbar">
        {/* 툴바 1행: 사진, MYBOX, 동영상, 스티커, 인용구, 구분선, 링크, 파일, 일정, 표, 장소 | 내 글감, 라이브러리, [템플릿] */}
        <div className="flex items-center justify-between text-xs text-slate-600 gap-3 min-w-max">
          <div className="flex items-center gap-3.5 py-0.5 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => toast.info('좌측 [사진 관리] 패널에서 사진을 업로드하거나 AI 생성할 수 있습니다.')}
              className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors shrink-0 whitespace-nowrap break-keep"
            >
              <Camera className="size-3.5 text-slate-500" />
              <span>사진</span>
              {photosCount > 0 && (
                <span className="text-[10px] font-bold bg-emerald-100 text-[#03c75a] px-1 rounded-full">
                  {photosCount}
                </span>
              )}
            </button>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">MYBOX</span>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">동영상</span>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">스티커</span>
            <button
              type="button"
              onClick={() => toast.info('네이버 공식 인용구 서식(따옴표, 말풍선, 버티컬 바)이 본문에 자동 적용됩니다.')}
              className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors shrink-0 whitespace-nowrap break-keep"
            >
              <Quote className="size-3.5 text-slate-500" />
              <span>인용구</span>
            </button>
            <button
              type="button"
              onClick={() => toast.info('문단 사이마다 네이버 표준 구분선이 자동 삽입됩니다.')}
              className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors shrink-0 whitespace-nowrap break-keep"
            >
              <Minus className="size-3.5 text-slate-500" />
              <span>구분선</span>
            </button>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">링크</span>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">파일</span>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">일정</span>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">소스코드</span>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors shrink-0 whitespace-nowrap break-keep"
            >
              <Table className="size-3.5 text-slate-500" />
              <span>표</span>
            </button>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">수식</span>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#03c75a] font-medium transition-colors shrink-0 whitespace-nowrap break-keep"
            >
              <MapPin className="size-3.5 text-slate-500" />
              <span>장소</span>
            </button>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">내돈내산</span>
            <span className="hover:text-[#03c75a] cursor-pointer shrink-0 whitespace-nowrap break-keep">글감</span>
          </div>

          {/* 우측 도구: 내 글감, 라이브러리, [템플릿] 서랍 토글 */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <span className="hover:text-[#03c75a] cursor-pointer text-[11px] text-slate-500 hidden md:inline shrink-0 whitespace-nowrap break-keep">
              내 글감
            </span>
            <span className="hover:text-[#03c75a] cursor-pointer text-[11px] text-slate-500 hidden md:inline shrink-0 whitespace-nowrap break-keep">
              라이브러리
            </span>

            {/* 🌟 템플릿 서랍 열기/닫기 토글 버튼 🌟 */}
            <button
              type="button"
              onClick={() => setTemplateDrawerOpen(!isTemplateDrawerOpen)}
              className={`flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-md border transition-all shrink-0 whitespace-nowrap ${
                isTemplateDrawerOpen
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:text-purple-600'
              }`}
              title="네이버 템플릿 설정 서랍을 열고 닫습니다"
            >
              <LayoutTemplate className="size-3.5 shrink-0" />
              <span>템플릿 ({currentSkill?.id === 'one_to_one' ? '원투원' : currentSkill?.name || '5종'})</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            </button>
          </div>
        </div>

        {/* 툴바 2행: 서식 컨트롤 (본문, 나눔고딕, 15, 볼드, 이탤릭, 정렬, 맞춤법) */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-1 text-[11px] text-slate-500 gap-2 min-w-max">
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700 shrink-0 whitespace-nowrap">본문 ▾</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700 shrink-0 whitespace-nowrap">나눔고딕 ▾</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700 shrink-0 whitespace-nowrap">15 ▾</span>
            <div className="h-3 w-px bg-slate-200 shrink-0" />
            <span className="font-bold text-slate-800 cursor-pointer px-1 shrink-0">B</span>
            <span className="italic text-slate-600 cursor-pointer px-1 shrink-0">I</span>
            <span className="underline text-slate-600 cursor-pointer px-1 shrink-0">U</span>
            <span className="line-through text-slate-600 cursor-pointer px-1 shrink-0">T</span>
            <div className="h-3 w-px bg-slate-200 shrink-0" />
            <span className="text-[#03c75a] font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap">
              <span>가운데 정렬</span>
            </span>
            <span className="text-slate-400 hidden lg:inline shrink-0 whitespace-nowrap">| 줄간격 180% | 맞춤법 검사</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy('naver')}
              className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 px-1.5 py-0.5 rounded transition-colors"
            >
              {copiedFormat === 'naver' ? '✓ 복사됨' : '네이버 복사'}
            </button>
            <button
              type="button"
              onClick={() => handleCopy('text')}
              className="text-[11px] font-medium text-slate-500 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
            >
              텍스트 복사
            </button>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          3. 메인 작업 영역: 860px 중앙 캔버스 + 우측 [템플릿] 서랍 (Slide-over)
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── 중앙 스마트에디터 화이트 캔버스 ── */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 flex justify-center custom-scrollbar">
          <div
            className={`w-full bg-white rounded-lg shadow-sm border border-[#e5e7eb] min-h-[900px] flex flex-col p-5 sm:p-8 md:p-10 relative transition-all ${
              viewDevice === 'mobile' ? 'max-w-[420px]' : 'max-w-[880px]'
            }`}
          >
            {/* 캔버스 우상단 커버/레이아웃 아이콘 */}
            <div className="flex items-center justify-end gap-2 text-slate-400 mb-4">
              <button
                type="button"
                onClick={() => toast.info('대표 이미지(커버)는 좌측 사진 관리 패널에서 첫 번째 사진으로 자동 지정됩니다.')}
                className="hover:text-slate-600 transition-colors p-1"
                title="커버 이미지 설정"
              >
                <Camera className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => toast.info('네이버 스마트에디터 ONE 표준 레이아웃입니다.')}
                className="hover:text-slate-600 transition-colors p-1"
                title="레이아웃 설정"
              >
                <Sliders className="size-4" />
              </button>
            </div>

            {/* ── 캔버스 제목 입력란 ── */}
            <div className="relative mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTemplateDrawerOpen(true)}
                  className="w-8 h-8 shrink-0 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-400 hover:text-[#03c75a] flex items-center justify-center transition-all shadow-2xs hover:scale-105"
                  title="템플릿 설정 서랍 열기"
                >
                  <Plus className="size-4" />
                </button>
                <input
                  id="real-blog-generated-title"
                  data-testid="rendered-blog-title"
                  type="text"
                  value={topic}
                  onChange={(e) => onTopicChange(e.target.value)}
                  placeholder="제목을 입력하세요 (블로그 주제 및 메인 키워드)"
                  className="real-blog-title-text flex-1 text-2xl md:text-3xl font-extrabold text-[#191919] placeholder:text-[#b8b8b8] border-none outline-hidden focus:outline-hidden bg-transparent leading-tight tracking-tight pr-2"
                />
              </div>
              <span id="real-blog-title-hidden" data-testid="rendered-blog-title" className="sr-only">
                {topic}
              </span>
              <div className="w-full h-px bg-[#e5e7eb] mt-5" />
            </div>

            {/* ── 캔버스 본문 영역 (생성된 글 OR 템플릿 가이드 스켈레톤) ── */}
            <div className="flex-1 text-[#222222] text-[16px] leading-[1.8] space-y-6">
              {isGenerating ? (
                /* 로딩 상태 */
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-[#03c75a] animate-spin" />
                    <Sparkles className="size-6 text-[#03c75a] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      네이버 스마트에디터 ONE 맞춤형 글을 작성하고 있습니다...
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      15종 스킬 공식({currentSkill?.copywritingFormula || 'PAS'})과 감성 말풍선, 중앙 정렬 사진 배치 최적화 중
                    </p>
                  </div>
                </div>
              ) : post ? (
                /* 🌟 글 생성 완료 상태: 네이버 서식 본문 렌더링 🌟 */
                <div className="space-y-6">
                  {/* 상단 네이버 공식 인용구 / 핵심 도입부 */}
                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center my-4">
                    <div className="text-[#03c75a] text-xl font-serif leading-none mb-2">“</div>
                    <p className="text-[16px] font-semibold text-emerald-950 leading-relaxed">
                      {post.excerpt || post.subtitle || `${topic}에 대한 솔직하고 체계적인 이야기!`}
                    </p>
                    <div className="text-[#03c75a] text-xl font-serif leading-none mt-2">”</div>
                  </div>

                  {/* 본문 사진 (중앙 정렬) */}
                  {photos.length > 0 && (
                    <div className="my-6 flex flex-col items-center text-center">
                      <div className="max-w-[680px] w-full rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                        <img
                          src={photos[0].url}
                          alt={photos[0].name || '블로그 본문 대표 이미지'}
                          className="w-full h-auto max-h-[460px] object-cover mx-auto"
                        />
                      </div>
                      <span className="text-xs text-slate-500 mt-2 font-medium">
                        ▲ {photos[0].caption || photos[0].name || '사진 1'}
                      </span>
                    </div>
                  )}

                  {/* 본문 마크다운/HTML 변환 렌더링 */}
                  <div
                    id="real-blog-generated-body"
                    data-testid="rendered-blog-body"
                    className="blog-preview-content prose prose-slate max-w-none text-[16px] leading-[1.8] font-sans
                      [&>h2]:text-xl [&>h2]:font-extrabold [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:pb-2 [&>h2]:border-b [&>h2]:border-slate-100
                      [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-800 [&>h3]:mt-6 [&>h3]:mb-2
                      [&>p]:text-[#333333] [&>p]:mb-4
                      [&>blockquote]:border-l-4 [&>blockquote]:border-[#03c75a] [&>blockquote]:bg-slate-50 [&>blockquote]:p-4 [&>blockquote]:rounded-r-lg [&>blockquote]:my-5 [&>blockquote]:not-italic [&>blockquote]:text-slate-800
                      [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-4
                      [&>table]:w-full [&>table]:border [&>table]:border-slate-200 [&>table]:my-6
                    "
                    dangerouslySetInnerHTML={{
                      __html: post.htmlContent || markdownToHtml(post.content),
                    }}
                  />

                  {/* 하단 태그 클라우드 */}
                  {tagsList.length > 0 && (
                    <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Tag className="size-3 text-[#03c75a]" />
                        <span>태그:</span>
                      </span>
                      {tagsList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* 🌟 글 생성 전 (초기 상태): 네이버 스마트에디터 스켈레톤 & 템플릿 안내 🌟 */
                <div className="py-6 space-y-8">
                  {/* 상단 템플릿 안내 배너 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      <LayoutTemplate className="size-3" />
                      현재 선택된 템플릿: {currentSkill?.name || '사주/운세'} ({currentSkill?.copywritingFormula || 'PAS'} 공식)
                    </span>
                    <p className="text-xs text-slate-500">
                      상단 제목란에 주제를 입력하고 우측 <strong>[템플릿 설정 서랍]</strong>에서 세부 옵션을 조정한 뒤,{' '}
                      <br />
                      <strong>[✨ AI 블로그 글 생성]</strong> 버튼을 누르면 아래 네이버 구조에 맞춰 본문이 자동으로 채워집니다.
                    </p>
                  </div>

                  {/* 네이버 스마트에디터 구조 스켈레톤 (이미지 2의 구조 미리보기) */}
                  <div className="space-y-6 opacity-75 pointer-events-none select-none">
                    {/* ① 도입 인용구 스켈레톤 */}
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center">
                      <p className="text-sm font-semibold text-emerald-800">
                        “ {topic ? `[${topic}] 핵심 한줄 요약 & 독자 공감 도입부` : '독자의 이목을 사로잡는 핵심 인용구 말풍선'} ”
                      </p>
                    </div>

                    {/* ② 사진 첨부 영역 스켈레톤 */}
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                      <Camera className="size-8 text-slate-300 mb-2" />
                      <span className="text-xs font-bold text-slate-500">
                        {photosCount > 0
                          ? `업로드된 ${photosCount}장의 사진이 본문 각 단락에 중앙 정렬로 자동 배치됩니다.`
                          : '좌측 [사진 관리] 패널에 사진을 추가하면 본문에 자동 삽입됩니다.'}
                      </span>
                    </div>

                    {/* ③ 15종 스킬별 구조 섹션 스켈레톤 */}
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-full" />
                        <div className="h-3 bg-slate-100 rounded w-5/6" />
                        <div className="h-3 bg-slate-100 rounded w-4/6" />
                      </div>
                    </div>

                    {/* ④ 네이버 구분선 */}
                    <div className="w-16 h-0.5 bg-slate-300 mx-auto my-6" />

                    {/* ⑤ 결론 및 방문 팁 스켈레톤 */}
                    <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">💡 전문가 조언 / 방문 꿀팁 / 요약 박스</span>
                      <p className="text-xs text-slate-400 mt-1">
                        독자 행동을 유도하는 맞춤 CTA와 지도/영업시간 안내가 포함됩니다.
                      </p>
                    </div>
                  </div>

                  {/* 빠른 AI 생성 유도 버튼 */}
                  <div className="text-center pt-4">
                    <Button
                      type="button"
                      size="lg"
                      disabled={isGenerating || !topic.trim()}
                      onClick={onGenerate}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-6 shadow-md"
                    >
                      <Sparkles className="size-4 mr-2" />
                      이 템플릿 구조로 AI 블로그 글 자동 생성하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            4. 우측 네이버 [템플릿] 서랍 (Slide-over Drawer)
               - 이미지 1의 모든 설정(15종 스킬, 오디언스, 키워드 등) 포함
        ═════════════════════════════════════════════════════════════════════ */}
        {isTemplateDrawerOpen && (
          <aside className="w-[340px] sm:w-[360px] lg:w-[380px] bg-white border-l border-[#e5e7eb] flex flex-col h-full shrink-0 shadow-lg z-20 animate-in slide-in-from-right duration-200">
            {/* 서랍 헤더 */}
            <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="size-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">네이버 템플릿 & 프롬프트 설정</h2>
              </div>
              <div className="flex items-center gap-1">
                {onSaveAsProfileTemplate && (
                  <button
                    type="button"
                    onClick={onSaveAsProfileTemplate}
                    className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="현재 설정을 프로필 기본 템플릿에 저장"
                  >
                    💾 템플릿 저장
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTemplateDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  title="서랍 닫기"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* 서랍 스크롤 바디 (이미지 1의 폼 내용 집약) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
              {/* ① 블로그 유형 (원투원 중심 정예 5종) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="size-3.5 text-indigo-600" />
                    <span>블로그 유형 ({showAllSkills ? BLOG_SKILLS.length : CORE_BLOG_SKILLS.length}종)</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    {showAllSkills ? '▲ 원투원 핵심 5종만 보기' : '▼ 전체 유형 펼치기'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(showAllSkills ? BLOG_SKILLS : CORE_BLOG_SKILLS).map((skill) => {
                    const isSelected = skillId === skill.id;
                    const isOneToOne = skill.id === 'one_to_one';
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => onSkillChange(skill.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isOneToOne
                            ? isSelected
                              ? 'col-span-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-950 shadow-xs font-bold ring-2 ring-indigo-500/20'
                              : 'col-span-2 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-slate-800 font-semibold'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50/70 text-blue-950 shadow-2xs font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{skill.emoji}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-600 font-mono font-bold">
                            {skill.copywritingFormula}
                          </span>
                        </div>
                        <div className="mt-1 font-bold text-[11px] truncate">{skill.name}</div>
                        {isOneToOne && (
                          <div className="text-[10px] text-indigo-600 font-medium truncate mt-0.5">
                            ★ BNI 121 미팅 기록, 비즈니스 인사이트 및 상생 협업
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🌟 원투원 전용 스마트 워크스페이스 UI/UX (One-to-One UI/UX) */}
              {skillId === 'one_to_one' && (
                <OneToOneMeetingPanel
                  customFields={customFields}
                  onCustomFieldsChange={onCustomFieldsChange}
                  topic={topic}
                  onTopicChange={onTopicChange}
                  requiredKeywords={requiredKeywords}
                  onRequiredKeywordsChange={onRequiredKeywordsChange}
                  onTargetAudienceChange={onTargetAudienceChange}
                />
              )}

              {/* ② 타겟 독자 (오디언스 칩) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="size-3.5 text-indigo-600" />
                  <span>타겟 독자 (오디언스)</span>
                </Label>
                <Input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => onTargetAudienceChange(e.target.value)}
                  placeholder="예: 2030 직장인, 강남 맛집 탐방러"
                  className="h-8 text-xs"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {AUDIENCE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* ③ 카피라이팅 공식 & 톤앤매너 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">카피라이팅 공식</Label>
                  <select
                    value={copyFormula}
                    onChange={(e) => onCopyFormulaChange(e.target.value as any)}
                    className="w-full h-8 text-xs font-medium border border-slate-200 rounded-md px-2 bg-white"
                  >
                    {COPY_FORMULA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">톤앤매너</Label>
                  <select
                    value={tone}
                    onChange={(e) => onToneChange(e.target.value as any)}
                    className="w-full h-8 text-xs font-medium border border-slate-200 rounded-md px-2 bg-white"
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.emoji} {t.label.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ④ 필수 포함 키워드 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="size-3.5 text-amber-600" />
                  <span>필수 포함 키워드 / 해시태그</span>
                </Label>
                <Input
                  type="text"
                  value={requiredKeywords}
                  onChange={(e) => onRequiredKeywordsChange(e.target.value)}
                  placeholder="쉼표(,)로 구분 (예: 강남역 삼겹살, 구워주는 고기집)"
                  className="h-8 text-xs"
                />
              </div>

              {/* ⑤ 스킬별 특화 필드 (환율 자동조회 등) */}
              {skillId === 'exchange' && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs">관세청 고시환율 자동조회</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isFetchingExchange}
                      onClick={handleAutoFetchExchange}
                      className="h-6 text-[10px] px-2 bg-white text-amber-800 border-amber-300 hover:bg-amber-100"
                    >
                      {isFetchingExchange ? <Loader2 className="size-3 animate-spin" /> : '⚡ 환율 불러오기'}
                    </Button>
                  </div>
                  <Input
                    type="text"
                    value={customFields.period || ''}
                    onChange={(e) => onCustomFieldsChange({ ...customFields, period: e.target.value })}
                    placeholder="기간 (예: 2026년 9월 1회차)"
                    className="h-7 text-xs bg-white"
                  />
                </div>
              )}

              {/* ⑥ 세부 추가 프롬프트 지침 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PenLine className="size-3.5 text-slate-600" />
                  <span>AI 추가 요청사항 (선택)</span>
                </Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => onCustomInstructionsChange(e.target.value)}
                  placeholder="예: 30대 직장인 회식 관점에서 주차 정보와 룸 예약 팁을 강조해줘"
                  className="text-xs min-h-[64px] resize-none"
                />
              </div>
            </div>

            {/* 서랍 하단 AI 생성 실행 바 */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={isGenerating || !topic.trim()}
                onClick={onGenerate}
                className="w-full h-9 bg-[#03c75a] hover:bg-[#02b350] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>글 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>이 템플릿으로 AI 글 생성하기</span>
                  </>
                )}
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          5. 하단 플로팅 글감 바 & 뷰 토글 (이미지 2 하단 100% 반영)
      ═════════════════════════════════════════════════════════════════════ */}
      <footer className="h-10 bg-white/90 backdrop-blur-xs border-t border-slate-200 px-5 flex items-center justify-between shrink-0 z-20 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-slate-600">
            글자수: <strong className="text-slate-900">{post?.content?.length || 0}자</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-medium text-slate-600">
            사진: <strong className="text-[#03c75a]">{photosCount}장</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-medium text-slate-600">
            유형: <strong className="text-purple-600">{currentSkill?.name}</strong>
          </span>
        </div>

        {/* 이미지 2 중앙 하단 글감 검색 바 */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-[11px] text-slate-500 hover:border-slate-300 transition-colors">
          <span>전체 보기 ▾</span>
          <div className="h-3 w-px bg-slate-300" />
          <Search className="size-3 text-slate-400" />
          <input
            type="text"
            placeholder="글감을 검색해보세요"
            className="bg-transparent border-none outline-hidden text-[11px] w-40 placeholder:text-slate-400"
          />
        </div>

        {/* 우측 PC/모바일 뷰 전환 및 도움말 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewDevice(viewDevice === 'pc' ? 'mobile' : 'pc')}
            className={`p-1 rounded transition-colors ${
              viewDevice === 'mobile' ? 'text-[#03c75a] bg-emerald-50' : 'text-slate-400 hover:text-slate-700'
            }`}
            title={viewDevice === 'pc' ? '모바일 미리보기로 전환' : 'PC 860px 캔버스로 전환'}
          >
            {viewDevice === 'pc' ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => toast.info('네이버 스마트에디터 ONE AI 스튜디오 도움말')}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
          >
            <HelpCircle className="size-4" />
          </button>
        </div>
      </footer>

      {/* ═════════════════════════════════════════════════════════════════════
          6. 네이버 블로그 [발행 설정 레이어] 팝업 모달
      ═════════════════════════════════════════════════════════════════════ */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            {/* 팝업 헤더 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#03c75a] flex items-center justify-center text-white font-bold text-xs">
                  N
                </div>
                <h3 className="text-base font-bold text-slate-900">네이버 블로그 발행 설정</h3>
              </div>
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 팝업 바디 */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* 카테고리 선택 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">카테고리 선택</Label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full h-9 text-xs font-medium border border-slate-200 rounded-md px-3 bg-white"
                >
                  <option value="사주/운세">사주/운세</option>
                  <option value="맛집/카페">맛집/카페</option>
                  <option value="일상/생각">일상/생각</option>
                  <option value="IT/컴퓨터">IT/컴퓨터</option>
                  <option value="비즈니스/경제">비즈니스/경제</option>
                  <option value="여행/숙박">여행/숙박</option>
                  <option value="취미/여가">취미/여가</option>
                </select>
              </div>

              {/* 발행 형태 선택 토글 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">발행 방식</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishActionType('draft')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      publishActionType === 'draft'
                        ? 'border-[#03c75a] bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>💾</span>
                      <span>안전 임시저장 (권장)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal mt-1">
                      네이버 블로그에 제목·사진·서식을 완벽 입력하고 임시저장함에 보관합니다.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishActionType('publish')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      publishActionType === 'publish'
                        ? 'border-[#03c75a] bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>🚀</span>
                      <span>즉시 전체공개</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal mt-1">
                      네이버 에디터에 작성 후 최종 [발행] 버튼까지 클릭하여 즉시 게시합니다.
                    </p>
                  </button>
                </div>
              </div>

              {/* 태그 관리 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">태그 편집 (최대 10개)</Label>
                <div className="flex gap-1.5">
                  <Input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        if (!tagsList.includes(newTagInput.trim())) {
                          setTagsList([...tagsList, newTagInput.trim()]);
                        }
                        setNewTagInput('');
                      }
                    }}
                    placeholder="태그 입력 후 Enter"
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (newTagInput.trim() && !tagsList.includes(newTagInput.trim())) {
                        setTagsList([...tagsList, newTagInput.trim()]);
                        setNewTagInput('');
                      }
                    }}
                    className="h-8 text-xs shrink-0"
                  >
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tagsList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTagsList(tagsList.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 데몬 상태 및 사진 중앙 정렬 확인 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1 text-slate-700">
                    <CheckCircle2 className="size-3.5 text-[#03c75a]" />
                    사진 100% 중앙 정렬 보장
                  </span>
                  <span className={isDaemonOnline ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {isDaemonOnline ? '● 로컬 데몬 온라인 (3055)' : '▲ 데몬 확인 필요'}
                  </span>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Playwright 봇이 실제 Chrome 브라우저를 열어 네이버 스마트에디터 ONE에 직접 타이핑하고 사진을 삽입합니다.
                </p>
                {botMessage && (
                  <div className="mt-2 p-2 rounded bg-blue-50 text-blue-700 font-mono text-[10px] break-all">
                    {botMessage}
                  </div>
                )}
              </div>
            </div>

            {/* 팝업 하단 버튼 */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPublishModalOpen(false)}
                className="h-9 text-xs"
              >
                취소
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={isTriggeringBot}
                onClick={handleExecutePlaywrightBot}
                className="h-9 px-5 bg-[#03c75a] hover:bg-[#02b350] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5"
              >
                {isTriggeringBot ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>네이버 블로그 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>🚀 네이버 블로그 자동 작성 시작</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
