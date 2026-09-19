import { describe, it, expect } from 'vitest';
import { parallaxRange, PARALLAX_SPEEDS } from './parallax';

describe('parallaxRange', () => {
  it('drifts a slow element downward relative to the page', () => {
    // speed < 1 means the element travels less than the scroll, so against the page it
    // appears to lag behind — the classic depth cue.
    const { from, to } = parallaxRange(0.8);
    expect(from).toBeLessThan(0);
    expect(to).toBeGreaterThan(0);
    expect(from).toBe(-to);
  });

  it('scales the drift with distance from 1', () => {
    expect(parallaxRange(0.6).to).toBeGreaterThan(parallaxRange(0.9).to);
  });

  it('is motionless at speed 1, which is the page itself', () => {
    expect(parallaxRange(1)).toEqual({ from: 0, to: 0 });
  });

  it('drifts the other way for a fast element', () => {
    expect(parallaxRange(1.2).from).toBeGreaterThan(0);
  });

  it('never exceeds the cap, however extreme the speed', () => {
    // An uncapped range lets an element slide out of its own section and overlap the
    // next one, which reads as a bug rather than as depth.
    expect(parallaxRange(0).to).toBeLessThanOrEqual(12);
    expect(parallaxRange(5).from).toBeLessThanOrEqual(12);
  });

  it('names the speeds the routes use, so they stay consistent site-wide', () => {
    expect(PARALLAX_SPEEDS.figure).toBeLessThan(1);
    expect(PARALLAX_SPEEDS.gallery).toBeLessThan(1);
  });
});
