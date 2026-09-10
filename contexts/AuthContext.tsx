'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInGuest: () => void;
}

const defaultUser: User = {
  uid: 'student-guest-01',
  email: 'student@learnai.kr',
  displayName: 'AI 수강생',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  loading: false,
  signInGuest: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에 저장된 사용자 이름이 있다면 반영
    try {
      const savedName = localStorage.getItem('student_display_name');
      if (savedName) {
        setUser((prev) => (prev ? { ...prev, displayName: savedName } : defaultUser));
      }
    } catch (e) {}
  }, []);

  const signInGuest = () => {
    setUser(defaultUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
