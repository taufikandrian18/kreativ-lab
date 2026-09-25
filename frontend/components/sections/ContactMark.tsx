'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MARK_RING, StudioMark } from '@/components/chrome/StudioMark';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * The studio mark, large, as the contact page's picture — the same drawing the preloader
 * opens the site with, so the site ends where it began. The ring draws itself round and
 * the K drops in as it comes into view, then the whole mark turns very slowly. The deck
 * page it replaces carried the phone numbers and email printed into the image, a second
 * time and too small to read on a phone.
 */
export function ContactMark({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const c = 2 * Math.PI * MARK_RING.r;
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
        .fromTo(
          '[data-mark-ring]',
          { attr: { 'stroke-dasharray': c, 'stroke-dashoffset': c } },
          { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power3.inOut' }
        )
        .from(
          '[data-mark-k]',
          { scale: 0.4, rotate: -35, opacity: 0, transformOrigin: '50% 50%', duration: 0.9, ease: 'back.out(1.8)' },
          0.45
        );
      gsap.to(el, { rotation: 360, duration: 120, repeat: -1, ease: 'none' });
    }, el);
    return () => ctx.revert();
  }, [preference]);

  return (
    <div ref={ref} data-contact-mark className={className}>
      <StudioMark className="block h-auto w-full" />
    </div>
  );
}
