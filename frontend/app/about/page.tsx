import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { ABOUT_PAGE, deckPageAlt } from '@/lib/deck';

// Transcribed verbatim from assets/web/page-03-1920.webp on 2026-09-19. Do not
// paraphrase: spec §3 treats deck copy as the studio's own words.
const PARAGRAPHS = [
  'KREATIVE STUDIO LAB is a Creative Production Studio specializing in Product Development and Creative Production.',
  'We collaborate with brands, corporations, organizations, and communities to develop products, visual content, and brand experiences that create meaningful connections. By combining strategic thinking, creative exploration, and production expertise, we transform ideas into tangible experiences from the first concept to the final execution.',
  "We don't separate creativity from production. We believe they belong together.",
] as const;

const PILLARS = ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'] as const;

export default function About() {
  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type text-k-red">
            WHO WE ARE
          </MaskReveal>

          <div className="mt-12 max-w-[60ch]">
            {PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-6 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* The words on page 03 are all live text above and below, but its artwork is
              not: a halftone studio portrait and four photographic pillar cards. The alt
              describes the picture, not the copy. */}
          <DeckFigure
            page={ABOUT_PAGE}
            alt={deckPageAlt(ABOUT_PAGE)}
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="mt-16"
            priority
          />

          <StaggerReveal className="mt-16 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
            {PILLARS.map((word) => (
              <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <p className="font-display border-k-black border-t-2 pt-4 text-4xl tracking-tight">
                  {word}
                </p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
