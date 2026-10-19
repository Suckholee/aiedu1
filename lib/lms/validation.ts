import { z } from 'zod';
const id=z.uuid();
const text=z.string().trim().min(1).max(200);
const optionalText=z.string().trim().max(200).default('');
const instant=z.union([z.iso.datetime({offset:true}),z.literal(''),z.null()]).optional();
export const managementCommand=z.discriminatedUnion('action',[
  z.object({action:z.literal('course'),id:id.optional(),title:text,slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
    subtitle:optionalText,description:z.string().max(20000).default(''),category:optionalText,level:optionalText,published:z.boolean(),
    thumbnail:z.union([z.literal(''),z.string().regex(/^\/(?!\/)/),z.url().refine(v=>new URL(v).protocol==='https:')]).default('')}),
  z.object({action:z.literal('cohort'),id:id.optional(),course_id:id,title:text,delivery_mode:z.enum(['offline','live','vod','blended']),
    status:z.enum(['draft','open','closed','running','completed','cancelled']),starts_at:instant,ends_at:instant,
    capacity:z.number().int().min(1).max(100000).nullable(),reserved_seats:z.number().int().min(0).max(100000).optional(),price_krw:z.number().int().min(0).max(1000000000),location:optionalText,instructor_name:optionalText}),
  z.object({action:z.literal('member'),id,display_name:text,phone:z.string().trim().max(40).default(''),company:optionalText,status:z.enum(['active','suspended'])}),
  z.object({action:z.literal('roles'),id,roles:z.array(z.enum(['admin','operations','finance'])).max(3)}),
]);
