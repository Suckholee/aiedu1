'use client';

import { useEffect, useRef } from 'react';

export function OnePageScroll({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest('a[href^="#"]') as HTMLAnchorElement | null;
      const hash = anchor?.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = root.querySelector(hash) as HTMLElement | null;
      if (!target) return;
      event.preventDefault();

      const desktopQuery = window.matchMedia('(min-width: 768px)');
      const headerHeight = root.querySelector('header')?.getBoundingClientRect().height ?? 64;

      if (desktopQuery.matches) {
        root.scrollTo({
          top: Math.max(0, target.offsetTop - headerHeight),
          behavior: 'smooth',
        });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: 'smooth',
        });
      }
    };

    root.addEventListener('click', onAnchorClick);
    return () => {
      root.removeEventListener('click', onAnchorClick);
    };
  }, []);

  return (
    <main
      ref={rootRef}
      className="min-h-screen w-full max-w-[100vw] overflow-x-clip bg-[#10024a] text-white selection:bg-fuchsia-300 selection:text-[#150354] touch-pan-y break-keep md:h-[100svh] md:overflow-y-auto md:snap-y md:snap-mandatory md:scroll-pt-16 md:scroll-smooth"
    >
      {children}
    </main>
  );
}
