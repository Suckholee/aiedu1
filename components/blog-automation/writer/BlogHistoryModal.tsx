'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Search,
  Calendar,
  Trash2,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedBlogPosts, deleteSavedBlogPost, type SavedBlogPost } from '@/lib/blog-automation/storage';
import { toast } from 'sonner';

interface BlogHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPost: (post: SavedBlogPost) => void;
  currentPostId?: string;
}

export function BlogHistoryModal({
  open,
  onOpenChange,
  onSelectPost,
  currentPostId,
}: BlogHistoryModalProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SavedBlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<SavedBlogPost | null>(null);

  // 글 목록 로드
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getSavedBlogPosts(user);
      setPosts(data);
      if (data.length > 0 && !selectedPost) {
        setSelectedPost(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadPosts();
    }
  }, [open, user]);

  // 검색 필터링
  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // 삭제 처리
  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!confirm('정말 이 글을 보관함에서 삭제하시겠습니까?')) return;

    try {
      await deleteSavedBlogPost(user?.uid || 'guest', postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(posts.find((p) => p.id !== postId) || null);
      }
      toast.success('글이 삭제되었습니다.');
    } catch (err: any) {
      toast.error('삭제 실패: ' + err.message);
    }
  };

  // 날짜 포맷
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return `오늘 ${d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-white flex flex-col rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>계정별 생성 글 보관함</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold text-xs">
                  {posts.length}개 보관 중
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span>👤 {user?.email || '게스트 사용자'}</span>
                <span>• 언제든 이전 글을 불러와 크롬 확장으로 전송하거나 복사할 수 있습니다</span>
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-64 mr-6">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 본문, 태그 검색..."
              className="h-8 pl-8 text-xs bg-white border-slate-200"
            />
          </div>
        </DialogHeader>

        {/* Content Body: Left List + Right Preview */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left: Posts List */}
          <div className="w-2/5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/40">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 className="size-6 animate-spin text-blue-600" />
                <span className="text-xs font-medium">글 목록을 불러오는 중...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="size-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">생성된 글이 없습니다</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? '검색 결과가 없습니다.' : 'AI 블로그 글을 생성하면 이곳에 자동으로 체계적으로 보관됩니다.'}
                </p>
              </div>
            ) : (
              filteredPosts.map((p) => {
                const isSelected = selectedPost?.id === p.id;
                const isCurrent = currentPostId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPost(p)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(p.createdAt)}
                      </span>
                      <div className="flex items-center gap-1">
                        {isCurrent && (
                          <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">현재 글</Badge>
                        )}
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.charCount?.toLocaleString()}자
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, p.id)}
                          className="p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="삭제"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h4>

                    {(p.clientName || p.profileName || p.platform) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.clientName && (
                          <span className="text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.2 rounded">
                            🏢 {p.clientName}
                          </span>
                        )}
                        {p.profileName && !p.clientName && (
                          <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded">
                            📂 {p.profileName}
                          </span>
                        )}
                        {p.platform && (
                          <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase">
                            {p.platform}
                          </span>
                        )}
                      </div>
                    )}

                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.tags.slice(0, 3).map((t, ti) => (
                          <span
                            key={ti}
                            className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                        {p.tags.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{p.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Post Details & Actions */}
          <div className="w-3/5 flex flex-col bg-white overflow-hidden">
            {selectedPost ? (
              <>
                {/* Preview Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-bold text-blue-700 bg-blue-50 border-blue-200">
                      {selectedPost.platform === 'tistory' ? '🟠 티스토리 스타일' : '🟢 네이버 블로그 스타일'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      공백제외 <strong>{selectedPost.charCount?.toLocaleString()}</strong>자
                    </span>
                    {selectedPost.images && selectedPost.images.length > 0 && (
                      <span className="text-xs text-slate-500">
                        • 📷 사진 <strong>{selectedPost.images.length}</strong>장
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      onSelectPost(selectedPost);
                      onOpenChange(false);
                      toast.success('글이 결과물 화면에 로드되었습니다!');
                    }}
                    className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <span>⚡ 이 글 작업 패널로 불러오기</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>

                {/* Preview Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                      {selectedPost.title}
                    </h3>
                    {selectedPost.subtitle && (
                      <p className="text-xs text-blue-600 font-semibold mt-1">
                        Q. {selectedPost.subtitle}
                      </p>
                    )}
                  </div>

                  {selectedPost.excerpt && (
                    <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl">
                      <strong className="text-xs font-bold text-blue-800 block mb-1">📌 핵심 요약</strong>
                      <p className="text-xs text-blue-900 leading-relaxed">{selectedPost.excerpt}</p>
                    </div>
                  )}

                  <div className="prose prose-slate prose-sm max-w-none text-xs text-slate-700 leading-relaxed space-y-2.5 whitespace-pre-line border-t border-slate-100 pt-4">
                    {selectedPost.content}
                  </div>

                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {selectedPost.tags.map((t, ti) => (
                        <span
                          key={ti}
                          className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <FileText className="size-12 text-slate-200 mb-2" />
                <p className="text-xs">왼쪽 목록에서 글을 선택해 상세 내용을 확인하세요.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
