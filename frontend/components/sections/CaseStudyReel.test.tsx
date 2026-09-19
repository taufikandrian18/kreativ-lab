import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CaseStudyReel } from './CaseStudyReel';
import { ARCHIVE_REELS } from '@/lib/archive-reels';

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

const reel = ARCHIVE_REELS['01'];

describe('CaseStudyReel', () => {
  it('carries every attribute iOS Safari needs to autoplay inline', () => {
    setReducedMotion(false);
    const { container } = render(<CaseStudyReel reel={reel} client="Nathan Tjoe A On" />);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.hasAttribute('muted') || video.muted).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.hasAttribute('autoplay')).toBe(true);
    expect(video.hasAttribute('loop')).toBe(true);
    expect(video.getAttribute('poster')).toBe(reel.poster);
  });

  it('serves the lighter cut below 768px, per spec §8', () => {
    setReducedMotion(false);
    const { container } = render(<CaseStudyReel reel={reel} client="Nathan Tjoe A On" />);
    const sources = Array.from(container.querySelectorAll('source'));
    expect(sources.find((s) => s.getAttribute('media')?.includes('768'))?.getAttribute('src')).toBe(
      reel.wide
    );
    expect(sources.at(-1)?.getAttribute('src')).toBe(reel.narrow);
    for (const source of sources) expect(source.getAttribute('type')).toBe('video/mp4');
  });

  it('shows the poster instead of the video under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<CaseStudyReel reel={reel} client="Nathan Tjoe A On" />);
    expect(container.querySelector('video')).toBeNull();
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(reel.poster);
    expect(img.getAttribute('alt')).toMatch(/Nathan Tjoe A On/);
  });

  it('ships no video in the prerender, so a reduced-motion visitor never fetches it', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    expect(
      renderToStaticMarkup(<CaseStudyReel reel={reel} client="Nathan Tjoe A On" />)
    ).not.toContain('<video');
  });
});
