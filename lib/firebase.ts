import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCRPNuVBWLz7Mo2Go27ai_F9UU_Oa2o33E",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gahoseokho.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gahoseokho",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gahoseokho.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "691879363691",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:691879363691:web:bacd6592b3b1847bc35d2e",
};

// 앱이 이미 초기화되었는지 확인
let app: any;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (e) {
  console.warn("Firebase initializeApp warning:", e);
}

// Prevent multiple initializations in development HMR
let dbInstance: any = null;
let authInstance: any = null;
let storageInstance: any = null;

const globalWithFirebase = globalThis as typeof globalThis & {
  _globalFirestoreDb?: any;
  _globalAuth?: any;
};

try {
  if (globalWithFirebase._globalAuth) {
    authInstance = globalWithFirebase._globalAuth;
  } else if (app) {
    authInstance = getAuth(app);
    if (process.env.NODE_ENV !== 'production') {
      globalWithFirebase._globalAuth = authInstance;
    }
  }
} catch (e) {
  console.warn("getAuth fallback:", e);
}

try {
  if (globalWithFirebase._globalFirestoreDb) {
    dbInstance = globalWithFirebase._globalFirestoreDb;
  } else if (app) {
    dbInstance = getFirestore(app);
    if (process.env.NODE_ENV !== 'production') {
      globalWithFirebase._globalFirestoreDb = dbInstance;
    }
  }
} catch (e) {
  console.warn("getFirestore fallback:", e);
}

try {
  if (app) {
    storageInstance = getStorage(app);
  }
} catch (e) {
  console.warn("getStorage fallback:", e);
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export default app;
