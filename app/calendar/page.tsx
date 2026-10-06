'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  List,
  Grid,
  Bell,
  Play,
  Share2,
  MoreVertical,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  CALENDAR_EVENTS,
  CalendarEvent,
  EVENT_TYPE_CONFIG,
  EventType,
} from '@/data/calendar-events';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [currentYearMonth, setCurrentYearMonth] = useState('2025.05');
  const [selectedDate, setSelectedDate] = useState('2025-05-21');
  const [viewMode, setViewMode] = useState<'monthly' | 'list'>('monthly');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Days in May 2025 (May 1st is Thursday)
  // Calendar row 1: Apr 27, 28, 29, 30, May 1, 2, 3
  const calendarDays = [
    { day: 27, isCurrentMonth: false, date: '2025-04-27' },
    { day: 28, isCurrentMonth: false, date: '2025-04-28' },
    { day: 29, isCurrentMonth: false, date: '2025-04-29' },
    { day: 30, isCurrentMonth: false, date: '2025-04-30' },
    { day: 1, isCurrentMonth: true, date: '2025-05-01' },
    { day: 2, isCurrentMonth: true, date: '2025-05-02' },
    { day: 3, isCurrentMonth: true, date: '2025-05-03' },

    { day: 4, isCurrentMonth: true, date: '2025-05-04' },
    { day: 5, isCurrentMonth: true, date: '2025-05-05' },
    { day: 6, isCurrentMonth: true, date: '2025-05-06' },
    { day: 7, isCurrentMonth: true, date: '2025-05-07' },
    { day: 8, isCurrentMonth: true, date: '2025-05-08' },
    { day: 9, isCurrentMonth: true, date: '2025-05-09' },
    { day: 10, isCurrentMonth: true, date: '2025-05-10' },

    { day: 11, isCurrentMonth: true, date: '2025-05-11' },
    { day: 12, isCurrentMonth: true, date: '2025-05-12' },
    { day: 13, isCurrentMonth: true, date: '2025-05-13' },
    { day: 14, isCurrentMonth: true, date: '2025-05-14' },
    { day: 15, isCurrentMonth: true, date: '2025-05-15' },
    { day: 16, isCurrentMonth: true, date: '2025-05-16' },
    { day: 17, isCurrentMonth: true, date: '2025-05-17' },

    { day: 18, isCurrentMonth: true, date: '2025-05-18' },
    { day: 19, isCurrentMonth: true, date: '2025-05-19' },
    { day: 20, isCurrentMonth: true, date: '2025-05-20' },
    { day: 21, isCurrentMonth: true, date: '2025-05-21' },
    { day: 22, isCurrentMonth: true, date: '2025-05-22' },
    { day: 23, isCurrentMonth: true, date: '2025-05-23' },
    { day: 24, isCurrentMonth: true, date: '2025-05-24' },

    { day: 25, isCurrentMonth: true, date: '2025-05-25' },
    { day: 26, isCurrentMonth: true, date: '2025-05-26' },
    { day: 27, isCurrentMonth: true, date: '2025-05-27' },
    { day: 28, isCurrentMonth: true, date: '2025-05-28' },
    { day: 29, isCurrentMonth: true, date: '2025-05-29' },
    { day: 30, isCurrentMonth: true, date: '2025-05-30' },
    { day: 31, isCurrentMonth: true, date: '2025-05-31' },

    { day: 1, isCurrentMonth: false, date: '2025-06-01' },
    { day: 2, isCurrentMonth: false, date: '2025-06-02' },
    { day: 3, isCurrentMonth: false, date: '2025-06-03' },
    { day: 4, isCurrentMonth: false, date: '2025-06-04' },
    { day: 5, isCurrentMonth: false, date: '2025-06-05' },
    { day: 6, isCurrentMonth: false, date: '2025-06-06' },
    { day: 7, isCurrentMonth: false, date: '2025-06-07' },
  ];

  const getEventsForDate = (dateStr: string) => {
    return CALENDAR_EVENTS.filter((e) => e.date === dateStr);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const nextDayEvents = getEventsForDate('2025-05-22');

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Header matching Slide 24 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            전체 강의 일정
          </h1>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 transition"
            title="일정 안내"
          >
            <Info className="size-4" />
          </button>
        </div>

        {/* Calendar Nav Controls matching Slide 24 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => toast.info('이전 달로 이동합니다.')}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.info('다음 달로 이동합니다.')}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 shadow-2xs">
            <span>{currentYearMonth}</span>
            <CalendarIcon className="size-4 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() => setSelectedDate('2025-05-21')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            오늘
          </button>

          {/* View toggle (Monthly / List) matching Slide 24 */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="size-3.5" />
              <span>Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="size-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => toast.info('필터 설정 패널을 엽니다.')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Filter className="size-3.5 text-slate-500" />
            <span>필터</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Calendar & Day Detail Layout matching Slide 24 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Left Column: Monthly Calendar Grid matching Slide 24 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold py-2 border-b border-slate-100">
            <span className="text-rose-500">일</span>
            <span className="text-slate-700">월</span>
            <span className="text-slate-700">화</span>
            <span className="text-slate-700">수</span>
            <span className="text-slate-700">목</span>
            <span className="text-slate-700">금</span>
            <span className="text-blue-500">토</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((item, idx) => {
              const isSelected = selectedDate === item.date;
              const events = getEventsForDate(item.date);
              const isSunday = idx % 7 === 0;
              const isSaturday = idx % 7 === 6;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(item.date)}
                  className={`min-h-[78px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/20'
                      : item.isCurrentMonth
                      ? 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      : 'border-transparent bg-slate-50/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'grid size-6 place-items-center rounded-full bg-blue-600 text-white font-black'
                          : !item.isCurrentMonth
                          ? 'text-slate-300'
                          : isSunday
                          ? 'text-rose-500'
                          : isSaturday
                          ? 'text-blue-500'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>

                  {/* Events inside calendar cell matching Slide 24 */}
                  <div className="space-y-1 mt-1">
                    {events.slice(0, 2).map((ev) => {
                      const conf = EVENT_TYPE_CONFIG[ev.type];
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1 text-[10px] leading-tight truncate"
                        >
                          <span className={`size-1.5 rounded-full shrink-0 ${conf.dot}`} />
                          <span className="text-slate-600 truncate font-medium hidden sm:inline">
                            {ev.type === 'vod'
                              ? 'VOD'
                              : ev.type === 'live'
                              ? '라이브'
                              : ev.type === 'offline'
                              ? '오프라인'
                              : ev.type === 'deadline'
                              ? '과제 마감'
                              : '시험'}
                          </span>
                        </div>
                      );
                    })}
                    {events.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block">
                        +{events.length - 2}개
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Legend matching Slide 24 */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((typeKey) => {
              const conf = EVENT_TYPE_CONFIG[typeKey];
              return (
                <div key={typeKey} className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${conf.dot}`} />
                  <span>{conf.label}</span>
                </div>
              );
            })}
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 transition"
            >
              +3개 더 보기
            </button>
          </div>
        </div>

        {/* Right Column: Daily Schedule Drawer matching Slide 24 */}
        <div className="space-y-6">
          {/* Day 1 Section: Selected Date */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {selectedDate} (수)
              </h3>
              <span className="text-xs font-bold text-slate-400">
                총 {selectedDateEvents.length}건
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                등록된 일정이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((ev) => {
                  const conf = EVENT_TYPE_CONFIG[ev.type];

                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 hover:border-slate-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {ev.startTime} ~ {ev.endTime}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                          >
                            {conf.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {ev.status === '학습 중' ? (
                            <button
                              type="button"
                              onClick={() => toast.info('강의실로 이동합니다.')}
                              className="grid size-6 place-items-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                              title="학습 계속하기"
                            >
                              <Play className="size-3 fill-white ml-0.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toast.success('일정 알림이 등록되었습니다.')}
                              className="p-1 rounded text-slate-400 hover:text-slate-600"
                              title="알림 받기"
                            >
                              <Bell className="size-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="p-1 rounded text-slate-400 hover:text-slate-600"
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {ev.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {ev.courseTitle}
                        </p>
                      </div>

                      {ev.progress !== undefined && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>진도율 {ev.progress}%</span>
                            <span className="text-blue-600 font-bold">{ev.status}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${ev.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Day 2 Section: 2025.05.22 (목) matching Slide 24 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                2025.05.22 (목)
              </h3>
              <span className="text-xs font-bold text-slate-400">
                총 {nextDayEvents.length}건
              </span>
            </div>

            <div className="space-y-3">
              {nextDayEvents.map((ev) => {
                const conf = EVENT_TYPE_CONFIG[ev.type];

                return (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 hover:border-slate-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {ev.startTime} ~ {ev.endTime}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toast.success('일정 알림이 등록되었습니다.')}
                          className="p-1 rounded text-slate-400 hover:text-slate-600"
                        >
                          <Bell className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1 rounded text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {ev.courseTitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => toast.info('추가 일정을 불러옵니다.')}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
            >
              더 보기 v
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
