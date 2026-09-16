'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeftOpen } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isStudioPage = pathname?.startsWith('/tools/blog');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Restore user's sidebar preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_desktop_sidebar_open');
      if (saved !== null) {
        setDesktopSidebarOpen(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleDesktopSidebar = () => {
    setDesktopSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('app_desktop_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut: Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        toggleDesktopSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Desktop Collapsible Left Sidebar */}
      <div
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-40 bg-white transition-all duration-300 ease-in-out overflow-hidden ${
          desktopSidebarOpen
            ? 'w-64 opacity-100'
            : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-64 h-full">
          <DashboardSidebar onToggleCollapse={toggleDesktopSidebar} />
        </div>
      </div>

      {/* Floating edge tab when sidebar is collapsed (Desktop) */}
      {!desktopSidebarOpen && (
        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className="hidden lg:flex fixed left-0 top-20 z-30 items-center justify-center size-8 rounded-r-xl border-y border-r border-slate-200/90 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-xs transition-all hover:w-9 group"
          title="사이드바 열기 (Ctrl/Cmd + B)"
          aria-label="사이드바 열기"
        >
          <PanelLeftOpen className="size-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>
      )}

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform">
            <DashboardSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          isSidebarOpen={desktopSidebarOpen}
          onToggleSidebar={toggleDesktopSidebar}
        />

        {/* Page Content: For Studio full-screen tools, use edge-to-edge without margins or padding */}
        <main
          className={
            isStudioPage
              ? 'flex-1 w-full min-w-0 p-0 m-0 overflow-hidden'
              : 'flex-1 px-4 py-6 sm:px-8 sm:py-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto'
          }
        >
          {children}
        </main>

        {/* Footer: Hidden on full-screen studio tools */}
        {!isStudioPage && <Footer />}
      </div>

      {/* Mobile Bottom Navigation: Hidden on studio pages to avoid blocking action buttons */}
      {!isStudioPage && <MobileBottomNav />}
    </div>
  );
}
