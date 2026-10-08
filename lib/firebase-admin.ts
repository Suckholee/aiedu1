import 'server-only';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const app = getApps().find(a => a.name === 'platform-server') ?? initializeApp({ storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, credential: cert({ projectId, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') }) }, 'platform-server');
export const platformDb = getFirestore(app);
export const platformAuth = getAuth(app);
export const platformRef = platformDb.collection('aieduPlatforms').doc('main');

export const platformBucket = getStorage(app).bucket();
