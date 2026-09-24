import gsap from 'gsap';

/**
 * The swapped letters' own entrance: each wide letter stretches out of a squeezed
 * sliver after its word has landed, so the swap is seen happening rather than simply
 * being there. scaleX only. Called from inside a caller's gsap.context, so it is torn
 * down with the rest of that caller's motion.
 */
export function stretchSwaps(scope: Element, vars: gsap.TweenVars = {}): void {
  const swaps = scope.querySelectorAll('[data-swap]');
  if (swaps.length === 0) return;
  gsap.fromTo(
    swaps,
    { scaleX: 0.25 },
    { scaleX: 1, duration: 1.1, ease: 'elastic.out(1, 0.5)', stagger: 0.12, ...vars }
  );
}
