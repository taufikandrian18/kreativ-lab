import { describe, it, expect } from 'vitest';
import { MAX_SWAPS, swapPlan } from './swap-letters';

const swapped = (text: string) => [...swapPlan(text)].sort((a, b) => a - b).map((i) => text[i]);

describe('swapPlan', () => {
  it('swaps a round letter inside the longest word', () => {
    expect(swapped('HOW WE WORK')).toContain('O');
  });

  it('gives a longer headline a second accent near its end', () => {
    const text = 'IDEAS ARE EVERYWHERE. WE MAKE THEM REAL.';
    const plan = [...swapPlan(text)];
    expect(plan).toHaveLength(2);
    expect(Math.max(...plan)).toBeGreaterThan(text.indexOf('EVERYWHERE') + 'EVERYWHERE'.length);
  });

  it('never swaps more than the cap', () => {
    expect(swapPlan('GOOD GOSSIP COSTS CROSS COLOSSAL SCISSORS').size).toBeLessThanOrEqual(MAX_SWAPS);
  });

  it('only swaps letters whose wide form reads as deliberate', () => {
    for (const char of swapped("GOT AN IDEA? LET'S MAKE IT LIVE.")) {
      expect(char).toMatch(/[OSCGQRoscegr]/);
    }
  });

  it('never swaps a capital E, whose hairline arms read as a bracket', () => {
    expect(swapped('EVERYWHERE THERE HERE')).not.toContain('E');
  });

  it('leaves a headline with no round letters alone', () => {
    expect(swapPlan('LAB HIT').size).toBe(0);
  });

  it('is deterministic', () => {
    const text = 'FRESH FROM THE LAB';
    expect([...swapPlan(text)]).toEqual([...swapPlan(text)]);
  });
});
