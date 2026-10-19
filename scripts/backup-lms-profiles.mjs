import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const snapshot={};for(const table of ['lms_profiles','lms_staff_members','lms_orders','lms_enrollments']){const {data,error}=await client.from(table).select('*');if(error)throw Error('Backup failed: '+table);snapshot[table]=data;}
await mkdir('.local-data/backups',{recursive:true});const path=`.local-data/backups/profiles-before-onboarding-${Date.now()}.json`;await writeFile(path,JSON.stringify(snapshot),{mode:0o600});console.log(JSON.stringify({path,counts:Object.fromEntries(Object.entries(snapshot).map(([k,v])=>[k,v.length]))}));
