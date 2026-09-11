'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInQuick: (name: string, email?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signInWithGoogle: async () => {},
  signInQuick: () => {},
  signOut: async () => {},
});

const LOCAL_STORAGE_KEY = 'student_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. 초기 세션 복구 및 Firebase Auth 리스너
  useEffect(() => {
    // 1-1. 로컬스토리지 캐시 우선 복구 (빠른 UI 렌더링)
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {}

    // 1-2. Firebase Auth 상태 변화 구독
    let unsubscribe = () => {};
    if (auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            const newUser: User = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '수강생',
              photoURL: fbUser.photoURL,
              isGuest: false,
            };
            setUser(newUser);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
            } catch (e) {}

            // Firestore 'users' 컬렉션 동기화
            if (db) {
              try {
                const userDocRef = doc(db, 'users', fbUser.uid);
                await setDoc(
                  userDocRef,
                  {
                    uid: fbUser.uid,
                    email: fbUser.email,
                    displayName: newUser.displayName,
                    photoURL: fbUser.photoURL,
                    role: 'student',
                    lastLoginAt: Date.now(),
                  },
                  { merge: true }
                );
              } catch (dbErr) {
                console.warn('Firestore user profile sync warning:', dbErr);
              }
            }
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn('Firebase Auth state listener error:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 2. Google / Gmail 원터치 로그인
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase Auth가 초기화되지 않았습니다.');
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const newUser: User = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '수강생',
        photoURL: fbUser.photoURL,
        isGuest: false,
      };

      setUser(newUser);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {}

      toast.success(`🎉 ${newUser.displayName}님, 환영합니다!`);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('로그인 창이 닫혔습니다.');
      } else {
        toast.error(`로그인 중 오류가 발생했습니다: ${error.message || ''}`);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. 지메일 / 이름 간편 로그인 (팝업 차단 환경 또는 빠른 실습용 Fallback)
  const signInQuick = (name: string, email?: string) => {
    const fallbackUser: User = {
      uid: `quick_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      displayName: name.trim() || '수강생',
      email: email?.trim() || `${name.trim().toLowerCase()}@gmail.com`,
      photoURL: null,
      isGuest: false,
    };

    setUser(fallbackUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackUser));
    } catch (e) {}

    toast.success(`🎉 ${fallbackUser.displayName}님으로 간편 로그인되었습니다!`);
  };

  // 4. 로그아웃
  const signOut = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
      setUser(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.info('로그아웃되었습니다.');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInQuick,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
