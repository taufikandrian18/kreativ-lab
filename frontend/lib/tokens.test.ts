import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('design tokens', () => {
  const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

  it('defines the three-colour palette from spec §5', () => {
    expect(css).toMatch(/--k-red:\s*#F81010/i);
    expect(css).toMatch(/--k-black:\s*#000000/i);
    expect(css).toMatch(/--k-paper:\s*#FFFFFF/i);
  });

  it('does not define a generic grey token', () => {
    expect(css).not.toMatch(/--k-grey/i);
    expect(css).not.toMatch(/--k-gray/i);
  });
});
