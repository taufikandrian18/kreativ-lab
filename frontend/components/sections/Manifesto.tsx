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

const LADDER = [
  'It begins with understanding.',
  'It grows through experimentation.',
  'It comes to life through craftsmanship.',
  'And it becomes meaningful when people experience it.',
] as const;

const EVERY = ['Every product.', 'Every detail.', 'Every story.', 'Every experience.'] as const;

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

            <p className="font-body mt-12 max-w-[42ch] text-xl">{OPENING}</p>

            <div className="mt-8 max-w-[52ch]">
              {BODY.map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="font-body mt-5 text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="mt-12 max-w-[52ch]">
              {LADDER.map((line, index) => (
                <SlideIn key={line} from="left" delay={index * 0.06}>
                  <li className="font-body py-1 text-lg">{line}</li>
                </SlideIn>
              ))}
            </ul>

            <ul className="mt-10">
              {EVERY.map((line, index) => (
                <SlideIn key={line} from="left" delay={index * 0.05}>
                  <li className="font-display text-3xl leading-tight tracking-tight">{line}</li>
                </SlideIn>
              ))}
            </ul>

            <p className="font-body mt-10 text-lg">Because we don&apos;t simply create.</p>

            <WordReveal
              as="p"
              text="We Create Live."
              accent={['live.']}
              className="display-type mt-6"
            />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <Parallax speed={PARALLAX_SPEEDS.figure} className="h-full">
              {/* The KREATE LIVE halftone, cropped off the right of deck page 02 so it can
                  hold its own column instead of riding along inside the whole page. */}
              <img
                src="/panels/manifesto.webp"
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
