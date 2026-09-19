'use client';

import { useLayoutEffect, useRef, useState } from 'react';
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
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

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
          onComplete: () => setRevealed(true),
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-mask-reveal
      data-revealed={String(revealed)}
      className={className}
    >
      {children}
    </Tag>
  );
}
