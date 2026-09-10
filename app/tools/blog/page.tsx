'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { PhotoUploadPanel, type UploadedPhoto } from '@/components/blog-automation/writer/PhotoUploadPanel';
import { NaverSmartEditorStudio } from '@/components/blog-automation/writer/NaverSmartEditorStudio';
import { BlogDriveHub } from '@/components/blog-automation/drive/BlogDriveHub';
import type { BlogSkillId, BlogPlatform } from '@/lib/blog-automation/blog-skills';
import type { BlogCopyFormula, BlogTone } from '@/lib/blog-automation/types';
import type { GeneratedContent } from '@/lib/blog-automation/content-generator';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { saveBlogPostRecord, type SavedBlogPost } from '@/lib/blog-automation/storage';
import {
  getBlogProfiles,
  saveBlogProfile,
  incrementProfilePostCount,
  type BlogProfile,
} from '@/lib/blog-automation/profile-storage';
import { BlogHistoryModal } from '@/components/blog-automation/writer/BlogHistoryModal';
import { AutoPilotBatchModal } from '@/components/blog-automation/writer/AutoPilotBatchModal';

export default function BlogStudioPage() {
  const { user } = useAuth();

  // 0. 뷰 모드: 기본적으로 바로 스마트에디터 작성기로 진입
  const [viewMode, setViewMode] = useState<'drive' | 'writer'>('writer');
  const [profiles, setProfiles] = useState<BlogProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<BlogProfile | null>(null);

  // 1. 좌측 패널: 사진 상태
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  // 2. 가운데 패널: AI 파라미터 상태
  const [skillId, setSkillId] = useState<BlogSkillId>('restaurant');
  const [platform, setPlatform] = useState<BlogPlatform>('naver');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [copyFormula, setCopyFormula] = useState<BlogCopyFormula>('auto');
  const [tone, setTone] = useState<BlogTone>('friendly');
  const [requiredKeywords, setRequiredKeywords] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [customInstructions, setCustomInstructions] = useState('');

  // 3. 메인 에디터: 결과물 및 상태
  const [post, setPost] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 4. 모달 상태
  const [historyOpen, setHistoryOpen] = useState(false);
  const [autoPilotOpen, setAutoPilotOpen] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | undefined>(undefined);

  // 프로필 목록 로드
  const loadProfiles = async () => {
    try {
      const list = await getBlogProfiles(user);
      setProfiles(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfiles();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setLeftCollapsed(true);
    }
  }, [user]);

  const handleSelectProfile = (profile: BlogProfile) => {
    setCurrentProfile(profile);
    setSkillId(profile.skillId || 'general');
    setPlatform(profile.platform || 'naver');
    setTone(profile.tone || 'friendly');
    setCopyFormula(profile.copyFormula || 'auto');
    setTargetAudience(profile.targetAudience || '');
    setRequiredKeywords(profile.requiredKeywords || '');
    setCustomFields(profile.customFields || {});
    setCustomInstructions(profile.customInstructions || '');
    setTopic('');

    setViewMode('writer');
    toast.success(`✨ '${profile.name}' 맞춤 템플릿이 로드되었습니다.`);
  };

  const handleDirectStart = () => {
    setCurrentProfile(null);
    setSkillId('restaurant');
    setPlatform('naver');
    setTone('friendly');
    setCopyFormula('auto');
    setTargetAudience('');
    setRequiredKeywords('');
    setCustomFields({});
    setCustomInstructions('');
    setTopic('');
    setViewMode('writer');
  };

  const handleSwitchProfile = (profile: BlogProfile) => {
    handleSelectProfile(profile);
  };

  const handleSaveAsProfileTemplate = async () => {
    if (!currentProfile) {
      toast.error('선택된 프로필이 없습니다.');
      return;
    }

    try {
      const updated: Partial<BlogProfile> & { name: string } = {
        ...currentProfile,
        skillId,
        platform,
        tone,
        copyFormula,
        targetAudience,
        requiredKeywords,
        customFields,
        customInstructions,
      };

      const saved = await saveBlogProfile(user, updated);
      setCurrentProfile(saved);
      await loadProfiles();
      toast.success(`💾 '${saved.name}' 템플릿에 현재 설정이 저장되었습니다!`);
    } catch (err: any) {
      toast.error('템플릿 저장 실패: ' + err.message);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('블로그 주제 또는 키워드를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      const imagesPayload = photos.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        description: p.description,
        caption: p.caption,
      }));

      const res = await fetch('/api/blog-auto/writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          skillId,
          platform,
          targetAudience: targetAudience.trim() || undefined,
          copyFormula,
          tone,
          requiredKeywords: requiredKeywords.trim() || undefined,
          customFields,
          customInstructions: customInstructions.trim() || undefined,
          images: imagesPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '블로그 글 생성에 실패했습니다.');
      }

      const postWithImages = {
        ...data.post,
        images: photos.map((p, idx) => ({
          url: p.url,
          name: p.name || `사진 ${idx + 1}`,
          caption: p.caption,
          description: p.description,
        })),
        updatedAt: Date.now(),
      };

      setPost(postWithImages);

      // 계정별 Firestore 및 LocalStorage에 자동 저장
      const savedRecord = await saveBlogPostRecord(user, postWithImages, {
        skillId,
        platform,
        targetAudience,
        profileId: currentProfile?.id,
        profileName: currentProfile?.name,
        clientName: currentProfile?.clientName,
        blogUrl: currentProfile?.blogUrl,
      });
      setCurrentSavedId(savedRecord.id);

      if (currentProfile?.id) {
        await incrementProfilePostCount(user, currentProfile.id);
        await loadProfiles();
      }

      try {
        localStorage.setItem('latest_blog_post', JSON.stringify(postWithImages));
        localStorage.setItem('latest_blog_photos', JSON.stringify(postWithImages.images || []));
        localStorage.setItem('latest_blog_title', postWithImages.title);
      } catch (e) {}

      toast.success('🎉 AI 블로그 글이 생성되어 보관함에 안전하게 저장되었습니다!');
    } catch (err: any) {
      console.error(err);
      toast.error(`생성 실패: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryPost = (saved: SavedBlogPost) => {
    const loadedPost: GeneratedContent = {
      title: saved.title,
      subtitle: saved.subtitle || '',
      content: saved.content,
      htmlContent: saved.htmlContent,
      excerpt: saved.excerpt,
      tags: saved.tags,
      faqs: saved.faqs || [],
      sources: [],
    };
    (loadedPost as any).images = saved.images || [];
    (loadedPost as any).updatedAt = Date.now();

    setPost(loadedPost);
    setCurrentSavedId(saved.id);
    setTopic(saved.title);
    if (saved.platform) setPlatform(saved.platform as any);
    if (saved.targetAudience) setTargetAudience(saved.targetAudience);

    if (saved.profileId) {
      const matched = profiles.find((p) => p.id === saved.profileId);
      if (matched) {
        setCurrentProfile(matched);
      }
    }
  };

  if (viewMode === 'drive') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-100/70 overflow-y-auto">
        <BlogDriveHub
          onSelectProfile={handleSelectProfile}
          onDirectStart={handleDirectStart}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#f4f4f4] font-sans">
      {/* 1. 좌측 패널: 사진 관리 (업로드 & 설명) */}
      <PhotoUploadPanel
        photos={photos}
        onPhotosChange={setPhotos}
        onApplyTopic={setTopic}
        skillId={skillId}
        topic={topic}
        collapsed={leftCollapsed}
        onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
      />

      {/* 2. 메인 작업 공간: 네이버 스마트에디터 ONE AI 스튜디오 */}
      <NaverSmartEditorStudio
        skillId={skillId}
        onSkillChange={(s) => {
          setSkillId(s);
          setCustomFields({});
        }}
        platform={platform}
        onPlatformChange={setPlatform}
        topic={topic}
        onTopicChange={setTopic}
        targetAudience={targetAudience}
        onTargetAudienceChange={setTargetAudience}
        copyFormula={copyFormula}
        onCopyFormulaChange={setCopyFormula}
        tone={tone}
        onToneChange={setTone}
        requiredKeywords={requiredKeywords}
        onRequiredKeywordsChange={setRequiredKeywords}
        customFields={customFields}
        onCustomFieldsChange={setCustomFields}
        customInstructions={customInstructions}
        onCustomInstructionsChange={setCustomInstructions}
        post={post}
        onPostChange={setPost}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        photos={photos}
        photosCount={photos.length}
        onOpenAutoPilot={() => setAutoPilotOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        currentProfile={currentProfile}
        allProfiles={profiles}
        onSwitchProfile={handleSwitchProfile}
        onGoToDrive={() => setViewMode('drive')}
        onSaveAsProfileTemplate={currentProfile ? handleSaveAsProfileTemplate : undefined}
      />

      {/* 3. 보관함 모달 */}
      <BlogHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectPost={handleSelectHistoryPost}
        currentPostId={currentSavedId}
      />

      {/* 4. 오토파일럿 대량 생성 모달 */}
      <AutoPilotBatchModal
        open={autoPilotOpen}
        onOpenChange={setAutoPilotOpen}
        skillId={skillId}
        platform={platform}
        targetAudience={targetAudience}
        copyFormula={copyFormula}
        tone={tone}
        requiredKeywords={requiredKeywords}
        photos={photos}
        onBatchComplete={async () => {
          if (currentProfile?.id) {
            await incrementProfilePostCount(user, currentProfile.id);
            await loadProfiles();
          }
          setAutoPilotOpen(false);
          setHistoryOpen(true);
        }}
      />
    </div>
  );
}
