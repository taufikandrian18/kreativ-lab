import Link from 'next/link';
import { LabsVenn } from '@/components/sections/LabsVenn';
import { MaskReveal } from '@/components/motion/MaskReveal';

export function TwoLabs() {
  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type max-w-[14ch]">
          One Studio. Two Labs.
        </MaskReveal>
        <p className="font-body mt-6 max-w-[48ch] text-lg">
          Different disciplines. One creative ecosystem.
        </p>

        <LabsVenn />

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
