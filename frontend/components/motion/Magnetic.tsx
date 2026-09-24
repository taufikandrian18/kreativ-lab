'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMotionPreference } from '@/lib/use-motion-preference';

/** How far the element follows the pointer, as a fraction of the pointer's offset. */
const PULL = 0.35;

/**
 * A call to action that leans toward the pointer and springs back when it leaves.
 *
 * Borrowed from the Crency reference's pill buttons. It is not the custom cursor the
 * 2026-09-19 amendment declined: the cursor stays the system cursor, and only the one
 * element that is asking to be clicked responds to it.
 *
 * Fine pointers with hover only. On touch there is nothing to lean toward, and a
 * transform left over from a synthetic pointer event would misplace the tap target.
 */
export function Magnetic({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;
    if (
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

      const move = (event: PointerEvent) => {
        // The box is measured with the current offset taken back out, so the pull is
        // relative to where the element rests, not to where it has already leaned.
        const box = el.getBoundingClientRect();
        const restX = box.left + box.width / 2 - Number(gsap.getProperty(el, 'x'));
        const restY = box.top + box.height / 2 - Number(gsap.getProperty(el, 'y'));
        toX((event.clientX - restX) * PULL);
        toY((event.clientY - restY) * PULL);
      };
      const leave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      };

      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <span ref={ref} data-magnetic className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
