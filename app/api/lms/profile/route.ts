import { ZodError } from 'zod';
import { requireMember, requireSameOrigin, lmsResponse, lmsFailure, LmsError } from '@/lib/lms/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { memberProfileInput } from '@/lib/lms/profile';
export const runtime = 'nodejs';

export async function GET() {
  try { return lmsResponse({ member: await requireMember() }); }
  catch (error) { return lmsFailure(error); }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const member = await requireMember();
    const command = memberProfileInput.parse(await request.json());
    const { error } = await createAdminClient().rpc('lms_save_own_profile', { command, actor: member.id });
    if (error) throw new LmsError(error.code === 'P0001' ? error.message : '회원 정보를 저장하지 못했습니다. 다시 시도해 주세요.', error.code === 'P0001' ? 400 : 503);
    return lmsResponse({ member: await requireMember() });
  } catch (error) {
    return lmsFailure(error instanceof ZodError ? new LmsError(error.issues[0]?.message ?? '입력 내용을 확인해 주세요.') : error);
  }
}
