// Parallax as a pure function of speed, so the one decision that matters — how far a
// thing drifts — is testable without a layout, a scroller, or a browser.
//
// Deliberately not ScrollSmoother's `data-speed`: that routes through the smoother's
// effects system, which only exists above 1024px and only if the smoother initialised.
// A scrubbed ScrollTrigger works at every width and whether or not the smoother is
// alive, which matters because the smoother's state has never been confirmed in a
// browser.

/** Maximum drift, in percent of the element's own height, in either direction. */
export const MAX_DRIFT = 12;

/** How far the drift travels per unit of distance from the page's own speed. */
const DRIFT_PER_UNIT = 20;

export interface ParallaxRange {
  from: number;
  to: number;
}

/**
 * The yPercent range an element travels across its own scroll pass.
 *
 * `speed` is relative to the page: 1 is the page itself and does not move, below 1 lags
 * behind it, above 1 runs ahead. The range is symmetric around zero so the element sits
 * at its laid-out position when it is centred in the viewport — otherwise every
 * parallaxed element would start visibly displaced from where the designer put it.
 */
export function parallaxRange(speed: number): ParallaxRange {
  const drift = Math.min(Math.abs(1 - speed) * DRIFT_PER_UNIT, MAX_DRIFT);
  const direction = speed < 1 ? 1 : -1;
  // `|| 0` normalises negative zero, which is not a value anyone wants to read in a
  // transform or compare against in a test.
  const to = drift * direction || 0;
  return { from: -to || 0, to };
}

/**
 * The speeds the routes use. Named rather than sprinkled as magic numbers, so the whole
 * site drifts by the same amounts and a change is one edit.
 */
export const PARALLAX_SPEEDS = {
  /** A full-bleed deck figure inside a section. */
  figure: 0.85,
  /** A stacked case-study gallery spread — shallower, because several are in view. */
  gallery: 0.92,
} as const;
