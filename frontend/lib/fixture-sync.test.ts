import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// lib/contract.ts imports frontend/data/rest-contract.json (a local copy) rather than
// Stage 1's canonical fixture at wordpress/plugins/kreative-studio-lab/tests/fixtures/
// rest-contract.json directly, because Next.js's production build can't resolve module
// imports that reach outside the app's own project directory. This test fails loudly if
// the two drift, since `npm run sync-fixture` (package.json) is a manual step nothing
// else enforces.
describe('local fixture stays in sync with Stage 1 source', () => {
  it('frontend/data/rest-contract.json matches the canonical WordPress fixture byte-for-byte', () => {
    const local = readFileSync(join(__dirname, '../data/rest-contract.json'), 'utf-8');
    const canonical = readFileSync(
      join(__dirname, '../../wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json'),
      'utf-8'
    );
    expect(local).toBe(canonical);
  });
});
