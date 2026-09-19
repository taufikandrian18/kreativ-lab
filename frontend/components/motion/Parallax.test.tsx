import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { Parallax } from './Parallax';

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
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

describe('Parallax', () => {
  it('renders its children untouched', () => {
    setReducedMotion(false);
    render(
      <Parallax speed={0.85}>
        <p>WHO WE ARE</p>
      </Parallax>
    );
    expect(screen.getByText('WHO WE ARE')).toBeInTheDocument();
  });

  it('marks itself with the speed it is running, for debugging in a live page', () => {
    setReducedMotion(false);
    const { container } = render(
      <Parallax speed={0.85}>
        <p>x</p>
      </Parallax>
    );
    expect(container.querySelector('[data-parallax]')?.getAttribute('data-parallax')).toBe(
      '0.85'
    );
  });

  it('creates no tween under reduced motion, so the content sits where it was laid out', () => {
    setReducedMotion(true);
    const baseline = gsap.globalTimeline.getChildren().length;
    render(
      <Parallax speed={0.85}>
        <p>x</p>
      </Parallax>
    );
    expect(gsap.globalTimeline.getChildren().length).toBe(baseline);
  });

  it('leaves no live tween behind when it unmounts', () => {
    setReducedMotion(false);
    const baseline = gsap.globalTimeline.getChildren().length;
    const { unmount } = render(
      <Parallax speed={0.85}>
        <p>x</p>
      </Parallax>
    );
    unmount();
    expect(gsap.globalTimeline.getChildren().length).toBe(baseline);
  });
});
