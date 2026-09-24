import { asset } from '@/lib/asset';
import { Grain } from '@/components/motion/Grain';
import { Parallax } from '@/components/motion/Parallax';
import { SlideIn } from '@/components/motion/SlideIn';
import { WordReveal } from '@/components/motion/WordReveal';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { accentWords, sitePage } from '@/lib/site-content';

/**
 * Deck page 02, taken apart and rebuilt, and now edited in WordPress (Home → Manifesto).
 *
 * The statement is live text and the halftone panel is its own column. The structure is
 * the design and stays in code; the words are the studio's:
 *
 * - Steps are a real sequence — understanding, then experimentation, then craft, then
 *   meaning — so each is set further right than the one before. The escalation is in the
 *   indentation, not a numbered marker. The first half carries the display face.
 * - "Every" repeats and the noun is what changes, so the noun is set large. Scale does
 *   the work because spec §5 allows no grey to quiet the repeated word.
 */
export function Manifesto() {
  const home = sitePage('home');
  const heading = accentWords(home.text('manifesto_heading'));
  const closing = accentWords(home.text('manifesto_closing'));
  const image = home.image('manifesto_image');
  const every = home.text('manifesto_every_label');

  return (
    <section className="bg-k-black text-k-paper relative overflow-hidden">
      <Grain />

      <div className="section-shell relative">
        <div className="grid grid-cols-12 gap-y-16 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-7">
            <WordReveal
              as="h2"
              text={heading.text}
              accent={heading.accent}
              className="display-type"
            />

            <p className="type-subhead mt-10 max-w-[18ch]">{home.text('manifesto_opening')}</p>

            <div className="mt-8 max-w-[46ch]">
              {home.lines('manifesto_body').map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="font-body mt-5 text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <ol className="mt-14">
              {home.pairs('manifesto_steps').map((step, index) => (
                <SlideIn key={step.first} from="left" delay={index * 0.06}>
                  <li className="py-1.5" style={{ paddingInlineStart: `${index * 2.5}rem` }}>
                    <span className="type-subhead">{step.first}</span>{' '}
                    <span className="font-body text-base">{step.second}</span>
                  </li>
                </SlideIn>
              ))}
            </ol>

            <ul className="mt-14">
              {home.lines('manifesto_every').map((noun, index) => (
                <SlideIn key={noun} from="left" delay={index * 0.05}>
                  <li className="flex items-baseline gap-3">
                    <span className="font-body text-xs tracking-[0.3em] uppercase">{every}</span>
                    <span className="font-display text-5xl leading-[0.95] tracking-tight lg:text-6xl">
                      {noun}.
                    </span>
                  </li>
                </SlideIn>
              ))}
            </ul>

            <p className="font-body mt-14 text-base">{home.text('manifesto_lead')}</p>

            <WordReveal
              as="p"
              text={closing.text}
              accent={closing.accent}
              className="display-type mt-4"
            />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <Parallax speed={PARALLAX_SPEEDS.figure} className="h-full">
              {/* The KREATE LIVE halftone, cropped off the right of deck page 02 so it can
                  hold its own column instead of riding along inside the whole page. */}
              <img
                src={image?.src ?? asset('/panels/manifesto.webp')}
                srcSet={image?.srcSet}
                sizes={image?.srcSet ? '(min-width: 1024px) 40vw, 100vw' : undefined}
                alt=""
                width={image?.width ?? 957}
                height={image?.height ?? 1358}
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
