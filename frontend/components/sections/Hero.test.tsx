import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

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

describe('Hero (spec §8)', () => {
  it('carries every attribute iOS Safari needs to autoplay inline', () => {
    setReducedMotion(false);
    const { container } = render(<Hero />);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.hasAttribute('muted') || video.muted).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.hasAttribute('autoplay')).toBe(true);
    expect(video.hasAttribute('loop')).toBe(true);
    expect(video.getAttribute('poster')).toBe('/video/hero-poster.webp');
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('serves 720p above 768px and 480p below', () => {
    setReducedMotion(false);
    const { container } = render(<Hero />);
    const sources = Array.from(container.querySelectorAll('source'));
    const wide = sources.find((s) => s.getAttribute('media')?.includes('768'));
    expect(wide?.getAttribute('src')).toBe('/video/hero-720.mp4');
    expect(sources.at(-1)?.getAttribute('src')).toBe('/video/hero-480.mp4');
  });

  it('swaps the video for the reduced-motion still', () => {
    setReducedMotion(true);
    const { container } = render(<Hero />);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/video/hero-still-reduced.webp');
  });

  it('renders the headline as real text', () => {
    setReducedMotion(false);
    render(<Hero />);
    expect(
      screen.getByRole('heading', { name: /CLEAN IN FORM\. SHARP IN FUNCTION\./i })
    ).toBeInTheDocument();
  });
});
