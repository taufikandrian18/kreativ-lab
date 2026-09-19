import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';

const PILLARS = ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'] as const;

export function WhoWeAre() {
  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell py-24">
        <MaskReveal as="h2" className="display-type">
          WHO WE ARE
        </MaskReveal>
        <StaggerReveal className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
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
  );
}
