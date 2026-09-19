'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { parallaxRange } from '@/lib/parallax';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * Depth by drift: the wrapped content travels at a different rate from the page across
 * its own scroll pass.
 *
 * Scrubbed against the viewport rather than driven by ScrollSmoother's `data-speed`,
 * because the smoother only runs above 1024px and only if it initialised — and this
 * should work at every width either way. `yPercent` is a transform, so it stays on the
 * compositor and never triggers layout, which the Global Constraints require of anything
 * touched by a scroll handler.
 */
export function Parallax({
  speed,
  className = '',
  children,
}: {
  speed: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    // 'unknown' is the server render and the first client render; 'reduced' is the
    // stated preference. Neither drifts — the content stays exactly where the layout
    // put it, which is also its end state.
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const { from, to } = parallaxRange(speed);
    if (from === to) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: from },
        {
          yPercent: to,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [preference, speed]);

  return (
    <div ref={ref} data-parallax={String(speed)} className={className}>
      {children}
    </div>
  );
}
