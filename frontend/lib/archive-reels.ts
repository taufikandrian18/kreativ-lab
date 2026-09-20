/**
 * Motion supplied by the studio, per case study.
 *
 * The source was a 186MB 1080x1920 ProRes-ish .mov. A 1080-wide H.264 cut was still
 * 11.8MB, which is indefensible for a clip that renders in a column about 600px across —
 * so the wide cut is 720 and the narrow one 480. That is a deliberate departure from spec
 * §8's "720p below 768px, 1080p above": §8 was written for the full-bleed landscape hero,
 * and a portrait reel inside a column does not need the same pixels.
 *
 * MP4 only, no WebM, as §8 requires.
 */
export interface ArchiveReel {
  wide: string;
  narrow: string;
  poster: string;
  /** Intrinsic size of the wide cut, so the column reserves the right box. */
  width: number;
  height: number;
}

export const ARCHIVE_REELS: Readonly<Record<string, ArchiveReel>> = Object.freeze({
  // The N8N x Blibli out-of-home film at SCBD. Square, so it holds a column without the
  // height a 9:16 clip forces on the row.
  '01': {
    wide: '/video/n8n-ooh-900.mp4',
    narrow: '/video/n8n-ooh-560.mp4',
    poster: '/video/n8n-ooh-poster.jpg',
    width: 900,
    height: 900,
  },
});

/**
 * Studio reels that are not tied to one case study. The PURE LOVE MATTERS apparel film is
 * N8N's own product, so it would be wrong on another client's page — it belongs where the
 * studio shows its production work rather than a client's campaign.
 */
export const CREATIVE_LAB_REEL: ArchiveReel = {
  wide: '/video/n8n-720.mp4',
  narrow: '/video/n8n-480.mp4',
  poster: '/video/n8n-poster.jpg',
  width: 720,
  height: 1280,
};
