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
 *
 * `deal` is the Crency reference's card entrance: the card comes in tilted away from the
 * side it enters from and uprights as it lands, scrubbed to scroll so a row of cards
 * reads as a hand being laid down rather than four boxes appearing. Transform only, for
 * the same no-grey reason as WordReveal's scrub — a photograph held at half opacity is a
 * grey wash over the page.
 */
export function SlideIn({
  from,
  delay = 0,
  deal = false,
  className = '',
  children,
}: {
  from: 'left' | 'right';
  delay?: number;
  /** Tilted, scroll-scrubbed entrance. `delay` becomes a scroll offset, not a time. */
  deal?: boolean;
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
      const sign = from === 'left' ? -1 : 1;
      if (deal) {
        // Each card starts its pass a little later in the scroll than the one before, so
        // the stagger survives being scrubbed: `delay` is read as a fraction of a
        // viewport, not as seconds, since scrubbed time is scroll distance.
        const lag = Math.round(delay * 100);
        gsap.fromTo(
          el,
          { xPercent: sign * 22, yPercent: 30, rotate: sign * 9 },
          {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            ease: 'power2.out',
            transformOrigin: '50% 100%',
            scrollTrigger: {
              trigger: el,
              start: `top ${100 - lag}%`,
              end: `top ${62 - lag}%`,
              scrub: 0.8,
            },
          }
        );
        return;
      }
      gsap.from(el, {
        xPercent: sign * 18,
        opacity: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [preference, from, delay, deal]);

  return (
    <div ref={ref} data-slide-in={from} className={className}>
      {children}
    </div>
  );
}
