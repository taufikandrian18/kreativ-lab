import { getClientLogos } from '@/lib/contract';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';

/**
 * Spec §6 asks for a "logo grid, opacity stagger on a 40ms interval". The marks do not
 * exist as files: the fixture's client_logo entries all carry a null image URL, and the
 * deck supplies only page 24, a single raster with every mark baked into it. Stage 3
 * shipped that raster; hovering one brand inside a flat JPEG is not possible, and the
 * names were announced twice — once in the image alt, once in a visually-hidden list.
 *
 * So the wall is set in type instead: one cell per client, on the 12-column grid, each
 * flipping to red and scaling up under the cursor. Red is allowed here because these are
 * display type at 24px and over, per spec §5.
 *
 * This is weaker than the real thing and deliberately so — a wall of names reads as a
 * client list, a wall of marks reads as proof. When the 24 logo files arrive, each cell
 * takes an <img> and the grid, the stagger and the hover all stay as they are.
 */
export function ClientWall() {
  const logos = getClientLogos();

  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type">
          OUR CLIENT
        </MaskReveal>

        <StaggerReveal
          className="mt-12 grid grid-cols-12 gap-x-4 gap-y-6 sm:gap-x-8 lg:gap-x-12"
          stagger={0.04}
        >
          {logos.map((logo) => (
            <p
              key={logo.name}
              data-testid="client-cell"
              className="font-display hover:text-k-red col-span-6 origin-left text-2xl tracking-tight transition-[color,transform] duration-300 ease-out hover:scale-110 sm:col-span-4 lg:col-span-3"
            >
              {logo.name}
            </p>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
