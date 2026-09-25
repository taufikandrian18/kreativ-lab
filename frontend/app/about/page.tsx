import { asset } from '@/lib/asset';
import { Parallax } from '@/components/motion/Parallax';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { CmsFigure } from '@/components/media/CmsFigure';
import { Accented } from '@/components/type/Accented';
import { sitePage } from '@/lib/site-content';

// Edited under Site Pages → About (heading, body, pillar words, optional image) and
// Home → Who we are (the pillar photographs, shared with the homepage cards).
const PILLAR_ART = ['think', 'design', 'craft', 'experience'] as const;

// What each default photograph shows, for its alt text. An alt entered with an image
// uploaded in WordPress replaces these.
const PILLAR_ALT: Record<(typeof PILLAR_ART)[number], string> = {
  think: 'Close-up of a man in glasses, looking through a lens',
  design: 'A mood board of garments, patterns and fabric swatches',
  craft: 'Paper sewing patterns and scissors on the cutting table',
  experience: 'An audience in 3D glasses, watching a screening',
};

export default function About() {
  const about = sitePage('about');
  const home = sitePage('home');
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

          {/* An About image uploaded in WordPress leads. Without one there is no figure
              here any more: the old default was deck page 03 as a single raster, which
              carried the page's previous copy ("WHO WE ARE") printed into it and shrank
              to an unreadable thumbnail on a phone. */}
          {image ? <CmsFigure image={image} {...figure} /> : null}

          {/* The pillars as photographic cards, the way deck page 03 draws them: each
              word over its own photograph. Pictures come from Home → Who we are, so a
              picture changed there changes here too. */}
          <StaggerReveal className="col-span-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {about.lines('about_pillars').map((word, index) => {
              const art = PILLAR_ART[index % PILLAR_ART.length];
              const photo = home.image(`pillar_${(index % PILLAR_ART.length) + 1}_image`);
              const card = (
                <figure className="bg-k-black text-k-paper overflow-hidden rounded-[1.25rem]">
                  <img
                    src={photo?.src ?? asset(`/pillars/${art}.jpg`)}
                    alt={photo?.alt || PILLAR_ALT[art]}
                    width={photo?.width ?? 280}
                    height={photo?.height ?? 335}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] h-auto w-full object-cover object-bottom"
                  />
                  <figcaption className="font-display px-4 py-3 text-2xl leading-none tracking-tight lg:text-3xl">
                    {word}
                  </figcaption>
                </figure>
              );
              // Every other card drifts, so the row settles at two depths.
              return index % 2 === 1 ? (
                <Parallax key={word} speed={PARALLAX_SPEEDS.gallery}>
                  {card}
                </Parallax>
              ) : (
                <div key={word}>{card}</div>
              );
            })}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
