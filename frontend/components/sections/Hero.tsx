'use client';

import { Marquee } from '@/components/motion/Marquee';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { useMotionPreference } from '@/lib/use-motion-preference';

export function Hero() {
  const preference = useMotionPreference();

  return (
    <section className="bg-k-black text-k-paper relative flex min-h-[100svh] overflow-hidden">
      {/* Spec §10: the poster frame is the LCP element and is preloaded. React hoists
          this into <head>, ahead of the deck images further down the page. */}
      <link rel="preload" as="image" href="/video/hero-poster.jpg" fetchPriority="high" />

      {preference === 'full' ? (
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          poster="/video/hero-poster.jpg"
          aria-label="Kreative Studio Lab showreel"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source media="(min-width: 768px)" src="/video/hero-1080.mp4" type="video/mp4" />
          <source src="/video/hero-720.mp4" type="video/mp4" />
        </video>
      ) : (
        // 'unknown' is the server render and the first client render: the poster, which
        // is both the spec's LCP element and the video's own first frame, so switching
        // to the video after mount is seamless. 'reduced' resolves to the still per §6.
        <img
          src={preference === 'reduced' ? '/video/hero-still-reduced.jpg' : '/video/hero-poster.jpg'}
          alt="Kreative Studio Lab"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Sits in the upper third so it clears the headline, which anchors to the
          bottom. At top-1/3 the two overlapped by 51px in a 784px viewport — measured in
          a browser, since jsdom has no layout and cannot see a collision. */}
      <div className="absolute inset-x-0 top-[15%] opacity-90">
        <Marquee text="KREATE LIVE" className="text-k-red" />
      </div>

      <div className="shell-inline relative flex flex-1 items-end pb-24">
        {/* mix-blend-difference, not a scrim: the showreel cuts to near-white frames and
            white-on-white made the headline vanish. Difference blending inverts the
            headline against whatever is behind it — black over a white frame, white over a
            dark one — and costs no grey, which spec §5 forbids as a CSS colour. */}
        <MaskReveal as="h1" className="display-type max-w-[16ch] mix-blend-difference">
          CLEAN IN FORM. SHARP IN FUNCTION.
        </MaskReveal>
      </div>
    </section>
  );
}
