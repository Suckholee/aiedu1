'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  RotateCcw,
  RotateCw,
  Save,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCourseRegistrationPage() {
  const [courseName, setCourseName] = useState('실무 중심의 AI 업무자동화 마스터');
  const [courseCode, setCourseCode] = useState('AI-AUTO-2025-001');
  const [durationMinutes, setDurationMinutes] = useState('600');
  const [recommendedDays, setRecommendedDays] = useState('30');
  const [category, setCategory] = useState('직무 역량 > AI 업무자동화');
  const [level, setLevel] = useState('중급');
  const [objectives, setObjectives] = useState(
    '- 생성형 AI의 핵심 원리와 기업 맞춤형 프롬프트 설계를 이해하고 실무에 즉시 적용할 수 있다.\n- 음성 녹음본에서 5단 구조 보고서를 1분 만에 자동 추출하는 파이프라인을 구축할 수 있다.\n- 네이버 스마트에디터 ONE 서식 변환과 숏폼 영상 제작을 무인 자동화할 수 있다.'
  );
  const [description, setDescription] = useState(
    '본 과정은 실무자를 위한 생성형 AI 업무자동화 전 과정을 체계적으로 학습하고 실무에 적용할 수 있도록 구성되었습니다. 보고서 작성, 블로그 포스팅, 숏폼 영상 제작까지 실습과 사례 중심으로 학습합니다.'
  );

  const [curriculumList, setCurriculumList] = useState([
    {
      id: 1,
      title: '01. 과정 개요 및 AI 비즈니스 환경 이해',
      count: 2,
      subLessons: ['1-1. 과정 소개 및 학습 목표', '1-2. 업무 혁신 3대 실습실 가이드'],
    },
    {
      id: 2,
      title: '02. 클로드(Claude) 지식베이스 & 기획서 추출',
      count: 3,
      subLessons: ['2-1. 지식베이스 구축 원리', '2-2. 5단 보고서 프롬프트 체이닝', '2-3. 실전 사례 학습'],
    },
    {
      id: 3,
      title: '03. 네이버 블로그 스마트 옮겨쓰기 및 사진 드라이브',
      count: 3,
      subLessons: ['3-1. 스마트에디터 ONE 호환성', '3-2. HTML 자동 서식 인라인', '3-3. 사진 캡션 자동화'],
    },
    {
      id: 4,
      title: '04. VisKits 숏폼 영상 제작 및 종합 평가',
      count: 2,
      subLessons: ['4-1. 숏폼 대본/음성 합성 실습', '4-2. 최종 평가 및 수료식'],
    },
  ]);

  const handleSave = () => {
    toast.success('표준 교육과정이 성공적으로 저장되었습니다!');
  };

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Breadcrumb & Action Bar matching Slide 16 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/admin" className="hover:text-blue-600 transition">관리자 콘솔</Link>
            <ChevronRight className="size-3" />
            <span>과정 관리</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">표준 교육과정(마스터) 등록</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            표준 교육과정(마스터) 등록
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            표준 교육과정(마스터)을 등록하고 커리큘럼과 차시를 구성하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info('임시저장되었습니다.')}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            임시저장
          </button>
          <button
            type="button"
            onClick={() => toast.info('수강생 화면 미리보기를 실행합니다.')}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            미리보기
          </button>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
          >
            저장
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout matching Slide 16 */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* Left Column: 커리큘럼 구성 matching Slide 16 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">커리큘럼 구성</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                드래그 앤 드롭으로 순서를 변경할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info('새 커리큘럼 챕터를 추가합니다.')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
            >
              <Plus className="size-3.5" />
              <span>커리큘럼 추가</span>
            </button>
          </div>

          <div className="space-y-3">
            {curriculumList.map((cur) => (
              <div
                key={cur.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-2xs hover:border-blue-400 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-slate-400 cursor-grab" />
                    <span className="text-xs font-bold text-slate-900">{cur.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{cur.count}</span>
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub lessons list */}
                <div className="ml-6 space-y-1.5 border-l-2 border-slate-100 pl-3">
                  {cur.subLessons.map((sub, idx) => (
                    <p key={idx} className="text-[11px] text-slate-500 font-medium">
                      {sub}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>총 4개 커리큘럼, 10개 차시</span>
            <button
              type="button"
              className="text-blue-600 font-bold hover:underline"
            >
              전체 펼치기
            </button>
          </div>
        </div>

        {/* Right Column: 과정 정보 matching Slide 16 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900">과정 정보</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                과정명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {courseName.length} / 100
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                과정 코드 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {courseCode.length} / 50
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                이수 시간 (분) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 pr-8 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  분
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                권장 학습 기간 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={recommendedDays}
                  onChange={(e) => setRecommendedDays(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 pr-8 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  일
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                과정 분류 <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
              >
                <option>직무 역량 &gt; AI 업무자동화</option>
                <option>직무 역량 &gt; 데이터 사이언스</option>
                <option>직무 역량 &gt; 개발·백엔드</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                난이도 <span className="text-rose-500">*</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
              >
                <option>입문</option>
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
            </div>
          </div>

          {/* Thumbnail upload */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">과정 썸네일</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toast.info('이미지 업로드 창이 열립니다.')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <UploadCloud className="size-4 text-blue-600" />
                <span>이미지 업로드</span>
              </button>
              <span className="text-[11px] text-slate-400">
                권장 사이즈 1280*720px / JPG, PNG (최대 2MB)
              </span>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              학습 목표 <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 block text-right">
              {objectives.length} / 500
            </span>
          </div>

          {/* Rich Text Editor for Course Description matching Slide 16 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">과정 설명</label>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              {/* Rich editor toolbar */}
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/80 p-2 text-slate-600">
                <span className="text-xs font-semibold px-2">본문 v</span>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <Bold className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <Italic className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <Underline className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <Strikethrough className="size-3.5" />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <AlignLeft className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <AlignCenter className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <AlignRight className="size-3.5" />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <List className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <ListOrdered className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <LinkIcon className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <ImageIcon className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <Table className="size-3.5" />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <RotateCcw className="size-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-200">
                  <RotateCw className="size-3.5" />
                </button>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full p-3 text-xs sm:text-sm text-slate-800 focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 block text-right">
              {description.length} / 3000
            </span>
          </div>

          <div className="pt-2 text-[11px] text-blue-600 font-medium">
            • 수정된 내용이 있습니다. 저장하지 않으면 페이지를 벗어날 때 변경사항이 사라질 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
