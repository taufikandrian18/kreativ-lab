'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ArchiveReel } from '@/lib/archive-reels';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * A studio-supplied clip inside a case study.
 *
 * Built on GSAP rather than framer-motion, which spec §6 excludes by name — "it
 * duplicates GSAP" — and which would be a second animation library doing work the first
 * one already does. The motion is the same one the house profile describes: a scrubbed
 * scale-and-rise as the reel passes, on transform only.
 *
 * The video is absent from the server render and from the first client render, so a
 * reduced-motion visitor is served the poster and never fetches two megabytes of loop.
 */
export function CaseStudyReel({ reel, client }: { reel: ArchiveReel; client: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 0.92, yPercent: 6 },
        {
          scale: 1,
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <div ref={ref} className="bg-k-black overflow-hidden">
      {preference === 'full' ? (
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          poster={reel.poster}
          aria-label={`${client} — campaign reel`}
          width={reel.width}
          height={reel.height}
          className="h-auto w-full"
        >
          <source media="(min-width: 768px)" src={reel.wide} type="video/mp4" />
          <source src={reel.narrow} type="video/mp4" />
        </video>
      ) : (
        <img
          src={reel.poster}
          alt={`${client} — still from the campaign reel`}
          width={reel.width}
          height={reel.height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
      )}
    </div>
  );
}
