import assert from 'node:assert/strict';
const base=process.env.LMS_TEST_BASE??'http://localhost:3100';let checks=0;
const expect=async(path,status,init)=>{const r=await fetch(base+path,{...init,signal:AbortSignal.timeout(20000)});assert.equal(r.status,status,path);checks++;return r;};
const list=await (await expect('/api/lms/shorts',200)).json();assert.ok(list.shorts.length>=2);checks++;
for(const video of list.shorts){assert.ok(video.published);assert.ok(video.title);assert.equal(video.video_path,undefined);assert.equal(video.created_by,undefined);assert.ok(video.duration_seconds>0);checks+=5;}
await expect('/api/lms/shorts?manage=1',401);
await expect('/api/lms/shorts',403,{method:'POST',headers:{Origin:'https://outside.example','Content-Type':'application/json'},body:'{}'});
await expect('/api/lms/shorts',401,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});
for(const video of list.shorts){const r=await fetch(video.video_url,{headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(15000)});assert.equal(r.status,206);assert.match(r.headers.get('content-type'),/video\/mp4/);assert.equal((await r.arrayBuffer()).byteLength,1024);const poster=await fetch(video.poster_url,{signal:AbortSignal.timeout(15000)});assert.equal(poster.status,200);assert.match(poster.headers.get('content-type'),/image\//);checks+=5;}
await expect('/admin/shorts',200);console.log(`PASS: ${checks} shorts public listing, private fields, administrator auth, CSRF, real video ranges and posters`);
