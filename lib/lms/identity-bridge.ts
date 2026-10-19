export type BridgeIdentity={uid:string;getIdToken:()=>Promise<string>};
// Firebase emits a listener event while the popup promise resolves. Share that work.
export function createIdentityBridge<T,I extends BridgeIdentity=BridgeIdentity>(connect:(identity:I,signal:AbortSignal)=>Promise<T>){
 let active:{uid:string;controller:AbortController;promise:Promise<T>}|null=null;
 return {run(identity:I){if(active?.uid===identity.uid)return active.promise;active?.controller.abort();const controller=new AbortController();const run:{uid:string;controller:AbortController;promise:Promise<T>}={uid:identity.uid,controller,promise:Promise.resolve(null as T)};run.promise=Promise.resolve().then(()=>{controller.signal.throwIfAborted();return connect(identity,controller.signal);}).finally(()=>{if(active===run)active=null;});active=run;return run.promise;},cancel(){active?.controller.abort();active=null;}};
}
