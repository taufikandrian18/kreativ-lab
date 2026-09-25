import { describe, it, expect } from 'vitest';
import { coverPoint, differenceOfWhite, needsBlendFallback } from './blend-fallback';

describe('needsBlendFallback', () => {
  it('catches every iOS browser, all of which are WebKit', () => {
    const iphoneChrome =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0 Mobile/15E148 Safari/604.1';
    expect(needsBlendFallback(iphoneChrome, 'iPhone', 5)).toBe(true);
  });

  it('catches iPadOS, which reports itself as a Mac with touch', () => {
    expect(needsBlendFallback('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5)).toBe(true);
  });

  it('leaves desktops and Android on the real blend', () => {
    expect(needsBlendFallback('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 0)).toBe(false);
    expect(needsBlendFallback('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/129.0 Mobile', 'Linux armv8l', 5)).toBe(false);
  });
});

describe('coverPoint', () => {
  it('maps the centre of the box to the centre of the frame', () => {
    const p = coverPoint(195, 422, { left: 0, top: 0, width: 390, height: 844 }, 854, 480);
    expect(p.x).toBeCloseTo(427);
    expect(p.y).toBeCloseTo(240);
  });

  it('crops a landscape frame from both sides on a portrait screen', () => {
    // 854x480 covering 390x844 scales to 1501.6x844, so 555.8px are cut off each side.
    const left = coverPoint(0, 422, { left: 0, top: 0, width: 390, height: 844 }, 854, 480);
    expect(left.x).toBeCloseTo((1501.6 - 390) / 2 / (844 / 480), 0);
  });

  it('follows the box when the push-in scales it up', () => {
    const p = coverPoint(0, 0, { left: -29, top: -63, width: 448, height: 970 }, 854, 480);
    expect(p.x).toBeGreaterThan(0);
    expect(p.y).toBeGreaterThan(0);
  });
});

describe('differenceOfWhite', () => {
  it('matches the blend: black over white, white over black, cyan over red', () => {
    expect(differenceOfWhite(255, 255, 255)).toBe('rgb(0, 0, 0)');
    expect(differenceOfWhite(0, 0, 0)).toBe('rgb(255, 255, 255)');
    expect(differenceOfWhite(248, 16, 16)).toBe('rgb(7, 239, 239)');
  });
});
