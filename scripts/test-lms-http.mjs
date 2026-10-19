import assert from 'node:assert/strict';
const base=process.env.LMS_TEST_BASE??'http://localhost:3100';
let checks=0;
async function expect(path,status,init){
  const response=await fetch(base+path,{...init,signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,status,path);checks++;return response;
}
await expect('/api/lms/manage',401);
await expect('/api/lms/learning',401);
await expect('/api/lms/finance',401);
await expect('/api/lms/billing',401);
await expect('/api/lms/profile',401);
for(const route of ['/api/lms/finance','/api/lms/billing','/api/lms/checkout','/api/lms/profile']){await expect(route,403,{method:'POST',headers:{Origin:'https://outside.example','Content-Type':'application/json'},body:'{}'});await expect(route,401,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});}
await expect('/api/lms/learning',403,{method:'POST',headers:{Origin:'https://outside.example','Content-Type':'application/json'},body:'{}'});
await expect('/api/lms/learning',401,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});
const session=await (await expect('/api/lms/session',200)).json();
assert.equal(session.member,null);checks++;
await expect('/api/lms/manage',403,{method:'POST',headers:{Origin:'https://outside.example','Content-Type':'application/json'},body:'{}'});
await expect('/api/lms/manage',401,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});
await expect('/api/lms/session',401,{method:'POST',headers:{Origin:base,Authorization:'Bearer forged'}});
await expect('/api/lms/session',403,{method:'DELETE',headers:{Origin:'https://outside.example'}});
await expect('/api/lms/firebase-session',401,{method:'POST',headers:{Origin:base}});
await expect('/api/lms/firebase-session',403,{method:'POST',headers:{Origin:'https://outside.example'}});
const providers=await (await expect('/api/auth/providers',200)).json();
assert.equal(providers.google,true);assert.equal(typeof providers.kakao,'boolean');assert.deepEqual(Object.keys(providers).sort(),['google','kakao']);checks+=3;
const callback=await fetch(base+'/auth/callback?next=https://outside.example',{redirect:'manual'});
assert.equal(callback.status,307);assert.equal(callback.headers.get('location'),base+'/auth/complete?error=oauth');checks+=2;
const platform=await (await expect('/api/platform',200)).json();
assert.deepEqual(platform.enrollments,[]);assert.deepEqual(platform.logs,[]);checks+=2;
assert.ok(platform.courses.every(c=>c.published));checks++;
for(const path of ['/','/courses','/apply','/admin/courses','/admin/cohorts','/admin/members','/admin/roles','/admin/learning','/admin/operations','/admin/finance','/admin/settlements','/admin/crm','/my-learning','/my-profile','/my-applications','/checkout/00000000-0000-4000-8000-000000000000'])await expect(path,200);
console.log(`PASS: ${checks} production HTTP checks (anonymous access, CSRF, forged login, public DTO, routes)`);
