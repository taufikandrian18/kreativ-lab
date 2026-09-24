import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

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
        {/* The process photography opens the page beside the title: sewing, pattern
            drafting, prototypes. It was the right half of deck page 05, which also carried
            the capability list as pixels — the list is live text below, so only the
            photographs are taken. */}
        <div className="section-shell grid grid-cols-12 items-start gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-6">
            <MaskReveal as="h1" className="display-type">
              PRODUCT <span className="text-k-red">LAB</span>
            </MaskReveal>
            <p className="type-subhead mt-8">Where Ideas Become Products.</p>
            <div className="mt-8 max-w-[46ch]">
              {BODY.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <Parallax speed={PARALLAX_SPEEDS.figure}>
              <img
                src="/panels/product-lab.webp"
                alt="Product Lab process: sewing, pattern drafting, and keyring, pouch and cap prototypes"
                width={1024}
                height={1448}
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full"
              />
            </Parallax>
          </div>

          <div className="col-span-12 mt-8">
            <h2 className="font-body text-xs tracking-[0.3em] uppercase">Capabilities</h2>
            <div className="mt-6">
              <CapabilityList groups={CAPABILITIES} columns />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
