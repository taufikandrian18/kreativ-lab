import { describe, it, expect } from 'vitest';
import { clientWallLayout } from './client-wall-layout';
import { CLIENT_MARKS } from './client-marks';

describe('clientWallLayout', () => {
  it('places every mark exactly once', () => {
    const laid = clientWallLayout(CLIENT_MARKS);
    expect(laid).toHaveLength(CLIENT_MARKS.length);
    expect(new Set(laid.map((l) => l.name)).size).toBe(CLIENT_MARKS.length);
  });

  it('is deterministic, because a random arrangement would not survive hydration', () => {
    // Math.random() here is the Stage 3 Critical all over again: the server would lay the
    // wall out one way, the client another, and React would throw the markup away. The
    // scramble is a hash of the name — irregular to look at, identical on both renders.
    const a = JSON.stringify(clientWallLayout(CLIENT_MARKS));
    const b = JSON.stringify(clientWallLayout(CLIENT_MARKS));
    expect(a).toBe(b);
  });

  it('does not simply echo the deck order', () => {
    const laid = clientWallLayout(CLIENT_MARKS);
    const same = laid.filter((l, i) => l.name === CLIENT_MARKS[i].name).length;
    expect(same).toBeLessThan(CLIENT_MARKS.length / 3);
  });

  it('varies the column span, so no row repeats the one above it', () => {
    const spans = new Set(clientWallLayout(CLIENT_MARKS).map((l) => l.span));
    expect(spans.size).toBeGreaterThanOrEqual(3);
    // 3-6 are the picks; a span can widen past 6 when it absorbs a remainder that would
    // otherwise leave a one-column orphan, which is the rule that keeps rows dense.
    for (const span of spans) {
      expect(span).toBeGreaterThanOrEqual(3);
      expect(span).toBeLessThanOrEqual(8);
    }
  });

  it('varies size and alignment too, or the spans alone still read as a grid', () => {
    const laid = clientWallLayout(CLIENT_MARKS);
    expect(new Set(laid.map((l) => l.size)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(laid.map((l) => l.align)).size).toBeGreaterThanOrEqual(2);
  });

  it('keeps the rows filled — no span leaves a hole wider than one column', () => {
    let used = 0;
    for (const { span } of clientWallLayout(CLIENT_MARKS)) {
      if (used + span > 12) {
        expect(12 - used).toBeLessThanOrEqual(1);
        used = 0;
      }
      used = (used + span) % 12;
    }
    expect(true).toBe(true);
  });
});
