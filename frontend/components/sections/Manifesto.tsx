import { deckImage } from '@/lib/deck';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 02 per content/page-section-mapping.md: the KREATE LIVE halftone marquee
// panel carrying the studio statement. The full statement copy has not been
// transcribed from the deck; it travels as alt text, and the one verified line is
// set as live display type.
const PAGE = 2;

export function Manifesto() {
  const img = deckImage(PAGE);

  return (
    <section className="bg-k-black text-k-paper relative">
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes="100vw"
        width={img.width}
        height={img.height}
        loading="lazy"
        decoding="async"
        alt="More than creativity — the Kreative Studio Lab statement: We Create Live."
        className="h-auto w-full"
      />
      <div className="section-shell py-20">
        <MaskReveal as="h2" className="display-type">
          WE CREATE <span className="text-k-red">LIVE.</span>
        </MaskReveal>
      </div>
    </section>
  );
}
