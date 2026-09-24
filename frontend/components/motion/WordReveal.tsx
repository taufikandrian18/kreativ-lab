'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';
import { swapPlan } from '@/lib/swap-letters';
import { stretchSwaps } from '@/lib/swap-motion';
import { Swapped } from '@/components/type/Swapped';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals a headline word by word.
 *
 * The house motion profile calls word-level reveal a signature, with a 0.08s stagger and
 * a [0.16, 1, 0.3, 1] ease — a long, decelerating settle rather than a bounce. Each word
 * is its own inline-block so the transform never reflows the line; the text stays
 * selectable and a screen reader reads the sentence, not a pile of fragments, because the
 * words are plain text nodes with spaces between them.
 *
 * `scrub` ties the reveal to scroll position instead of playing it once, the Crency
 * reference's signature: a statement assembles word by word as the reader scrolls into it
 * and takes itself apart again on the way back up. Scrubbed words move on transform only,
 * never opacity — a word parked half-transparent while the reader holds still is a grey,
 * which spec §5 forbids. The clip is what hides a word that has not arrived yet.
 *
 * Renders in place whenever motion is off, including the server render.
 */
export function WordReveal({
  as: Tag = 'h2',
  text,
  className = '',
  accent,
  accentClassName = 'text-k-red',
  scrub = false,
  swaps = 0,
}: {
  as?: 'h1' | 'h2' | 'p';
  text: string;
  className?: string;
  /** Words rendered in the accent colour, matched case-insensitively. */
  accent?: readonly string[];
  accentClassName?: string;
  /** Tie the reveal to scroll progress rather than playing it once. */
  scrub?: boolean;
  /** How many letters to set in the wide face (lib/swap-letters.ts). None by default. */
  swaps?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('[data-word]');
      if (scrub) {
        // Set, then to — not fromTo. A staggered fromTo under a scrub renders only the
        // words whose turn has come, so the last word of the line sat fully set until its
        // stagger began and then dropped out of sight to rise again. Measured in a
        // browser: computed transform 'none' on "LIVES." while "LET'S" was mid-rise.
        gsap.set(words, { yPercent: 115, rotate: 6, transformOrigin: '0% 100%' });
        gsap.to(words, {
          yPercent: 0,
          rotate: 0,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'bottom 58%', scrub: 0.6 },
        });
        stretchSwaps(el, { scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
        return;
      }
      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        // Through ctx.add: a callback runs after the context function has returned,
        // so a tween made there would otherwise escape the route's teardown.
        onComplete: () => ctx.add(() => stretchSwaps(el)),
      });
    }, el);

    return () => ctx.revert();
  }, [preference, scrub]);

  // Both sides lose their punctuation before they are compared. The accent list comes
  // from accentWords(), which keeps a trailing full stop ("*LIVE.*" → "live."), while the
  // word being checked had its stop stripped — so an accented last word never matched and
  // "LIVES." shipped in paper instead of red.
  const bare = (w: string) => w.toLowerCase().replace(/[.,!?;:]/g, '');
  const accented = new Set((accent ?? []).map(bare));

  const words = text.split(' ');
  const plan = swapPlan(text, swaps);
  const offsets = words.map((_, i) => words.slice(0, i).join(' ').length + (i > 0 ? 1 : 0));

  return (
    <Tag ref={ref as React.Ref<never>} data-word-reveal={scrub ? 'scrub' : 'once'} className={className}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <span
              data-word
              className={`inline-block ${
                accented.has(bare(word)) ? accentClassName : ''
              }`}
            >
              <Swapped text={word} plan={plan} offset={offsets[index]} />
            </span>
          </span>
          {/* The space is a sibling of the clipped span, never inside it: a space inside
              an overflow-hidden inline-block is dropped from the accessible name, which
              turned "WHO WE ARE" into "WHOWEARE" and made the heading unfindable. */}
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
