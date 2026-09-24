'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/** A burst of `points` spikes, as an SVG polygon in a 0–100 box. */
export function burstPoints(points = 14, inner = 26, outer = 50): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    out.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return out.join(' ');
}

/**
 * Crency's cases: a hand of cards held in a stack, fanned out while the section holds
 * still, with a burst turning behind them.
 *
 * The grid the children sit in is the layout and the end state — it is what renders
 * with motion off, on the server, and under reduced motion. At 1024px and up the section
 * pins and each card starts gathered at the centre, tilted, and deals out to its place
 * on scrub; spec §7 forbids pinning below 1024px, so there the cards are dealt in once
 * as they arrive. Offsets are read from offsetLeft/offsetWidth — layout values that
 * ignore transforms — once per refresh, never inside the scroll handler.
 */
export function CardFan({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = stage.current;
    const row = grid.current;
    if (!el || !row) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const cards = Array.from(row.children) as HTMLElement[];
      const mid = (cards.length - 1) / 2;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'center center',
          end: '+=100%',
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      cards.forEach((card, i) => {
        timeline.from(
          card,
          {
            x: () => row.offsetWidth / 2 - (card.offsetLeft + card.offsetWidth / 2),
            yPercent: 6 * Math.abs(i - mid),
            rotate: (i - mid) * 8,
            scale: 0.84,
            ease: 'power2.inOut',
          },
          0
        );
      });
      timeline.fromTo(
        el.querySelector('[data-burst]'),
        { rotate: -30, scale: 0.55 },
        { rotate: 45, scale: 1.1, ease: 'none' },
        0
      );
    });
    mm.add('(max-width: 1023px)', () => {
      Array.from(row.children).forEach((card, i) => {
        gsap.from(card, {
          yPercent: 30,
          rotate: i % 2 === 0 ? -6 : 6,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        });
      });
    });

    return () => mm.revert();
  }, [preference]);

  return (
    <div ref={stage} data-card-fan className="relative">
      {/* Centred by the wrapper, turned by GSAP on the svg: a transform GSAP writes
          would replace the centring translate if both lived on one element. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 w-[min(120vw,1100px)] -translate-x-1/2 -translate-y-1/2"
      >
        <svg data-burst viewBox="0 0 100 100" className="block w-full">
          <polygon points={burstPoints()} fill="var(--k-red)" />
        </svg>
      </div>
      <div ref={grid} className={`relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
