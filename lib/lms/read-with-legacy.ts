// Optional legacy reads may fail; the primary database must never silently turn into empty data.
export async function readWithLegacy<P,L>(primary:()=>Promise<P>,legacy:()=>Promise<L>,fallback:()=>L,timeoutMs=4000){
 const optional=(async()=>{let timer:ReturnType<typeof setTimeout>|undefined;try{const value=await Promise.race([Promise.resolve().then(legacy),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('legacy-timeout')),timeoutMs);})]);return {value,available:true};}catch{return {value:fallback(),available:false};}finally{clearTimeout(timer);}})();
 const [data,old]=await Promise.all([primary(),optional]);return {data,legacy:old.value,legacyAvailable:old.available};
}
