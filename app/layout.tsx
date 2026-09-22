import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AuthProvider } from '@/contexts/AuthContext';
import { KakaoInAppHandler } from '@/components/common/KakaoInAppHandler';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AI수강생 플랫폼 | AI 업무자동화 실전 마스터 클래스',
  description: 'AI 초급자를 위한 3시간 실전 업무자동화 강의. 말로 한 상담이 보고서가 되기까지(조영빈 대표), AI 블로그 & 티스토리 스마트 옮겨쓰기(이석호 대표), VisKits AI 숏폼 영상 제작(박재범 대표) 수강생 전용 포털',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <KakaoInAppHandler />
        <AuthProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
