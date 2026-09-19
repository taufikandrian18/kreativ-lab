import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// A missing derivative does not fail a build — it 404s into a blank section at
// runtime, which is exactly how Stage 2's hero image shipped broken. This test is the
// gate: every width of every page, plus all four hero media files, must be on disk
// before anything references them.
const deckDir = join(__dirname, '../public/deck');
const videoDir = join(__dirname, '../public/video');

describe('deck and video assets are present in public/ (spec §9, §8)', () => {
  it('ships all 104 deck derivatives', () => {
    const files = readdirSync(deckDir).filter((f) => f.endsWith('.webp'));
    expect(files).toHaveLength(104);
  });

  it('ships all four widths for every one of the 26 pages', () => {
    for (let page = 1; page <= 26; page++) {
      const nn = String(page).padStart(2, '0');
      for (const width of [420, 768, 1280, 1920]) {
        expect(
          existsSync(join(deckDir, `page-${nn}-${width}.webp`)),
          `missing page-${nn}-${width}.webp`
        ).toBe(true);
      }
    }
  });

  it('ships the hero video, its poster, and the reduced-motion still', () => {
    for (const file of [
      'hero-1080.mp4',
      'hero-720.mp4',
      'hero-poster.jpg',
      'hero-still-reduced.jpg',
    ]) {
      expect(existsSync(join(videoDir, file)), `missing ${file}`).toBe(true);
    }
  });
});
