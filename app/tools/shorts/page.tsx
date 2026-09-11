'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Download,
  Play,
  Clock,
  Film,
  SmartphoneIcon,
  Monitor,
  Pencil,
  Trash2,
  Volume2,
  VolumeX,
  Palette,
  Music,
  ImageIcon,
  Target,
  Zap,
  ExternalLink,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateVideo, type VideoScene } from '@/lib/video-generator';
import { generateBGM, type BgmStyle } from '@/lib/bgm-generator';
import { saveScript, generateId } from '@/lib/youtube-store';

// ─── Types ───────────────────────────────────────────────────

interface VideoScript {
  title: string;
  description: string;
  tags: string[];
  scenes: VideoScene[];
}

type VideoFormat = 'shorts' | 'regular';
type VideoTheme = 'neon' | 'vibrant' | 'elegant';
type HookStyle = 'question' | 'shock' | 'empathy' | 'story';

const THEME_OPTIONS: {
  value: VideoTheme;
  label: string;
  desc: string;
  colors: string;
}[] = [
  {
    value: 'neon',
    label: 'Neon',
    desc: '사이버펑크',
    colors: 'from-slate-500 to-blue-700',
  },
  {
    value: 'vibrant',
    label: 'Vibrant',
    desc: '강렬한',
    colors: 'from-blue-600 to-red-500',
  },
  {
    value: 'elegant',
    label: 'Elegant',
    desc: '고급스러운',
    colors: 'from-blue-700 to-yellow-700',
  },
];

const HOOK_OPTIONS: { value: HookStyle; label: string; emoji: string }[] = [
  { value: 'question', label: '질문형', emoji: '❓' },
  { value: 'shock', label: '충격형', emoji: '😱' },
  { value: 'empathy', label: '공감형', emoji: '🤝' },
  { value: 'story', label: '스토리형', emoji: '📖' },
];

const AUDIENCE_PRESETS = [
  '20대 직장인',
  '30대 자기개발러',
  '부업/투잡 관심자',
  '대학생',
  '1인 사업자',
  '육아맘',
  'MZ세대',
  '시니어',
];

// ─── Constants ───────────────────────────────────────────────

const STYLE_LABELS: Record<string, { label: string; color: string }> = {
  intro: { label: '도입', color: 'bg-blue-100 text-blue-700' },
  content: { label: '본문', color: 'bg-slate-100 text-slate-700' },
  highlight: { label: '강조', color: 'bg-amber-100 text-amber-700' },
  outro: { label: '마무리', color: 'bg-purple-100 text-blue-700' },
};

const FORMAT_OPTIONS: {
  value: VideoFormat;
  label: string;
  icon: typeof SmartphoneIcon;
  desc: string;
  width: number;
  height: number;
}[] = [
  {
    value: 'shorts',
    label: 'Shorts',
    icon: SmartphoneIcon,
    desc: '9:16 세로',
    width: 1080,
    height: 1920,
  },
  {
    value: 'regular',
    label: '일반',
    icon: Monitor,
    desc: '16:9 가로',
    width: 1920,
    height: 1080,
  },
];

const VOICE_OPTIONS = [
  { value: 'male-1', label: '남성 (Neural)', desc: '자연스러운 남성 음성' },
  { value: 'female-1', label: '여성 (Neural)', desc: '자연스러운 여성 음성' },
  { value: 'standard-male', label: '남성 (Standard)', desc: '기본 남성 음성' },
  { value: 'standard-female', label: '여성 (Standard)', desc: '기본 여성 음성' },
];

const BGM_OPTIONS: { value: BgmStyle; label: string }[] = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'chill', label: 'Chill' },
];

// ─── Component ───────────────────────────────────────────────

export default function YouTubePage() {
  // Generate state
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<VideoFormat>('shorts');
  const [theme, setTheme] = useState<VideoTheme>('neon');
  const [targetAudience, setTargetAudience] = useState('');
  const [hookStyle, setHookStyle] = useState<HookStyle>('question');
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [editingScene, setEditingScene] = useState<number | null>(null);

  // TTS state
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voice, setVoice] = useState('male-1');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudio, setTtsAudio] = useState<(string | null)[] | null>(null);

  // BGM state
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [bgmStyle, setBgmStyle] = useState<BgmStyle>('ambient');

  // AI Image state
  const [aiImagesEnabled, setAiImagesEnabled] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoadedCount, setImageLoadedCount] = useState(0);

  // Video rendering state
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Script Generation ─────────────────────────────────────

  const handleGenerateScript = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    setScript(null);
    setVideoBlob(null);
    setVideoUrl(null);

    try {
      const res = await fetch('/api/youtube/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          format,
          targetAudience: targetAudience.trim(),
          hookStyle,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `스크립트 생성 실패 (${res.status})`);
      }

      const data = await res.json();
      setScript(data.script);

      // Save to history
      saveScript({
        id: generateId(),
        topic: topic.trim(),
        targetAudience,
        hookStyle,
        format,
        theme,
        title: data.script.title,
        description: data.script.description,
        tags: data.script.tags,
        scenes: data.script.scenes,
        createdAt: new Date().toISOString(),
        status: 'draft',
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : '스크립트 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // ─── Scene Editing ─────────────────────────────────────────

  const updateScene = (index: number, updates: Partial<VideoScene>) => {
    if (!script) return;
    const newScenes = [...script.scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    setScript({ ...script, scenes: newScenes });
  };

  const removeScene = (index: number) => {
    if (!script || script.scenes.length <= 2) return;
    const newScenes = script.scenes.filter((_, i) => i !== index);
    setScript({ ...script, scenes: newScenes });
  };

  // ─── TTS Generation ─────────────────────────────────────────

  const handleGenerateTTS = async (): Promise<(string | null)[] | null> => {
    if (!script || !ttsEnabled) return null;

    setTtsLoading(true);
    try {
      const res = await fetch('/api/youtube/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: script.scenes.map((s) => s.narration),
          voice,
          speakingRate: 1.0,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.warn('TTS failed:', data?.error);
        return null;
      }

      const data = await res.json();
      setTtsAudio(data.audioFiles);
      return data.audioFiles;
    } catch {
      console.warn('TTS request failed');
      return null;
    } finally {
      setTtsLoading(false);
    }
  };

  // ─── AI Image Loading ────────────────────────────────────

  const loadImageFromPollinations = async (
    prompt: string,
    width: number,
    height: number
  ): Promise<HTMLImageElement> => {
    // Use smaller dimensions for faster generation, Canvas scales up
    const imgW = Math.min(width, 768);
    const imgH = Math.min(height, 1344);
    const seed = Date.now() + Math.floor(Math.random() * 10000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=${imgW}&height=${imgH}&nologo=true&seed=${seed}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('Image fetch failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Image decode failed'));
        };
        img.src = objectUrl;
      });
    } catch {
      clearTimeout(timeout);
      throw new Error('Image generation timeout');
    }
  };

  // ─── Video Rendering ──────────────────────────────────────

  const handleRenderVideo = async () => {
    if (!script) return;
    setRendering(true);
    setRenderProgress(0);
    setError('');

    // Clean up previous video URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoBlob(null);

    try {
      // Step 1: Generate TTS audio if enabled
      let audioData: (string | null)[] | null = ttsAudio;
      if (ttsEnabled && !audioData) {
        setRenderProgress(0);
        audioData = await handleGenerateTTS();
        if (!audioData) {
          setError(
            'TTS 나레이션 생성 실패 — Google Cloud Console에서 Cloud Text-to-Speech API를 활성화해주세요. 배경음악으로 계속 진행합니다.'
          );
        }
      }

      // Step 2: Generate AI background images if enabled
      let backgroundImages: (HTMLImageElement | null)[] | undefined;
      const formatConfig = FORMAT_OPTIONS.find((f) => f.value === format)!;

      if (aiImagesEnabled && script.scenes.some((s) => s.imagePrompt)) {
        setImageLoading(true);
        setImageLoadedCount(0);
        let loaded = 0;

        backgroundImages = await Promise.all(
          script.scenes.map(async (scene) => {
            if (!scene.imagePrompt) {
              loaded++;
              setImageLoadedCount(loaded);
              return null;
            }
            try {
              const img = await loadImageFromPollinations(
                scene.imagePrompt,
                formatConfig.width,
                formatConfig.height
              );
              loaded++;
              setImageLoadedCount(loaded);
              return img;
            } catch {
              loaded++;
              setImageLoadedCount(loaded);
              return null;
            }
          })
        );

        setImageLoading(false);
      }

      // Step 3: Generate BGM if enabled
      let bgmBuffer: AudioBuffer | undefined;
      if (bgmEnabled) {
        const totalSec = script.scenes.reduce((s, sc) => s + sc.duration, 0);
        bgmBuffer = await generateBGM(totalSec + 1, bgmStyle);
      }

      // Step 4: Render video with audio + images
      const blob = await generateVideo(
        {
          width: formatConfig.width,
          height: formatConfig.height,
          fps: 30,
          title: script.title,
          scenes: script.scenes,
          watermark: 'neoNpeter',
          audioData: audioData || undefined,
          bgm: bgmBuffer,
          backgroundImages,
          theme,
        },
        (percent) => setRenderProgress(Math.round(percent))
      );

      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : '영상 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setRendering(false);
    }
  };

  // ─── Download ──────────────────────────────────────────────

  const handleDownload = () => {
    if (!videoUrl || !script) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${script.title.replace(/[^가-힣a-zA-Z0-9\s]/g, '').trim()}.webm`;
    a.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const totalDuration = script?.scenes.reduce((s, sc) => s + sc.duration, 0) || 0;

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#10024a] pb-24 text-white">
      {/* Background radial effects */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,.3),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,.25),transparent_35%)]" />

      {/* Header Banner with VisKits as the Hero */}
      <section className="relative overflow-hidden border-b border-indigo-500/30 bg-gradient-to-br from-[#1b0559] via-[#2a087a] to-[#120242] py-12 text-white">
        <div className="absolute right-0 top-0 -z-0 h-full w-1/3 bg-gradient-to-l from-pink-500/20 to-transparent blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-black text-fuchsia-300 border border-fuchsia-400/30">
                  PART 03 · 박재범 대표
                </span>
                <span className="rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-300/30">
                  👑 숏폼 자동화 공식 플랫폼: VisKits (비스킷츠)
                </span>
              </div>

              <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                AI 숏폼 영상 제작의 중심,<br />
                <span className="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-indigo-200 bg-clip-text text-transparent">
                  VisKits (비스킷츠)
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-violet-100/90 leading-relaxed">
                사진 한 장, 링크 하나로 30초 홍보 숏폼을 원클릭 완성하는 대한민국 대표 AI 숏폼 영상 플랫폼.<br className="hidden sm:inline" />
                강의 참석자 전원에게 <strong>VisKits 1개월 무료 이용권</strong>이 지급됩니다!
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://viskits.ai/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(236,72,153,.35)] transition hover:scale-105 hover:shadow-[0_15px_35px_rgba(236,72,153,.45)]"
                >
                  <Sparkles className="size-4" />
                  <span>VisKits (비스킷츠) 공식 홈 바로가기</span>
                  <ExternalLink className="size-4" />
                </a>

                <Link
                  href="/drive"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-indigo-400/40 bg-indigo-600/30 px-5 py-3.5 text-xs font-bold text-white transition hover:bg-indigo-600/50 backdrop-blur-sm"
                >
                  <Camera className="size-4 text-pink-300" />
                  <span>📷 사진 드라이브 (웹캠 촬영/공유)</span>
                </Link>

                <a
                  href="#script-studio"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-xs font-bold text-white transition hover:bg-white/20 backdrop-blur-sm"
                >
                  <span>VisKits 대본 빌더 &darr;</span>
                </a>
              </div>
            </div>

            {/* VisKits Spotlight Card */}
            <div className="w-full lg:max-w-md rounded-3xl border border-indigo-400/30 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xl bg-pink-500 text-white font-black text-xs">
                    V
                  </span>
                  <span className="font-extrabold text-sm text-white">viskits.ai</span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                  수강생 1개월 무료 혜택
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-violet-100">
                <div className="flex items-start gap-2">
                  <span className="text-fuchsia-400 font-bold">•</span>
                  <span><strong>원클릭 숏폼 생성:</strong> 대본 입력 즉시 9:16 비디오·자막·음성 자동 매칭</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-fuchsia-400 font-bold">•</span>
                  <span><strong>AI 나레이션 &amp; 템플릿:</strong> 조회수를 부르는 감각적인 트렌드 영상 프리셋</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-fuchsia-400 font-bold">•</span>
                  <span><strong>실습 연동 팁:</strong> 아래 스튜디오에서 후킹 대본을 작성한 뒤 VisKits에 붙여넣어 초고화질로 렌더링하세요!</span>
                </div>
              </div>

              <a
                href="https://viskits.ai/home"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white text-indigo-950 py-2.5 text-xs font-black shadow-md hover:bg-violet-50 transition"
              >
                <span>https://viskits.ai/home 방문하기</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="script-studio" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 text-slate-900">
          <CardContent className="pt-6 text-red-600 text-sm">{error}</CardContent>
        </Card>
      )}
          {/* Topic Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="영상 주제를 입력하세요 (예: 2025 AI 트렌드, Claude Code 사용법)"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateScript()}
                    disabled={generating || rendering}
                    maxLength={200}
                    className="text-lg h-12"
                  />
                  <Button
                    onClick={handleGenerateScript}
                    disabled={generating || rendering || !topic.trim()}
                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {generating ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        스크립트 생성
                      </>
                    )}
                  </Button>
                </div>

                {/* Target Audience & Hook Style */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-slate-50 to-amber-50/30 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Target className="size-4 text-blue-600" />
                    알고리즘 타겟팅
                  </div>

                  {/* Target Audience Input + Presets */}
                  <div className="flex gap-2">
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="타겟 오디언스 (예: 20대 직장인, 부업 관심자)"
                      disabled={generating || rendering}
                      maxLength={100}
                      className="flex-1 text-sm h-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AUDIENCE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() =>
                          setTargetAudience((prev) =>
                            prev ? `${prev}, ${preset}` : preset
                          )
                        }
                        disabled={generating || rendering}
                        className="px-2.5 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-blue-50 transition-all disabled:opacity-50"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Hook Style Selector */}
                  <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-slate-600">3초 훅 스타일:</span>
                    <div className="flex gap-1.5">
                      {HOOK_OPTIONS.map((h) => (
                        <button
                          key={h.value}
                          onClick={() => setHookStyle(h.value)}
                          disabled={generating || rendering}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            hookStyle === h.value
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-500 hover:border-amber-300'
                          } disabled:opacity-50`}
                        >
                          {h.emoji} {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Format & TTS Selection */}
                <div className="flex flex-wrap gap-3">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormat(opt.value)}
                      disabled={generating || rendering}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        format === opt.value
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      } disabled:opacity-50`}
                    >
                      <opt.icon className="size-4" />
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs opacity-60">{opt.desc}</span>
                    </button>
                  ))}

                  {/* Theme Selector */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-slate-200">
                    <Palette className="size-4 text-slate-400" />
                    {THEME_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        disabled={generating || rendering}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                          theme === t.value
                            ? `bg-gradient-to-r ${t.colors} text-white shadow-sm`
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        } disabled:opacity-50`}
                        title={t.desc}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* TTS Toggle */}
                  <button
                    onClick={() => {
                      setTtsEnabled(!ttsEnabled);
                      setTtsAudio(null);
                    }}
                    disabled={generating || rendering}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      ttsEnabled
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 text-slate-400'
                    } disabled:opacity-50`}
                  >
                    {ttsEnabled ? (
                      <Volume2 className="size-4" />
                    ) : (
                      <VolumeX className="size-4" />
                    )}
                    <span className="font-medium">나레이션</span>
                  </button>

                  {/* Voice Selection */}
                  {ttsEnabled && (
                    <select
                      value={voice}
                      onChange={(e) => {
                        setVoice(e.target.value);
                        setTtsAudio(null);
                      }}
                      disabled={generating || rendering}
                      className="rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-50"
                    >
                      {VOICE_OPTIONS.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* BGM Toggle */}
                  <button
                    onClick={() => setBgmEnabled(!bgmEnabled)}
                    disabled={generating || rendering}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      bgmEnabled
                        ? 'border-purple-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-400'
                    } disabled:opacity-50`}
                  >
                    <Music className="size-4" />
                    <span className="font-medium">배경음악</span>
                  </button>

                  {/* BGM Style Selection */}
                  {bgmEnabled && (
                    <select
                      value={bgmStyle}
                      onChange={(e) =>
                        setBgmStyle(e.target.value as BgmStyle)
                      }
                      disabled={generating || rendering}
                      className="rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-50"
                    >
                      {BGM_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* AI Background Image Toggle */}
                  <button
                    onClick={() => setAiImagesEnabled(!aiImagesEnabled)}
                    disabled={generating || rendering}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      aiImagesEnabled
                        ? 'border-cyan-500 bg-blue-50 text-cyan-700'
                        : 'border-slate-200 text-slate-400'
                    } disabled:opacity-50`}
                  >
                    <ImageIcon className="size-4" />
                    <span className="font-medium">AI 배경</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generating Indicator */}
          {generating && (
            <div className="text-center py-12">
              <Loader2 className="size-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-slate-500">
                AI가 <strong>{topic}</strong> 영상 스크립트를 작성 중...
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Gemini + 웹 검색 + 알고리즘 최적화 (10~20초)
              </p>
              {targetAudience && (
                <p className="text-xs text-blue-600 mt-1">
                  <Target className="size-3 inline mr-1" />
                  타겟: {targetAudience}
                </p>
              )}
            </div>
          )}

          {/* Script / Storyboard */}
          <AnimatePresence>
            {script && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Script Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Film className="size-5 text-red-500" />
                      스토리보드
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {totalDuration}초
                      </span>
                      <span>{script.scenes.length}장면</span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {format === 'shorts' ? 'Shorts 9:16' : '일반 16:9'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Title & Description */}
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <Input
                        value={script.title}
                        onChange={(e) =>
                          setScript({ ...script, title: e.target.value })
                        }
                        className="text-lg font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        {script.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {script.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Scenes */}
                    <div className="space-y-3">
                      {script.scenes.map((scene, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group"
                        >
                          {/* Scene Number */}
                          <div className="flex-shrink-0 size-8 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </div>

                          {/* Scene Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {scene.emoji && (
                                <span className="text-base">{scene.emoji}</span>
                              )}
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STYLE_LABELS[scene.style]?.color || ''}`}
                              >
                                {STYLE_LABELS[scene.style]?.label || scene.style}
                              </span>
                              <span className="text-xs text-slate-400">
                                {scene.duration}초
                              </span>
                            </div>

                            {editingScene === i ? (
                              <div className="space-y-2">
                                <Input
                                  value={scene.text}
                                  onChange={(e) =>
                                    updateScene(i, { text: e.target.value })
                                  }
                                  className="text-sm font-medium"
                                  placeholder="화면 텍스트"
                                />
                                <textarea
                                  value={scene.narration}
                                  onChange={(e) =>
                                    updateScene(i, {
                                      narration: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-500"
                                  placeholder="나레이션"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min={2}
                                    max={15}
                                    value={scene.duration}
                                    onChange={(e) =>
                                      updateScene(i, {
                                        duration: Number(e.target.value) || 3,
                                      })
                                    }
                                    className="w-20 text-xs"
                                  />
                                  <span className="text-xs text-slate-400 self-center">
                                    초
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingScene(null)}
                                  >
                                    완료
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {scene.text}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {scene.narration}
                                </p>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                setEditingScene(editingScene === i ? null : i)
                              }
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            {script.scenes.length > 2 && (
                              <button
                                onClick={() => removeScene(i)}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Render Button */}
                {!videoUrl && !rendering && !ttsLoading && !imageLoading && (
                  <Button
                    onClick={handleRenderVideo}
                    className="w-full h-14 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white text-lg"
                  >
                    <Play className="size-5 mr-2" />
                    {aiImagesEnabled ? 'AI 배경 + ' : ''}{ttsEnabled ? '나레이션 + ' : ''}{bgmEnabled ? 'BGM + ' : ''}영상 생성하기 ({totalDuration}초)
                  </Button>
                )}

                {/* Rendering Progress */}
                {(rendering || ttsLoading || imageLoading) && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <Loader2 className="size-8 animate-spin text-red-500 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">
                          {imageLoading
                            ? `AI 배경 이미지 생성 중... (${imageLoadedCount}/${script?.scenes.length || 0})`
                            : ttsLoading && renderProgress === 0
                              ? 'TTS 나레이션 생성 중...'
                              : '영상 렌더링 중...'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {imageLoading
                            ? 'Pollinations AI로 장면별 배경 이미지 생성 (장면당 ~10초)'
                            : ttsLoading && renderProgress === 0
                              ? 'Google Cloud TTS로 음성 합성'
                              : `Canvas + ${ttsEnabled || bgmEnabled ? '오디오' : '무음'} 렌더링 (실시간 처리)`}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">진행률</span>
                          <span className="font-medium text-red-600">
                            {renderProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <motion.div
                            className="bg-gradient-to-r from-red-500 to-blue-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${renderProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Video Preview */}
                {videoUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="size-5 text-green-600" />
                          영상 생성 완료!
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Video Player */}
                        <div
                          className={`mx-auto bg-black rounded-lg overflow-hidden ${
                            format === 'shorts'
                              ? 'max-w-[280px] aspect-[9/16]'
                              : 'max-w-full aspect-video'
                          }`}
                        >
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="text-center text-sm text-slate-500">
                          {videoBlob && (
                            <span>
                              {formatFileSize(videoBlob.size)} · WebM ·{' '}
                              {totalDuration}초
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={handleDownload}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Download className="size-4 mr-2" />
                            다운로드
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVideoBlob(null);
                              if (videoUrl) URL.revokeObjectURL(videoUrl);
                              setVideoUrl(null);
                            }}
                          >
                            다시 생성
                          </Button>
                        </div>

                        {/* YouTube Upload Hint */}
                        <div className="text-center">
                          <p className="text-xs text-slate-400">
                            YouTube에 업로드하려면 &quot;업로드&quot; 탭에서 다운로드한
                            파일을 선택하세요.
                            <br />
                            YouTube 연결 후 자동 업로드가 가능합니다.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
}
