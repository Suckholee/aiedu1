import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
const require = createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());
const app = initializeApp({credential: cert({projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_ADMIN_CLIENT_EMAIL,privateKey:process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g,'\n')})});
try {
  const db=getFirestore(app);
  const root=db.collection('aieduPlatforms').doc('main');
  const keys=['courses','banners','enrollments','materials','reviews','promotionPosts','logs'];
  const snapshots=await Promise.all(keys.map(k=>root.collection(k).get()));
  const platform=Object.fromEntries(keys.map((k,i)=>[k,snapshots[i].docs.map(d=>d.data())]));
  const profiles=await db.collection('users').get();
  const users=[];
  let pageToken;
  do {
    const page=await getAuth(app).listUsers(1000,pageToken);
    for(const u of page.users) users.push({uid:u.uid,email:u.email??null,emailVerified:u.emailVerified,displayName:u.displayName??'',photoURL:u.photoURL??null,disabled:u.disabled,admin:u.customClaims?.admin===true});
    pageToken=page.pageToken;
  } while(pageToken);
  const snapshot={exportedAt:new Date().toISOString(),project:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,platform,users,profiles:profiles.docs.map(d=>({id:d.id,...d.data()}))};
  await mkdir('.local-data/backups',{recursive:true});
  const path=`.local-data/backups/lms-source-${Date.now()}.json`;
  await writeFile(path,JSON.stringify(snapshot,null,2),{mode:0o600});
  console.log(JSON.stringify({backup:path,collections:Object.fromEntries(keys.map(k=>[k,platform[k].length])),authUsers:users.length,userProfiles:profiles.size,verifiedAdmins:users.filter(u=>u.admin).length}));
} finally {await app.delete();}
