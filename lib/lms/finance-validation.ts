import {z} from 'zod';
const id=z.uuid(),amount=z.number().int().safe().min(1).max(1_000_000_000_000),reference=z.string().trim().min(3).max(300),instant=z.iso.datetime({offset:true});
export const financeCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('payment'),order_id:id,amount_krw:amount,reference,paid_at:instant,method:z.string().trim().min(1).max(100)}),
 z.object({action:z.literal('review_order'),order_id:id,amount_krw:amount.or(z.literal(0)),title:z.string().trim().min(1).max(200),reference}),
 z.object({action:z.literal('link_enrollment'),order_id:id,enrollment_id:id}),
 z.object({action:z.literal('cancel_order'),order_id:id}),
 z.object({action:z.literal('crm_note'),order_id:id,body:z.string().trim().min(1).max(2000)}),
 z.object({action:z.literal('crm_update'),order_id:id,customer_name:z.string().trim().min(1).max(200),customer_email:z.union([z.email(),z.literal('')]),customer_phone:z.string().max(50),company:z.string().max(200)}),
 z.object({action:z.literal('refund_request'),payment_id:id,amount_krw:amount,reason:z.string().trim().min(1).max(2000),idempotency_key:id,revoke_access:z.boolean().default(true)}),
 z.object({action:z.literal('refund_result'),id,status:z.enum(['processing','succeeded','failed']),reference}),
 z.object({action:z.literal('settlement_confirm'),order_ids:z.array(id).min(1).max(200),payee_name:z.string().trim().min(1).max(200),share_bps:z.number().int().min(0).max(10000),tax_bps:z.number().int().min(0).max(10000),idempotency_key:id}),
 z.object({action:z.literal('settlement_record'),id,reference,recorded_at:instant}),
]);
export const importPayload=z.object({source:z.string().max(300),kind:z.enum(['browser','repository_seed']),snapshots:z.record(z.string(),z.unknown()),records:z.array(z.record(z.string(),z.unknown())).max(1000)});
