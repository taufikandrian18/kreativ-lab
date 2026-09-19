// Spec §5: three colours only, and greys are image content. An alpha-composited black
// renders as a grey, which is how two Stage 2 stubs violated this without naming a grey
// anywhere. Source-level, because the composite only exists at paint time — there is no
// runtime signal to assert on. The scan does not exclude comments, deliberately: a
// comment that spells the pattern out is itself a copy-paste source, and rewording one
// is cheaper than teaching this test to parse TypeScript. Only app/ and components/ are
// scanned, so this file's own regex does not match itself.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      sourceFiles(path, acc);
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      acc.push(path);
    }
  }
  return acc;
}

describe('three-colour constraint (spec §5)', () => {
  it('composites no brand colour against an alpha', () => {
    const offenders: string[] = [];
    for (const path of [
      ...sourceFiles(join(__dirname, '../app')),
      ...sourceFiles(join(__dirname, '../components')),
    ]) {
      const matches = readFileSync(path, 'utf-8').match(/k-(?:black|paper|red)\/\d+/g);
      if (matches) offenders.push(`${path}: ${matches.join(', ')}`);
    }
    expect(offenders).toEqual([]);
  });
});
