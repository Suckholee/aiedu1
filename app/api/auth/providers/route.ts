export async function GET(){
  let kakao=false;
  try{
    const response=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??''},cache:'no-store',signal:AbortSignal.timeout(5000)});
    if(response.ok){const data=await response.json();kakao=data.external?.kakao===true;}
  }catch{}
  return Response.json({google:true,kakao},{headers:{'Cache-Control':'no-store'}});
}
