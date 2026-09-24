import { BASE_PATH } from '@/lib/asset';
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
  return `${BASE_PATH}/deck/page-${String(page).padStart(2, '0')}-${width}.webp`;
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

// Single-page routes, verified in frontend/content/page-section-mapping.md.
export const ABOUT_PAGE = 3;
export const PRODUCT_LAB_PAGE = 5;
export const CREATIVE_LAB_PAGE = 6;
export const CONTACT_PAGE = 26;

// Page 07 ("Every great outcome starts with a thoughtful process.") is recorded as
// ambiguous in the mapping document, which declined to assign it. Assigned here by the
// studio's call of 2026-09-19 as the /archive index opener — /archive is the only route
// in spec §4 with no deck page of its own, and page 07 sits immediately before the first
// case study in the deck. The mapping document's page 07 row is updated to match.
export const PROCESS_STATEMENT_PAGE = 7;

// Each case study's gallery pages, in deck order, verified in the mapping document.
export const ARCHIVE_GALLERY_PAGES: Readonly<Record<string, readonly number[]>> =
  Object.freeze({
    '01': Object.freeze([9, 10, 11]),
    '02': Object.freeze([13, 14]),
    '03': Object.freeze([16]),
    '04': Object.freeze([18]),
    '05': Object.freeze([20, 21]),
    '06': Object.freeze([23]),
  });

export function archiveGalleryPages(archiveNo: string): readonly number[] {
  const pages = ARCHIVE_GALLERY_PAGES[archiveNo];
  if (!pages) {
    throw new RangeError(
      `no gallery mapping for archive_no ${archiveNo} — add it to ARCHIVE_GALLERY_PAGES ` +
        `in lib/deck.ts, verified against content/page-section-mapping.md`
    );
  }
  // Not decoration: this runs assertPage over every mapped page at call time, so a
  // typo'd page number throws during the static render rather than 404ing into a
  // blank gallery at runtime — the Stage 2 failure this module exists to prevent.
  pages.forEach((page) => deckSrc(page, 1920));
  return pages;
}

/**
 * What each deck page depicts, transcribed from the Depicts column of
 * frontend/content/page-section-mapping.md.
 *
 * Spec §11: "Every image carries meaningful alt text drawn from its project's client and
 * scope." A case-study gallery section contains no heading, caption or body text — the
 * spreads are the case study — so an empty alt removes the whole section from the
 * accessibility tree. These descriptions are what a sighted visitor gets from the page.
 */
export const DECK_PAGE_ALT: Readonly<Record<number, string>> = Object.freeze({
  3: 'Studio portrait: a sewing machine foot in high-contrast halftone, and the four pillars as photographic cards — think, design, craft, experience',
  9: 'Campaign photography with a car, a promotional tile grid, and flat-lays of caps, hoodies and tees',
  10: 'Denim product close-ups and street campaign photography under Tokyo signage',
  11: 'Studio shoot of grey hoodies and sweats, and flat-lays of caps, hoodie and tees',
  13: 'Red, white and navy jersey product shots, boxed retail packaging, trading-card inserts and a lanyard, with a bar-setting campaign photo',
  14: 'Red Honda-branded polo jersey product shots and a group campaign photo of four men in jerseys',
  16: 'Helmet and fender detail shots on a Triumph motorcycle, and campaign photography of a model in helmet and leather jacket',
  18: 'Vespa scooter campaign photography with models in pastel helmets, and lifestyle shots on grass',
  20: 'Surf and moto rally event photography — banners, riders and surfers on the beach — with vest, shirt and long-sleeve product shots',
  21: 'Quarter-zip jacket product shots and stage photography from the Ookla Speedtest Awards',
  23: 'Event brochure, towels, water bottles, cap, lanyards and VVIP, VIP, crew and visitor access bands',
});

/**
 * The description for a deck page, prefixed with the client so a screen-reader user
 * landing mid-gallery knows whose work this is. Throws rather than returning a bare
 * client name, so a new gallery page cannot ship with nothing to announce.
 */
export function deckPageAlt(page: number, prefix?: string): string {
  const description = DECK_PAGE_ALT[page];
  if (!description) {
    throw new RangeError(
      `no alt description for deck page ${page} — add it to DECK_PAGE_ALT in lib/deck.ts, ` +
        `transcribed from the Depicts column of content/page-section-mapping.md`
    );
  }
  return prefix ? `${prefix} — ${description}` : description;
}
