'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { prefersReducedMotion, shouldEnableSmoother } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // One context per route. Reverting it on pathname change tears down every
  // ScrollTrigger and the smoother together, per spec §6 — leaked triggers from a
  // previous route break scrolling on the next one.
  useLayoutEffect(() => {
    const enabled = shouldEnableSmoother({
      width: window.innerWidth,
      reducedMotion: prefersReducedMotion(),
    });
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
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
