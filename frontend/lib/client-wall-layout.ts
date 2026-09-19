import type { ClientMark } from './client-marks';

/**
 * The scramble for the client wall.
 *
 * A neat 4-column grid of evenly sized marks reads as a directory. The studio asked for
 * something closer to the deck's own brutalism: irregular spans, mixed sizes, mixed
 * alignment, an order that does not echo the source page.
 *
 * Every one of those decisions is a hash of the client's name, never Math.random(). A
 * random arrangement would lay the wall out one way on the server and another on the
 * client, React would discard the markup, and the wall would visibly rearrange itself on
 * hydration — the same class of defect as the reduced-motion Critical found in Stage 3.
 * Hashing gives the irregularity without the mismatch, and the same client always lands
 * in the same place, which is what lets the studio say "move Pertamina" and have it mean
 * something.
 */
export type MarkSize = 'sm' | 'md' | 'lg';
export type MarkAlign = 'start' | 'center' | 'end';

export interface PlacedMark extends ClientMark {
  /** Columns out of 12. */
  span: number;
  size: MarkSize;
  align: MarkAlign;
}

/** FNV-1a. Small, stable across runtimes, and good enough to look unplanned. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const SPANS = [3, 4, 5, 6] as const;
const SIZES: MarkSize[] = ['sm', 'md', 'lg'];
const ALIGNS: MarkAlign[] = ['start', 'center', 'end'];

export function clientWallLayout(marks: readonly ClientMark[]): PlacedMark[] {
  // Order first: sort by a hash of the name rather than shuffling in place, so the result
  // depends only on the set of names and not on the order they arrived in.
  const ordered = [...marks].sort((a, b) => hash(a.name) - hash(b.name));

  const placed: PlacedMark[] = [];
  let used = 0;

  for (const mark of ordered) {
    const h = hash(mark.name);
    let span: number = SPANS[h % SPANS.length];

    // Keep rows full. A brutalist wall is dense; a ragged right edge just looks like a
    // bug. If the pick would overhang, take the remainder — unless that leaves a sliver,
    // in which case widen the previous mark instead of shipping a 1-column orphan.
    const remaining = 12 - used;
    if (span > remaining) {
      if (remaining >= 3) span = remaining;
      else {
        if (placed.length > 0) placed[placed.length - 1].span += remaining;
        used = 0;
        span = SPANS[h % SPANS.length];
      }
    }

    placed.push({
      ...mark,
      span,
      size: SIZES[(h >>> 8) % SIZES.length],
      align: ALIGNS[(h >>> 16) % ALIGNS.length],
    });
    used = (used + span) % 12;
  }

  return placed;
}
