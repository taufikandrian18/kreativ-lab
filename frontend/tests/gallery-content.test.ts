// Every case-study gallery tile must carry a picture. The tiles were cut out of the deck
// by gutter detection, and one gutter — 203px of pure white between two DRX spreads —
// was cut out as a tile and shipped as a tall blank column beside the campaign photo.
// A tile whose every channel is flat is a gutter, never a photograph.
import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import sharp from 'sharp';
import { GALLERY_TILES } from '@/lib/gallery-tiles';

/** Standard deviation below this, in every colour channel, is a flat fill. */
const FLAT = 3;

describe('gallery tiles carry pictures', () => {
  const files = Object.values(GALLERY_TILES).flatMap((tiles) => tiles.map((t) => t.file));

  it('lists at least one tile', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('has no tile that is a single flat colour', async () => {
    const flat: string[] = [];
    for (const file of files) {
      const stats = await sharp(join(__dirname, '../public', file)).stats();
      const spread = Math.max(...stats.channels.slice(0, 3).map((c) => c.stdev));
      if (spread < FLAT) flat.push(file);
    }
    expect(flat).toEqual([]);
  });
});
