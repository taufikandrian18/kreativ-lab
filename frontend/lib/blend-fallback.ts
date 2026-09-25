// The hero headline inverts against the showreel with mix-blend-mode: difference —
// black over a white frame, white over black, cyan over the red type. iOS cannot do this:
// every iOS browser is WebKit, and WebKit plays inline video in its own hardware layer,
// which page content cannot blend with. On an iPhone the headline stayed plain white and
// vanished over the white frames (seen on a real phone, 2026-09-25).
//
// So on iOS the page does the difference itself: it reads the playing frame into a tiny
// canvas and sets each letter to the inverse of the colour behind it. These are the pure
// parts of that; components/motion/useSampledDifference.ts runs them.

/** Every iOS browser, including iPadOS, which reports itself as a Mac with touch. */
export function needsBlendFallback(ua: string, platform: string, maxTouchPoints: number): boolean {
  return /iP(hone|ad|od)/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where a point on screen lands in the video's own pixels, for a video drawn with
 * object-fit: cover inside `box` (its on-screen rectangle, transforms included).
 * Cover scales the frame up until it fills the box and crops the overflow equally from
 * both sides, so the mapping is one scale and one centred offset.
 */
export function coverPoint(
  x: number,
  y: number,
  box: Box,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number } {
  const scale = Math.max(box.width / videoWidth, box.height / videoHeight);
  const offsetX = (box.width - videoWidth * scale) / 2;
  const offsetY = (box.height - videoHeight * scale) / 2;
  return {
    x: (x - box.left - offsetX) / scale,
    y: (y - box.top - offsetY) / scale,
  };
}

/** mix-blend-mode: difference of white text over this colour. */
export function differenceOfWhite(r: number, g: number, b: number): string {
  const inv = (v: number) => Math.max(0, Math.min(255, Math.round(255 - v)));
  return `rgb(${inv(r)}, ${inv(g)}, ${inv(b)})`;
}
