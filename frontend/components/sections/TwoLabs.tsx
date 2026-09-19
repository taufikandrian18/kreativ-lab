import Link from 'next/link';
import { DeckFigure } from '@/components/media/DeckFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 04 per content/page-section-mapping.md: the two overlapping PRODUCT LAB /
// CREATIVE LAB circles merging into the K-mark.
// Spec §6 specifies this section pinned with the circles converging on scrub. Pinning
// is Stage 5's severable tail; this static composition is what Stage 5 animates.
const PAGE = 4;

export function TwoLabs() {
  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell py-24">
        <MaskReveal as="h2" className="display-type max-w-[14ch]">
          One Studio. Two Labs.
        </MaskReveal>
        <p className="font-body mt-6 max-w-[48ch] text-lg">
          Different disciplines. One creative ecosystem.
        </p>

        <DeckFigure
          page={PAGE}
          alt="Product Lab and Creative Lab as two overlapping circles merging into the studio mark"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="mt-12"
          parallax={PARALLAX_SPEEDS.figure}
        />

        <div className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          <Link
            href="/product-lab"
            className="font-display border-k-black col-span-12 border-t-2 pt-4 text-4xl tracking-tight sm:col-span-6"
          >
            PRODUCT LAB
          </Link>
          <Link
            href="/creative-lab"
            className="font-display border-k-black col-span-12 border-t-2 pt-4 text-4xl tracking-tight sm:col-span-6"
          >
            CREATIVE LAB
          </Link>
        </div>
      </div>
    </section>
  );
}
