import Link from 'next/link';
import { LabsVenn } from '@/components/sections/LabsVenn';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { Accented } from '@/components/type/Accented';
import { sitePage } from '@/lib/site-content';

export function TwoLabs() {
  const home = sitePage('home');
  const product = home.text('labs_product');
  const creative = home.text('labs_creative');

  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell grid grid-cols-12 items-start gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
        <MaskReveal as="h2" className="display-type col-opener">
          <Accented text={home.text('labs_heading')} />
        </MaskReveal>
        <p className="type-subhead col-copy">{home.text('labs_subhead')}</p>

        <div className="col-figure">
          <LabsVenn product={product} creative={creative} />
        </div>

        <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          <Link
            href="/product-lab"
            className="font-display border-k-black col-span-12 border-t-2 pt-4 text-4xl tracking-tight sm:col-span-6"
          >
            {product}
          </Link>
          <Link
            href="/creative-lab"
            className="font-display border-k-black col-span-12 border-t-2 pt-4 text-4xl tracking-tight sm:col-span-6"
          >
            {creative}
          </Link>
        </div>
      </div>
    </section>
  );
}
