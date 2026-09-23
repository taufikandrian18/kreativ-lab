import { DeckFigure } from '@/components/media/DeckFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
import { PRODUCT_LAB_PAGE } from '@/lib/deck';

// Transcribed verbatim from assets/web/page-05-1920.webp on 2026-09-19.
const BODY = [
  "We transform ideas into products that embody a brand's identity and purpose. From material exploration and design development to prototyping, production, and final finishing, every stage is approached with precision and intention.",
  'We believe exceptional products are created through thoughtful craftsmanship, meticulous attention to detail, and a commitment to quality.',
] as const;

const CAPABILITIES: readonly CapabilityGroup[] = [
  {
    name: 'Print & Packaging',
    items: [
      'Packaging Design & Production',
      'Premium Gift Sets',
      'Printing Production',
      'Publications',
    ],
  },
  {
    name: 'Brand Products',
    items: [
      'Brand Merchandise',
      'Corporate Merchandise',
      'Event Merchandise',
      'Apparel Development',
      'Uniform Development',
    ],
  },
  { name: 'Spatial Experience', items: ['Retail Display', 'Exhibition Production'] },
  { name: 'Custom Solutions', items: ['Custom Product Development'] },
];

export default function ProductLab() {
  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell grid grid-cols-12 gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
          <MaskReveal as="h1" className="display-type col-opener">
            PRODUCT <span className="text-k-red">LAB</span>
          </MaskReveal>

          <p className="type-subhead col-copy">
            Where Ideas Become Products.
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


          {/* A description, not alt="": page 05's right half is production photography —
              sewing, pattern drafting, keyring and pouch prototypes, cap construction
              sketches — whose content appears nowhere on this page as text. */}
          <DeckFigure
            page={PRODUCT_LAB_PAGE}
            alt="Product Lab process: pattern cutting, material sampling, and packaging and merchandise prototyping"
            sizes="100vw"
            className="col-figure"
            parallax={PARALLAX_SPEEDS.figure}
          />
        </div>
      </section>
    </main>
  );
}
