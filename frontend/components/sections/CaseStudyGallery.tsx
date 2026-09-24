import { Parallax } from '@/components/motion/Parallax';
import { SlideIn } from '@/components/motion/SlideIn';
import type { GalleryTile } from '@/lib/gallery-tiles';
import { justifyRows } from '@/lib/justify-rows';
import { PARALLAX_SPEEDS } from '@/lib/parallax';

/**
 * A case-study gallery composed from the individual pieces of work, set in justified
 * rows (lib/justify-rows.ts): each row fills the width at one height, and each tile keeps
 * its own proportions by taking a share of the row equal to its aspect ratio. A gallery
 * of any size and any mix of shapes comes out with no holes.
 *
 * Below 640px every row is a single column, full width: three portraits side by side on
 * a phone would each be a thumbnail. Tiles alternate the side they enter from, and every
 * tile in a row drifts at the same speed, so the row stays level as it passes.
 */
export function CaseStudyGallery({ tiles, client }: { tiles: readonly GalleryTile[]; client: string }) {
  let index = 0;
  const rows = justifyRows(tiles).map((row) => row.map((tile) => ({ tile, index: index++ })));

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
      {rows.map((row, r) => (
        <div key={r} data-gallery-row className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          {row.map(({ tile, index: i }) => (
            <SlideIn
              key={`${i}-${tile.file}`}
              from={i % 2 === 0 ? 'left' : 'right'}
              delay={(i % 3) * 0.05}
              className="min-w-0"
              // flex-grow by aspect ratio from a zero basis is what gives every tile in
              // the row the same height. In the phone's column it has no free space to
              // share, so each tile simply takes its own height.
              style={{ flex: `${tile.w / tile.h} 1 0%` }}
            >
              <Parallax speed={PARALLAX_SPEEDS.gallery}>
                <img
                  src={tile.file}
                  srcSet={tile.srcSet}
                  sizes={tile.srcSet ? '(min-width: 640px) 50vw, 100vw' : undefined}
                  alt={tile.alt || `${client} — campaign work`}
                  width={tile.w}
                  height={tile.h}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full rounded-[1.1rem]"
                />
              </Parallax>
            </SlideIn>
          ))}
        </div>
      ))}
    </div>
  );
}
