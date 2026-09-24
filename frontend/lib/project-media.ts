import { cmsImage, type CmsImage } from '@/lib/cms-image';
import type { ArchiveProject } from '@/lib/contract';
import { ARCHIVE_OPENER_PAGE } from '@/lib/deck';
import { GALLERY_TILES, type GalleryTile } from '@/lib/gallery-tiles';

/**
 * Where a case study's imagery comes from: WordPress first, the deck second.
 *
 * Studies 01–06 were built from the deck, and their CMS entries carry no images yet, so
 * they keep the deck artwork until an editor uploads something better. A study added in
 * WordPress (07 onward) has no deck pages at all, so its imagery can only come from the
 * CMS — and one with no images yet must still render, not break the build.
 */
export type ProjectOpener =
  | { kind: 'cms'; image: CmsImage }
  | { kind: 'deck'; page: number }
  | null;

export function projectOpener(project: ArchiveProject): ProjectOpener {
  const image = cmsImage(project.hero_image);
  if (image) return { kind: 'cms', image };

  const page = ARCHIVE_OPENER_PAGE[project.archive_no];
  return page === undefined ? null : { kind: 'deck', page };
}

export function projectGallery(project: ArchiveProject): readonly GalleryTile[] {
  const uploaded = project.gallery.flatMap((img) => {
    const image = cmsImage(img);
    return image
      ? [{ file: image.src, srcSet: image.srcSet, w: image.width, h: image.height, alt: image.alt }]
      : [];
  });
  if (uploaded.length > 0) return uploaded;

  return GALLERY_TILES[project.archive_no] ?? [];
}
