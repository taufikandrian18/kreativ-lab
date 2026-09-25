'use client';

import { asset } from '@/lib/asset';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Grain } from '@/components/motion/Grain';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

/**
 * Spec §6: "Two labs — pinned; two circles converge into the Venn on scrub."
 *
 * Rebuilt as live elements rather than the deck's flat raster, because two circles baked
 * into one image cannot converge. Not pinned: pinning is forbidden below 1024px by §7 and
 * deferred to Stage 5 above it, and the convergence reads perfectly well scrubbed across
 * the section's own scroll pass. The studio mark fades in at the intersection as the two
 * meet, which is what the deck page shows at rest.
 *
 * The circles animate on x and scale only, and the mark on opacity — all compositor
 * properties. Under anything but resolved full motion they render already converged,
 * which is the deck's own composition and the end state of the scrub.
 */
/** "PRODUCT LAB" → PRODUCT / LAB: the last word drops to its own line inside the circle. */
function CircleLabel({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <>{text}</>;
  return (
    <>
      {words.slice(0, -1).join(' ')}
      <br />
      {words[words.length - 1]}
    </>
  );
}

export function LabsVenn({
  product = 'PRODUCT LAB',
  creative = 'CREATIVE LAB',
}: {
  product?: string;
  creative?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        // Measured in a browser: 'top 80%' to 'bottom 55%' spread the convergence over
        // 1200px of scroll for a 729px section, so the circles were still apart by the time
        // the section filled the screen. Ending at centre lands the Venn when the section is.
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 50%', scrub: 0.6 },
      });
      timeline
        .from('[data-lab-circle="product"]', { xPercent: -42, scale: 0.86, ease: 'none' }, 0)
        .from('[data-lab-circle="creative"]', { xPercent: 42, scale: 0.86, ease: 'none' }, 0)
        .from('[data-studio-mark-scale]', { opacity: 0, scale: 0.7, ease: 'none' }, 0.45);

      // Once they have met, the mark keeps turning slowly, so the section is alive
      // while the reader is still in it. Rotation only.
      //
      // The spin runs on its own inner element, never on an element the scrub moves.
      // The ring used to spin on the same element that converged, and GSAP cached its
      // starting offset as a fixed 102px x: the ring stopped 102px short of the Venn on
      // every visit, and the CREATIVE LAB label turned with it and read sideways.
      // Measured in a browser. The ring no longer spins at all: a solid circle turning
      // looks exactly like one standing still, so the spin only ever showed as the label.
      gsap.to('[data-studio-mark]', {
        rotation: -360,
        duration: 140,
        repeat: -1,
        ease: 'none',
      });
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <div ref={root} className="bg-k-black relative aspect-[4/3] w-full overflow-hidden">
      <Grain opacity={0.16} />
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Product Lab: the solid white disc, left of centre. */}
        <div
          data-lab-circle="product"
          className="bg-k-paper text-k-black relative -mr-[12%] flex aspect-square w-[46%] items-end rounded-full p-[6%]"
        >
          <p className="font-display text-xl leading-none tracking-tight sm:text-2xl">
            <CircleLabel text={product} />
          </p>
        </div>

        {/* Creative Lab: the ringed disc, right of centre, over the product disc. */}
        <div
          data-lab-circle="creative"
          className="text-k-paper relative flex aspect-square w-[46%] items-start justify-end rounded-full p-[6%]"
        >
          <span
            aria-hidden="true"
            className="border-k-paper absolute inset-0 rounded-full border-4"
          />
          <p className="font-display relative text-right text-xl leading-none tracking-tight sm:text-2xl">
            <CircleLabel text={creative} />
          </p>
        </div>
      </div>

      {/* The crossed-K mark sits at the intersection, cropped off deck page 04. */}
      {/* Centred by the outer span; scaled in by the scrub on the middle one; turned on
          the inner one. Three elements because a transform GSAP writes replaces the
          centring translate, and two tweens on one element fight over its cache. */}
      <span className="pointer-events-none absolute top-1/2 left-1/2 block aspect-square w-[16%] -translate-x-1/2 -translate-y-1/2">
      <span data-studio-mark-scale aria-hidden="true" className="block h-full w-full">
      <span
        data-studio-mark
        aria-hidden="true"
        style={{
          maskImage: `url(${asset('/logos/studiolab-mark.png')})`,
          WebkitMaskImage: `url(${asset('/logos/studiolab-mark.png')})`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          backgroundColor: 'var(--k-red)',
        }}
        className="block h-full w-full"
      />
      </span>
      </span>
    </div>
  );
}
