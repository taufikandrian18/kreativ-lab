import { getClientLogos } from '@/lib/contract';
import { deckImage } from '@/lib/deck';
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
  const img = deckImage(PAGE);
  const logos = getClientLogos();

  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell py-24">
        <MaskReveal as="h2" className="display-type">
          OUR CLIENT
        </MaskReveal>

        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes="100vw"
          width={img.width}
          height={img.height}
          loading="lazy"
        decoding="async"
        alt={`Client wall: ${logos.map((l) => l.name).join(', ')}`}
          className="mt-12 h-auto w-full"
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
