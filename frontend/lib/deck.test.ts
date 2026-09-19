import { describe, it, expect } from 'vitest';
import { deckSrc, deckSrcSet, deckImage, ARCHIVE_OPENER_PAGE, DECK_WIDTHS } from './deck';

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
