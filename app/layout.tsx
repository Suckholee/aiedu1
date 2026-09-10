import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AI 업무자동화 캠프 | 수강생 전용 포털 (honestone & neoNpeter)',
  description: 'AI 초급자를 위한 3시간 실전 업무자동화 강의. 클로드를 통한 업무 자동화(조영빈), AI와 블로그 시작하기(이석호), AI로 숏폼 장착하기(박재범) 실습 포털',
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
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-[#10024a] font-sans text-slate-100 antialiased flex flex-col selection:bg-fuchsia-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
