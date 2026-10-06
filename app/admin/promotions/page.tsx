'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GripVertical,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Search,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface BannerItem {
  id: string;
  order: number;
  title: string;
  previewTitle: string;
  previewSubtitle: string;
  gradient: string;
  iconText: string;
  period: string;
  status: 'ACTIVE' | 'INACTIVE';
  registeredAt: string;
}

export default function AdminPromotionsPage() {
  const [banners, setBanners] = useState<BannerItem[]>([
    {
      id: 'b-1',
      order: 1,
      title: '2025 AI 업무자동화 실전 특강 시리즈',
      previewTitle: '2025 AI 트렌드',
      previewSubtitle: '실전 자동화 특강',
      gradient: 'from-blue-600 to-indigo-700',
      iconText: '💎',
      period: '2025-05-01 00:00 ~ 2025-05-31 23:59',
      status: 'ACTIVE',
      registeredAt: '2025-04-25 14:30',
    },
    {
      id: 'b-2',
      order: 2,
      title: '신규 가입 얼리버드 혜택 - 수강료 20% 할인',
      previewTitle: '신규 가입 이벤트',
      previewSubtitle: '수강료 20% 할인!',
      gradient: 'from-emerald-500 to-teal-700',
      iconText: '🎁',
      period: '2025-05-10 00:00 ~ 2025-06-09 23:59',
      status: 'ACTIVE',
      registeredAt: '2025-05-08 09:15',
    },
    {
      id: 'b-3',
      order: 3,
      title: 'CEO 전용 AI 루틴 캘린더 모바일 콕핏 오픈',
      previewTitle: 'CEO 맞춤 콕핏',
      previewSubtitle: 'AI 루틴 캘린더',
      gradient: 'from-purple-600 to-pink-600',
      iconText: '👑',
      period: '2025-04-20 00:00 ~ 2025-06-30 23:59',
      status: 'ACTIVE',
      registeredAt: '2025-04-18 11:20',
    },
    {
      id: 'b-4',
      order: 4,
      title: '네이버 스마트에디터 ONE 서식 변환기 무료 배포',
      previewTitle: '스마트에디터 ONE',
      previewSubtitle: '원클릭 서식 변환',
      gradient: 'from-violet-600 to-purple-800',
      iconText: '🚀',
      period: '2025-05-15 00:00 ~ 2025-06-15 23:59',
      status: 'ACTIVE',
      registeredAt: '2025-05-14 16:40',
    },
    {
      id: 'b-5',
      order: 5,
      title: '추천 강의 패키지 3종 실습 번들 프로모션',
      previewTitle: '추천 강의 패키지',
      previewSubtitle: '지금 바로 확인하세요!',
      gradient: 'from-amber-500 to-orange-600',
      iconText: '📚',
      period: '2025-04-01 00:00 ~ 2025-05-31 23:59',
      status: 'ACTIVE',
      registeredAt: '2025-03-28 10:05',
    },
    {
      id: 'b-6',
      order: 6,
      title: '수강 후기 인증 이벤트 (스타벅스 쿠폰 증정)',
      previewTitle: '수강 인증 이벤트',
      previewSubtitle: '생생 후기 남기기',
      gradient: 'from-slate-900 to-slate-800',
      iconText: '📱',
      period: '2025-05-20 00:00 ~ 2025-06-20 23:59',
      status: 'ACTIVE',
      registeredAt: '2025-05-17 13:50',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleDelete = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success('배너가 삭제되었습니다.');
  };

  const handleToggleStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : b
      )
    );
    toast.success('배너 노출 상태가 변경되었습니다.');
  };

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Header matching Slide 2 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/admin" className="hover:text-blue-600 transition">관리자 콘솔</Link>
            <ChevronRight className="size-3" />
            <span>프로모션 관리</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">배너 관리</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            배너 관리
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            메인 화면에 노출되는 대표 배너를 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            미리보기
          </Link>
          <button
            type="button"
            onClick={() => toast.info('배너 신규 등록 창을 엽니다.')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
          >
            <Plus className="size-4" />
            <span>배너 등록</span>
          </button>
        </div>
      </div>

      {/* Filter Box matching Slide 2 */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
            >
              <option>전체</option>
              <option>ACTIVE (노출중)</option>
              <option>INACTIVE (숨김)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">기간</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                defaultValue="2025-05-01"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
              <span className="text-slate-400">~</span>
              <input
                type="date"
                defaultValue="2025-06-30"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">검색어</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="배너 제목을 입력하세요."
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => toast.info('검색이 완료되었습니다.')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Table matching Slide 2 */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            배너 목록 <span className="text-blue-600 font-extrabold">(총 {banners.length}건)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4 w-16 text-center">순서</th>
                <th className="py-3 px-4 w-48">미리보기</th>
                <th className="py-3 px-4">제목</th>
                <th className="py-3 px-4">노출 기간</th>
                <th className="py-3 px-4 w-24">상태</th>
                <th className="py-3 px-4 w-36">등록일</th>
                <th className="py-3 px-4 w-24 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  {/* Order with Drag Handle */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <GripVertical className="size-3.5 text-slate-400 cursor-grab" />
                      <span className="font-bold text-slate-800">{b.order}</span>
                    </div>
                  </td>

                  {/* Thumbnail Card matching Slide 2 preview shape */}
                  <td className="py-3 px-4">
                    <div
                      className={`h-12 w-44 rounded-xl bg-gradient-to-r ${b.gradient} p-2 text-white flex items-center justify-between shadow-2xs`}
                    >
                      <div className="leading-tight overflow-hidden pr-1">
                        <p className="text-[10px] font-black truncate">{b.previewTitle}</p>
                        <p className="text-[8px] opacity-80 truncate">{b.previewSubtitle}</p>
                      </div>
                      <span className="text-sm shrink-0">{b.iconText}</span>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                    {b.title}
                  </td>

                  {/* Period */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {b.period}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(b.id)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold cursor-pointer ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {b.status}
                    </button>
                  </td>

                  {/* Registered At */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {b.registeredAt}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => toast.info('배너 편집')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Slide 2 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <select className="rounded-lg border border-slate-200 px-2 py-1 bg-white text-xs">
            <option>10개씩 보기</option>
            <option>20개씩 보기</option>
          </select>

          <div className="flex items-center gap-1">
            <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-600">
              <ChevronLeft className="size-4" />
            </button>
            <span className="grid size-6 place-items-center rounded-lg bg-blue-600 text-white font-bold">
              1
            </span>
            <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-600">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <span className="font-mono text-slate-400">1 - {banners.length} of {banners.length}</span>
        </div>
      </div>
    </div>
  );
}
