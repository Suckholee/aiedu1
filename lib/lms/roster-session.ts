import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
export const rosterCookie='np_roster_view';
export const rosterLifetime=3600;
export const hashRosterValue=(value:string)=>createHash('sha256').update(value).digest('hex');
export function matchesRosterCode(code:string,expectedHash:string){
 return /^[a-f0-9]{64}$/.test(expectedHash)&&timingSafeEqual(Buffer.from(hashRosterValue(code)),Buffer.from(expectedHash));
}
function signature(payload:string,secret:string,codeHash:string){return createHmac('sha256',secret).update(`roster-view:${codeHash}:${payload}`).digest('hex');}
export function issueRosterSession(secret:string,codeHash:string,now=Date.now()){
 const payload=String(Math.floor(now/1000)+rosterLifetime);return `${payload}.${signature(payload,secret,codeHash)}`;
}
export function validRosterSession(token:string,secret:string,codeHash:string,now=Date.now()){
 const [expiry,sig,...extra]=token.split('.');const current=Math.floor(now/1000);
 if(extra.length||!/^\d{10}$/.test(expiry??'')||!/^[a-f0-9]{64}$/.test(sig??'')||Number(expiry)<=current||Number(expiry)>current+rosterLifetime)return false;
 return timingSafeEqual(Buffer.from(sig),Buffer.from(signature(expiry,secret,codeHash)));
}
