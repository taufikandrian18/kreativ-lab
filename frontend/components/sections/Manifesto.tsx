import { asset } from '@/lib/asset';
import { Grain } from '@/components/motion/Grain';
import { Parallax } from '@/components/motion/Parallax';
import { SlideIn } from '@/components/motion/SlideIn';
import { WordReveal } from '@/components/motion/WordReveal';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

/**
 * Deck page 02, taken apart and rebuilt.
 *
 * It used to be the whole page dropped in as one raster: the studio statement was pixels,
 * unselectable and uncrawlable, and the halftone panel came along for the ride at
 * whatever size the page happened to be. The statement is transcribed here as live text —
 * verbatim from the deck, on 2026-09-19 — and the halftone panel is cropped out as its
 * own asset so it can hold a column and drift on its own.
 */
const OPENING = 'More than creativity. Ideas are everywhere.';

const BODY = [
  'What makes them valuable is how they are explored, developed, crafted, and experienced.',
  "At KREATIVE STUDIO LAB, we believe creativity doesn't end with making something beautiful.",
] as const;

// A real sequence — understanding, then experimentation, then craft, then meaning — so
// each step is set further right than the one before it. The escalation is in the
// indentation rather than in a numbered marker, because the reader does not need to count
// the steps, only to feel them climb. The verb carries the display face; the rest stays
// body, so the four lines scan as one gesture.
const LADDER = [
  { verb: 'It begins', rest: 'with understanding.' },
  { verb: 'It grows', rest: 'through experimentation.' },
  { verb: 'It comes to life', rest: 'through craftsmanship.' },
  { verb: 'And it becomes meaningful', rest: 'when people experience it.' },
] as const;

// Anaphora: "Every" repeats and the noun is what changes, so the noun is what is set
// large. The repetition is the rhythm; the nouns are the content. Scale does the work
// here because spec §5 allows no grey to quiet the repeated word.
const EVERY = ['product', 'detail', 'story', 'experience'] as const;

export function Manifesto() {
  return (
    <section className="bg-k-black text-k-paper relative overflow-hidden">
      <Grain />

      <div className="section-shell relative">
        <div className="grid grid-cols-12 gap-y-16 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-7">
            <WordReveal
              as="h2"
              text="KREATE LIVE STUDIO LAB"
              accent={['live']}
              className="display-type"
            />

            <p className="type-subhead mt-10 max-w-[18ch]">{OPENING}</p>

            <div className="mt-8 max-w-[46ch]">
              {BODY.map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="font-body mt-5 text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <ol className="mt-14">
              {LADDER.map((step, index) => (
                <SlideIn key={step.verb} from="left" delay={index * 0.06}>
                  <li className="py-1.5" style={{ paddingInlineStart: `${index * 2.5}rem` }}>
                    <span className="type-subhead">{step.verb}</span>{' '}
                    <span className="font-body text-base">{step.rest}</span>
                  </li>
                </SlideIn>
              ))}
            </ol>

            <ul className="mt-14">
              {EVERY.map((noun, index) => (
                <SlideIn key={noun} from="left" delay={index * 0.05}>
                  <li className="flex items-baseline gap-3">
                    <span className="font-body text-xs tracking-[0.3em] uppercase">Every</span>
                    <span className="font-display text-5xl leading-[0.95] tracking-tight lg:text-6xl">
                      {noun}.
                    </span>
                  </li>
                </SlideIn>
              ))}
            </ul>

            <p className="font-body mt-14 text-base">Because we don&apos;t simply create.</p>

            <WordReveal
              as="p"
              text="We Create Live."
              accent={['live.']}
              className="display-type mt-4"
            />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <Parallax speed={PARALLAX_SPEEDS.figure} className="h-full">
              {/* The KREATE LIVE halftone, cropped off the right of deck page 02 so it can
                  hold its own column instead of riding along inside the whole page. */}
              <img
                src={asset('/panels/manifesto.webp')}
                alt=""
                width={957}
                height={1358}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
