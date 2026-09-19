'use client';

import { useLayoutEffect, useRef, useState } from 'react';
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
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(Array.from(el.children), {
        yPercent: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onComplete: () => setRevealed(true),
      });
    }, el);

    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={ref} data-stagger-reveal data-revealed={String(revealed)} className={className}>
      {children}
    </div>
  );
}
