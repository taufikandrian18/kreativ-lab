/**
 * The case-study galleries, cut out of the deck pages on 2026-09-20.
 *
 * Until now a gallery was the deck page itself: a screenshot of a layout, complete with
 * its page margins and its "LAB ARCHIVE 01" footer, shown at whatever size the column
 * gave it. The work inside was never addressable on its own, so the site could not
 * compose it — it could only re-present someone else's composition.
 *
 * Tiles are found by gutter detection rather than hand-measured boxes: a gutter is a line
 * of near-constant colour running the whole way across, which is white on the light pages
 * and black on the dark ones. Composite panels — the SALE banner, the PROMO MATTERS grid —
 * are deliberately kept whole. They are designed artefacts, and shredding them into their
 * own sub-photographs would destroy the work rather than extract it. Every tile is clamped
 * above the footer band so no deck chrome survives the crop.
 *
 * Cut from assets/raw (2048px) rather than the 1920px web export, and never upscaled.
 * That is a 7% gain and no more: a photograph occupying a quarter of a deck page is about
 * 480px at source, so these are soft above thumbnail size and no resampling changes that.
 * The ceiling is the deck export itself. Sharp galleries need the original photography.
 *
 * Regenerate from the extraction in this commit's history if the deck is re-exported.
 */
export interface GalleryTile {
  file: string;
  w: number;
  h: number;
}

export const GALLERY_TILES: Readonly<Record<string, readonly GalleryTile[]>> = Object.freeze({
  '01': [
      { file: '/gallery/01-01.webp', w: 484, h: 323 },
      { file: '/gallery/01-02.webp', w: 484, h: 323 },
      { file: '/gallery/01-03.webp', w: 483, h: 323 },
      { file: '/gallery/01-04.webp', w: 482, h: 323 },
      { file: '/gallery/01-05.webp', w: 650, h: 815 },
      { file: '/gallery/01-06.webp', w: 650, h: 815 },
      { file: '/gallery/01-07.webp', w: 650, h: 815 },
      { file: '/gallery/01-08.webp', w: 1023, h: 1296 },
      { file: '/gallery/01-09.webp', w: 883, h: 1296 },
      { file: '/gallery/01-10.webp', w: 1027, h: 1296 },
      { file: '/gallery/01-11.webp', w: 969, h: 1296 },
  ],
  '02': [
      { file: '/gallery/02-01.webp', w: 958, h: 1296 },
      { file: '/gallery/02-02.webp', w: 978, h: 1296 },
      { file: '/gallery/02-03.webp', w: 203, h: 1296 },
      { file: '/gallery/02-04.webp', w: 683, h: 1296 },
      { file: '/gallery/02-05.webp', w: 987, h: 1296 },
  ],
  '03': [
      { file: '/gallery/03-01.webp', w: 361, h: 453 },
      { file: '/gallery/03-02.webp', w: 366, h: 453 },
      { file: '/gallery/03-03.webp', w: 362, h: 453 },
      { file: '/gallery/03-04.webp', w: 362, h: 453 },
      { file: '/gallery/03-05.webp', w: 361, h: 453 },
      { file: '/gallery/03-06.webp', w: 2048, h: 730 },
  ],
  '04': [
      { file: '/gallery/04-01.webp', w: 651, h: 869 },
      { file: '/gallery/04-02.webp', w: 653, h: 869 },
      { file: '/gallery/04-03.webp', w: 652, h: 869 },
      { file: '/gallery/04-04.webp', w: 1999, h: 405 },
  ],
  '05': [
      { file: '/gallery/05-01.webp', w: 505, h: 756 },
      { file: '/gallery/05-02.webp', w: 727, h: 756 },
      { file: '/gallery/05-03.webp', w: 730, h: 756 },
      { file: '/gallery/05-04.webp', w: 237, h: 299 },
      { file: '/gallery/05-05.webp', w: 237, h: 299 },
      { file: '/gallery/05-06.webp', w: 371, h: 299 },
      { file: '/gallery/05-07.webp', w: 704, h: 299 },
      { file: '/gallery/05-08.webp', w: 364, h: 299 },
      { file: '/gallery/05-09.webp', w: 525, h: 1296 },
      { file: '/gallery/05-10.webp', w: 391, h: 1296 },
      { file: '/gallery/05-11.webp', w: 913, h: 1296 },
  ],
  '06': [
      { file: '/gallery/06-01.webp', w: 645, h: 1227 },
      { file: '/gallery/06-02.webp', w: 1231, h: 1227 },
  ],
});
