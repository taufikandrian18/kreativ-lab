'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

export interface Chip {
  src: string;
}

/** After which word each chip sits: spread evenly, never after the last word. */
export function chipSlots(wordCount: number, chipCount: number): number[] {
  const slots: number[] = [];
  for (let i = 0; i < chipCount; i++) {
    const at = Math.round(((i + 1) * wordCount) / (chipCount + 1)) - 1;
    slots.push(Math.min(Math.max(at, 0), wordCount - 2));
  }
  return [...new Set(slots)];
}

// Where each chip starts, as a fraction of the statement's own box: scattered around it,
// never inside the line it is flying into. Fixed, not random, so the flight is the same
// on every visit and a screenshot can be compared against the last one.
const SCATTER = [
  { x: -0.42, y: -0.9, r: -24 },
  { x: 0.38, y: -1.1, r: 18 },
  { x: -0.3, y: 1.2, r: 14 },
  { x: 0.44, y: 0.95, r: -20 },
];

/**
 * Crency's signature statement — "We build brands [icon] people love and websites [icon]
 * that win clients" — with the studio's own work where Crency has icons.
 *
 * Scrubbed to scroll: the words rise into the line one after another while the photos
 * fly in from around the statement and land in the gaps saved for them. Scroll back up
 * and it comes apart again. Words move on transform only and never opacity, so nothing
 * sits half-transparent (a grey) while the reader holds still.
 *
 * The photographs are decoration — the sentence is complete without them — so they are
 * hidden from assistive technology and carry empty alt text.
 */
export function ChipStatement({
  text,
  chips,
  className = '',
}: {
  text: string;
  chips: readonly Chip[];
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const preference = useMotionPreference();
  const words = text.split(' ');
  const slots = chipSlots(words.length, chips.length);

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: el, start: 'top 88%', end: 'bottom 45%', scrub: 0.7 };
      const wordEls = el.querySelectorAll('[data-word]');
      // Set, then to: a staggered fromTo under a scrub leaves the later words unrendered
      // at their start state (see WordReveal).
      gsap.set(wordEls, { yPercent: 115 });
      gsap.to(wordEls, { yPercent: 0, ease: 'power2.out', stagger: 0.1, scrollTrigger: trigger });

      const box = el.getBoundingClientRect();
      el.querySelectorAll<HTMLElement>('[data-chip]').forEach((chip, i) => {
        const from = SCATTER[i % SCATTER.length];
        gsap.fromTo(
          chip,
          { x: from.x * box.width, y: from.y * box.height, rotate: from.r, scale: 2.2 },
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            ease: 'power3.out',
            scrollTrigger: { ...trigger, scrub: 0.9 },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [preference, text]);

  return (
    <p ref={ref} data-chip-statement className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span data-word className="inline-block">
              {word}
            </span>
          </span>
          {slots.includes(i) && chips[slots.indexOf(i)] ? (
            <>
              {' '}
              <span data-chip aria-hidden="true" className="k-chip bg-k-black">
                <img
                  src={chips[slots.indexOf(i)].src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </span>
            </>
          ) : null}
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </p>
  );
}
