import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 앱이 이미 초기화되었는지 확인
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Prevent multiple initializations in development HMR
let dbInstance: any;
let authInstance: any;
const globalWithFirebase = globalThis as typeof globalThis & {
  _globalFirestoreDb?: any;
  _globalAuth?: any;
};

if (globalWithFirebase._globalAuth) {
  authInstance = globalWithFirebase._globalAuth;
} else {
  authInstance = getAuth(app);
  if (process.env.NODE_ENV !== 'production') {
    globalWithFirebase._globalAuth = authInstance;
  }
}

if (globalWithFirebase._globalFirestoreDb) {
  dbInstance = globalWithFirebase._globalFirestoreDb;
} else {
  dbInstance = getFirestore(app);
  if (process.env.NODE_ENV !== 'production') {
    globalWithFirebase._globalFirestoreDb = dbInstance;
  }
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = getStorage(app);
export { app };
export default app;
