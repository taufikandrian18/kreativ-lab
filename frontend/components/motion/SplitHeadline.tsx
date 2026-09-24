'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMotionPreference } from '@/lib/use-motion-preference';

/**
 * An above-the-fold headline that builds itself letter by letter on load.
 *
 * The Crency reference sets its opener in a compressed grotesque and has the letters
 * arrive rather than the block fade in; ours is the same gesture on the deck's own face.
 * Each character rises out of its word's clip and uprights from a slight tilt — a type
 * compositor dropping sorts into a line, not a bounce.
 *
 * Load-triggered, not scroll-triggered: the hero is in view on arrival, and a
 * ScrollTrigger at 'top 85%' fires on frame one anyway, so it was never a scroll reveal.
 *
 * The characters are hidden from first paint by `[data-split-char]` in globals.css (only
 * under no-preference), so hydration does not flash the finished headline, hide it, and
 * then build it. That rule carries a failsafe that shows the letters after 4s if this
 * effect never runs, and the layout's <noscript> shows them at once with JS off.
 *
 * The heading's accessible name is the plain text via aria-label; the per-letter spans are
 * presentation and hidden from assistive technology, so a screen reader reads a sentence.
 */
export function SplitHeadline({
  as: Tag = 'h1',
  text,
  className = '',
  delay = 0.15,
}: {
  as?: 'h1' | 'h2';
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-split-char]'),
        { yPercent: 110, rotate: 8, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1,
          delay,
          stagger: 0.028,
          ease: 'expo.out',
          transformOrigin: '0% 100%',
        }
      );
    }, el);

    return () => ctx.revert();
  }, [preference, delay]);

  const words = text.split(' ');

  return (
    <Tag ref={ref as React.Ref<never>} aria-label={text} data-split-headline className={className}>
      {words.map((word, w) => (
        <Fragment key={`${word}-${w}`}>
          {/* The clip is padded and pulled back by the same amount so Anton's caps, which
              stand taller than a 0.95 line box, are not shaved while at rest. */}
          <span
            aria-hidden="true"
            className="-my-[0.08em] inline-block overflow-hidden py-[0.08em] align-bottom whitespace-nowrap"
          >
            {Array.from(word).map((char, c) => (
              <span key={c} data-split-char className="inline-block">
                {char}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
