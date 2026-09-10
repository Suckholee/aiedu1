'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  Plus,
  Search,
  Building2,
  Globe,
  User,
  Star,
  Layers,
  Sparkles,
  Zap,
  FileText,
  Clock,
  Filter,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Bookmark,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBlogProfiles,
  saveBlogProfile,
  deleteBlogProfile,
  toggleFavoriteProfile,
  type BlogProfile,
} from '@/lib/blog-automation/profile-storage';
import { BlogProfileCard } from './BlogProfileCard';
import { BlogProfileModal } from './BlogProfileModal';
import { toast } from 'sonner';

interface BlogDriveHubProps {
  onSelectProfile: (profile: BlogProfile) => void;
  onDirectStart: () => void;
}

type FilterTab = 'all' | 'client' | 'blog' | 'owner' | 'category' | 'favorite';

export function BlogDriveHub({ onSelectProfile, onDirectStart }: BlogDriveHubProps) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BlogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'posts' | 'name'>('updated');

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<BlogProfile | null>(null);

  // 프로필 로드
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const list = await getBlogProfiles(user);
      setProfiles(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [user]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalProfiles = profiles.length;
    const totalPosts = profiles.reduce((sum, p) => sum + (p.postsCount || 0), 0);
    const uniqueClients = new Set(profiles.map((p) => p.clientName).filter(Boolean)).size;
    const favoritesCount = profiles.filter((p) => p.favorite).length;

    const platformCounts: Record<string, number> = {};
    profiles.forEach((p) => {
      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
    });

    return { totalProfiles, totalPosts, uniqueClients, favoritesCount, platformCounts };
  }, [profiles]);

  // 유니크 필터 목록
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(profiles.map((p) => p.category).filter(Boolean)));
  }, [profiles]);

  const uniqueClientsList = useMemo(() => {
    return Array.from(new Set(profiles.map((p) => p.clientName).filter(Boolean)));
  }, [profiles]);

  const uniqueOwnersList = useMemo(() => {
    return Array.from(new Set(profiles.map((p) => p.ownerName).filter(Boolean)));
  }, [profiles]);

  // 필터링 및 정렬
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        // 탭별 1차 필터
        if (activeFilterTab === 'favorite' && !p.favorite) return false;
        if (activeFilterTab === 'category' && selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (activeFilterTab === 'client' && selectedClient !== 'all' && p.clientName !== selectedClient) return false;
        if (activeFilterTab === 'owner' && selectedOwner !== 'all' && p.ownerName !== selectedOwner) return false;

        // 검색어 필터
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchClient = p.clientName.toLowerCase().includes(q);
          const matchOwner = p.ownerName.toLowerCase().includes(q);
          const matchUrl = p.blogUrl.toLowerCase().includes(q) || (p.blogHandle || '').toLowerCase().includes(q);
          const matchKeywords = (p.requiredKeywords || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          return matchName || matchClient || matchOwner || matchUrl || matchKeywords || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'posts') return (b.postsCount || 0) - (a.postsCount || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
        // updated (기본: 즐겨찾기 우선 + 최신순)
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [profiles, activeFilterTab, selectedCategory, selectedClient, selectedOwner, searchQuery, sortBy]);

  // 프로필 추가/수정 저장
  const handleSaveProfile = async (profileData: Partial<BlogProfile> & { name: string }) => {
    const saved = await saveBlogProfile(user, profileData);
    await loadProfiles();
  };

  // 프로필 복제
  const handleDuplicate = async (profile: BlogProfile) => {
    const duplicated: Partial<BlogProfile> & { name: string } = {
      ...profile,
      id: undefined,
      name: `${profile.name} (사본)`,
      postsCount: 0,
      lastGeneratedAt: undefined,
      favorite: false,
    };
    await saveBlogProfile(user, duplicated);
    await loadProfiles();
    toast.success(`'${profile.name}' 프로필이 복제되었습니다.`);
  };

  // 프로필 삭제
  const handleDelete = async (profileId: string) => {
    if (!confirm('정말 이 블로그 프로필 템플릿을 삭제하시겠습니까?')) return;
    await deleteBlogProfile(user, profileId);
    await loadProfiles();
    toast.success('프로필이 삭제되었습니다.');
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async (profileId: string) => {
    await toggleFavoriteProfile(user, profileId);
    await loadProfiles();
  };

  return (
    <div className="min-h-full bg-slate-50/60 p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. 상단 헤더 & 빠른 액션 버튼 ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-lg">📂</span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              블로그 워크스페이스 드라이브
            </h1>
            <Badge variant="secondary" className="bg-blue-100/70 text-blue-700 font-semibold border-none ml-1 text-xs">
              맞춤 템플릿 허브
            </Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            고객사별, 블로그 주소별, 담당자별로 맞춤 템플릿을 세팅해두고 원클릭으로 맞춤형 AI 블로그 글을 자동 대량 생산하세요.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={onDirectStart}
            className="text-xs h-10 px-4 font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            기본 템플릿으로 바로 작성
          </Button>

          <Button
            onClick={() => {
              setProfileToEdit(null);
              setModalOpen(true);
            }}
            className="bg-[#0A84FF] hover:bg-blue-600 text-white text-xs h-10 px-4 font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            새 블로그 프로필 추가
          </Button>
        </div>
      </div>

      {/* ── 2. 통계 메트릭 바 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">등록된 블로그 프로필</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalProfiles}개</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">관리 고객사 / 브랜드</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.uniqueClients}곳</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">누적 AI 자동 생성 글</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.totalPosts}편</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">즐겨찾는 워크스페이스</p>
              <p className="text-2xl font-bold text-amber-500 mt-0.5">{stats.favoritesCount}개</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. 필터 탭 & 검색 & 정렬 바 ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 분류 탭 */}
          <Tabs
            value={activeFilterTab}
            onValueChange={(v) => {
              setActiveFilterTab(v as FilterTab);
              setSelectedCategory('all');
              setSelectedClient('all');
              setSelectedOwner('all');
            }}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
              <TabsTrigger value="all" className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs">
                전체 ({profiles.length})
              </TabsTrigger>
              <TabsTrigger value="client" className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                고객사별
              </TabsTrigger>
              <TabsTrigger value="blog" className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                블로그 주소별
              </TabsTrigger>
              <TabsTrigger value="owner" className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                사람/담당자별
              </TabsTrigger>
              <TabsTrigger value="category" className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                업종별
              </TabsTrigger>
              <TabsTrigger value="favorite" className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-xs flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                즐겨찾기
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 검색 & 정렬 */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로필, 고객사, URL, 키워드 검색..."
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-32 h-9 text-xs bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent className="bg-white text-xs">
                <SelectItem value="updated">최신 수정순</SelectItem>
                <SelectItem value="posts">생성 글 많은순</SelectItem>
                <SelectItem value="name">이름 가나다순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2차 서브 카테고리/고객사/담당자 필터 칩 */}
        {activeFilterTab === 'category' && uniqueCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 업종
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeFilterTab === 'client' && uniqueClientsList.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
            <button
              onClick={() => setSelectedClient('all')}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                selectedClient === 'all'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 고객사
            </button>
            {uniqueClientsList.map((client) => (
              <button
                key={client}
                onClick={() => setSelectedClient(client)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedClient === client
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏢 {client}
              </button>
            ))}
          </div>
        )}

        {activeFilterTab === 'owner' && uniqueOwnersList.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
            <button
              onClick={() => setSelectedOwner('all')}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                selectedOwner === 'all'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 담당자
            </button>
            {uniqueOwnersList.map((owner) => (
              <button
                key={owner}
                onClick={() => setSelectedOwner(owner)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedOwner === owner
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👤 {owner}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. 프로필 카드 그리드 ── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">블로그 워크스페이스 드라이브 불러오는 중...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-slate-800">일치하는 블로그 프로필이 없습니다</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            새로운 고객사 또는 블로그 프로필 템플릿을 등록하여 자동화를 시작해보세요.
          </p>
          <Button
            onClick={() => {
              setProfileToEdit(null);
              setModalOpen(true);
            }}
            className="mt-4 bg-[#0A84FF] hover:bg-blue-600 text-white text-xs h-9 px-4 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            새 블로그 프로필 생성
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProfiles.map((profile) => (
            <BlogProfileCard
              key={profile.id}
              profile={profile}
              onSelect={onSelectProfile}
              onEdit={(p) => {
                setProfileToEdit(p);
                setModalOpen(true);
              }}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* ── 5. 프로필 생성 / 편집 모달 ── */}
      <BlogProfileModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        profileToEdit={profileToEdit}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
