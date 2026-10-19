import { z, ZodError } from 'zod';
import { requireMember, requireSameOrigin, lmsResponse, lmsFailure, LmsError } from '@/lib/lms/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeReferralCode, validReferralCode, maskedReferrer } from '@/lib/lms/referrals';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const actor = await requireMember();
    const { code } = z.object({ code: z.string().max(50).transform(normalizeReferralCode).refine(validReferralCode, '추천코드를 확인해 주세요.') }).strict().parse(await request.json());
    const { data, error } = await createAdminClient().from('lms_profiles').select('id,display_name').eq('referral_code', code).eq('status', 'active').maybeSingle();
    if (error) throw new LmsError('추천인 확인을 다시 시도해 주세요.', 503);
    if (!data) throw new LmsError('유효한 추천코드를 확인해 주세요.');
    if (data.id === actor.id) throw new LmsError('본인의 추천코드는 사용할 수 없습니다.');
    return lmsResponse({ code, referrer_name: maskedReferrer(data.display_name) });
  } catch (error) {
    return lmsFailure(error instanceof ZodError ? new LmsError(error.issues[0]?.message ?? '추천코드를 확인해 주세요.') : error);
  }
}
