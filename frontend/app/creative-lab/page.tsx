import { DeckFigure } from '@/components/media/DeckFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
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
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type">
            CREATIVE <span className="text-k-red">LAB</span>
          </MaskReveal>

          <p className="font-display mt-12 text-3xl tracking-tight">
            Where Products Become Stories
          </p>
          <div className="mt-6 max-w-[60ch]">
            {BODY.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <h2 className="font-display mt-20 text-4xl tracking-tight">Capabilities</h2>
          <CapabilityList groups={CAPABILITIES} />

          <DeckFigure
            page={CREATIVE_LAB_PAGE}
            alt="Creative Lab production: mood boards, camera rigs on set, and a lit studio floor"
            sizes="100vw"
            className="mt-20"
            parallax={PARALLAX_SPEEDS.figure}
          />
        </div>
      </section>
    </main>
  );
}
