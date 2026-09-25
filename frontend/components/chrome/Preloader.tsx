'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MARK_RING, StudioMark } from '@/components/chrome/StudioMark';
import { tearPoints } from '@/lib/shapes';

gsap.registerPlugin(ScrollTrigger);

/** Session key: the preloader plays once per visit, not on every route change or reload. */
export const PRELOADER_SEEN = 'k-preloader-seen';

/** Event the hero headline waits for before it builds, so it is not built behind a curtain. */
export const PRELOADER_DONE = 'k:preloaded';

/** Shortest time the mark is on screen, so a fast load still reads as a gesture, not a flicker. */
const MIN_HOLD = 0.9;

/** Longest the preloader waits for fonts and the page before leaving anyway. */
const MAX_WAIT = 1.6;

/**
 * Runs in <head>, before first paint, and decides whether the preloader shows at all:
 * only on the first page of a visit, and never under reduced motion. Without this attribute
 * the preloader is display:none, so with JS off it never appears (globals.css).
 */
export const PRELOADER_BOOT = `(function(){var d=document.documentElement,on=false;try{on=!sessionStorage.getItem('${PRELOADER_SEEN}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}d.setAttribute('data-preloader',on?'on':'off')})()`;

function finish() {
  const html = document.documentElement;
  html.setAttribute('data-preloader', 'done');
  try {
    sessionStorage.setItem(PRELOADER_SEEN, '1');
  } catch {
    // Private mode or blocked storage: the preloader simply plays again next time.
  }
  window.dispatchEvent(new Event(PRELOADER_DONE));
  ScrollTrigger.refresh();
}

/**
 * The red crossed-K as the opening curtain.
 *
 * The ring draws itself round, the K drops into it, and the black panel lifts off the page
 * with a torn lower edge — the showreel's own torn paper. It never holds the page hostage:
 * it leaves as soon as fonts and the page have loaded (after a short minimum, so a fast
 * connection still sees a gesture), after 1.6s regardless, and a pure-CSS failsafe in
 * globals.css lifts it at 2.8s even if this script never runs. It plays once per visit.
 *
 * Spec 2026-09-19 declined a preloader because it spends the LCP budget on itself. This
 * one sits over a page that is already rendering underneath; the cost it adds is at most
 * the hold time, and only on a visit's first page.
 */
// Live preloader effects. React's development StrictMode mounts, unmounts and remounts
// every effect once; finishing on that first unmount ended the curtain before it showed.
// Cleanup therefore waits a tick and finishes only if nothing has remounted.
let mounted = 0;

export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const html = document.documentElement;
    if (!el || html.getAttribute('data-preloader') !== 'on') return;

    let done = false;
    mounted++;
    const ctx = gsap.context(() => {
      const circumference = 2 * Math.PI * MARK_RING.r;
      // Hidden by CSS until now, so first paint never shows the finished mark for a frame
      // before the draw begins.
      gsap.set('[data-preloader-mark]', { visibility: 'visible' });
      const intro = gsap.timeline();
      intro
        .fromTo(
          '[data-mark-ring]',
          { attr: { 'stroke-dasharray': circumference, 'stroke-dashoffset': circumference } },
          { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power3.inOut' },
          0
        )
        .from(
          '[data-mark-k]',
          { scale: 0.4, rotate: -35, opacity: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(1.8)' },
          0.35
        );

      const leave = () => {
        if (done) return;
        done = true;
        gsap
          .timeline({ onComplete: finish })
          .to('[data-preloader-mark]', { scale: 0.7, yPercent: -20, duration: 0.6, ease: 'power3.in' }, 0)
          .to(el, { yPercent: -115, duration: 0.85, ease: 'expo.inOut' }, 0.15);
      };

      const ready = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
      ]);
      const minHold = new Promise((resolve) => setTimeout(resolve, MIN_HOLD * 1000));
      const cap = new Promise((resolve) => setTimeout(resolve, MAX_WAIT * 1000));
      Promise.race([Promise.all([ready, minHold]), cap]).then(() => ctx.add(leave));
    }, el);

    return () => {
      mounted--;
      ctx.revert();
      // Unmounted mid-play for good: never leave the page curtained.
      setTimeout(() => {
        if (mounted === 0 && html.getAttribute('data-preloader') === 'on') finish();
      }, 50);
    };
  }, []);

  return (
    <div
      ref={ref}
      id="k-preloader"
      aria-hidden="true"
      className="bg-k-black fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div data-preloader-mark>
        <StudioMark className="block w-[min(46vw,260px)]" />
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-full block h-[clamp(24px,5vw,72px)] w-full"
      >
        <polygon points={tearPoints(23)} fill="var(--k-black)" />
      </svg>
    </div>
  );
}
