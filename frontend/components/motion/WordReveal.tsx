'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

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
 * Renders in place whenever motion is off, including the server render.
 */
export function WordReveal({
  as: Tag = 'h2',
  text,
  className = '',
  accent,
  accentClassName = 'text-k-red',
}: {
  as?: 'h1' | 'h2' | 'p';
  text: string;
  className?: string;
  /** Words rendered in the accent colour, matched case-insensitively. */
  accent?: readonly string[];
  accentClassName?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-word]'), {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [preference]);

  const accented = new Set((accent ?? []).map((w) => w.toLowerCase()));

  const words = text.split(' ');

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <span
              data-word
              className={`inline-block ${
                accented.has(word.toLowerCase().replace(/[.,]/g, '')) ? accentClassName : ''
              }`}
            >
              {word}
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
