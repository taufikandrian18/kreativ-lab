'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Marquee } from '@/components/motion/Marquee';
import { SplitHeadline } from '@/components/motion/SplitHeadline';
import { useMotionPreference } from '@/lib/use-motion-preference';
import { useSampledDifference } from '@/components/motion/useSampledDifference';

gsap.registerPlugin(ScrollTrigger);

export interface HeroContent {
  headline: string;
  marquee: string;
  videoWide: string;
  videoNarrow: string;
  poster: string;
  still: string;
  videoLabel: string;
}

/** The hero as it renders. Hero.tsx resolves the content; this owns the motion switch. */
export function HeroView({ content }: { content: HeroContent }) {
  const preference = useMotionPreference();
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);

  // The scroll-out, after the Crency reference's hero: leaving the section is a camera
  // move, not a page sliding up. The showreel pushes in while the headline lifts and
  // shrinks toward its own corner, and the marquee band runs ahead of both — three
  // layers at three rates. Transform only, scrubbed across the hero's own exit, and the
  // amendment's "scroll-linked type scale on route openers" for the home route.
  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = section.current;
    if (!el) return;
    // Found rather than ref'd: SplitHeadline owns the h1's ref, and a wrapper div would
    // put a box between the h1 and the gutter shell the rhythm suite holds it to.
    const headline = el.querySelector('[data-split-headline]');
    if (!media.current || !band.current || !headline) return;

    const ctx = gsap.context(() => {
      const exit = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
      exit
        .to(media.current, { scale: 1.15 }, 0)
        .to(band.current, { yPercent: -140 }, 0)
        .to(headline, { yPercent: -35, scale: 0.86, transformOrigin: '0% 100%' }, 0);
    }, el);

    return () => ctx.revert();
  }, [preference]);

  // iOS cannot blend page content with a playing video, so there the headline's
  // difference is computed from the frame instead (lib/blend-fallback.ts). Only while the
  // video is what is showing: the poster and the reduced-motion still are images, which
  // WebKit blends normally.
  useSampledDifference(section, preference === 'full');

  return (
    <section
      ref={section}
      className="bg-k-black text-k-paper relative flex min-h-[100svh] overflow-hidden"
    >
      {/* Spec §10: the poster frame is the LCP element and is preloaded. React hoists
          this into <head>, ahead of the deck images further down the page. */}
      <link rel="preload" as="image" href={content.poster} fetchPriority="high" />

      <div ref={media} className="absolute inset-0">
        {preference === 'full' ? (
          <video
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            poster={content.poster}
            aria-label={content.videoLabel}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source media="(min-width: 768px)" src={content.videoWide} type="video/mp4" />
            <source src={content.videoNarrow} type="video/mp4" />
          </video>
        ) : (
          // 'unknown' is the server render and the first client render: the poster, which
          // is both the spec's LCP element and the video's own first frame, so switching
          // to the video after mount is seamless. 'reduced' resolves to the still per §6.
          <img
            src={preference === 'reduced' ? content.still : content.poster}
            alt={content.videoLabel}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Sits in the upper third so it clears the headline, which anchors to the
          bottom. At top-1/3 the two overlapped by 51px in a 784px viewport — measured in
          a browser, since jsdom has no layout and cannot see a collision. */}
      <div ref={band} className="absolute inset-x-0 top-[15%] opacity-90">
        <Marquee text={content.marquee} className="text-k-red" />
      </div>

      <div className="shell-inline relative flex flex-1 items-end pb-24">
        {/* mix-blend-difference, not a scrim: the showreel cuts to near-white frames and
            white-on-white made the headline vanish. Difference blending inverts the
            headline against whatever is behind it — black over a white frame, white over a
            dark one — and costs no grey, which spec §5 forbids as a CSS colour. */}
        <SplitHeadline
          as="h1"
          text={content.headline}
          className="display-type max-w-[12em] [text-wrap:balance] mix-blend-difference"
        />
      </div>
    </section>
  );
}
