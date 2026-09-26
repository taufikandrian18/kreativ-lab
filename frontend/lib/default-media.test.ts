import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultMedia } from '@/lib/default-media';

// The map is generated from the site's own fallback constants and committed twice: here
// for scripts/fetch-cms.mjs, and in the plugin for `wp ksl seed --import-media`.
// `npm run sync-default-media` rewrites both; this test fails if either drifts.
const localPath = join(__dirname, '../data/default-media.json');
const pluginPath = join(__dirname, '../../wordpress/plugins/kreative-studio-lab/data/default-media.json');
const expected = JSON.stringify(defaultMedia(), null, 2) + '\n';

if (process.env.WRITE_DEFAULT_MEDIA) {
  writeFileSync(localPath, expected);
  if (existsSync(join(pluginPath, '..'))) writeFileSync(pluginPath, expected);
}

describe('default media map', () => {
  it('matches the committed copy in frontend/data', () => {
    expect(readFileSync(localPath, 'utf-8')).toBe(expected);
  });

  it.skipIf(!existsSync(pluginPath))('matches the plugin copy', () => {
    expect(readFileSync(pluginPath, 'utf-8')).toBe(expected);
  });

  it('names only files that exist in public/', () => {
    const map = defaultMedia();
    const paths = [
      ...Object.values(map.site_pages).flatMap((fields) => Object.values(fields)),
      ...Object.values(map.archive_projects).flatMap((p) => [
        p.hero_image,
        ...(p.gallery ?? []),
        p.reel_wide,
        p.reel_narrow,
        p.reel_poster,
      ]),
      ...Object.values(map.client_logos),
    ].filter((p): p is string => typeof p === 'string');
    expect(paths.length).toBeGreaterThan(80);
    const missing = paths.filter((p) => !p.startsWith('/') || !existsSync(join(__dirname, '../public', p)));
    expect(missing).toEqual([]);
  });

  it('fits every gallery in the 16 WordPress gallery slots', () => {
    for (const project of Object.values(defaultMedia().archive_projects)) {
      expect(project.gallery?.length ?? 0).toBeLessThanOrEqual(16);
    }
  });
});
