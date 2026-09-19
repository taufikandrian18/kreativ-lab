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
  '01': {
    wide: '/video/n8n-720.mp4',
    narrow: '/video/n8n-480.mp4',
    poster: '/video/n8n-poster.jpg',
    width: 720,
    height: 1280,
  },
});
