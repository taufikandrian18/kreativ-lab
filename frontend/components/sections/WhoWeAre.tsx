import { asset } from '@/lib/asset';
import { WordReveal } from '@/components/motion/WordReveal';
import { SlideIn } from '@/components/motion/SlideIn';
import { sitePage } from '@/lib/site-content';

// The four pillars are photographic cards on deck page 03, not labels on a rule. The
// photographs were cropped out of that page on 2026-09-19 and sit in public/pillars;
// Home → Who we are in WordPress replaces any of the four words or pictures. Cards enter
// from alternating sides: four cards rising identically read as a list, and this section
// is meant to read as a composition. They are dealt — tilted, scrubbed to scroll — after
// the Crency reference's service cards; SlideIn says how.
const PILLAR_ART = ['think', 'design', 'craft', 'experience'] as const;

export function WhoWeAre() {
  const home = sitePage('home');
  const pillars = PILLAR_ART.map((art, index) => {
    const n = index + 1;
    const image = home.image(`pillar_${n}_image`);
    return {
      word: home.text(`pillar_${n}_word`),
      src: image?.src ?? asset(`/pillars/${art}.jpg`),
      width: image?.width ?? 280,
      height: image?.height ?? 335,
      from: index % 2 === 0 ? ('left' as const) : ('right' as const),
    };
  });

  return (
    // overflow-x-clip: a dealt card starts a fifth of its width past its column, which on
    // a single-column phone is past the viewport edge and would widen the page. `clip`
    // rather than `hidden`, so the section does not become a scroll container.
    <section className="bg-k-paper text-k-black overflow-x-clip">
      <div className="section-shell grid grid-cols-12 gap-x-4 gap-y-14 sm:gap-x-8 lg:gap-x-12">
        <WordReveal as="h2" text={home.text('who_heading')} className="display-type col-opener" />

        <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          {pillars.map((pillar, index) => (
            <SlideIn
              key={index}
              from={pillar.from}
              delay={index * 0.08}
              deal
              className="col-span-12 sm:col-span-6 lg:col-span-3"
            >
              <figure className="group">
                <div className="bg-k-black overflow-hidden">
                  <img
                    src={pillar.src}
                    alt=""
                    width={pillar.width}
                    height={pillar.height}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <figcaption className="bg-k-black text-k-paper font-display px-4 py-3 text-2xl tracking-tight">
                  {pillar.word}
                </figcaption>
              </figure>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
