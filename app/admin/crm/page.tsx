'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Tag,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentCRMRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  stage: '결제완료' | '상담중' | '신청대기' | '수료';
  interest: string;
  lastContact: string;
  assignedTo: string;
  todo?: string;
  consultationHistory: {
    date: string;
    channel: '전화' | '카카오톡' | '이메일';
    summary: string;
  }[];
}

export default function AdminCRMPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('전체');

  const [students, setStudents] = useState<StudentCRMRecord[]>([
    {
      id: 'crm-1',
      name: '김수강',
      phone: '010-1234-5678',
      email: 'student.kim@example.com',
      company: '핀테크 솔루션즈',
      stage: '결제완료',
      interest: 'AI 업무자동화 (보고서/클로드)',
      lastContact: '2025-05-19 14:20',
      assignedTo: '조영빈 매니저',
      todo: '1주차 과제 제출 여부 확인',
      consultationHistory: [
        { date: '2025-05-19', channel: '카카오톡', summary: '클로드 Pro 요금제 연동 문의 안내 완료' },
        { date: '2025-05-10', channel: '전화', summary: '1기 얼리버드 수강 신청 및 좌석 선점 확정' },
      ],
    },
    {
      id: 'crm-2',
      name: '곽성진',
      phone: '010-9876-5432',
      email: 'ceo.kwak@example.com',
      company: '비노글라스 / 르글라스',
      stage: '결제완료',
      interest: 'AI 루틴 캘린더 CEO 콕핏',
      lastContact: '2025-05-18 11:30',
      assignedTo: '이석호 대표',
      todo: '모바일 1초 승인 덱 커스텀 프롬프트 세팅 지원',
      consultationHistory: [
        { date: '2025-05-18', channel: '전화', summary: 'CEO 전용 콕핏 매장별 자동화 브리핑 진행' },
      ],
    },
    {
      id: 'crm-3',
      name: '이지은',
      phone: '010-3344-5566',
      email: 'jieun.lee@luxheaven.kr',
      company: '럭스헤븐',
      stage: '상담중',
      interest: '네이버 블로그 스마트 옮겨쓰기',
      lastContact: '2025-05-20 09:15',
      assignedTo: '박재범 매니저',
      todo: '단체 할인 20% 견적서 송부',
      consultationHistory: [
        { date: '2025-05-20', channel: '이메일', summary: '마케팅팀 5인 단체 수강 세금계산서 문의' },
      ],
    },
    {
      id: 'crm-4',
      name: '최민준',
      phone: '010-7788-9900',
      email: 'minjun.choi@techbridge.co',
      company: '테크브릿지',
      stage: '신청대기',
      interest: 'VisKits 숏폼 영상 제작',
      lastContact: '2025-05-17 16:50',
      assignedTo: '조영빈 매니저',
      consultationHistory: [
        { date: '2025-05-17', channel: '카카오톡', summary: '선착순 좌석 오픈 알림 신청' },
      ],
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<StudentCRMRecord>(students[0]);

  const filtered = students.filter((s) => {
    const matchStage = selectedStage === '전체' || s.stage === selectedStage;
    const matchQuery =
      s.name.includes(searchQuery) ||
      s.email.includes(searchQuery) ||
      (s.company && s.company.includes(searchQuery)) ||
      s.interest.includes(searchQuery);
    return matchStage && matchQuery;
  });

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Header matching Slide 51 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/admin" className="hover:text-blue-600 transition">관리자 콘솔</Link>
            <ChevronRight className="size-3" />
            <span>수강생 관리</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">수강생 CRM &amp; 상담</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            수강생 CRM 및 상담 관리
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            문의 고객과 수강생의 상담 이력, 수강 단계, To-do 업무를 통합 관리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.info('신규 수강생/상담 등록 창을 엽니다.')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-200 transition"
        >
          <Plus className="size-4" />
          <span>신규 상담 등록</span>
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['전체', '결제완료', '상담중', '신청대기', '수료'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStage(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedStage === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 이메일, 소속 검색"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main 2-Column CRM view matching Slide 52 & 53 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Left: Customer List Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              고객 목록 <span className="text-blue-600 font-extrabold">(총 {filtered.length}명)</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((std) => {
              const isSelected = selectedStudent.id === std.id;

              return (
                <div
                  key={std.id}
                  onClick={() => setSelectedStudent(std)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/50 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                      {std.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {std.name}
                        </span>
                        {std.company && (
                          <span className="text-[11px] text-slate-500">({std.company})</span>
                        )}
                        <span
                          className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                            std.stage === '결제완료'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : std.stage === '상담중'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {std.stage}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                        {std.interest}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <span className="block font-medium text-slate-600">
                      담당: {std.assignedTo}
                    </span>
                    <span className="font-mono">{std.lastContact.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Customer Detail & Consultation History matching Slide 53 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {selectedStudent.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedStudent.company} • {selectedStudent.email}
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                selectedStudent.stage === '결제완료'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {selectedStudent.stage}
            </span>
          </div>

          {/* Quick contact buttons */}
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => toast.info(`${selectedStudent.phone} 번호로 전화 연결`)}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <Phone className="size-3.5 text-emerald-600" />
              <span>전화</span>
            </button>
            <button
              type="button"
              onClick={() => toast.info('카카오톡 알림톡 발송 모달')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <MessageCircle className="size-3.5 text-amber-500" />
              <span>알림톡</span>
            </button>
            <button
              type="button"
              onClick={() => toast.info(`${selectedStudent.email} 메일 작성`)}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <Mail className="size-3.5 text-blue-600" />
              <span>이메일</span>
            </button>
          </div>

          {/* To-Do Follow-up task matching Slide 55 */}
          {selectedStudent.todo && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="size-3.5 text-amber-600" />
                <span>후속 업무 (To-do)</span>
              </div>
              <p className="text-amber-800 leading-relaxed">{selectedStudent.todo}</p>
            </div>
          )}

          {/* Consultation History Log matching Slide 53 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">상담 이력 ({selectedStudent.consultationHistory.length})</h4>
              <button
                type="button"
                onClick={() => toast.info('상담 이력 추가 모달')}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                + 이력 추가
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedStudent.consultationHistory.map((h, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">[{h.channel}] 상담</span>
                    <span className="font-mono text-[10px] text-slate-400">{h.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{h.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
