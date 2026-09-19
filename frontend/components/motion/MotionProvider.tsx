'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { prefersReducedMotion, shouldEnableSmoother } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  // The environment is not fixed for the life of the page: a desktop window dragged
  // below 1024px must give its native scroll back (spec §7), and toggling the OS
  // reduced-motion setting must take effect without a reload (spec §6). Re-sampling
  // here rather than only on navigation is what makes the smoother follow both.
  useEffect(() => {
    const query =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const sample = () =>
      setEnabled(
        shouldEnableSmoother({
          width: window.innerWidth,
          reducedMotion: prefersReducedMotion(),
        })
      );

    sample();
    window.addEventListener('resize', sample);
    query?.addEventListener?.('change', sample);
    return () => {
      window.removeEventListener('resize', sample);
      query?.removeEventListener?.('change', sample);
    };
  }, []);

  // One context per route. Reverting it on pathname change tears down every
  // ScrollTrigger and the smoother together, per spec §6 — leaked triggers from a
  // previous route break scrolling on the next one.
  useLayoutEffect(() => {
    if (!enabled) return;

    const ctx = gsap.context(() => {
      ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.1,
        effects: true,
      });
    }, wrapper);

    return () => ctx.revert();
  }, [pathname, enabled]);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
