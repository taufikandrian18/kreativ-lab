import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { CLIENT_MARKS } from '@/lib/client-marks';

/**
 * Spec §6: "logo grid, opacity stagger on a 40ms interval".
 *
 * Stage 3 shipped deck page 24 as one composite raster and Stage 4 replaced it with the
 * client names in type, both on the finding that no logo artwork existed. The fixture
 * carries none — but the deck page does, as black marks on white, and they lift out
 * cleanly. Each is an alpha mask, so the mark is painted by `background-color` and the
 * hover that the type grid had — red, scaled up — works identically on a real logo.
 */
export function ClientWall() {
  return (
    <section className="bg-k-paper text-k-black">
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type">
          OUR CLIENT
        </MaskReveal>

        <StaggerReveal
          className="mt-12 grid grid-cols-12 gap-x-4 gap-y-10 sm:gap-x-8 lg:gap-x-12"
          stagger={0.04}
        >
          {CLIENT_MARKS.map((mark) => (
            <div
              key={mark.name}
              data-testid="client-cell"
              role="img"
              aria-label={mark.name}
              className="hover:text-k-red col-span-6 flex items-center transition-[color,transform] duration-300 ease-out hover:scale-110 sm:col-span-4 lg:col-span-3"
            >
              <span
                data-client-mark
                aria-hidden="true"
                style={{
                  maskImage: `url(${mark.file})`,
                  WebkitMaskImage: `url(${mark.file})`,
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'left center',
                  WebkitMaskPosition: 'left center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  backgroundColor: 'currentcolor',
                  aspectRatio: `${mark.w} / ${mark.h}`,
                }}
                className="block h-12 w-full lg:h-14"
              />
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
