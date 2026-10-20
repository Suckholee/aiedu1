import type {FinancePayment,FinanceRefund} from './finance-types';
import type {EnrollmentStatus} from './learning-types';
import type {orderNames} from './finance-types';
export interface PaymentNotice {id:string;order_id:string;depositor_name:string;amount_krw:number;paid_at:string;note:string;created_at:string}
export interface BillingOrder {id:string;number:string;title:string;amount_krw:number;review_status:'needs_review'|'verified';status:keyof typeof orderNames;enrollment_id:string;enrollment_status:EnrollmentStatus;current_application:boolean;created_at:string;payment_method:string;payment_guide:string;cohort_id:string;starts_at:string|null;ends_at?:string|null;legacy_course_id?:string|null;location:string;received_krw:number;due_krw:number}
export interface BillingData {actor_id:string;orders:BillingOrder[];payments:Pick<FinancePayment,'id'|'order_id'|'amount_krw'|'paid_at'|'method'>[];refunds:Pick<FinanceRefund,'id'|'payment_id'|'amount_krw'|'reason'|'status'|'created_at'>[];notices:PaymentNotice[];checkoutEnabled:false}
export const canPay=(o:BillingOrder)=>o.current_application&&o.review_status==='verified'&&o.status==='pending'&&o.due_krw>0&&['applied','active','completed'].includes(o.enrollment_status);
