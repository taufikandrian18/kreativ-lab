import { Gather } from '@/components/motion/Gather';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { TornEdge } from '@/components/motion/TornEdge';
import { Accented } from '@/components/type/Accented';
import { clientWallLayout } from '@/lib/client-wall-layout';
import { clientWallMarks } from '@/lib/client-wall-marks';
import { getClientLogos } from '@/lib/contract';
import { sitePage } from '@/lib/site-content';

/**
 * Spec §6: "logo grid, opacity stagger on a 40ms interval".
 *
 * The marks are cropped from deck page 24 and rendered as alpha masks, so the colour is
 * CSS and a hover can recolour them. The arrangement is deliberately irregular —
 * hash-derived spans, sizes and alignment, and an order that does not echo the deck — so
 * the wall reads as a composition rather than a supplier directory. The scramble is
 * deterministic; lib/client-wall-layout.ts says why that matters.
 *
 * The marks gather out of a scatter as the section scrolls up (Gather) — Crency's chips
 * floating in around its audit headline, landing — under a centred heading. The old 80ms
 * opacity stagger is gone: a wall of marks each half-faded mid-stagger was a wall of
 * greys. Hover is scale 1.03 — subtle is the house style.
 */
// Brutalist means dense and heavy, not scattered. The first pass at h-8/h-11/h-14 with a
// 48px row gap read as a sparse constellation on a 1680px screen — measured by eye in a
// browser. These are roughly double, and the rows are tight enough that neighbouring
// marks nearly touch.
const SIZE_CLASS = {
  sm: 'h-12 lg:h-16',
  md: 'h-16 lg:h-24',
  lg: 'h-24 lg:h-32',
} as const;

const ALIGN_CLASS = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
} as const;

const SPAN_CLASS: Record<number, string> = {
  3: 'col-span-6 lg:col-span-3',
  4: 'col-span-6 lg:col-span-4',
  5: 'col-span-6 lg:col-span-5',
  6: 'col-span-6 lg:col-span-6',
  7: 'col-span-12 lg:col-span-7',
  8: 'col-span-12 lg:col-span-8',
};

export function ClientWall() {
  const marks = clientWallLayout(clientWallMarks(getClientLogos()));
  const home = sitePage('home');

  return (
    // overflow-x-clip: marks start their gather scattered past the page edges.
    <section className="bg-k-paper text-k-black relative overflow-x-clip">
      <TornEdge from="black" seed={11} />
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type text-center">
          <Accented text={home.text('clients_heading')} />
        </MaskReveal>

        <Gather className="mt-16 grid grid-cols-12 items-center gap-x-4 gap-y-6 sm:gap-x-6 lg:gap-x-8">
          {marks.map((mark) => (
            <div
              key={mark.name}
              data-testid="client-cell"
              role="img"
              aria-label={mark.name}
              // min-w-0: a grid item's minimum width is its content by default, so a wide
              // mark pushed its cell — and the page — wider instead of fitting it.
              className={`hover:text-k-red flex min-w-0 transition-[color,transform] duration-300 ease-out hover:scale-[1.03] ${SPAN_CLASS[mark.span]} ${ALIGN_CLASS[mark.align]}`}
            >
              {mark.text ? (
                <span
                  data-client-mark
                  aria-hidden="true"
                  className="font-display max-w-full text-2xl leading-none tracking-tight break-words lg:text-4xl"
                >
                  {mark.name}
                </span>
              ) : (
                <span
                  data-client-mark
                  aria-hidden="true"
                  style={{
                    maskImage: `url(${mark.file})`,
                    WebkitMaskImage: `url(${mark.file})`,
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    backgroundColor: 'currentcolor',
                    aspectRatio: `${mark.w} / ${mark.h}`,
                  }}
                  // max-w-full: a mark is drawn at a fixed height, so its width follows its
                  // shape — Grand Hyatt is 288px wide at the phone's large size, in a
                  // 170px cell, and it ran over Erspo beside it. Capped to the cell, the
                  // box narrows and the mask (contain) scales the artwork down inside it.
                  className={`block w-auto max-w-full ${SIZE_CLASS[mark.size]}`}
                />
              )}
            </div>
          ))}
        </Gather>
      </div>
    </section>
  );
}
