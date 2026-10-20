import 'server-only';
import {cookies} from 'next/headers';
import {LmsError} from './access';
import {rosterCookie,validRosterSession} from './roster-session';
export function rosterConfig(){
 const hash=process.env.LMS_ROSTER_CODE_HASH,secret=process.env.SUPABASE_SECRET_KEY;
 if(!hash||! /^[a-f0-9]{64}$/.test(hash)||!secret)throw new LmsError('신청자 목록 조회 코드 설정을 확인해주세요.',503);
 return {hash,secret};
}
export async function requireRosterSession(){
 const {hash,secret}=rosterConfig();const token=(await cookies()).get(rosterCookie)?.value??'';
 if(!validRosterSession(token,secret,hash))throw new LmsError('조회 코드를 입력해주세요. 접속은 1시간 동안 유지됩니다.',401);
 return Number(token.split('.')[0]);
}
