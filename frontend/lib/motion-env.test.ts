import { describe, it, expect } from 'vitest';
import { shouldEnableSmoother, SMOOTHER_MIN_WIDTH } from './motion-env';

describe('shouldEnableSmoother (spec §6 reduced motion, §7 mobile)', () => {
  it('enables on desktop with motion allowed', () => {
    expect(shouldEnableSmoother({ width: 1440, reducedMotion: false })).toBe(true);
  });

  it('disables below the 1024px breakpoint so native momentum scroll survives', () => {
    expect(shouldEnableSmoother({ width: 1023, reducedMotion: false })).toBe(false);
    expect(shouldEnableSmoother({ width: 390, reducedMotion: false })).toBe(false);
  });

  it('enables exactly at the breakpoint', () => {
    expect(shouldEnableSmoother({ width: SMOOTHER_MIN_WIDTH, reducedMotion: false })).toBe(true);
  });

  it('disables whenever reduced motion is requested, at any width', () => {
    expect(shouldEnableSmoother({ width: 1920, reducedMotion: true })).toBe(false);
    expect(shouldEnableSmoother({ width: 390, reducedMotion: true })).toBe(false);
  });
});
