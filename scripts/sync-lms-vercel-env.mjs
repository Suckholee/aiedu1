import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
const require=createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const project=JSON.parse(await readFile('.vercel/project.json','utf8'));
if(project.projectId!=='prj_dLMXGn21WP7cw7EIuV28pdQVH1cH')throw Error('Unexpected Vercel project; stopped.');
// Default sync deliberately excludes the privileged key.
// --server-production is only for a separately approved production-only step.
const serverOnly=process.argv.includes('--server-production');
const names=serverOnly?['SUPABASE_SECRET_KEY']:['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
if(!names.every(n=>process.env[n]?.trim()))throw Error('Missing Supabase environment settings.');
for(const target of serverOnly?['production']:['development','preview','production'])for(const name of names){
  const args=['env','add',name,target,'--yes','--force'];
  if(name==='SUPABASE_SECRET_KEY'&&target!=='development')args.push('--sensitive');
  await new Promise((resolve,reject)=>{
    const child=spawn('vercel',args,{stdio:['pipe','pipe','pipe']});
    // Do not print CLI output: some versions echo input values.
    child.stdout.resume();child.stderr.resume();child.on('error',reject);
    child.on('close',code=>code===0?resolve():reject(Error(`Vercel variable sync failed: ${name}/${target}`)));
    child.stdin.end(process.env[name].trim());
  });
  console.log(`Configured ${name} (${target})`);
}
