'use client';

import React from 'react';
import {
  Star,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  User,
  Building2,
  Tag,
  Clock,
  FileText,
  Target,
  Zap,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BlogProfile } from '@/lib/blog-automation/profile-storage';
import { getSkillById } from '@/lib/blog-automation/blog-skills';

interface BlogProfileCardProps {
  profile: BlogProfile;
  onSelect: (profile: BlogProfile) => void;
  onEdit: (profile: BlogProfile) => void;
  onDuplicate: (profile: BlogProfile) => void;
  onDelete: (profileId: string) => void;
  onToggleFavorite: (profileId: string) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string; lightBg: string }> = {
  blue: { bg: 'bg-blue-600', border: 'hover:border-blue-400', badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600', lightBg: 'bg-blue-50/70' },
  amber: { bg: 'bg-amber-600', border: 'hover:border-amber-400', badge: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-600', lightBg: 'bg-amber-50/70' },
  emerald: { bg: 'bg-emerald-600', border: 'hover:border-emerald-400', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-600', lightBg: 'bg-emerald-50/70' },
  purple: { bg: 'bg-purple-600', border: 'hover:border-purple-400', badge: 'bg-purple-50 text-purple-800 border-purple-200', text: 'text-purple-600', lightBg: 'bg-purple-50/70' },
  rose: { bg: 'bg-rose-600', border: 'hover:border-rose-400', badge: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-600', lightBg: 'bg-rose-50/70' },
  cyan: { bg: 'bg-cyan-600', border: 'hover:border-cyan-400', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', text: 'text-cyan-600', lightBg: 'bg-cyan-50/70' },
  indigo: { bg: 'bg-indigo-600', border: 'hover:border-indigo-400', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', text: 'text-indigo-600', lightBg: 'bg-indigo-50/70' },
  slate: { bg: 'bg-slate-700', border: 'hover:border-slate-400', badge: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-700', lightBg: 'bg-slate-50' },
};

const PLATFORM_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  naver: { label: '네이버 블로그', bg: 'bg-[#03C75A]/10 border-[#03C75A]/30', text: 'text-[#03A348]' },
  tstory: { label: '티스토리', bg: 'bg-[#FF5A00]/10 border-[#FF5A00]/30', text: 'text-[#E04F00]' },
  tistory: { label: '티스토리', bg: 'bg-[#FF5A00]/10 border-[#FF5A00]/30', text: 'text-[#E04F00]' },
  velog: { label: '벨로그', bg: 'bg-[#20C997]/10 border-[#20C997]/30', text: 'text-[#12B886]' },
  wordpress: { label: '워드프레스', bg: 'bg-[#21759B]/10 border-[#21759B]/30', text: 'text-[#21759B]' },
};

const TONE_NAMES: Record<string, string> = {
  friendly: '😊 친근한',
  professional: '👔 전문적',
  casual: '✌️ 캐주얼',
  informative: '📖 정보형',
  persuasive: '💡 설득형',
};

function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return '생성 이력 없음';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function BlogProfileCard({
  profile,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: BlogProfileCardProps) {
  const theme = COLOR_MAP[profile.color] || COLOR_MAP.blue;
  const platform = PLATFORM_BADGE[profile.platform] || PLATFORM_BADGE.naver;
  const skill = getSkillById(profile.skillId);

  return (
    <Card
      className={`group relative flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${theme.border}`}
    >
      {/* 상단 액센트 바 */}
      <div className={`h-1.5 w-full ${theme.bg}`} />

      {/* 카드 본문 */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 아바타, 타이틀, 즐겨찾기 & 액션 메뉴 */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0 ${theme.lightBg} border border-slate-200/60`}
              >
                {profile.avatarEmoji || '📝'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                    {profile.name}
                  </h3>
                </div>
                {profile.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{profile.description}</p>
                )}
              </div>
            </div>

            {/* 즐겨찾기 & 메뉴 드롭다운 */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(profile.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  profile.favorite
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-300 hover:text-slate-500'
                }`}
                title={profile.favorite ? '즐겨찾기 해제' : '즐겨찾기 등록'}
              >
                <Star className={`w-4 h-4 ${profile.favorite ? 'fill-amber-400' : ''}`} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(profile);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    템플릿 설정 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(profile);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Copy className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    프로필 복제
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(profile.id);
                    }}
                    className="cursor-pointer text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    프로필 삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 고객사 & 사람/담당자 & 블로그 주소 뱃지 정보 */}
          <div className="space-y-1.5 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 mb-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 flex items-center gap-1 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                고객/브랜드
              </span>
              <span className="font-semibold text-slate-800 truncate">
                {profile.clientName || '미지정'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 flex items-center gap-1 shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400" />
                담당/페르소나
              </span>
              <span className="font-medium text-slate-700 truncate">
                {profile.ownerName || '공용 작성'}
              </span>
            </div>

            {profile.blogUrl && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  블로그
                </span>
                <a
                  href={profile.blogUrl.startsWith('http') ? profile.blogUrl : `https://${profile.blogUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 truncate max-w-[190px] font-mono text-[11px]"
                >
                  {profile.blogHandle ? `@${profile.blogHandle}` : profile.blogUrl.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                </a>
              </div>
            )}
          </div>

          {/* 사전 맞춤 세팅 태그 (스킬, 플랫폼, 톤, 카피라이팅) */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="outline" className={`text-[11px] font-semibold py-0.5 px-2 ${platform.bg} ${platform.text}`}>
              {platform.label}
            </Badge>

            <Badge variant="outline" className="text-[11px] bg-slate-100/90 text-slate-700 border-slate-200 py-0.5 px-2">
              {skill.emoji} {skill.name}
            </Badge>

            <Badge variant="outline" className="text-[11px] bg-white text-slate-600 border-slate-200 py-0.5 px-2">
              {TONE_NAMES[profile.tone] || profile.tone}
            </Badge>

            {profile.copyFormula && profile.copyFormula !== 'auto' && (
              <Badge variant="outline" className="text-[11px] bg-purple-50 text-purple-700 border-purple-200 py-0.5 px-2">
                <Zap className="w-3 h-3 mr-0.5" />
                {profile.copyFormula} 공식
              </Badge>
            )}
          </div>

          {/* 타겟 오디언스 및 필수 키워드 미리보기 */}
          <div className="space-y-1 text-xs text-slate-600 mb-3 bg-white">
            {profile.targetAudience && (
              <div className="flex items-start gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1 text-slate-600">
                  <strong className="text-slate-700 font-medium">타겟:</strong> {profile.targetAudience}
                </span>
              </div>
            )}
            {profile.requiredKeywords && (
              <div className="flex items-start gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1 text-slate-600">
                  <strong className="text-slate-700 font-medium">키워드:</strong> {profile.requiredKeywords}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 하단 통계 & 글 작성 진입 버튼 */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              누적 생성 <span className="font-bold text-slate-800">{profile.postsCount || 0}</span>편
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-slate-300" />
              {formatTimeAgo(profile.lastGeneratedAt)}
            </span>
          </div>

          <Button
            onClick={() => onSelect(profile)}
            className="w-full bg-[#0A84FF] hover:bg-blue-600 text-white font-semibold text-xs py-2 h-9 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all group-hover:shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            이 템플릿으로 글 작성하기
          </Button>
        </div>
      </div>
    </Card>
  );
}
