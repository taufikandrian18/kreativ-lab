import { asset } from '@/lib/asset';
import { ARCHIVE_REELS, type ArchiveReel } from '@/lib/archive-reels';
import { cmsImage, type CmsImage } from '@/lib/cms-image';
import type { ArchiveProject } from '@/lib/contract';
import { GALLERY_TILES, type GalleryTile } from '@/lib/gallery-tiles';

/**
 * Where a case study's imagery comes from: WordPress first, the deck second.
 *
 * Studies 01–06 were built from the deck, and their CMS entries carry no images yet, so
 * they keep the deck's photography until an editor uploads something better. The opener
 * is the photograph alone, cut from the left half of the study's deck page
 * (public/openers): the whole page used to be shown, with its SCOPE OF WORK list and
 * footer printed into the image — unreadable on a phone and duplicating live text. A study
 * added in WordPress (07 onward) has no deck pages, so its imagery can only come from the
 * CMS — and one with no images yet must still render, not break the build.
 */
export interface ProjectOpener {
  image: CmsImage;
  /** True when an editor uploaded it, so its own alt text can be trusted. */
  uploaded: boolean;
}

/** Heights of the 1060px-wide crops in public/openers, keyed by archive number. */
const OPENER_HEIGHT: Readonly<Record<string, number>> = {
  '01': 1443,
  '02': 1444,
  '03': 1444,
  '04': 1439,
  '05': 1436,
  '06': 1444,
};

export function projectOpener(project: ArchiveProject): ProjectOpener | null {
  const image = cmsImage(project.hero_image);
  if (image) return { image, uploaded: true };

  const height = OPENER_HEIGHT[project.archive_no];
  if (!height) return null;
  const no = project.archive_no;
  return {
    uploaded: false,
    image: {
      src: asset(`/openers/${no}-1060.webp`),
      srcSet: `${asset(`/openers/${no}-720.webp`)} 720w, ${asset(`/openers/${no}-1060.webp`)} 1060w`,
      width: 1060,
      height,
      alt: null,
    },
  };
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

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : asset(url);
}

/**
 * A reel from uploaded files, or null when there is not enough to show one. The poster
 * is required because it is what reduced-motion visitors and the first paint see, and
 * its proportions are the only size the column has to reserve. A missing mobile cut
 * falls back to the desktop one.
 */
export function uploadedReel(
  wide: string | null | undefined,
  narrow: string | null | undefined,
  poster: CmsImage | null
): ArchiveReel | null {
  const wideUrl = resolveUrl(wide);
  if (!wideUrl || !poster) return null;
  return {
    wide: wideUrl,
    narrow: resolveUrl(narrow) ?? wideUrl,
    poster: poster.src,
    width: poster.width,
    height: poster.height,
  };
}

/** A case study's reel: uploaded in WordPress first, then the one cut from studio footage. */
export function projectReel(project: ArchiveProject): ArchiveReel | undefined {
  const uploaded = uploadedReel(
    project.reel?.wide.url,
    project.reel?.narrow.url,
    cmsImage(project.reel?.poster)
  );
  return uploaded ?? ARCHIVE_REELS[project.archive_no];
}
