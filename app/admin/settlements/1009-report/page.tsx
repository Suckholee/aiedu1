'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, CheckCircle2, AlertCircle, Building, Users } from 'lucide-react';

export default function Settlement1009ReportPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-800 print:bg-white print:p-0">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin/settlements"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition"
        >
          <ArrowLeft className="size-4" />
          <span>정산 관리 시스템으로 돌아가기</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-200 transition"
        >
          <Printer className="size-4" />
          <span>PDF 다운로드 / 인쇄하기</span>
        </button>
      </div>

      {/* Main A4 Document Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 sm:p-12 print:border-none print:shadow-none print:p-6 print:rounded-none print:max-w-none">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                주식회사 네오앤피터 공식 정산서
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">
                10월 9일 AI 업무자동화 실전 마스터 클래스
              </h1>
              <p className="text-sm font-bold text-slate-500 mt-1">
                수강료 수납 및 3인 강사진 최종 정산 명세서 (회식비 사비 선결제 환급 반영)
              </p>
            </div>
            <div className="text-right sm:self-end">
              <span className="text-xs text-slate-400 block">정산 작성일자</span>
              <span className="text-xs font-mono font-bold text-slate-800">2026. 10. 11</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">강의 일시</span>
              <span className="font-bold text-slate-800">2026.10.09 (금) 14:00~17:00</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">강의 장소</span>
              <span className="font-bold text-slate-800">위든타워 3층 대강의실</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">정산 대상 강사진</span>
              <span className="font-bold text-slate-800">이석호 · 조영빈 · 박재범 대표</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">정산 방식</span>
              <span className="font-bold text-emerald-700">실수납액 - 임대료 - 회식비 (1/n)</span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
            1. 총괄 수납 및 순정산액 산출 내역
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-xl">
              <span className="text-xs text-blue-700 font-bold block">현재 총 실수납액</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">₩ 1,100,000</span>
              <span className="text-[11px] text-blue-600 mt-1 block">유료 8명 결제완료 기준</span>
            </div>

            <div className="border border-rose-200 bg-rose-50/50 p-4 rounded-xl">
              <span className="text-xs text-rose-700 font-bold block">공제 고정비 합계</span>
              <span className="text-2xl font-black text-rose-900 mt-1 block">- ₩ 477,000</span>
              <span className="text-[11px] text-rose-600 mt-1 block">임대료 22만 + 회식비 25.7만</span>
            </div>

            <div className="border border-emerald-300 bg-emerald-50/70 p-4 rounded-xl">
              <span className="text-xs text-emerald-700 font-bold block">3인 배분 순이익</span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">₩ 623,000</span>
              <span className="text-[11px] text-emerald-700 mt-1 block">1인당 ₩ 207,666 배분</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
            <p>• <strong>고정비 상세</strong>: 위든타워 대관료(220,000원) + <strong>조영빈 대표 사비 선결제 저녁 회식비(257,000원)</strong> = 477,000원</p>
            <p>• <strong>미수금 안내</strong>: 김미균(15만), 정미희(10만), 양온정(10만) 미입금 3인은 수납 합계(110만)에서 제외되어 있으며, 입금 즉시 사후 추가 정산됩니다.</p>
            <p>• <strong>선수 예치금</strong>: 김형석 대표(150,000원) 입금액은 당일 미수강에 따른 크레딧으로 보관 중으로 이번 정산에서 제외되었습니다.</p>
          </div>
        </div>

        {/* Section 2: Final Payout Breakdown per Instructor */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
            2. 강사진 3인 최종 실지급액 명세서 (★ 조영빈 대표 사비 회식비 환급 산입)
          </h2>

          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-3 px-4">성함 / 직함</th>
                  <th className="py-3 px-4 text-right">순이익 배분 (1/3)</th>
                  <th className="py-3 px-4 text-right">사비 선결제 환급금</th>
                  <th className="py-3 px-4 text-right text-sm">최종 실지급액 (송금액)</th>
                  <th className="py-3 px-4">정산 비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">이석호 대표</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">₩ 207,666</td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono">-</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-blue-700 text-sm">₩ 207,666</td>
                  <td className="py-3.5 px-4 text-slate-500">순이익 1/3 정산</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">박재범 대표</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">₩ 207,667</td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono">-</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-blue-700 text-sm">₩ 207,667</td>
                  <td className="py-3.5 px-4 text-slate-500">순이익 1/3 정산 (원단위 보정)</td>
                </tr>
                <tr className="bg-amber-50/40 hover:bg-amber-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    조영빈 대표
                    <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">사비환급 포함</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">₩ 207,667</td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-rose-600">+ ₩ 257,000</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 text-base">₩ 464,667</td>
                  <td className="py-3.5 px-4 text-amber-900 font-bold">순이익(207,667원) + 저녁 회식비 사비 전액 환급</td>
                </tr>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="py-3 px-4 text-slate-900">합계</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900">₩ 623,000</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-600">₩ 257,000</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-950 text-base">₩ 880,000</td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">총 수납액 110만 - 대관료 22만 일치</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: 19 Attendees Breakdown */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
            3. 10/9 전체 참석자 명단 (총 19인 상세)
          </h2>

          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">성함</th>
                  <th className="py-2.5 px-3">구분</th>
                  <th className="py-2.5 px-3">소속 / 직무</th>
                  <th className="py-2.5 px-3 text-right">수강료</th>
                  <th className="py-2.5 px-3 text-center">결제 상태</th>
                  <th className="py-2.5 px-3">비고 / 수납 세부사항</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Paid 8 */}
                <tr><td className="py-2 px-3 text-center text-slate-400">1</td><td className="py-2 px-3 font-bold">황선도</td><td>신규</td><td>오투아이 (안경원 운영)</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 150,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>기업은행 입금 확인 (세금계산서)</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">2</td><td className="py-2 px-3 font-bold">이보배</td><td>신규</td><td>보험설계사</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 150,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>기업은행 입금 확인 (현금영수증)</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">3</td><td className="py-2 px-3 font-bold">조보겸</td><td>신규</td><td>보험설계사</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 150,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>기업은행 입금 확인 (이보배 합산)</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">4</td><td className="py-2 px-3 font-bold">임영미</td><td>신규</td><td>보험</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 150,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>기업은행 입금 확인</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">5</td><td className="py-2 px-3 font-bold">김해리</td><td>신규</td><td>네오앤피터 수강생</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 150,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>한선희 대납 기업은행 입금 확인</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">6</td><td className="py-2 px-3 font-bold">윤성경</td><td>신규</td><td>킹스토어 (도소매/3PL)</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 150,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>세금계산서/무통장입금 확인</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">7</td><td className="py-2 px-3 font-bold">옥리안</td><td>신규</td><td>네오앤피터 (단체할인)</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 100,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>단체할인 기업은행 입금 확인</td></tr>
                <tr><td className="py-2 px-3 text-center text-slate-400">8</td><td className="py-2 px-3 font-bold">지미란</td><td>신규</td><td>네오앤피터 (단체할인)</td><td className="py-2 px-3 text-right font-mono font-bold text-blue-700">₩ 100,000</td><td className="text-center font-bold text-blue-700">결제완료</td><td>단체할인 기업은행 입금 확인</td></tr>

                {/* 2. Unpaid 3 */}
                <tr className="bg-rose-50/50"><td className="py-2 px-3 text-center text-rose-500">9</td><td className="py-2 px-3 font-bold text-rose-900">김미균</td><td>신규</td><td>교보생명 FP</td><td className="py-2 px-3 text-right font-mono text-rose-700 font-bold">₩ 150,000</td><td className="text-center font-bold text-rose-600">미입금</td><td className="text-rose-700">입금 대기 (미수금)</td></tr>
                <tr className="bg-rose-50/50"><td className="py-2 px-3 text-center text-rose-500">10</td><td className="py-2 px-3 font-bold text-rose-900">정미희</td><td>신규</td><td>네오앤피터 (단체)</td><td className="py-2 px-3 text-right font-mono text-rose-700 font-bold">₩ 100,000</td><td className="text-center font-bold text-rose-600">미입금</td><td className="text-rose-700">입금 대기 (미수금)</td></tr>
                <tr className="bg-rose-50/50"><td className="py-2 px-3 text-center text-rose-500">11</td><td className="py-2 px-3 font-bold text-rose-900">양온정</td><td>신규</td><td>네오앤피터 (단체)</td><td className="py-2 px-3 text-right font-mono text-rose-700 font-bold">₩ 100,000</td><td className="text-center font-bold text-rose-600">미입금</td><td className="text-rose-700">입금 대기 (미수금)</td></tr>

                {/* 3. Prepaid Credit 1 */}
                <tr className="bg-amber-50/50"><td className="py-2 px-3 text-center text-amber-500">12</td><td className="py-2 px-3 font-bold text-amber-950">김형석</td><td>신규</td><td>중고차 유통</td><td className="py-2 px-3 text-right font-mono text-amber-800">₩ 150,000</td><td className="text-center font-bold text-amber-700">예치금보관</td><td className="text-amber-800 font-bold">10/9 당일 미수강, 차기 수강용 크레딧 보관</td></tr>

                {/* 4. Free Auditors 3 */}
                <tr className="bg-slate-50"><td className="py-2 px-3 text-center text-slate-400">13</td><td className="py-2 px-3 font-bold">한상유</td><td>청강</td><td>청강생</td><td className="py-2 px-3 text-right font-mono text-slate-400">₩ 0</td><td className="text-center text-slate-500 font-bold">청강무료</td><td>수강료 0원 무료 혜택</td></tr>
                <tr className="bg-slate-50"><td className="py-2 px-3 text-center text-slate-400">14</td><td className="py-2 px-3 font-bold">한선희</td><td>청강</td><td>청강생 (김해리 대납자)</td><td className="py-2 px-3 text-right font-mono text-slate-400">₩ 0</td><td className="text-center text-slate-500 font-bold">청강무료</td><td>수강료 0원 무료 혜택</td></tr>
                <tr className="bg-slate-50"><td className="py-2 px-3 text-center text-slate-400">15</td><td className="py-2 px-3 font-bold">유상근</td><td>청강</td><td>서강대 팀장</td><td className="py-2 px-3 text-right font-mono text-slate-400">₩ 0</td><td className="text-center text-slate-500 font-bold">청강무료</td><td>수강료 0원 무료 혜택</td></tr>

                {/* 5. Free Retakers 4 */}
                <tr className="bg-emerald-50/30"><td className="py-2 px-3 text-center text-emerald-600 font-bold">16</td><td className="py-2 px-3 font-bold text-emerald-950">방은주</td><td className="font-bold text-emerald-800">재수강</td><td>금융서비스 자산관리</td><td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">₩ 0</td><td className="text-center text-emerald-700 font-bold">재수강무료</td><td>재수강 0원 무료 정책 적용</td></tr>
                <tr className="bg-emerald-50/30"><td className="py-2 px-3 text-center text-emerald-600 font-bold">17</td><td className="py-2 px-3 font-bold text-emerald-950">이현주</td><td className="font-bold text-emerald-800">재수강</td><td>대표 / 수강생</td><td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">₩ 0</td><td className="text-center text-emerald-700 font-bold">재수강무료</td><td>재수강 0원 무료 정책 적용</td></tr>
                <tr className="bg-emerald-50/30"><td className="py-2 px-3 text-center text-emerald-600 font-bold">18</td><td className="py-2 px-3 font-bold text-emerald-950">이주빈</td><td className="font-bold text-emerald-800">재수강</td><td>네오앤피터 / 재수강</td><td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">₩ 0</td><td className="text-center text-emerald-700 font-bold">재수강무료</td><td>재수강 0원 무료 정책 적용 (수강생 4인 추천)</td></tr>
                <tr className="bg-emerald-50/30"><td className="py-2 px-3 text-center text-emerald-600 font-bold">19</td><td className="py-2 px-3 font-bold text-emerald-950">박정희</td><td className="font-bold text-emerald-800">재수강</td><td>재수강생</td><td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">₩ 0</td><td className="text-center text-emerald-700 font-bold">재수강무료</td><td>재수강 0원 무료 정책 적용</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Future Pending Allocation */}
        <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-xs">
          <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-blue-600" />
            4. 미입금 3인(350,000원) 추후 입금 시 사후 정산 배분
          </h3>
          <p className="text-slate-600 leading-relaxed">
            김미균(15만) + 정미희(10만) + 양온정(10만) 총 <strong>350,000원</strong>이 통장에 입금 확인되는 즉시,  
            3인에게 각 <strong>+₩ 116,666원씩</strong> 균등하게 추가 송금됩니다.  
            (완납 시 3인 최종 순이익 수령액: 207,666 + 116,666 = <strong>₩ 324,332 / 1인</strong>)
          </p>
        </div>

        {/* Footer Signature */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700">주식회사 네오앤피터 (NEO &amp; PETER Co., Ltd.)</p>
            <p className="text-[11px] text-slate-400">AI 실무 교육 사업본부 • 문의: support@neoandpeter.com</p>
          </div>
          <div className="flex items-center gap-6 font-bold text-slate-700">
            <span>이석호 (인)</span>
            <span>조영빈 (인)</span>
            <span>박재범 (인)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
