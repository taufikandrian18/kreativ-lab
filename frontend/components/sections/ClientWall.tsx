import { getClientLogos } from '@/lib/contract';
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 24 per content/page-section-mapping.md: the OUR CLIENT wall, a single
// raster carrying all 25 marks.
//
// Deviation from spec §6, which specifies "logo grid, opacity stagger on a 40ms
// interval": individual logo artwork does not exist. The fixture's client_logo entries
// carry null image URLs and the deck supplies only this composite. A per-logo stagger
// is impossible without that artwork, so this renders one image with a single reveal
// and keeps the names in the accessibility tree. When individual marks are supplied,
// this becomes the grid §6 describes.
const PAGE = 24;

export function ClientWall() {
  const logos = getClientLogos();

  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell py-24">
        <MaskReveal as="h2" className="display-type">
          OUR CLIENT
        </MaskReveal>

        <DeckFigure
          page={PAGE}
          alt={`Client wall: ${logos.map((l) => l.name).join(', ')}`}
          sizes="100vw"
          className="mt-12"
        />

        <ul className="sr-only">
          {logos.map((logo) => (
            <li key={logo.name}>{logo.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
