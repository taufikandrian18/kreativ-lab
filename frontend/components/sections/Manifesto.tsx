import { asset } from '@/lib/asset';
import { ChipStatement } from '@/components/motion/ChipStatement';
import { Grain } from '@/components/motion/Grain';
import { OffsetHeading } from '@/components/motion/OffsetHeading';
import { Parallax } from '@/components/motion/Parallax';
import { SlideIn } from '@/components/motion/SlideIn';
import { WordReveal } from '@/components/motion/WordReveal';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { accentWords, sitePage } from '@/lib/site-content';

// The studio's own work, set inline in the statement where Crency sets icons: a product
// detail, a campaign, a product, a campaign — the two things the sentence says the studio
// makes. Picked from the case-study galleries, so every chip is a real piece of work,
// and cut down to 180px squares in public/chips: the chip shows at about 70px, and the
// full gallery files cost 3–99KB each where the thumbnails cost 3–6KB.
const CHIPS = [
  { src: asset('/chips/03-04.webp') },
  { src: asset('/chips/01-02.webp') },
  { src: asset('/chips/06-01.webp') },
  { src: asset('/chips/04-01.webp') },
];

/**
 * Deck page 02, edited in WordPress (Home → Manifesto), laid out after the Crency
 * reference's "about us":
 *
 * - The opener is two offset lines that drift apart as they are read (OffsetHeading).
 * - The opening sentence is the section's centre of gravity: set big, in sentence case,
 *   centred, assembling word by word with the studio's own work flying into it.
 * - The rest keeps the deck's structure — steps escalating to the right, "Every" set
 *   small beside the noun that changes — beside the halftone panel.
 */
export function Manifesto() {
  const home = sitePage('home');
  const closing = accentWords(home.text('manifesto_closing'));
  const image = home.image('manifesto_image');
  const every = home.text('manifesto_every_label');

  return (
    <section className="bg-k-black text-k-paper relative overflow-hidden">
      <Grain />

      <div className="section-shell relative">
        <OffsetHeading as="h2" text={home.text('manifesto_heading')} className="display-type" />

        <ChipStatement
          text={home.text('manifesto_opening')}
          chips={CHIPS}
          className="type-statement mx-auto mt-[clamp(4rem,9vw,9rem)] max-w-[22ch] text-center"
        />

        <div className="mt-[clamp(4rem,9vw,9rem)] grid grid-cols-12 gap-y-16 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-7">
            <div className="max-w-[46ch]">
              {home.lines('manifesto_body').map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="font-body mt-5 text-lg leading-relaxed first:mt-0">
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

            <p className="font-body mt-14 text-lg">{home.text('manifesto_lead')}</p>

            <WordReveal
              as="p"
              text={closing.text}
              accent={closing.accent}
              className="display-type mt-4"
              scrub
              swaps={1}
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
                className="h-full w-full rounded-[1.25rem] object-cover"
              />
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
