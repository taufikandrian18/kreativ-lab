'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { PRELOADER_DONE } from '@/components/chrome/Preloader';
import { StudioMark } from '@/components/chrome/StudioMark';
import { useMotionPreference } from '@/lib/use-motion-preference';

/** How far the digits drift against the pointer, in px at the edge of the screen. */
const DRIFT = 18;

/**
 * The 404 as a word-mark across the screen, with every 0 drawn as the red crossed-K —
 * the page that is missing is the one place the studio signs its name this large.
 *
 * The digits drop in one after another (expo.out, 0.12s apart) and the mark rolls in
 * behind them, then keeps turning at the sticker's slow 24s. On a fine pointer the
 * digits drift against it and the mark with it, so the number reads as a layer in front
 * of the page rather than printed on it. Transform and opacity only.
 *
 * Hidden by CSS until this runs (globals.css, [data-lost-in]), with a failsafe that shows
 * it at 3.5s if it never does. On a visit's first page it waits for the preloader's
 * curtain to lift, as the home headline does.
 */
export function LostCode({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || preference === 'unknown') return;
    if (preference === 'reduced') {
      gsap.set(el.querySelectorAll('[data-lost-in]'), { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const digits = gsap.utils.toArray<HTMLElement>('[data-lost-digit]');
      const marks = gsap.utils.toArray<HTMLElement>('[data-lost-mark]');
      gsap.set([...digits, ...marks], { opacity: 0 });

      const play = () =>
        gsap
          .timeline()
          .fromTo(
            digits,
            { yPercent: 45, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.12 },
            0
          )
          .fromTo(
            marks,
            { scale: 0.4, rotate: -140, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.6)' },
            0.18
          );

      const curtained = document.documentElement.getAttribute('data-preloader') === 'on';
      if (curtained) window.addEventListener(PRELOADER_DONE, play, { once: true });
      else play();

      if (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) {
        const layers = [
          ...digits.map((d) => ({ el: d, depth: -1 })),
          ...marks.map((m) => ({ el: m.firstElementChild as HTMLElement, depth: 1.4 })),
        ].map(({ el: target, depth }) => ({
          depth,
          x: gsap.quickTo(target, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(target, 'y', { duration: 0.9, ease: 'power3.out' }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const l of layers) {
            l.x(nx * DRIFT * 2 * l.depth);
            l.y(ny * DRIFT * 2 * l.depth);
          }
        };
        window.addEventListener('pointermove', onMove);
        return () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener(PRELOADER_DONE, play);
        };
      }
      return () => window.removeEventListener(PRELOADER_DONE, play);
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={code}
      className="font-display text-k-paper flex items-center justify-center gap-[0.03em] text-[clamp(8rem,42vw,32rem)] leading-[0.8] tracking-[-0.04em] select-none"
    >
      {[...code].map((ch, i) =>
        ch === '0' ? (
          <span key={i} data-lost-in data-lost-mark className="inline-block w-[0.74em] px-[0.02em]">
            <span className="block">
              <StudioMark className="k-sticker-spin block w-full" />
            </span>
          </span>
        ) : (
          <span key={i} data-lost-in data-lost-digit className="inline-block">
            {ch}
          </span>
        )
      )}
    </div>
  );
}

/** The address the visitor tried, read after mount: the 404 page is one static file. */
export function MissingPath({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = window.location.pathname;
  }, []);
  return (
    <p className="font-body flex min-w-0 flex-wrap items-baseline gap-x-3 text-xs tracking-widest uppercase">
      <span>{label}</span>
      <span ref={ref} className="text-k-red font-semibold tracking-normal break-all normal-case" />
    </p>
  );
}
