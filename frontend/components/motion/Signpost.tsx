'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

const TONE = {
  red: { face: 'bg-k-red text-k-paper', depth: 'bg-k-black' },
  black: { face: 'bg-k-black text-k-paper', depth: 'bg-k-red' },
  paper: { face: 'bg-k-paper text-k-black', depth: 'bg-k-red' },
} as const;

/**
 * A link set as a signpost — Crency's "VIEW ALL CASES" boards: an arrow-shaped plate
 * with its depth showing, turned away in perspective and swinging toward the reader as
 * the page brings it up. On hover it faces the reader square.
 *
 * Two layers so the two motions never fight: the outer one is GSAP's (the swing, on
 * scroll), the inner one is CSS's (the square-up, on hover). Both are rotateY only.
 */
export function Signpost({
  href,
  point = 'right',
  tone = 'red',
  children,
}: {
  href: string;
  point?: 'left' | 'right';
  tone?: keyof typeof TONE;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();
  const sign = point === 'right' ? 1 : -1;

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { rotateY: sign * -55, xPercent: sign * -12 },
        {
          rotateY: sign * -14,
          xPercent: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: 0.8 },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [preference, sign]);

  return (
    <div className="[perspective:900px]">
      <div
        ref={ref}
        data-signpost={point}
        className="[transform-style:preserve-3d]"
        style={{ transform: `rotateY(${sign * -14}deg)` }}
      >
        <Link
          href={href}
          data-point={point}
          className="k-signpost hover:[transform:rotateY(var(--square))]"
          style={{ ['--square' as string]: `${sign * 14}deg` }}
        >
          <span aria-hidden="true" className={`k-signpost-depth ${TONE[tone].depth}`} />
          <span className={`k-signpost-face relative ${TONE[tone].face}`}>{children}</span>
        </Link>
      </div>
    </div>
  );
}
