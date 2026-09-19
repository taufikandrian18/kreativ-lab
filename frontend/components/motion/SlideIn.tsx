'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * Enters its children from one side as they come into view.
 *
 * Direction is the point: a column of cards that all rise identically reads as a list,
 * while alternating sides reads as a composition. `x` and `opacity` only, so it stays on
 * the compositor, and it renders in place — never off-screen — whenever motion is off,
 * including the server render.
 */
export function SlideIn({
  from,
  delay = 0,
  className = '',
  children,
}: {
  from: 'left' | 'right';
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        xPercent: from === 'left' ? -18 : 18,
        opacity: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [preference, from, delay]);

  return (
    <div ref={ref} data-slide-in={from} className={className}>
      {children}
    </div>
  );
}
