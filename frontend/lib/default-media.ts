import { CHIP_ART } from '@/components/sections/Manifesto';
import { PILLAR_ART } from '@/components/sections/WhoWeAre';
import { ARCHIVE_REELS, CREATIVE_LAB_REEL } from '@/lib/archive-reels';
import { BASE_PATH } from '@/lib/asset';
import { CLIENT_MARKS } from '@/lib/client-marks';
import { GALLERY_TILES } from '@/lib/gallery-tiles';
import { OPENER_NUMBERS } from '@/lib/project-media';

/**
 * Every media field an editor sees in WordPress, and the file in public/ the site shows
 * while that field is empty.
 *
 * The site was built from the deck, so its photographs and films live in this repository,
 * not in WordPress: the Media Library started empty and every media field said "leave
 * empty to keep the current one" without showing what that was. `wp ksl seed
 * --import-media` reads this map (the plugin keeps a copy in its data/ folder) and uploads
 * each file into the field, labelled with the path it came from.
 *
 * scripts/fetch-cms.mjs reads the same map. A field that still holds its own imported file
 * is treated as empty, so the site keeps serving the hand-cut originals (the opener crops,
 * the 180px chips, the 720/480 video pair) exactly as before. Picking a different file in
 * the field is what makes the site use WordPress's copy.
 *
 * Paths are relative to the public site's root, without the /kreative-lab base path.
 * Regenerate both copies with `npm run sync-default-media` after changing any fallback.
 */
export interface DefaultMedia {
  site_pages: Record<string, Record<string, string>>;
  archive_projects: Record<
    string,
    { hero_image?: string; gallery?: string[]; reel_wide?: string; reel_narrow?: string; reel_poster?: string }
  >;
  client_logos: Record<string, string>;
}

function unbased(url: string): string {
  return BASE_PATH && url.startsWith(BASE_PATH) ? url.slice(BASE_PATH.length) : url;
}

export function defaultMedia(): DefaultMedia {
  const home: Record<string, string> = {
    // The same four paths as components/sections/Hero.tsx.
    hero_video_wide: '/video/hero-720.mp4',
    hero_video_narrow: '/video/hero-480.mp4',
    hero_poster: '/video/hero-poster.webp',
    hero_still: '/video/hero-still-reduced.webp',
  };
  CHIP_ART.forEach((art, i) => (home[`manifesto_chip_${i + 1}`] = `/chips/${art}.webp`));
  PILLAR_ART.forEach((art, i) => (home[`pillar_${i + 1}_image`] = `/pillars/${art}.jpg`));

  const archive_projects: DefaultMedia['archive_projects'] = {};
  const numbers = new Set([...OPENER_NUMBERS, ...Object.keys(GALLERY_TILES), ...Object.keys(ARCHIVE_REELS)]);
  for (const no of [...numbers].sort()) {
    const entry: DefaultMedia['archive_projects'][string] = {};
    if (OPENER_NUMBERS.includes(no)) entry.hero_image = `/openers/${no}-1060.webp`;
    const tiles = GALLERY_TILES[no];
    if (tiles?.length) entry.gallery = tiles.map((t) => unbased(t.file));
    const reel = ARCHIVE_REELS[no];
    if (reel) {
      entry.reel_wide = unbased(reel.wide);
      entry.reel_narrow = unbased(reel.narrow);
      entry.reel_poster = unbased(reel.poster);
    }
    archive_projects[no] = entry;
  }

  return {
    site_pages: {
      home,
      creative_lab: {
        cl_reel_wide: unbased(CREATIVE_LAB_REEL.wide),
        cl_reel_narrow: unbased(CREATIVE_LAB_REEL.narrow),
        cl_reel_poster: unbased(CREATIVE_LAB_REEL.poster),
      },
    },
    archive_projects,
    client_logos: Object.fromEntries(CLIENT_MARKS.map((m) => [m.name, unbased(m.file)])),
  };
}
