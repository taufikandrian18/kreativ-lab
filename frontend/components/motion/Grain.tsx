/**
 * A film-grain overlay.
 *
 * The house profile calls for an feTurbulence noise layer at low opacity over flat dark
 * sections — without it, a full-bleed black panel reads as an empty div rather than as
 * printed ink. Pure SVG, no image request, no JavaScript, and `pointer-events-none` so it
 * never intercepts a click.
 *
 * Not a grey: the turbulence is monochrome noise composited over the section, the same
 * way the deck's own halftone is image content rather than a CSS colour.
 */
export function Grain({ opacity = 0.22 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay"
      style={{ opacity }}
    >
      <filter id="k-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.88" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#k-grain)" />
    </svg>
  );
}
