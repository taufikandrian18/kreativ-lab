import { asset } from '@/lib/asset';
/**
 * The 25 client marks, cropped out of deck page 24 on 2026-09-19.
 *
 * Stage 3 and Stage 4 both recorded that no logo artwork existed, because the fixture's
 * client_logo entries carry null image URLs and the deck supplies one composite raster.
 * That was true of the fixture and wrong about the deck: page 24 is pure black marks on
 * white in a clean grid, so each one lifts out cleanly. Detected by ink projection rather
 * than by hand-measured boxes, and written out as alpha masks — the PNG carries the shape
 * in its alpha channel and no colour at all, so CSS paints it with `background-color` and
 * a hover can recolour it. A flat JPEG of a logo could never do that.
 *
 * Names follow the fixture, not the deck's own rendering — the CMS is what the studio
 * edits, so "Shiny Bright" and "Chelsea" win over the artwork's "SHINING BRIGHT" and
 * "CHELSEA FOOTBALL CLUB". The file names keep the deck's spelling; only the label moves.
 *
 * 25 here against 24 in the fixture: the deck includes Nippon Paint, which spec §3's
 * transcribed list omits. content/page-section-mapping.md already flagged that gap.
 *
 * Regenerate with the extraction in this file's git history if the deck is re-exported.
 */
export interface ClientMark {
  name: string;
  file: string;
  w: number;
  h: number;
}

export const CLIENT_MARKS: readonly ClientMark[] = [
  { name: "Deus", file: asset('/logos/deus.png'), w: 140, h: 141 },
  { name: "BMW Motorrad", file: asset('/logos/bmw-motorrad.png'), w: 275, h: 141 },
  { name: "Unionwell", file: asset('/logos/unionwell.png'), w: 125, h: 141 },
  { name: "Jägermeister", file: asset('/logos/jagermeister.png'), w: 133, h: 141 },
  { name: "Howard Smith", file: asset('/logos/howard-smith.png'), w: 282, h: 141 },
  { name: "Jameson", file: asset('/logos/jameson.png'), w: 245, h: 141 },
  { name: "Von Dutch", file: asset('/logos/von-dutch.png'), w: 211, h: 141 },
  { name: "Shiny Bright", file: asset('/logos/shining-bright.png'), w: 93, h: 139 },
  { name: "Compass", file: asset('/logos/compass.png'), w: 260, h: 139 },
  { name: "XLSmart", file: asset('/logos/xlsmart.png'), w: 282, h: 139 },
  { name: "Cargloss", file: asset('/logos/cargloss.png'), w: 291, h: 139 },
  { name: "B-LOG", file: asset('/logos/b-log.png'), w: 200, h: 139 },
  { name: "Pocari Sweat", file: asset('/logos/pocari-sweat.png'), w: 162, h: 139 },
  { name: "N8N", file: asset('/logos/n8n.png'), w: 148, h: 139 },
  { name: "J&T Express", file: asset('/logos/j-t-express.png'), w: 231, h: 119 },
  { name: "Garuda Indonesia", file: asset('/logos/garuda-indonesia.png'), w: 311, h: 119 },
  { name: "Pertamina", file: asset('/logos/pertamina.png'), w: 289, h: 119 },
  { name: "Chelsea", file: asset('/logos/chelsea-fc.png'), w: 118, h: 119 },
  { name: "Erspo", file: asset('/logos/erspo.png'), w: 166, h: 119 },
  { name: "Nippon Paint", file: asset('/logos/nippon-paint.png'), w: 99, h: 119 },
  { name: "DRX", file: asset('/logos/drx.png'), w: 94, h: 119 },
  { name: "Kominfo", file: asset('/logos/kominfo.png'), w: 287, h: 131 },
  { name: "Kemenpora", file: asset('/logos/kemenpora.png'), w: 245, h: 131 },
  { name: "Sampoerna", file: asset('/logos/sampoerna.png'), w: 263, h: 131 },
  { name: "Grand Hyatt", file: asset('/logos/grand-hyatt.png'), w: 392, h: 131 },
];
