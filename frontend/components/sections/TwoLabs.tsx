import { Highlight } from '@/components/motion/Highlight';
import { LabsVenn } from '@/components/sections/LabsVenn';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { Signpost } from '@/components/motion/Signpost';
import { Accented } from '@/components/type/Accented';
import { sitePage } from '@/lib/site-content';

/**
 * Laid out after Crency's "Trust comes [from design], not explanation. [mascot] [pill]"
 * row: a sentence with its key phrase highlighted, the converging Venn where Crency has
 * its mascot, and the two lab routes as a pair of signposts pointing opposite ways —
 * Crency's VIEW ALL CASES / VIEW ALL BLOGS boards.
 */
export function TwoLabs() {
  const home = sitePage('home');
  const product = home.text('labs_product');
  const creative = home.text('labs_creative');

  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell grid grid-cols-12 items-center gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
        <MaskReveal as="h2" className="display-type col-span-12 text-center">
          <Accented text={home.text('labs_heading')} />
        </MaskReveal>

        <Highlight
          text={home.text('labs_subhead')}
          className="type-statement col-span-12 lg:col-span-4"
        />

        <div className="col-span-12 lg:col-span-5">
          <LabsVenn product={product} creative={creative} />
        </div>

        <div className="col-span-12 flex flex-col items-start gap-8 lg:col-span-3 lg:items-end">
          <Signpost href="/product-lab" point="right" tone="red">
            {product}
          </Signpost>
          <Signpost href="/creative-lab" point="left" tone="black">
            {creative}
          </Signpost>
        </div>
      </div>
    </section>
  );
}
