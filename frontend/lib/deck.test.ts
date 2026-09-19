import { describe, it, expect } from 'vitest';
import {
  deckSrc,
  deckSrcSet,
  deckImage,
  ARCHIVE_OPENER_PAGE,
  DECK_WIDTHS,
  ABOUT_PAGE,
  PRODUCT_LAB_PAGE,
  CREATIVE_LAB_PAGE,
  PROCESS_STATEMENT_PAGE,
  CONTACT_PAGE,
  ARCHIVE_GALLERY_PAGES,
  archiveGalleryPages,
} from './deck';
import { getArchiveProjects } from './contract';

describe('deck image helper (spec §9)', () => {
  it('zero-pads the page number and names the width', () => {
    expect(deckSrc(2, 1920)).toBe('/deck/page-02-1920.webp');
    expect(deckSrc(24, 420)).toBe('/deck/page-24-420.webp');
  });

  it('builds a srcSet across all four widths', () => {
    expect(deckSrcSet(4)).toBe(
      '/deck/page-04-420.webp 420w, /deck/page-04-768.webp 768w, /deck/page-04-1280.webp 1280w, /deck/page-04-1920.webp 1920w'
    );
  });

  it('reports the deck aspect ratio at 1920 wide', () => {
    const img = deckImage(2);
    expect(img.width).toBe(1920);
    expect(img.height).toBe(1358);
  });

  it('rejects a page outside 1..26 rather than emitting a 404 path', () => {
    expect(() => deckSrc(0, 1920)).toThrow(/page/i);
    expect(() => deckSrc(27, 1920)).toThrow(/page/i);
  });

  it('maps every archive_no to its verified opener page', () => {
    expect(ARCHIVE_OPENER_PAGE).toEqual({
      '01': 8,
      '02': 12,
      '03': 15,
      '04': 17,
      '05': 19,
      '06': 22,
    });
  });

  it('exposes the four derivative widths', () => {
    expect(DECK_WIDTHS).toEqual([420, 768, 1280, 1920]);
  });
});

describe('route page constants (content/page-section-mapping.md)', () => {
  it('names the verified page for each single-page route', () => {
    expect(ABOUT_PAGE).toBe(3);
    expect(PRODUCT_LAB_PAGE).toBe(5);
    expect(CREATIVE_LAB_PAGE).toBe(6);
    expect(PROCESS_STATEMENT_PAGE).toBe(7);
    expect(CONTACT_PAGE).toBe(26);
  });

  it('maps every case study to its verified gallery pages', () => {
    expect(ARCHIVE_GALLERY_PAGES).toEqual({
      '01': [9, 10, 11],
      '02': [13, 14],
      '03': [16],
      '04': [18],
      '05': [20, 21],
      '06': [23],
    });
  });

  it('covers every project the fixture carries, so a new one cannot ship unmapped', () => {
    for (const project of getArchiveProjects()) {
      expect(archiveGalleryPages(project.archive_no).length).toBeGreaterThan(0);
    }
  });

  it('throws rather than returning empty for an unmapped archive number', () => {
    expect(() => archiveGalleryPages('07')).toThrow(/no gallery mapping/i);
  });

  it('emits a resolvable path for every gallery page', () => {
    for (const pages of Object.values(ARCHIVE_GALLERY_PAGES)) {
      for (const page of pages) {
        expect(deckImage(page).src).toMatch(/^\/deck\/page-\d{2}-1920\.webp$/);
      }
    }
  });
});
