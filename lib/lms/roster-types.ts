import type {EnrollmentStatus} from './learning-types';
import type {orderNames} from './finance-types';
export interface ApplicantRoster {
 expiresAt:string;
 cohorts:{id:string;title:string;starts_at:string|null;ends_at:string|null;location:string;legacy_course_id:string|null}[];
 applicants:{id:string;cohort_id:string;status:EnrollmentStatus;applied_at:string;contact_name:string;contact_email:string;contact_phone:string;company:string;amount_krw:number;paymentStatus:keyof typeof orderNames|null;orderNumber:string|null}[];
}
