import {z} from 'zod';
export const SHORTS_BUCKET='lms-shorts';
export const MAX_VIDEO_BYTES=50*1024*1024;
export const MAX_POSTER_BYTES=5*1024*1024;
const root='[a-f0-9-]{36}/[a-f0-9-]{36}';
export const shortsCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('upload'),kind:z.enum(['video','poster']),type:z.enum(['video/mp4','image/webp','image/jpeg','image/png']),size:z.number().int().positive().max(MAX_VIDEO_BYTES)})
 .refine(v=>v.kind==='video'?v.type==='video/mp4':v.type.startsWith('image/')&&v.size<=MAX_POSTER_BYTES,'MP4 50MB, 표지 이미지 5MB 이하를 선택하세요.'),
 z.object({action:z.literal('save'),id:z.uuid().optional(),title:z.string().trim().min(1).max(120),description:z.string().trim().max(1000).default(''),video_path:z.string().regex(new RegExp('^'+root+'\\.mp4$')),poster_path:z.string().regex(new RegExp('^'+root+'\\.(webp|jpg|png)$')),duration_seconds:z.number().int().min(1).max(600),position:z.number().int().min(0).max(10000),published:z.boolean()}),
 z.object({action:z.literal('publish'),id:z.uuid(),published:z.boolean()}),
]);
export interface ShortVideo {id:string;title:string;description:string;duration_seconds:number;position:number;published:boolean;video_url:string;poster_url:string;video_path?:string;poster_path?:string;}
