export type LmsRole = 'admin' | 'operations' | 'finance';
export interface LmsMember {
  id:string; auth_user_id:string|null; legacy_firebase_uid:string|null; display_name:string;
  email:string|null; phone:string|null; company:string|null; status:'active'|'suspended';
  photo_url:string|null; created_at:string; last_seen_at:string|null; roles:LmsRole[];
}
export interface LmsCourse {
  id:string; legacy_id:string|null; slug:string; title:string; subtitle:string; description:string;
  category:string; level:string; published:boolean; thumbnail:string; metadata:Record<string,any>;
}
export interface LmsCohort {
  id:string; legacy_course_id:string|null; course_id:string; title:string;
  delivery_mode:'offline'|'live'|'vod'|'blended'; status:'draft'|'open'|'closed'|'running'|'completed'|'cancelled';
  starts_at:string|null; ends_at:string|null; capacity:number|null; price_krw:number;
  location:string; instructor_name:string; payment_guide?:string; metadata:Record<string,any>;
}
