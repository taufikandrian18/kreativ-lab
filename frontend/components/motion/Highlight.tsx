'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { accentRuns } from '@/lib/site-content';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * A sentence with its *starred* words highlighted — Crency's "Trust comes [from design],
 * not explanation", the marker stroke behind the phrase that matters.
 *
 * The marker is red and the words on it turn paper, so the highlight stays inside the
 * three colours. It is drawn in with scaleX from its left edge once the line is in view;
 * with motion off it is simply there.
 */
export function Highlight({
  as: Tag = 'p',
  text,
  className = '',
}: {
  as?: 'p' | 'h2';
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-mark]'), {
        scaleX: 0,
        duration: 0.9,
        delay: 0.2,
        stagger: 0.15,
        ease: 'expo.out',
        transformOrigin: '0% 50%',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [preference]);

  return (
    <Tag ref={ref as React.Ref<never>} className={`isolate ${className}`}>
      {accentRuns(text).map((run, i) =>
        run.accent ? (
          <span key={i} className="text-k-paper relative inline-block px-[0.12em]">
            <span
              data-mark
              aria-hidden="true"
              className="bg-k-red absolute inset-x-0 inset-y-[0.06em] -z-10 -skew-x-6 rounded-[0.12em]"
            />
            {run.text}
          </span>
        ) : (
          <Fragment key={i}>{run.text}</Fragment>
        )
      )}
    </Tag>
  );
}
