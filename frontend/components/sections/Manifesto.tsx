import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 02 per content/page-section-mapping.md: the KREATE LIVE halftone marquee
// panel carrying the studio statement. The full statement copy has not been
// transcribed from the deck; it travels as alt text, and the one verified line is
// set as live display type.
const PAGE = 2;

export function Manifesto() {
  return (
    <section className="bg-k-black text-k-paper relative">
      <DeckFigure
        page={PAGE}
        alt="More than creativity — the Kreative Studio Lab statement: We Create Live."
        sizes="100vw"
      />
      <div className="section-shell py-20">
        <MaskReveal as="h2" className="display-type">
          WE CREATE <span className="text-k-red">LIVE.</span>
        </MaskReveal>
      </div>
    </section>
  );
}
