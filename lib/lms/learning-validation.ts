import {z} from 'zod';
const id=z.uuid(),text=z.string().trim().min(1).max(200),url=z.string().max(2000).refine(v=>!v||/^\/(?!\/)/.test(v)||/^https?:\/\//.test(v),'자료 링크를 확인하세요.');
const instant=z.iso.datetime({offset:true});
const attendance=z.enum(['present','late','absent','excused']);
export const learningCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('apply'),cohort_id:id,referral_code:z.string().trim().max(50).default(''),name:text,phone:z.string().trim().min(8).max(30),company:z.string().trim().max(200).default(''),note:z.string().trim().max(2000).default(''),payment_method:z.string().max(100).default(''),receipt_type:z.string().max(100).default(''),receipt_number:z.string().max(100).default(''),depositor_name:z.string().max(200).default('')}),
 z.object({action:z.literal('status'),id,status:z.enum(['active','waitlisted','rejected','cancelled','completed','revoked'])}),
 z.object({action:z.literal('access'),id,access_until:instant.nullable()}),
 z.object({action:z.literal('note'),id,note:z.string().trim().min(1).max(2000)}),
 z.object({action:z.literal('attendance'),id,session_id:id,status:attendance,note:z.string().max(2000).default('')}),
 z.object({action:z.literal('attendance_batch'),session_id:id,records:z.array(z.object({id,status:attendance,note:z.string().max(2000).default('')})).min(1).max(200)}),
 z.object({action:z.literal('progress'),id,lesson_id:id,percent:z.number().int().min(0).max(100)}),
 z.object({action:z.literal('session'),id:id.optional(),cohort_id:id,title:text,starts_at:instant,ends_at:instant,location:z.string().max(500).default('')}),
 z.object({action:z.literal('lesson'),id:id.optional(),cohort_id:id,title:text,position:z.number().int().min(0).max(10000),kind:z.enum(['video','live','document','practice','quiz']),required:z.boolean(),content_url:url}),
 z.object({action:z.literal('archive_session'),id,cohort_id:id,archived:z.boolean()}),
 z.object({action:z.literal('archive_lesson'),id,cohort_id:id,archived:z.boolean()}),
]);
