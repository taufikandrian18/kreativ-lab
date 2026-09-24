'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Accented } from '@/components/type/Accented';
import { accentRuns } from '@/lib/site-content';
import { stretchSwaps } from '@/lib/swap-motion';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits a headline into two lines at the sentence break nearest its middle, falling
 * back to the middle word. `*accent*` markup is kept whole on whichever line it lands.
 */
export function splitLines(text: string): [string, string] {
  const breaks = [...text.matchAll(/[.?!]\s+/g)].map((m) => (m.index ?? 0) + m[0].length);
  if (breaks.length > 0) {
    const mid = text.length / 2;
    const at = breaks.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a));
    return [text.slice(0, at).trim(), text.slice(at).trim()];
  }
  const words = text.split(' ');
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

/**
 * Crency's two-line opener — WE CRAFT BRANDS AND DIGITAL / PRODUCTS THAT SCALE — with
 * the second line set in from the left so the pair reads as a composition, not a block.
 *
 * Each line rises out of its own clip on arrival, then the two lines drift apart and
 * back together across the heading's scroll pass, in opposite directions — the one
 * scrubbed move that makes a static opener feel like it is being read. Transform only.
 */
export function OffsetHeading({
  as: Tag = 'h2',
  text,
  className = '',
}: {
  as?: 'h1' | 'h2';
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const preference = useMotionPreference();
  const [first, second] = splitLines(text);

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const inner = el.querySelectorAll('[data-line-inner]');
      gsap.from(inner, {
        yPercent: 110,
        rotate: 3,
        duration: 1,
        stagger: 0.14,
        ease: 'expo.out',
        transformOrigin: '0% 100%',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        // Through ctx.add: a callback runs after the context function has returned,
        // so a tween made there would otherwise escape the route's teardown.
        onComplete: () => ctx.add(() => stretchSwaps(el)),
      });

      el.querySelectorAll<HTMLElement>('[data-line]').forEach((line, i) => {
        gsap.fromTo(
          line,
          { xPercent: i === 0 ? 6 : -6 },
          {
            xPercent: i === 0 ? -3 : 3,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    // aria-label: the accessible name is computed per block and each block's text is
    // trimmed, so two lines read "EVERYWHERE.WE" whatever whitespace sits between them.
    // The label is the sentence exactly as written, without the accent markup.
    <Tag
      ref={ref as React.Ref<never>}
      data-offset-heading
      aria-label={accentRuns(text).map((r) => r.text).join('')}
      className={className}
    >
      <span data-line className="block overflow-hidden pb-[0.04em]">
        <span data-line-inner className="block">
          <Accented text={first} swaps={1} />
        </span>
      </span>{' '}
      <span data-line className="block overflow-hidden pb-[0.04em] lg:pl-[22%]">
        <span data-line-inner className="block">
          <Accented text={second} swaps={1} />
        </span>
      </span>
    </Tag>
  );
}
