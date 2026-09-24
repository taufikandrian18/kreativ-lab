import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
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
 * Stagger is 80ms rather than §6's 40ms: at 25 marks, 40ms ran the whole wall in a second
 * and read as one block appearing. Hover is scale 1.03, not the 1.10 shipped earlier —
 * subtle is the house style.
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
    <section className="bg-k-paper text-k-black">
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type">
          {home.text('clients_heading')}
        </MaskReveal>

        <StaggerReveal
          className="mt-16 grid grid-cols-12 items-center gap-x-4 gap-y-6 sm:gap-x-6 lg:gap-x-8"
          stagger={0.08}
        >
          {marks.map((mark) => (
            <div
              key={mark.name}
              data-testid="client-cell"
              role="img"
              aria-label={mark.name}
              className={`hover:text-k-red flex transition-[color,transform] duration-300 ease-out hover:scale-[1.03] ${SPAN_CLASS[mark.span]} ${ALIGN_CLASS[mark.align]}`}
            >
              {mark.text ? (
                <span
                  data-client-mark
                  aria-hidden="true"
                  className="font-display text-2xl leading-none tracking-tight whitespace-nowrap lg:text-4xl"
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
                  className={`block w-auto ${SIZE_CLASS[mark.size]}`}
                />
              )}
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
