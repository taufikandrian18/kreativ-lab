import { describe, it, expect } from 'vitest';
import { justifyRows } from './justify-rows';

const portrait = { w: 3, h: 4 };
const landscape = { w: 3, h: 2 };

describe('justifyRows', () => {
  it('keeps every tile, in order', () => {
    const tiles = [portrait, landscape, portrait, portrait, landscape].map((t, i) => ({ ...t, i }));
    expect(justifyRows(tiles).flat().map((t) => t.i)).toEqual([0, 1, 2, 3, 4]);
  });

  it('packs rows up to the target width', () => {
    const rows = justifyRows(Array(6).fill(portrait), 2.2);
    for (const row of rows) {
      expect(row.reduce((n, t) => n + t.w / t.h, 0)).toBeGreaterThanOrEqual(2.2);
    }
  });

  it('never leaves one short tile alone on the last row', () => {
    // The DRX case: three portraits fill a row, the fourth would sit alone.
    const rows = justifyRows(Array(4).fill(portrait), 2.2);
    expect(rows.at(-1)!.length).toBeGreaterThan(1);
  });

  it('lets a single wide tile stand on its own', () => {
    expect(justifyRows([{ w: 4, h: 1 }], 2.6)).toEqual([[{ w: 4, h: 1 }]]);
  });
});
