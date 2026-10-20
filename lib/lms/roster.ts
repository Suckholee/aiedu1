import 'server-only';
import {allRows} from './learning';
import {readCatalog} from './catalog';
import {applicationOrder} from './application-orders';
import {orderNumber} from './finance-types';
export async function readApplicantRoster(){
 const [catalog,enrollments,orders]=await Promise.all([
  readCatalog(),allRows('lms_enrollments','id,cohort_id,status,applied_at,contact_name,contact_email,contact_phone,company,amount_krw'),
  allRows('lms_orders','id,enrollment_id,enrollment_applied_at,status,legacy_order_id,created_at')
 ]);
 return {expiresAt:new Date(Date.now()+3600000).toISOString(),cohorts:catalog.cohorts.map(h=>({id:h.id,title:h.title,starts_at:h.starts_at})),
  applicants:enrollments.map(e=>{const order=applicationOrder(orders,e);return {...e,paymentStatus:order?.status??null,orderNumber:order?orderNumber(order):null};}).sort((a,b)=>b.applied_at.localeCompare(a.applied_at))};
}
