import {BANK_TRANSFER_ACCOUNT} from './payment-channel';
export interface SmsPayload {id:string;order_id:string;kind:'application'|'payment_reminder';name:string;phone:string;title:string;starts_at:string|null;location:string;guest:boolean;number:string;payable:boolean;due:number}
export function smsPhone(value:string){const digits=value.replace(/\D/g,'').replace(/^82(?=10)/,'0');return /^01[016789]\d{7,8}$/.test(digits)?digits:null;}
export function smsSender(value:string){const digits=value.replace(/\D/g,'');return /^0\d{8,10}$/.test(digits)?digits:null;}
export function smsText(p:SmsPayload){
 const header=p.kind==='application'?'수강신청 접수':'수강료 납부 안내';
 const lines=[`[네오앤피터 ${header}]`,`${p.name}님, ${p.title}${p.kind==='application'?' 신청이 접수되었습니다.':' 수강료 납부 안내드립니다.'}`];
 if(p.starts_at)lines.push(`일정: ${new Date(p.starts_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}`);
 if(p.location)lines.push(`장소: ${p.location}`);
 if(p.payable&&Number(p.due)>0)lines.push(`납부금액: ${Number(p.due).toLocaleString('ko-KR')}원`,`${BANK_TRANSFER_ACCOUNT.bank} ${BANK_TRANSFER_ACCOUNT.number} (${BANK_TRANSFER_ACCOUNT.holder})`,'신청자 이름으로 입금해주세요. 이미 입금하셨다면 담당자 확인을 기다려주세요.');
 else lines.push('신청·결제 처리 상태는 아래에서 확인해주세요.');
 lines.push(`접수번호: ${p.number}`,`내역 확인: https://aiedu1.vercel.app/${p.guest?'guest-applications':'my-applications'}`,'문의: 010-8952-3667');return lines.join('\n');
}
