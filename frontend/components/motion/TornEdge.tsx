'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/** A deterministic ragged line: the same tear on every build, different per seed. */
export function tearPoints(seed: number, steps = 64): string {
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points = ['0,0'];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    // Mostly shallow with the occasional deep bite, which is how paper actually tears.
    const depth = next() < 0.18 ? 55 + next() * 45 : 15 + next() * 35;
    points.push(`${x.toFixed(2)},${depth.toFixed(1)}`);
  }
  points.push('100,0');
  return points.join(' ');
}

const FILL = { black: 'var(--k-black)', paper: 'var(--k-paper)' } as const;

/**
 * The seam between two sections, torn rather than cut.
 *
 * Crency joins its sections with soft waves that flatten as you scroll through them.
 * The gesture is borrowed; the wave is not. This studio's own showreel tears paper, so
 * the seam is a tear, in the colour of the section above, hanging into the section below.
 * As the section comes up the page, the tear is pulled flat — scaleY from the top edge,
 * transform only. Under anything but full motion it sits at its resting depth.
 *
 * It sits inside the section it opens, so a section that clips its overflow keeps it.
 */
export function TornEdge({ from, seed }: { from: keyof typeof FILL; seed: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleY: 1.8 },
        {
          scaleY: 0.35,
          ease: 'none',
          transformOrigin: '50% 0%',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'top 20%',
            scrub: true,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [preference]);

  return (
    <svg
      ref={ref}
      data-torn-edge
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-[-1px] z-10 block h-[clamp(20px,3.5vw,56px)] w-full"
    >
      <polygon points={tearPoints(seed)} fill={FILL[from]} />
    </svg>
  );
}
