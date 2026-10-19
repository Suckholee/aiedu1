import 'server-only';
import {z} from 'zod';import {createAdminClient} from '@/lib/supabase/admin';import {LmsError} from './access';import type {LmsMember} from './types';
const commandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('payment_notice'),order_id:z.uuid(),depositor_name:z.string().trim().min(1).max(200),amount_krw:z.number().int().safe().min(1).max(1_000_000_000_000),paid_at:z.iso.datetime({offset:true}),note:z.string().trim().max(1000).default('')}),
 z.object({action:z.literal('payment_guide'),cohort_id:z.uuid(),guide:z.string().trim().max(2000)})
]);
export async function runCheckout(input:unknown,member:LmsMember){const command=commandSchema.parse(input);const {data,error}=await createAdminClient().rpc('lms_checkout',{command,actor:member.id});if(error)throw new LmsError(error.code==='P0001'?error.message:'입력값과 연결 상태를 확인하세요.');return data;}
