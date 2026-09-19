'use client';

import { Marquee } from '@/components/motion/Marquee';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { prefersReducedMotion } from '@/lib/motion-env';

export function Hero() {
  const reduced = prefersReducedMotion();

  return (
    <section className="bg-k-black text-k-paper relative min-h-[100svh] overflow-hidden">
      {reduced ? (
        <img
          src="/video/hero-still-reduced.jpg"
          alt="Kreative Studio Lab"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
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
      )}

      <div className="absolute inset-x-0 top-1/3 opacity-90">
        <Marquee text="KREATE LIVE" className="text-k-red" />
      </div>

      <div className="relative flex min-h-[100svh] items-end px-4 pb-20 sm:px-8 lg:px-12">
        <MaskReveal as="h1" className="display-type max-w-[16ch]">
          CLEAN IN FORM. SHARP IN FUNCTION.
        </MaskReveal>
      </div>
    </section>
  );
}
