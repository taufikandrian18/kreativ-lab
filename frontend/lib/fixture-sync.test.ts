import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// lib/contract.ts imports frontend/data/rest-contract.json (a local copy) rather than
// Stage 1's canonical fixture at wordpress/plugins/kreative-studio-lab/tests/fixtures/
// rest-contract.json directly, because Next.js's production build can't resolve module
// imports that reach outside the app's own project directory. This test fails loudly if
// the two drift, since `npm run sync-fixture` (package.json) is a manual step nothing
// else enforces.
//
// If frontend/ is ever built or tested standalone without the sibling wordpress/
// directory present (e.g. a deploy pipeline that only has frontend/ on disk), the
// canonical fixture won't exist. That's a different failure mode than "drift
// detected", so this test skips gracefully (with a clear message) instead of letting
// readFileSync throw an ENOENT.
const canonicalPath = join(
  __dirname,
  '../../wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json'
);

describe('local fixture stays in sync with Stage 1 source', () => {
  if (process.env.KSL_CMS_URL) {
    // A deploy build: scripts/fetch-cms.mjs has just replaced the local copy with live
    // WordPress content, which is supposed to differ from the frozen fixture.
    it.skip('frontend/data/rest-contract.json matches the canonical WordPress fixture byte-for-byte (skipped: building from live CMS content, KSL_CMS_URL is set)', () => {});
  } else if (!existsSync(canonicalPath)) {
    it.skip('frontend/data/rest-contract.json matches the canonical WordPress fixture byte-for-byte (skipped: canonical fixture not present — wordpress/ directory not found alongside frontend/)', () => {});
    // eslint-disable-next-line no-console
    console.warn(
      `fixture-sync.test.ts: skipping drift check — canonical fixture not found at ${canonicalPath}. ` +
        'This is expected when frontend/ is built or tested standalone without the wordpress/ directory present.'
    );
  } else {
    it('frontend/data/rest-contract.json matches the canonical WordPress fixture byte-for-byte', () => {
      const local = readFileSync(join(__dirname, '../data/rest-contract.json'), 'utf-8');
      const canonical = readFileSync(canonicalPath, 'utf-8');
      expect(local).toBe(canonical);
    });
  }
});
