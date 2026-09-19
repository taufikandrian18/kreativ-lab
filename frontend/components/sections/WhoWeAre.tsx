import { WordReveal } from '@/components/motion/WordReveal';
import { SlideIn } from '@/components/motion/SlideIn';

// The four pillars are photographic cards on deck page 03, not labels on a rule. The
// photographs were cropped out of that page on 2026-09-19 and sit in public/pillars.
// Cards enter from alternating sides: four cards rising identically read as a list, and
// this section is meant to read as a composition.
const PILLARS = [
  { word: 'THINK', image: '/pillars/think.jpg', from: 'left' as const },
  { word: 'DESIGN', image: '/pillars/design.jpg', from: 'right' as const },
  { word: 'CRAFT', image: '/pillars/craft.jpg', from: 'left' as const },
  { word: 'EXPERIENCE', image: '/pillars/experience.jpg', from: 'right' as const },
];

export function WhoWeAre() {
  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell">
        <WordReveal as="h2" text="WHO WE ARE" className="display-type" />

        <div className="mt-16 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          {PILLARS.map((pillar, index) => (
            <SlideIn
              key={pillar.word}
              from={pillar.from}
              delay={index * 0.08}
              className="col-span-12 sm:col-span-6 lg:col-span-3"
            >
              <figure className="group">
                <div className="bg-k-black overflow-hidden">
                  <img
                    src={pillar.image}
                    alt=""
                    width={280}
                    height={335}
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
