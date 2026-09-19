// Addresses the deck derivatives vendored into public/deck by `npm run sync-assets`.
// Page-to-section assignments are recorded and verified in
// frontend/content/page-section-mapping.md — consult that file before using a page
// number here; do not re-derive the mapping.

export const DECK_WIDTHS = [420, 768, 1280, 1920] as const;
export type DeckWidth = (typeof DECK_WIDTHS)[number];

// Source pages are 2048x1448 (spec §9). At 1920 wide: 1920 * 1448 / 2048 = 1357.5.
const DECK_ASPECT = 1448 / 2048;
const DECK_PAGE_COUNT = 26;

function assertPage(page: number): void {
  if (!Number.isInteger(page) || page < 1 || page > DECK_PAGE_COUNT) {
    throw new RangeError(
      `deck page must be an integer in 1..${DECK_PAGE_COUNT}, received ${page}`
    );
  }
}

export function deckSrc(page: number, width: DeckWidth): string {
  assertPage(page);
  return `/deck/page-${String(page).padStart(2, '0')}-${width}.webp`;
}

export function deckSrcSet(page: number): string {
  assertPage(page);
  return DECK_WIDTHS.map((w) => `${deckSrc(page, w)} ${w}w`).join(', ');
}

export function deckImage(page: number): {
  src: string;
  srcSet: string;
  width: number;
  height: number;
} {
  assertPage(page);
  return {
    src: deckSrc(page, 1920),
    srcSet: deckSrcSet(page),
    width: 1920,
    height: Math.round(1920 * DECK_ASPECT),
  };
}

// Verified in frontend/content/page-section-mapping.md: each case study's opener page.
export const ARCHIVE_OPENER_PAGE: Readonly<Record<string, number>> = Object.freeze({
  '01': 8,
  '02': 12,
  '03': 15,
  '04': 17,
  '05': 19,
  '06': 22,
});
