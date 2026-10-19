import assert from 'node:assert/strict';import {createIdentityBridge} from '../lib/lms/identity-bridge.ts';
let calls=0,finish,seen=[];const bridge=createIdentityBridge(async(user,signal)=>{calls++;seen.push(signal);return new Promise(resolve=>{finish=resolve;});}),user={uid:'google-user',getIdToken:async()=>''};
const first=bridge.run(user),second=bridge.run(user);assert.equal(first,second);await Promise.resolve();assert.equal(calls,1);finish('linked');assert.equal(await first,'linked');assert.equal(await second,'linked');
const old=bridge.run(user);await Promise.resolve();const finishOld=finish;const fresh=bridge.run({...user,uid:'kakao-user'});assert.equal(seen.at(-1).aborted,true);await Promise.resolve();finishOld('stale');finish('new');assert.equal(await old,'stale');assert.equal(await fresh,'new');
let retries=0;const retry=createIdentityBridge(async()=>{if(++retries===1)throw Error('temporary');return 'ok';});await assert.rejects(retry.run(user));assert.equal(await retry.run(user),'ok');
const cancelled=createIdentityBridge(async()=>{throw Error('Should never connect');});const pending=cancelled.run(user);cancelled.cancel();await assert.rejects(pending,e=>e.name==='AbortError');
console.log('PASS: popup/listener share one connection, account switch aborts stale work, failures can retry, pre-start cancellation blocks side effects');
