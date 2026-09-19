import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

const { revert, create } = vi.hoisted(() => ({
  revert: vi.fn(),
  create: vi.fn(() => ({ kill: vi.fn() })),
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    context: (fn: () => void) => {
      fn();
      return { revert };
    },
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('gsap/ScrollSmoother', () => ({ ScrollSmoother: { create } }));

import { MotionProvider } from './MotionProvider';

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

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

beforeEach(() => {
  create.mockClear();
  revert.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe('MotionProvider (spec §6, §7)', () => {
  it('creates the smoother on a desktop viewport with motion allowed', () => {
    setViewport(1440);
    setReducedMotion(false);
    render(<MotionProvider>content</MotionProvider>);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('creates no smoother below 1024px, so native momentum scrolling survives', () => {
    setViewport(390);
    setReducedMotion(false);
    render(<MotionProvider>content</MotionProvider>);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates no smoother under reduced motion, at any width', () => {
    setViewport(1920);
    setReducedMotion(true);
    render(<MotionProvider>content</MotionProvider>);
    expect(create).not.toHaveBeenCalled();
  });

  it('tears the smoother down when the window is resized below the breakpoint', () => {
    setViewport(1440);
    setReducedMotion(false);
    render(<MotionProvider>content</MotionProvider>);
    expect(create).toHaveBeenCalledTimes(1);

    act(() => {
      setViewport(900);
      window.dispatchEvent(new Event('resize'));
    });

    expect(revert).toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('reverts the route context on unmount', () => {
    setViewport(1440);
    setReducedMotion(false);
    const { unmount } = render(<MotionProvider>content</MotionProvider>);
    unmount();
    expect(revert).toHaveBeenCalled();
  });
});
