import { asset } from '@/lib/asset';
import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList } from '@/components/sections/CapabilityList';
import { Accented } from '@/components/type/Accented';
import { sitePage } from '@/lib/site-content';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

// Edited under Site Pages → Product Lab. The defaults are page 05 of the deck,
// transcribed verbatim on 2026-09-19.
export default function ProductLab() {
  const page = sitePage('product_lab');
  const image = page.image('pl_image');

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
              <Accented text={page.text('pl_heading')} />
            </MaskReveal>
            <p className="type-subhead mt-8">{page.text('pl_subhead')}</p>
            <div className="mt-8 max-w-[46ch]">
              {page.lines('pl_body').map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <Parallax speed={PARALLAX_SPEEDS.figure}>
              <img
                src={image?.src ?? asset('/panels/product-lab.webp')}
                srcSet={image?.srcSet}
                sizes={image?.srcSet ? '(min-width: 1024px) 40vw, 70vw' : undefined}
                alt={page.text('pl_image_alt')}
                width={image?.width ?? 1024}
                height={image?.height ?? 1448}
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full"
              />
            </Parallax>
          </div>

          <div className="col-span-12 mt-8">
            <h2 className="font-body text-xs tracking-[0.3em] uppercase">
              {page.text('pl_capabilities_label')}
            </h2>
            <div className="mt-6">
              <CapabilityList groups={page.groups('pl_capabilities')} columns />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
