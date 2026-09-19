// Review Focus #5: motion a route registers must be gone once that route unmounts, or
// it accumulates across client-side navigations.
//
// jsdom has no layout, so ScrollTrigger itself never instantiates here — `getAll()`
// stays empty whether or not the code is correct, which makes it a useless assertion.
// The tweens the primitives create ARE real gsap state, and they are what the context
// owns: if `ctx.revert()` stops running, the count stays elevated after unmount. That
// is the leak this guards. The browser-level check of `ScrollTrigger.getAll()` across
// a real route change is still required and is named in the Stage 3 exit criteria.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import gsap from 'gsap';
import { MaskReveal } from './MaskReveal';
import { StaggerReveal } from './StaggerReveal';

function allowMotion() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('motion teardown (spec §6, §12)', () => {
  it('leaves no live tweens behind when the sections unmount', () => {
    allowMotion();
    const baseline = gsap.globalTimeline.getChildren().length;

    const { unmount } = render(
      <>
        <MaskReveal as="h2">WHO WE ARE</MaskReveal>
        <StaggerReveal>
          <p>THINK</p>
        </StaggerReveal>
      </>
    );

    expect(gsap.globalTimeline.getChildren().length).toBeGreaterThan(baseline);

    unmount();

    expect(gsap.globalTimeline.getChildren().length).toBe(baseline);
  });
});
