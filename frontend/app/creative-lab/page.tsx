import { asset } from '@/lib/asset';
import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList } from '@/components/sections/CapabilityList';
import { Accented } from '@/components/type/Accented';
import { uploadedReel } from '@/lib/project-media';
import { sitePage } from '@/lib/site-content';
import { CaseStudyReel } from '@/components/sections/CaseStudyReel';
import { CREATIVE_LAB_REEL } from '@/lib/archive-reels';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

// Edited under Site Pages → Creative Lab. The defaults are page 06 of the deck,
// transcribed verbatim on 2026-09-19 — the twelve capabilities the deck actually names.
export default function CreativeLab() {
  const page = sitePage('creative_lab');
  const reel =
    uploadedReel(page.file('cl_reel_wide'), page.file('cl_reel_narrow'), page.image('cl_reel_poster')) ??
    CREATIVE_LAB_REEL;
  const strip = page.image('cl_strip_image');

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        {/* The film is the thesis. A creative-production page used to open on a title and
            a paragraph, with the studio's own footage buried two screens down beside an
            empty half of the viewport. It now shares the first screen with the title. */}
        <div className="section-shell grid grid-cols-12 items-start gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-6">
            <MaskReveal as="h1" className="display-type">
              <Accented text={page.text('cl_heading')} />
            </MaskReveal>
            <p className="type-subhead mt-8">{page.text('cl_subhead')}</p>
            <div className="mt-8 max-w-[46ch]">
              {page.lines('cl_body').map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <CaseStudyReel reel={reel} client="Creative Lab" />
          </div>

          <div className="col-span-12 mt-8">
            <h2 className="font-body text-xs tracking-[0.3em] uppercase">
              {page.text('cl_capabilities_label')}
            </h2>
            <div className="mt-6">
              <CapabilityList groups={page.groups('cl_capabilities')} columns />
            </div>
          </div>
        </div>

        {/* Six set and behind-the-scenes photographs, cut from the bottom of deck page 06
            and run edge to edge — the one bleed this route takes. */}
        <Parallax speed={PARALLAX_SPEEDS.figure} className="mt-4">
          <img
            src={strip?.src ?? asset('/panels/creative-lab-strip.webp')}
            srcSet={strip?.srcSet}
            sizes={strip?.srcSet ? '100vw' : undefined}
            alt={page.text('cl_strip_alt')}
            width={strip?.width ?? 2048}
            height={strip?.height ?? 398}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </Parallax>
      </section>
    </main>
  );
}
