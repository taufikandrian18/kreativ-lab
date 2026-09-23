import { DeckFigure } from '@/components/media/DeckFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
import { CaseStudyReel } from '@/components/sections/CaseStudyReel';
import { CREATIVE_LAB_REEL } from '@/lib/archive-reels';
import { CREATIVE_LAB_PAGE } from '@/lib/deck';

// Transcribed verbatim from assets/web/page-06-1920.webp on 2026-09-19. The mapping
// document had this list as "Creative Direction, Photography, Film, etc." — these are
// the twelve the deck actually names.
const BODY = [
  'Powerful products deserve meaningful stories. Through Creative Lab, we transform products into visual experiences that strengthen brand perception and create emotional connections.',
  'From creative direction to campaign execution, we produce visual content that communicates not only what a product is, but why it matters.',
  'Because every product deserves a story worth remembering.',
] as const;

const CAPABILITIES: readonly CapabilityGroup[] = [
  {
    name: '',
    items: [
      'Creative Direction',
      'Product Photography',
      'Campaign Photography',
      'Editorial',
      'Lookbook',
      'Lifestyle Photography',
      'Brand Film',
      'Video Campaign',
      'TV Commercial',
      'Motion Graphics',
      'Content Production',
      'Social Media Assets',
    ],
  },
];

export default function CreativeLab() {
  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell grid grid-cols-12 gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
          <MaskReveal as="h1" className="display-type col-opener">
            CREATIVE <span className="text-k-red">LAB</span>
          </MaskReveal>

          <p className="type-subhead col-copy">
            Where Products Become Stories
          </p>
          <div className="col-copy">
            {BODY.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="col-aside">
            <h2 className="type-subhead">Capabilities</h2>
            <CapabilityList groups={CAPABILITIES} />
          </div>

          {/* The PURE LOVE MATTERS apparel film. It is N8N's own product, so it would be
              wrong on another client's case study — it belongs where the studio shows what
              it produces rather than what it produced for one brand. */}
          <div className="col-span-12 grid grid-cols-12 items-end gap-x-4 gap-y-6 sm:gap-x-8 lg:gap-x-12">
            <div className="col-span-12 sm:col-span-5 lg:col-span-4">
              <CaseStudyReel reel={CREATIVE_LAB_REEL} client="Creative Lab" />
            </div>
            <div className="col-span-12 sm:col-span-7 lg:col-span-5">
              <p className="type-subhead">Campaign film, start to finish.</p>
              <p className="font-body mt-4 text-base leading-relaxed">
                Creative direction, production and post, shot and cut in house.
              </p>
            </div>
          </div>


          <DeckFigure
            page={CREATIVE_LAB_PAGE}
            alt="Creative Lab production: mood boards, camera rigs on set, and a lit studio floor"
            sizes="100vw"
            className="col-figure"
            parallax={PARALLAX_SPEEDS.figure}
          />
        </div>
      </section>
    </main>
  );
}
