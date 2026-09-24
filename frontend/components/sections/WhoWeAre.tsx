import { asset } from '@/lib/asset';
import { WordReveal } from '@/components/motion/WordReveal';
import { SlideIn } from '@/components/motion/SlideIn';
import { TornEdge } from '@/components/motion/TornEdge';
import { sitePage } from '@/lib/site-content';

// The four pillars are photographic cards on deck page 03; Home → Who we are in
// WordPress replaces any word, line or picture. Laid out as Crency's service cards: a
// centred heading over a row of rounded cards, each a different fill, each with its own
// line of copy. Cards are dealt in from alternating sides — tilted, scrubbed to scroll —
// and lift on hover. Fills cycle through the three colours; nothing else is available.
const PILLAR_ART = ['think', 'design', 'craft', 'experience'] as const;

const FILLS = [
  'bg-k-red text-k-paper',
  'bg-k-black text-k-paper',
  'bg-k-paper text-k-black border-2 border-k-black',
  'bg-k-black text-k-paper',
] as const;

export function WhoWeAre() {
  const home = sitePage('home');
  const pillars = PILLAR_ART.map((art, index) => {
    const n = index + 1;
    const image = home.image(`pillar_${n}_image`);
    return {
      word: home.text(`pillar_${n}_word`),
      line: home.text(`pillar_${n}_line`),
      src: image?.src ?? asset(`/pillars/${art}.jpg`),
      width: image?.width ?? 280,
      height: image?.height ?? 335,
      from: index % 2 === 0 ? ('left' as const) : ('right' as const),
      fill: FILLS[index % FILLS.length],
    };
  });

  return (
    // overflow-x-clip: a dealt card starts a fifth of its width past its column, which on
    // a single-column phone is past the viewport edge and would widen the page. `clip`
    // rather than `hidden`, so the section does not become a scroll container.
    <section className="bg-k-paper text-k-black relative overflow-x-clip">
      <TornEdge from="black" seed={3} />
      <div className="section-shell grid grid-cols-12 gap-x-4 gap-y-14 sm:gap-x-8 lg:gap-x-12">
        <WordReveal
          as="h2"
          text={home.text('who_heading')}
          className="display-type col-span-12 text-center"
          swaps={1}
        />

        <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-6 lg:gap-6">
          {pillars.map((pillar, index) => (
            <SlideIn
              key={index}
              from={pillar.from}
              delay={index * 0.08}
              deal
              className="col-span-12 sm:col-span-6 lg:col-span-3"
            >
              {/* The hover lift lives on this inner element: the outer one's transform
                  belongs to the scrubbed deal, and one element cannot carry both. */}
              <figure
                className={`group flex h-full flex-col rounded-[1.75rem] p-5 transition-transform duration-500 ease-out hover:-translate-y-2 hover:-rotate-1 lg:p-6 ${pillar.fill}`}
              >
                <figcaption className="text-center">
                  <span className="font-display block text-[clamp(2.5rem,4vw,3.75rem)] leading-none tracking-tight">
                    {pillar.word}
                  </span>
                  <span className="font-body mx-auto mt-3 block max-w-[26ch] text-base leading-snug">
                    {pillar.line}
                  </span>
                </figcaption>
                <div className="mt-6 overflow-hidden rounded-[1.1rem]">
                  <img
                    src={pillar.src}
                    alt=""
                    width={pillar.width}
                    height={pillar.height}
                    loading="lazy"
                    decoding="async"
                    // The deck crops carry a white band across their top; a 4:3 window
                    // anchored to the bottom keeps the photograph and loses the band.
                    className="aspect-[4/3] h-auto w-full object-cover object-bottom transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
              </figure>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
