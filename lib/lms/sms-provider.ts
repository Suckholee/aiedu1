import {createHmac,randomBytes} from 'node:crypto';
export async function sendSolapiMessage(config:{apiKey:string;apiSecret:string;sender:string},message:{id:string;to:string;text:string},transport:typeof fetch=fetch){
 const date=new Date().toISOString(),salt=randomBytes(16).toString('hex');const signature=createHmac('sha256',config.apiSecret).update(date+salt).digest('hex');
 try{
  const response=await transport('https://api.solapi.com/messages/v4/send-many/detail',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`HMAC-SHA256 apiKey=${config.apiKey}, date=${date}, salt=${salt}, signature=${signature}`},body:JSON.stringify({messages:[{to:message.to,from:config.sender,text:message.text,type:'LMS',subject:'네오앤피터 수강 안내',customFields:{jobId:message.id}}],showMessageList:true,allowDuplicates:false}),signal:AbortSignal.timeout(10000)});
  const result=await response.json();const accepted=result.messageList?.[0];
  if(response.ok&&accepted?.statusCode==='2000'&&accepted?.messageId)return {status:'accepted',messageId:String(accepted.messageId),errorCode:null};
  if(result.failedMessageList?.length||response.status>=400&&response.status<500)return {status:'failed',messageId:null,errorCode:String(result.failedMessageList?.[0]?.statusCode??response.status)};
  return {status:'unknown',messageId:null,errorCode:'provider_result_uncertain'};
 }catch{return {status:'unknown',messageId:null,errorCode:'provider_connection_uncertain'};}
}
