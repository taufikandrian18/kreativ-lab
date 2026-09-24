import { CLIENT_MARKS, type ClientMark } from '@/lib/client-marks';
import { cmsImage } from '@/lib/cms-image';
import type { ClientLogo } from '@/lib/contract';

/**
 * What the client wall shows for each entry under Client Logos in WordPress.
 *
 * The CMS decides who is on the wall; the artwork is found in this order:
 *   1. a logo uploaded in WordPress — used as an alpha mask like the deck marks, so it
 *      should be a black-on-transparent PNG or an SVG;
 *   2. the mark cut from deck page 24, matched by name;
 *   3. neither: the client's name set in the display face, so a new client appears the
 *      moment they are added, before anyone has artwork for them.
 *
 * With no CMS content at all (a build that never reached WordPress), the deck marks are
 * the wall, exactly as before the CMS existed.
 */
export interface WallMark extends ClientMark {
  /** True when there is no artwork and the name itself is the mark. */
  text?: boolean;
}

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '');

const DECK_MARKS = new Map(CLIENT_MARKS.map((m) => [normalise(m.name), m]));

export function clientWallMarks(logos: readonly ClientLogo[]): WallMark[] {
  if (logos.length === 0) return [...CLIENT_MARKS];

  return logos.map((logo) => {
    const uploaded = cmsImage(logo.logo);
    if (uploaded) {
      return { name: logo.name, file: uploaded.src, w: uploaded.width, h: uploaded.height };
    }
    const deck = DECK_MARKS.get(normalise(logo.name));
    if (deck) return { ...deck, name: logo.name };
    // Proportions that give a short name a sensible span in the layout's hash.
    return { name: logo.name, file: '', w: Math.max(logo.name.length, 4) * 40, h: 120, text: true };
  });
}
