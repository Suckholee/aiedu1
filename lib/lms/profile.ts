import { z } from 'zod';
import type { LmsMember } from './types';

export const PROFILE_PRIVACY_VERSION = '2026-10-19.v1';
export const INDUSTRIES = ['외식·식음료', '유통·쇼핑몰', '교육·강의', '콘텐츠·마케팅', 'IT·소프트웨어', '전문서비스·컨설팅', '제조·건설', '의료·복지', '문화·예술', '공공·비영리', '학생·취업 준비', '기타'] as const;
export const normalizeMobile = (value: string) => value.replace(/[\s()-]/g, '').replace(/^\+82/, '0');
export const memberProfileInput = z.object({
  display_name: z.string().trim().min(2, '이름을 2자 이상 입력해 주세요.').max(100),
  phone: z.string().trim().transform(normalizeMobile).pipe(z.string().regex(/^010\d{8}$/, '010으로 시작하는 휴대전화 11자리를 확인해 주세요.')),
  industry: z.enum(INDUSTRIES, { error: '업종을 선택해 주세요.' }),
  company: z.string().trim().max(200).default(''),
  job_title: z.string().trim().max(100).default(''),
  privacy_version: z.literal(PROFILE_PRIVACY_VERSION),
  consent_to_privacy: z.literal(true, { error: '개인정보 수집·이용 내용을 확인하고 동의해 주세요.' }),
  service_alimtalk_opt_in: z.boolean(),
  marketing_opt_in: z.boolean(),
}).strict();

export function profileComplete(member: Pick<LmsMember, 'profile_completed_at' | 'display_name' | 'phone' | 'industry'>) {
  return Boolean(member.profile_completed_at && member.display_name.trim() && /^010\d{8}$/.test(member.phone ?? '') && member.industry?.trim());
}
