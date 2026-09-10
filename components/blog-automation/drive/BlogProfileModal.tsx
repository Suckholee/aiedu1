'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BLOG_SKILLS,
  getSkillById,
  type BlogSkillId,
  type BlogPlatform,
} from '@/lib/blog-automation/blog-skills';
import type { BlogCopyFormula, BlogTone } from '@/lib/blog-automation/types';
import type { BlogProfile } from '@/lib/blog-automation/profile-storage';
import {
  Sparkles,
  Building2,
  User,
  Globe,
  Tag,
  Target,
  Zap,
  BookOpen,
  MapPin,
  Clock,
  Phone,
  Car,
  FileCode,
  Loader2,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface BlogProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileToEdit?: BlogProfile | null;
  onSave: (profileData: Partial<BlogProfile> & { name: string }) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  '병원/의료',
  '음식점/카페',
  '부동산',
  'IT/앱서비스',
  '뷰티/미용',
  '학원/교육',
  '법률/세무',
  '제품/상품리뷰',
  '여행/숙박',
  '개인브랜딩',
  '금융/재테크',
  '일반/자유',
];

const EMOJI_OPTIONS = ['🏥', '🥐', '💻', '🏠', '💇‍♀️', '📚', '⚖️', '📦', '✈️', '📈', '☕', '🎨', '✨', '📝'];

const COLOR_OPTIONS = [
  { value: 'blue', label: '블루', bg: 'bg-blue-600' },
  { value: 'amber', label: '앰버', bg: 'bg-amber-600' },
  { value: 'emerald', label: '에메랄드', bg: 'bg-emerald-600' },
  { value: 'purple', label: '퍼플', bg: 'bg-purple-600' },
  { value: 'rose', label: '로즈', bg: 'bg-rose-600' },
  { value: 'cyan', label: '시안', bg: 'bg-cyan-600' },
  { value: 'indigo', label: '인디고', bg: 'bg-indigo-600' },
  { value: 'slate', label: '슬레이트', bg: 'bg-slate-700' },
];

const TONE_OPTIONS: { value: BlogTone; label: string; emoji: string }[] = [
  { value: 'friendly', label: '친근한 (~해요, 친절한 어조)', emoji: '😊' },
  { value: 'professional', label: '전문적 (정중한 경어, 신뢰성)', emoji: '👔' },
  { value: 'casual', label: '캐주얼 (편안한 대화체)', emoji: '✌️' },
  { value: 'informative', label: '정보형 (명확한 핵심 요약)', emoji: '📖' },
  { value: 'persuasive', label: '설득형 (공감 유도 및 강한 CTA)', emoji: '💡' },
];

const COPY_FORMULA_OPTIONS: { value: BlogCopyFormula; label: string; desc: string }[] = [
  { value: 'auto', label: '자동 추천', desc: '스킬 기본값' },
  { value: 'PAS', label: 'PAS 공식', desc: '문제 → 자극 → 해결' },
  { value: 'AIDA', label: 'AIDA 공식', desc: '주의 → 관심 → 욕구 → 행동' },
  { value: 'BAB', label: 'BAB 공식', desc: '이전 → 이후 → 연결' },
  { value: 'FAB', label: 'FAB 공식', desc: '기능 → 장점 → 혜택' },
];

const AUDIENCE_PRESETS = [
  '2030 여성',
  '3040 직장인',
  '지역 주민/단골',
  '자영업/소상공인',
  '스타트업/개발자',
  '내집마련 실수요자',
  '학부모/수험생',
  '시니어/실버세대',
];

export function BlogProfileModal({
  open,
  onOpenChange,
  profileToEdit,
  onSave,
}: BlogProfileModalProps) {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [blogHandle, setBlogHandle] = useState('');
  const [category, setCategory] = useState('병원/의료');
  const [description, setDescription] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🏥');
  const [color, setColor] = useState('blue');

  // AI 템플릿 세팅
  const [platform, setPlatform] = useState<BlogPlatform>('naver');
  const [skillId, setSkillId] = useState<BlogSkillId>('medical');
  const [tone, setTone] = useState<BlogTone>('professional');
  const [copyFormula, setCopyFormula] = useState<BlogCopyFormula>('PAS');
  const [targetAudience, setTargetAudience] = useState('');
  const [requiredKeywords, setRequiredKeywords] = useState('');

  // 업체 상세 정보
  const [location, setLocation] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [phone, setPhone] = useState('');
  const [parking, setParking] = useState('');
  const [features, setFeatures] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [photoCategory, setPhotoCategory] = useState('전체');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'ai' | 'biz'>('basic');

  useEffect(() => {
    if (profileToEdit) {
      setName(profileToEdit.name || '');
      setClientName(profileToEdit.clientName || '');
      setOwnerName(profileToEdit.ownerName || '');
      setBlogUrl(profileToEdit.blogUrl || '');
      setBlogHandle(profileToEdit.blogHandle || '');
      setCategory(profileToEdit.category || '병원/의료');
      setDescription(profileToEdit.description || '');
      setAvatarEmoji(profileToEdit.avatarEmoji || '🏥');
      setColor(profileToEdit.color || 'blue');
      setPlatform(profileToEdit.platform || 'naver');
      setSkillId(profileToEdit.skillId || 'medical');
      setTone(profileToEdit.tone || 'professional');
      setCopyFormula(profileToEdit.copyFormula || 'PAS');
      setTargetAudience(profileToEdit.targetAudience || '');
      setRequiredKeywords(profileToEdit.requiredKeywords || '');

      const cf = profileToEdit.customFields || {};
      setLocation(cf.location || '');
      setBusinessHours(cf.businessHours || '');
      setPhone(cf.phone || '');
      setParking(cf.parking || '');
      setFeatures(cf.features || cf.signatureMenu || cf.specialty || cf.doctorIntro || '');
      setCustomInstructions(profileToEdit.customInstructions || '');
      setPhotoCategory(profileToEdit.photoCategory || '전체');
    } else {
      setName('');
      setClientName('');
      setOwnerName('');
      setBlogUrl('');
      setBlogHandle('');
      setCategory('음식점/카페');
      setDescription('');
      setAvatarEmoji('🥐');
      setColor('amber');
      setPlatform('naver');
      setSkillId('restaurant');
      setTone('friendly');
      setCopyFormula('AIDA');
      setTargetAudience('2030 직장인 및 미식가');
      setRequiredKeywords('');
      setLocation('');
      setBusinessHours('');
      setPhone('');
      setParking('');
      setFeatures('');
      setCustomInstructions('');
      setPhotoCategory('전체');
    }
    setActiveTab('basic');
  }, [profileToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('프로필명을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const customFields: Record<string, string> = {};
      if (location.trim()) customFields.location = location.trim();
      if (businessHours.trim()) customFields.businessHours = businessHours.trim();
      if (phone.trim()) customFields.phone = phone.trim();
      if (parking.trim()) customFields.parking = parking.trim();
      if (features.trim()) customFields.features = features.trim();

      await onSave({
        id: profileToEdit?.id,
        name: name.trim(),
        clientName: clientName.trim(),
        ownerName: ownerName.trim(),
        blogUrl: blogUrl.trim(),
        blogHandle: blogHandle.trim(),
        category,
        description: description.trim(),
        avatarEmoji,
        color,
        platform,
        skillId,
        tone,
        copyFormula,
        targetAudience: targetAudience.trim(),
        requiredKeywords: requiredKeywords.trim(),
        customFields,
        customInstructions: customInstructions.trim(),
        photoCategory,
      });

      toast.success(profileToEdit ? '블로그 프로필 템플릿이 수정되었습니다.' : '새 블로그 프로필 템플릿이 생성되었습니다!');
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              {avatarEmoji}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {profileToEdit ? '블로그 맞춤 프로필 템플릿 편집' : '새 블로그 맞춤 프로필 추가'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                고객사별, 블로그 주소별 맞춤 템플릿을 등록하여 고품질 글을 원클릭으로 대량 생산하세요.
              </DialogDescription>
            </div>
          </div>

          {/* 탭 버튼 */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'basic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1. 기본 정보 & 식별
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2. AI 맞춤 템플릿 (스킬/톤/키워드)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('biz')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'biz'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              3. 매장/업체 상세 & 시스템 지침
            </button>
          </div>
        </DialogHeader>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* 프로필명 & 업종 분류 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">프로필/워크스페이스명 *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 강남 미소치과 공식 블로그"
                    className="mt-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">업종 카테고리</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1 text-sm bg-white">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-56">
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 고객사/브랜드명 & 사람/담당자명 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    고객사 / 브랜드명
                  </Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="예: 미소덴탈의료재단, 달콤F&B"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    사람 / 작성자 / 담당자
                  </Label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="예: 김대표원장, 홍길동 마케터"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* 블로그 URL & 아이디 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    블로그 전체 주소 (URL)
                  </Label>
                  <Input
                    value={blogUrl}
                    onChange={(e) => setBlogUrl(e.target.value)}
                    placeholder="https://blog.naver.com/misodental"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">블로그 ID / 핸들</Label>
                  <Input
                    value={blogHandle}
                    onChange={(e) => setBlogHandle(e.target.value)}
                    placeholder="misodental"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
              </div>

              {/* 한줄 설명 */}
              <div>
                <Label className="text-xs font-semibold text-slate-700">프로필 요약 설명</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 임플란트 및 심미보철 1:1 맞춤 진료 전문 블로그"
                  className="mt-1 text-sm"
                />
              </div>

              {/* 아이콘 이모지 & 테마 색상 선택 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">아이콘 이모지</Label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                          avatarEmoji === emoji
                            ? 'bg-blue-600 text-white shadow-xs scale-110'
                            : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">카드 테마 색상</Label>
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {COLOR_OPTIONS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setColor(col.value)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${col.bg} ${
                          color === col.value ? 'ring-2 ring-offset-2 ring-slate-800 scale-105' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              {/* 플랫폼 & 블로그 스킬 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">기본 발행 플랫폼</Label>
                  <Select value={platform} onValueChange={(v) => setPlatform(v as BlogPlatform)}>
                    <SelectTrigger className="mt-1 text-sm bg-white">
                      <SelectValue placeholder="플랫폼 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="naver">네이버 블로그 (스마트에디터)</SelectItem>
                      <SelectItem value="tstory">티스토리 블로그</SelectItem>
                      <SelectItem value="wordpress">워드프레스 (SEO 표준)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">기본 블로그 AI 스킬 ({BLOG_SKILLS.length}종)</Label>
                  <Select value={skillId} onValueChange={(v) => setSkillId(v as BlogSkillId)}>
                    <SelectTrigger className="mt-1 text-sm bg-white">
                      <SelectValue placeholder="스킬 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-56">
                      {BLOG_SKILLS.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.emoji} {s.name} ({s.copywritingFormula})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 톤앤매너 & 카피라이팅 공식 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-green-500" />
                    기본 톤앤매너
                  </Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as BlogTone)}>
                    <SelectTrigger className="mt-1 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {TONE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">
                          {t.emoji} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    카피라이팅 공식
                  </Label>
                  <Select value={copyFormula} onValueChange={(v) => setCopyFormula(v as BlogCopyFormula)}>
                    <SelectTrigger className="mt-1 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {COPY_FORMULA_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-xs">
                          {c.label} ({c.desc})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 타겟 오디언스 */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                  타겟 오디언스 (잠재 고객층)
                </Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예: 강남 인근 30~50대 직장인 및 안심 진료 희망 환자"
                  className="mt-1 text-sm"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {AUDIENCE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setTargetAudience(targetAudience ? `${targetAudience}, ${preset}` : preset)
                      }
                      className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 필수 키워드 & 해시태그 */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  기본 필수 키워드 & 브랜드 해시태그 (쉼표로 구분)
                </Label>
                <Input
                  value={requiredKeywords}
                  onChange={(e) => setRequiredKeywords(e.target.value)}
                  placeholder="예: 강남역치과, 강남임플란트, 야간진료치과, 센트럴치과"
                  className="mt-1 text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  글 생성 시 본문 및 소제목에 자연스럽게 우선 배치되고 태그로 자동 등록됩니다.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'biz' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800">
                💡 여기에 등록된 매장/업체 정보는 AI가 글을 쓸 때 <strong>방문 안내, 위치 설명, 오시는 길, 상담 문의</strong> 섹션에 정확하게 반영됩니다.
              </div>

              {/* 위치 & 영업시간 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    매장/업체 위치 & 오시는 길
                  </Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 강남역 11번 출구 도보 2분 (글라스타워 5층)"
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    영업시간 / 진료시간
                  </Label>
                  <Input
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="예: 평일 09:30~20:30 (화/목 야간진료)"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* 전화번호 & 주차 안내 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    대표 연락처 / 예약 전화
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="예: 02-555-2875"
                    className="mt-1 text-sm font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-blue-500" />
                    주차 지원 / 편의시설
                  </Label>
                  <Input
                    value={parking}
                    onChange={(e) => setParking(e.target.value)}
                    placeholder="예: 건물 내 지하 2시간 무료 주차"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* 주요 특장점 / 시그니처 / 원장 소개 */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  핵심 특장점 / 시그니처 메뉴 / 원장 전문의 소개
                </Label>
                <Textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="예: 보건복지부 인증 구강악안면외과 전문의 1:1 책임진료, 3D 디지털 네비게이션 임플란트 장비 보유"
                  rows={2}
                  className="mt-1 text-sm"
                />
              </div>

              {/* AI 전용 맞춤 시스템 지침 (Custom Instructions) */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-slate-600" />
                  AI 전용 특별 프롬프트 지침 (금지어, 강조 문구 등)
                </Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="예: 과도한 과장 표현 지양, 환자의 불안감을 덜어주는 신뢰감 있는 문체 유지, 지도 첨부 안내 문구 필수 포함"
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              * 언제든지 3패널 작성기 내에서도 템플릿 값을 갱신할 수 있습니다.
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs h-9">
                취소
              </Button>
              <Button
                type="submit"
                disabled={saving || !name.trim()}
                className="bg-[#0A84FF] hover:bg-blue-600 text-white text-xs h-9 px-4 font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                {profileToEdit ? '템플릿 저장 완료' : '새 프로필 등록하기'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
