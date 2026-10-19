'use client';
// Read exact source strings without the old getter's filtering/reset behavior.
export function captureLegacyFinance(){
 const snapshots:Record<string,string>={};const records:Record<string,unknown>[]=[];
 const keys=Object.keys(localStorage).filter(k=>/^aiedu_settlement_records_/.test(k)).sort((a,b)=>a==='aiedu_settlement_records_real_only_v6'?-1:b==='aiedu_settlement_records_real_only_v6'?1:b.localeCompare(a));
 for(const key of keys){const raw=localStorage.getItem(key);if(raw===null)continue;snapshots[key]=raw;try{const value=JSON.parse(raw);if(Array.isArray(value))for(const row of value)if(row&&typeof row==='object'&&!Array.isArray(row))records.push(row);}catch{/* Invalid source strings are still retained in snapshots. */}}
 for(const key of ['aiedu_user_order_ids_v1','platform-learner-email']){const raw=localStorage.getItem(key);if(raw!==null)snapshots[key]=raw;}
 return {source:`browser:${window.location.origin}`,kind:'browser' as const,snapshots,records};
}
export function downloadLegacyBackup(){const payload=captureLegacyFinance();const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.href=url;a.download=`lms-finance-original-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);}
