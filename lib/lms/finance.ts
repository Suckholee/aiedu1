import 'server-only';
import {createHash} from 'node:crypto';
import {createAdminClient} from '@/lib/supabase/admin';
import {LmsError} from './access';
import {allRows} from './learning';
import {readCatalog} from './catalog';
import type {LmsMember} from './types';
import type {FinanceData,FinanceOrder} from './finance-types';
import {applicationOrder} from './application-orders';
import {orderNumber} from './finance-types';
import {financeCommand,importPayload} from './finance-validation';
export const isFinance=(m:LmsMember)=>m.roles.some(r=>['admin','finance'].includes(r));
export async function readFinance(member:LmsMember,url:URL):Promise<FinanceData>{
 const financial=isFinance(member),crm=member.roles.includes('operations');
 if(!financial&&!crm)throw new LmsError('운영·회계 권한이 필요합니다.',403);
 const [orders,payments,refunds,settlements,lines,legacy,notes,enrollments,catalog,notices]=await Promise.all([
  allRows('lms_orders'),financial?allRows('lms_payments'):[],financial?allRows('lms_refunds'):[],financial?allRows('lms_settlements'):[],financial?allRows('lms_settlement_lines'):[],financial?allRows('lms_legacy_finance_records'):[],allRows('lms_crm_notes'),allRows('lms_enrollments','id,cohort_id,contact_name,contact_email,amount_krw,applied_at,status'),readCatalog(),financial?allRows('lms_payment_notices'):[]
 ]);
 const mapped:FinanceOrder[]=orders.map(o=>{
  const e=enrollments.find(e=>e.id===o.enrollment_id);const ps=payments.filter(p=>p.order_id===o.id),rs=refunds.filter(r=>ps.some(p=>p.id===r.payment_id));
  const received=ps.reduce((n,p)=>n+Number(p.amount_krw),0),returned=rs.filter(r=>r.status==='succeeded').reduce((n,r)=>n+Number(r.amount_krw),0),reserved=rs.filter(r=>['requested','processing'].includes(r.status)).reduce((n,r)=>n+Number(r.amount_krw),0);
  const base={...o,number:orderNumber(o),cohort_id:e?.cohort_id??null,cohort_title:catalog.cohorts.find(h=>h.id===e?.cohort_id)?.title??'',enrollment_status:e?.status??null,received_krw:received,refunded_krw:returned,reserved_refund_krw:reserved,net_krw:received-returned,due_krw:o.status==='cancelled'||o.review_status==='needs_review'?0:Math.max(0,Number(o.amount_krw)-received)};
  if(financial)return base;
  // Operations receives contact and enrollment fields only, no financial raw or evidence.
  return {id:o.id,number:orderNumber(o),title:o.title,customer_name:o.customer_name,customer_email:o.customer_email,customer_phone:o.customer_phone,company:o.company,enrollment_id:o.enrollment_id,cohort_id:base.cohort_id,cohort_title:base.cohort_title,enrollment_status:base.enrollment_status,created_at:o.created_at} as FinanceOrder;
 });
 const search=(url.searchParams.get('q')??'').slice(0,200).toLowerCase(),cohort=url.searchParams.get('cohort')??'';
 const filtered=mapped.filter(o=>(!cohort||o.cohort_id===cohort)&&`${o.customer_name} ${o.customer_email} ${o.customer_phone} ${o.number} ${o.title}`.toLowerCase().includes(search)).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const page=Math.max(0,Math.min(10000,Math.floor(Number(url.searchParams.get('page'))||0))),selected=filtered.slice(page*50,page*50+50),ids=new Set(selected.map(o=>o.id));
 const selectedPayments=payments.filter(p=>ids.has(p.order_id));
 return {actor_id:member.id,financial,notices:notices.filter(n=>ids.has(n.order_id)),orders:selected,payments:selectedPayments,refunds:refunds.filter(r=>selectedPayments.some(p=>p.id===r.payment_id)),settlements,lines,legacy:legacy.filter(l=>selected.some(o=>o.legacy_record_id===l.id)),notes:notes.filter(n=>ids.has(n.order_id)),
  enrollments:financial?enrollments.map(({id,cohort_id,contact_name,contact_email,amount_krw})=>({id,cohort_id,contact_name,contact_email,amount_krw})):[],cohorts:catalog.cohorts.map(({id,title})=>({id,title})),total:filtered.length,page,
  summary:financial?{orders:mapped.length,unreviewed:mapped.filter(o=>o.review_status==='needs_review').length,received:mapped.reduce((n,o)=>n+o.received_krw,0),refunded:mapped.reduce((n,o)=>n+o.refunded_krw,0),net:mapped.reduce((n,o)=>n+o.net_krw,0),due:mapped.reduce((n,o)=>n+o.due_krw,0),confirmed:settlements.filter(s=>s.status==='confirmed').reduce((n,s)=>n+Number(s.net_krw),0),recorded:settlements.filter(s=>s.status==='recorded').reduce((n,s)=>n+Number(s.net_krw),0)}:{orders:mapped.length,unreviewed:0,received:0,refunded:0,net:0,due:0,confirmed:0,recorded:0},provider:{name:'tosspayments',state:'registration_pending',checkoutEnabled:false}};
}
export async function runFinance(input:unknown,member:LmsMember){
 const command=financeCommand.parse(input);
 if(!['crm_note','crm_update','refund_request'].includes(command.action)&&!isFinance(member))throw new LmsError('회계 권한이 필요합니다.',403);
 const r=await createAdminClient().rpc('lms_finance',{command,actor:member.id});
 if(r.error)throw new LmsError(r.error.code==='P0001'?r.error.message:r.error.code==='23505'?'이미 사용된 거래·요청 번호입니다.':'금액과 입력값을 확인하세요.');return r.data as string;
}
function canonical(value:unknown):string{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical((value as Record<string,unknown>)[k])).join(',')+'}';}
export async function importFinance(input:unknown,member:LmsMember){
 if(!isFinance(member))throw new LmsError('회계 권한이 필요합니다.',403);const validated=importPayload.parse(input);const {COURSE_SETTLEMENT_METAS}=await import('@/data/settlements');const payload={...validated,course_titles:Object.fromEntries(COURSE_SETTLEMENT_METAS.map(c=>[c.courseId,c.courseTitle]))};const digest=createHash('sha256').update(canonical(payload)).digest('hex');
 const r=await createAdminClient().rpc('lms_finance_import',{payload,digest,actor:member.id});if(r.error)throw new LmsError(r.error.code==='P0001'?r.error.message:'이전 기록 저장에 실패했습니다. 원본은 유지됩니다.');return r.data;
}
export async function readBilling(member:LmsMember):Promise<import('./checkout-types').BillingData>{
 const enrollments=await allRows('lms_enrollments','id,cohort_id,status,applied_at',{column:'learner_id',value:member.id});
 const forIds=async(table:string,columns:string,column:string,ids:string[])=>{const rows:any[]=[];for(let offset=0;offset<ids.length;offset+=100)rows.push(...await allRows(table,columns,{column,value:ids.slice(offset,offset+100)}));return rows;};
 const orders=await forIds('lms_orders','id,legacy_order_id,title,amount_krw,review_status,status,enrollment_id,enrollment_applied_at,created_at,payment_method','enrollment_id',enrollments.map(e=>e.id));
 const [payments,notices,catalog]=await Promise.all([
  forIds('lms_payments','id,order_id,amount_krw,paid_at,method','order_id',orders.map(o=>o.id)),
  forIds('lms_payment_notices','id,order_id,depositor_name,amount_krw,paid_at,note,created_at','order_id',orders.map(o=>o.id)),readCatalog()
 ]);
 const refunds=await forIds('lms_refunds','id,payment_id,amount_krw,reason,status,created_at','payment_id',payments.map(p=>p.id));
 return {actor_id:member.id,orders:orders.map(o=>{const e=enrollments.find(e=>e.id===o.enrollment_id),h=catalog.cohorts.find(h=>h.id===e?.cohort_id),received=payments.filter(p=>p.order_id===o.id).reduce((n,p)=>n+Number(p.amount_krw),0);return {...o,number:orderNumber(o),enrollment_status:e.status,current_application:applicationOrder(orders,e)?.id===o.id,cohort_id:e.cohort_id,starts_at:h?.starts_at??null,location:h?.location??'',payment_guide:h?.payment_guide??'',received_krw:received,due_krw:o.status==='pending'?Math.max(0,Number(o.amount_krw)-received):0};}).sort((a,b)=>b.created_at.localeCompare(a.created_at)),payments,refunds,notices,checkoutEnabled:false};
}
