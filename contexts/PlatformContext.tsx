'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { PlatformData } from '@/lib/platform-types';
const initial: PlatformData = { promotionPosts: [], reviews: [], courses: [], banners: [], enrollments: [], materials: [], logs: [] };
const Context = createContext<{
    data: PlatformData;
    ready: boolean;
    error: string;
    mutate: (command: object) => Promise<PlatformData>;
    refresh: () => Promise<void>;
} | null>(null);
export function PlatformProvider({ children }: {
    children: ReactNode;
}) {
    const { user } = useAuth();
    const [data, setData] = useState(initial);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const version = useRef(0);
    const refresh = useCallback(async () => {
        const current = ++version.current;
        try {
            const r = await fetch('/api/platform', { cache: 'no-store', headers: auth?.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : {} });
            const d = await r.json();
            if (!r.ok)
                throw Error(d.error);
            if (current === version.current) {
                setData(d);
                setError('');
                setReady(true);
            }
        }
        catch (e) {
            if (current === version.current)
                setError(e instanceof Error ? e.message : '연결에 실패했습니다.');
        }
    }, [user?.uid]);
    useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 5000); window.addEventListener('focus', refresh); return () => { clearInterval(timer); window.removeEventListener('focus', refresh); }; }, [refresh]);
    const mutate = async (command: object) => { ++version.current; const r = await fetch('/api/platform', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth?.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : {}) }, body: JSON.stringify(command) }); const d = await r.json(); if (!r.ok)
        throw Error(d.error); ++version.current; setData(d); setError(''); return d as PlatformData; };
    return <Context.Provider value={{ data, ready, error, mutate, refresh }}>{error && <div role="alert" className="bg-amber-50 p-3 text-sm text-amber-800">공통 데이터: {error} <button onClick={() => void refresh()}>다시 연결</button></div>}{children}</Context.Provider>;
}
export function usePlatform() { const context = useContext(Context); if (!context)
    throw Error('PlatformProvider가 필요합니다.'); return context; }
