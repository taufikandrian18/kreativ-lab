'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger);

export function MaskReveal({
  as: Tag = 'h2',
  className = '',
  children,
}: {
  as?: 'h1' | 'h2' | 'p';
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  // `data-revealed` is written straight onto the element rather than kept in state: it
  // is a marker for tests and styling, and nothing renders differently because of it, so
  // a state update (and the extra render it forces from inside an effect) buys nothing.
  // React sets "false" once and never touches the attribute again, since it never changes.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => {
      el.dataset.revealed = 'true';
    };
    if (prefersReducedMotion()) {
      reveal();
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onComplete: reveal,
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-mask-reveal
      data-revealed="false"
      className={className}
    >
      {children}
    </Tag>
  );
}
