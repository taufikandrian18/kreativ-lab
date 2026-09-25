import gsap from 'gsap';

/**
 * The swapped letters' own entrance: each wide letter lands with a squash after its word
 * has, so the swap is seen happening rather than simply being there. Scale only. Called from inside a caller's gsap.context, so it is torn
 * down with the rest of that caller's motion.
 */
export function stretchSwaps(scope: Element, vars: gsap.TweenVars = {}): void {
  const swaps = scope.querySelectorAll('[data-swap]');
  if (swaps.length === 0) return;
  // From slightly wide and squashed, never from a sliver: the letter's layout box is
  // full width the whole time, so starting at scaleX 0.25 left a hole in the word
  // ("EVE R YWHERE") for most of a second. Overshooting outward overlaps the
  // neighbours for a moment instead, which reads as the letter landing.
  gsap.fromTo(
    swaps,
    { scaleX: 1.35, scaleY: 0.7 },
    { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, 0.55)', stagger: 0.12, ...vars }
  );
}
