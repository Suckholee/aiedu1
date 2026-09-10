'use client';

import { ArrowRight, Calendar, ExternalLink, FileText, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { AI_WORK_PARTICIPANTS, EARLY_BIRD_PERIOD, maskName, Participant } from '@/data/ai-work-automation-participants';

interface ParticipantRosterSectionProps {
  googleFormUrl: string;
  participants?: Participant[];
  showReferralPromo?: boolean;
}

export function ParticipantRosterSection({
  googleFormUrl,
  participants = AI_WORK_PARTICIPANTS,
  showReferralPromo = true,
}: ParticipantRosterSectionProps) {
  const earlyBirdCount = participants.filter((p) => p.isEarlyBird).length;

  return (
    <section
      id="participants"
      className="relative z-10 flex w-full max-w-full items-center overflow-x-clip bg-[#fbf9fe] py-12 text-slate-900 break-keep sm:py-16 md:min-h-[calc(100svh-4rem)] md:snap-start md:snap-always"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              <Sparkles className="size-3.5" />
              실시간 참가 신청 &amp; 얼리버드 혜택 현황
            </div>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 break-keep">
              참가 신청 명단 &amp; 얼리버드 AI 콘텐츠
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed sm:leading-7 text-slate-600 max-w-2xl break-keep">
              <strong className="text-violet-900 font-bold">{EARLY_BIRD_PERIOD.label}</strong> 얼리버드 기간 내 신청자분들의 업종에 맞춰 AI로 사전 제작된 블로그 글과 숏폼 영상 콘텐츠를 순차적으로 공유해 드립니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-fuchsia-50 px-3.5 py-2 text-xs font-extrabold text-fuchsia-800 border border-fuchsia-200">
              <Calendar className="size-3.5 text-fuchsia-600" />
              얼리버드: {EARLY_BIRD_PERIOD.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2 text-xs font-bold text-violet-800 shadow-sm border border-violet-100">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
              </span>
              {earlyBirdCount > 0 ? `얼리버드 신청 ${earlyBirdCount}명` : '얼리버드 접수 진행 중'}
            </span>
          </div>
        </div>

        {/* 얼리버드 특별 혜택 안내 배너 */}
        <div className="mt-6 rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-600/5 via-fuchsia-600/5 to-purple-600/5 p-4 sm:p-5 break-keep">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-violet-600 text-white text-xs font-black">
                🎁
              </span>
              <p className="leading-snug break-keep">
                <strong className="font-bold text-violet-950">얼리버드 신청 기간 ({EARLY_BIRD_PERIOD.label}):</strong>{' '}
                해당 기간 내 신청해 주신 분들께는 입력해주신 업종에 맞춰 <strong>AI 블로그 포스팅 1편</strong>과{' '}
                <strong>홍보 숏폼 영상 1편</strong>을 사전에 맞춤 제작해 드립니다. (강의 당일 실습 제작법 100% 공개)
              </p>
            </div>
            <a
              href={googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-1 font-bold text-violet-700 hover:text-violet-900 transition underline underline-offset-4"
            >
              얼리버드 혜택 신청하기 &rarr;
            </a>
          </div>

          <div className="mt-3.5 pt-3 border-t border-violet-200/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1 font-semibold">
              <span className="text-fuchsia-600 font-bold">✓ 참석자 전원 혜택:</span> AI 숏폼 1개월권 + 블로그 10개 생성권 (총 20만원 상당 무료)
            </span>
            {showReferralPromo ? (
              <>
                <span className="hidden sm:inline text-violet-300">|</span>
                <span className="inline-flex items-center gap-1 font-semibold">
                  <span className="text-violet-700 font-bold">✓ 지인 초대 할인:</span> 지인 2명 초대 시 본인 5만원 즉시 할인 (본인 외 2명)
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline text-violet-300">|</span>
                <span className="inline-flex items-center gap-1 font-semibold">
                  <span className="text-violet-700 font-bold">✓ 실습 코칭 혜택:</span> 3인 전문 강사진의 실무 프롬프트 템플릿 &amp; 1:1 질의응답
                </span>
              </>
            )}
          </div>
        </div>

        {/* 신청자 목록 또는 등록 안내 상태 */}
        {participants.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-violet-300 bg-white/90 p-6 sm:p-12 text-center shadow-sm break-keep">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Sparkles className="size-7" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-fuchsia-100 px-3.5 py-1 text-xs font-extrabold text-fuchsia-800">
              ⚡ {EARLY_BIRD_PERIOD.label} 얼리버드 접수 진행 중
            </span>
            <h3 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-keep">
              얼리버드 신청자 명단이 실시간으로 등록될 예정입니다
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600 break-keep">
              현재 얼리버드 참가 접수를 받고 있습니다. 구글 폼 신청서가 접수되는 순서대로 신청자의 비즈니스 업종에 맞춘 <strong>AI 블로그 글과 숏폼 영상 콘텐츠 링크</strong>가 이곳에 순차적으로 업데이트됩니다.
              <br />
              <span className="mt-2 inline-block text-[11px] text-slate-400">
                (신청자의 개인정보 보호를 위해 성함은 가운데 글자가 마스킹 처리되며, 연락처·이메일은 일체 공개되지 않습니다)
              </span>
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#220063] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#340099] transition hover:scale-105"
              >
                <span>지금 얼리버드 신청하고 AI 맞춤 콘텐츠 받기</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* 데스크톱 테이블 뷰 (md 이상) */}
            <div className="mt-6 hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500">
                    <th className="py-3.5 px-5 w-24">이름</th>
                    <th className="py-3.5 px-5">업종 / 비즈니스</th>
                    <th className="py-3.5 px-5 w-32">얼리버드</th>
                    <th className="py-3.5 px-5 min-w-[200px]">AI 블로그 글</th>
                    <th className="py-3.5 px-5 min-w-[200px]">AI 숏폼 영상</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.map((item) => {
                    const masked = maskName(item.name);
                    return (
                      <tr key={item.id} className="hover:bg-violet-50/40 transition-colors">
                        {/* 이름 */}
                        <td className="py-4 px-5">
                          <div className="inline-flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-full bg-violet-100 text-xs font-black text-violet-800">
                              {masked.charAt(0)}
                            </span>
                            <span className="font-bold text-slate-900 tracking-wide">{masked}</span>
                          </div>
                        </td>

                        {/* 업종 */}
                        <td className="py-4 px-5">
                          <p className="font-semibold text-slate-800">{item.industry}</p>
                        </td>

                        {/* 얼리버드 */}
                        <td className="py-4 px-5">
                          {item.isEarlyBird ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-fuchsia-50 border border-fuchsia-200/70 px-2.5 py-1 text-xs font-extrabold text-fuchsia-700">
                              ⚡ {item.earlyBirdBadge || '얼리버드'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              일반 신청
                            </span>
                          )}
                        </td>

                        {/* 블로그글 링크 */}
                        <td className="py-4 px-5">
                          {item.blogPost?.status === 'completed' && item.blogPost.url ? (
                            <a
                              href={item.blogPost.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-violet-50/80 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                              title={item.blogPost.title}
                            >
                              <FileText className="size-3.5 text-violet-500 group-hover:text-white" />
                              <span>포스팅 보기</span>
                              <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                              AI 작성 진행 중
                            </span>
                          )}
                        </td>

                        {/* 숏폼영상 링크 */}
                        <td className="py-4 px-5">
                          {item.shortFormVideo?.status === 'completed' && item.shortFormVideo.url ? (
                            <a
                              href={item.shortFormVideo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-300 bg-fuchsia-50/80 px-3 py-1.5 text-xs font-bold text-fuchsia-700 hover:bg-fuchsia-600 hover:text-white transition-all shadow-sm"
                              title={item.shortFormVideo.title}
                            >
                              <Video className="size-3.5 text-fuchsia-500 group-hover:text-white" />
                              <span>숏폼 영상 보기</span>
                              <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                              AI 렌더링 중
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 뷰 (md 미만) */}
            <div className="mt-5 grid gap-3 md:hidden">
              {participants.map((item) => {
                const masked = maskName(item.name);
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-violet-100 text-xs font-black text-violet-800">
                          {masked.charAt(0)}
                        </span>
                        <span className="font-bold text-slate-900">{masked}</span>
                      </div>
                      {item.isEarlyBird && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-fuchsia-50 border border-fuchsia-200/70 px-2 py-0.5 text-xs font-extrabold text-fuchsia-700">
                          ⚡ {item.earlyBirdBadge || '얼리버드'}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      {item.industry}
                    </p>

                    <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      {/* 블로그 */}
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 mb-1">AI 블로그 글</p>
                        {item.blogPost?.status === 'completed' && item.blogPost.url ? (
                          <a
                            href={item.blogPost.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-violet-300 bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-600 hover:text-white transition"
                          >
                            <FileText className="size-3" />
                            <span>글 보기</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        ) : (
                          <div className="flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-500">
                            <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
                            작성 중
                          </div>
                        )}
                      </div>

                      {/* 숏폼 */}
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 mb-1">AI 숏폼 영상</p>
                        {item.shortFormVideo?.status === 'completed' && item.shortFormVideo.url ? (
                          <a
                            href={item.shortFormVideo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-fuchsia-300 bg-fuchsia-50 px-2.5 py-1.5 text-xs font-bold text-fuchsia-700 hover:bg-fuchsia-600 hover:text-white transition"
                          >
                            <Video className="size-3" />
                            <span>영상 보기</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        ) : (
                          <div className="flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-500">
                            <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
                            제작 중
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Footer info & CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>신청자의 개인정보 보호를 위해 성함의 일부는 마스킹되며, 연락처·이메일 등은 일체 공개되지 않습니다.</span>
          </div>

          <a
            href={googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-800 transition hover:scale-105 shrink-0"
          >
            얼리버드 혜택 받고 참가 신청하기
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
