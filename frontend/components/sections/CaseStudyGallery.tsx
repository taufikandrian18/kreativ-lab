import { Parallax } from '@/components/motion/Parallax';
import { SlideIn } from '@/components/motion/SlideIn';
import type { GalleryTile } from '@/lib/gallery-tiles';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

/**
 * A case-study gallery composed from the individual pieces of work.
 *
 * A tile's own proportions decide its column span — a landscape frame earns more width
 * than a portrait one — so the grid is set by the photography rather than imposed on it,
 * and no two studies fall into the same rhythm. Tiles alternate the side they enter from,
 * and each drifts as it passes.
 */
function spanFor(tile: GalleryTile): string {
  const ratio = tile.w / tile.h;
  if (ratio > 1.7) return 'col-span-12 lg:col-span-8';
  if (ratio > 1.15) return 'col-span-12 sm:col-span-6 lg:col-span-7';
  if (ratio > 0.85) return 'col-span-6 lg:col-span-5';
  return 'col-span-6 sm:col-span-6 lg:col-span-4';
}

export function CaseStudyGallery({ tiles, client }: { tiles: readonly GalleryTile[]; client: string }) {
  return (
    <div className="grid grid-cols-12 items-start gap-4 sm:gap-6 lg:gap-8">
      {tiles.map((tile, index) => (
        <SlideIn
          key={tile.file}
          from={index % 2 === 0 ? 'left' : 'right'}
          delay={(index % 3) * 0.05}
          className={spanFor(tile)}
        >
          <Parallax speed={PARALLAX_SPEEDS.gallery}>
            <img
              src={tile.file}
              alt={`${client} — campaign work`}
              width={tile.w}
              height={tile.h}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
          </Parallax>
        </SlideIn>
      ))}
    </div>
  );
}
