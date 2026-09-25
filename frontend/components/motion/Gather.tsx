'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/** A fixed pseudo-random scatter per index, in percent of the element's own size. */
export function scatterFor(index: number): { xPercent: number; yPercent: number; rotate: number } {
  const a = Math.sin(index * 12.9898) * 43758.5453;
  const b = Math.sin(index * 78.233) * 12345.6789;
  const u = a - Math.floor(a);
  const v = b - Math.floor(b);
  return {
    xPercent: (u - 0.5) * 260,
    yPercent: 120 + v * 260,
    rotate: (u - 0.5) * 50,
  };
}

/**
 * Children fly in from a scatter and settle into their places as the section scrolls
 * up — Crency's floating chips around its audit headline, landing. Scrubbed, transform
 * only, and every child is visible the whole way, so nothing is ever a faded grey.
 * With motion off the children are simply in their places.
 */
export function Gather({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      Array.from(el.children).forEach((child, i) => {
        gsap.fromTo(
          child,
          { ...scatterFor(i), scale: 0.7 },
          {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: `top ${95 - (i % 6) * 2}%`,
              end: 'center 62%',
              scrub: 0.8,
            },
          }
        );
      });
    }, el);
    return () => ctx.revert();
  }, [preference]);

  return (
    <div ref={ref} data-gather className={className}>
      {children}
    </div>
  );
}
