'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger);

export function StaggerReveal({
  className = '',
  stagger = 0.06,
  children,
}: {
  className?: string;
  stagger?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

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
      gsap.from(Array.from(el.children), {
        yPercent: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onComplete: reveal,
      });
    }, el);

    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={ref} data-stagger-reveal data-revealed="false" className={className}>
      {children}
    </div>
  );
}
