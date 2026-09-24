import { DeckFigure } from '@/components/media/DeckFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { CmsFigure } from '@/components/media/CmsFigure';
import { Accented } from '@/components/type/Accented';
import { ABOUT_PAGE } from '@/lib/deck';
import { sitePage } from '@/lib/site-content';

// Edited under Site Pages → About. The defaults are page 03 of the deck, transcribed
// verbatim on 2026-09-19 — spec §3 treats deck copy as the studio's own words.
export default function About() {
  const about = sitePage('about');
  const image = about.image('about_image');
  const figure = {
    alt: about.text('about_image_alt'),
    sizes: '(min-width: 1024px) 80vw, 100vw',
    className: 'col-figure lg:-mt-24',
    priority: true,
    parallax: PARALLAX_SPEEDS.figure,
  };

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell grid grid-cols-12 gap-x-4 gap-y-14 sm:gap-x-8 lg:gap-x-12">
          <MaskReveal as="h1" className="display-type text-k-red col-opener">
            <Accented text={about.text('about_heading')} />
          </MaskReveal>

          <div className="col-copy">
            {about.lines('about_body').map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-6 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* The words on page 03 are all live text above and below, but its artwork is
              not: a halftone studio portrait and four photographic pillar cards. The alt
              describes the picture, not the copy. */}
          {image ? <CmsFigure image={image} {...figure} /> : <DeckFigure page={ABOUT_PAGE} {...figure} />}

          <StaggerReveal className="col-span-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
            {about.lines('about_pillars').map((word) => (
              <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <p className="font-display border-k-black border-t-2 pt-4 text-4xl tracking-tight">
                  {word}
                </p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
