import { asset } from '@/lib/asset';
import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
import { CaseStudyReel } from '@/components/sections/CaseStudyReel';
import { CREATIVE_LAB_REEL } from '@/lib/archive-reels';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

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
        {/* The film is the thesis. A creative-production page used to open on a title and
            a paragraph, with the studio's own footage buried two screens down beside an
            empty half of the viewport. It now shares the first screen with the title. */}
        <div className="section-shell grid grid-cols-12 items-start gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-6">
            <MaskReveal as="h1" className="display-type">
              CREATIVE <span className="text-k-red">LAB</span>
            </MaskReveal>
            <p className="type-subhead mt-8">Where Products Become Stories</p>
            <div className="mt-8 max-w-[46ch]">
              {BODY.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <CaseStudyReel reel={CREATIVE_LAB_REEL} client="Creative Lab" />
          </div>

          <div className="col-span-12 mt-8">
            <h2 className="font-body text-xs tracking-[0.3em] uppercase">Capabilities</h2>
            <div className="mt-6">
              <CapabilityList groups={CAPABILITIES} columns />
            </div>
          </div>
        </div>

        {/* Six set and behind-the-scenes photographs, cut from the bottom of deck page 06
            and run edge to edge — the one bleed this route takes. */}
        <Parallax speed={PARALLAX_SPEEDS.figure} className="mt-4">
          <img
            src={asset('/panels/creative-lab-strip.webp')}
            alt="Creative Lab on set: mood boards, camera rigs, and the lit studio floor"
            width={2048}
            height={398}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </Parallax>
      </section>
    </main>
  );
}
