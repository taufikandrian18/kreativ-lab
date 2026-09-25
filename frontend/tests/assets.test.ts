import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
      'hero-720.mp4',
      'hero-480.mp4',
      'hero-poster.webp',
      'hero-still-reduced.webp',
    ]) {
      expect(existsSync(join(videoDir, file)), `missing ${file}`).toBe(true);
    }
  });

  // hero-1080.mp4 shipped truncated: an mdat box running to the end of the file and no
  // moov box, so no browser could play it — yet every desktop visitor downloaded all
  // 1.3MB of it before falling back. A file that exists is not a file that plays.
  it('ships only videos that carry their moov index', () => {
    const broken: string[] = [];
    for (const file of readdirSync(videoDir).filter((f) => f.endsWith('.mp4'))) {
      const data = readFileSync(join(videoDir, file));
      const boxes: string[] = [];
      for (let at = 0; at + 8 <= data.length; ) {
        const size = data.readUInt32BE(at);
        boxes.push(data.toString('latin1', at + 4, at + 8));
        if (size < 8) break;
        at += size;
      }
      if (!boxes.includes('moov')) broken.push(file);
    }
    expect(broken).toEqual([]);
  });
});

describe('the asset check gates the build, not just the test run', () => {
  it('runs in prebuild, so a missing derivative cannot reach a deployed page', () => {
    // lib/deck.ts validates the page NUMBER at build time, but nothing validates that
    // the file exists — and a missing derivative 404s into a blank section, which is
    // exactly the Stage 2 failure. This suite is that existence check; it only gates
    // anything if the build runs it.
    const pkg = JSON.parse(
      readFileSync(join(__dirname, '../package.json'), 'utf-8')
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts.prebuild).toContain('tests/assets.test.ts');
  });
});
