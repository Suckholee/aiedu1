'use client';

import { useEffect, useRef } from 'react';

export function OnePageScroll({ children, embedded = false }: { children: React.ReactNode; embedded?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

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
      const headerHeight = embedded ? 80 : root.querySelector('header')?.getBoundingClientRect().height ?? 64;

      if (desktopQuery.matches && !embedded) {
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
  }, [embedded]);

  return (
    <div
      ref={rootRef}
      className={embedded
        ? 'w-full overflow-x-clip rounded-2xl bg-[#10024a] text-white selection:bg-fuchsia-300 selection:text-[#150354] break-keep'
        : 'min-h-screen w-full max-w-[100vw] overflow-x-clip bg-[#10024a] text-white selection:bg-fuchsia-300 selection:text-[#150354] touch-pan-y break-keep md:h-[100svh] md:overflow-y-auto md:snap-y md:snap-mandatory md:scroll-pt-16 md:scroll-smooth'}
    >
      {children}
    </div>
  );
}
