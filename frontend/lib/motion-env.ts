// Spec §7: ScrollSmoother is disabled below 1024px so native scroll and momentum are
// preserved — mobile is the priority surface, not the fallback.
// Spec §6: prefers-reduced-motion disables ScrollSmoother entirely.
export const SMOOTHER_MIN_WIDTH = 1024;

export interface MotionEnv {
  width: number;
  reducedMotion: boolean;
}

export function shouldEnableSmoother({ width, reducedMotion }: MotionEnv): boolean {
  if (reducedMotion) return false;
  return width >= SMOOTHER_MIN_WIDTH;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
