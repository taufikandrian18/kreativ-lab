'use client';

import { Marquee } from '@/components/motion/Marquee';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { useMotionPreference } from '@/lib/use-motion-preference';

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

  return (
    <section className="bg-k-black text-k-paper relative flex min-h-[100svh] overflow-hidden">
      {/* Spec §10: the poster frame is the LCP element and is preloaded. React hoists
          this into <head>, ahead of the deck images further down the page. */}
      <link rel="preload" as="image" href={content.poster} fetchPriority="high" />

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

      {/* Sits in the upper third so it clears the headline, which anchors to the
          bottom. At top-1/3 the two overlapped by 51px in a 784px viewport — measured in
          a browser, since jsdom has no layout and cannot see a collision. */}
      <div className="absolute inset-x-0 top-[15%] opacity-90">
        <Marquee text={content.marquee} className="text-k-red" />
      </div>

      <div className="shell-inline relative flex flex-1 items-end pb-24">
        {/* mix-blend-difference, not a scrim: the showreel cuts to near-white frames and
            white-on-white made the headline vanish. Difference blending inverts the
            headline against whatever is behind it — black over a white frame, white over a
            dark one — and costs no grey, which spec §5 forbids as a CSS colour. */}
        <MaskReveal as="h1" className="display-type max-w-[16ch] mix-blend-difference">
          {content.headline}
        </MaskReveal>
      </div>
    </section>
  );
}
