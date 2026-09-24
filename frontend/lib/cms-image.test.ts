import { describe, it, expect } from 'vitest';
import { cmsImage } from './cms-image';

describe('cmsImage', () => {
  it('returns null for an empty field, so callers can fall back to deck artwork', () => {
    expect(cmsImage({ url: null, alt: null })).toBeNull();
    expect(cmsImage(undefined)).toBeNull();
  });

  it('builds a srcset from the resized variants', () => {
    const img = cmsImage({
      url: '/cms/abc-1600.webp',
      alt: 'Campaign still',
      width: 1600,
      height: 1000,
      variants: [
        { url: '/cms/abc-480.webp', width: 480 },
        { url: '/cms/abc-1600.webp', width: 1600 },
      ],
    });
    expect(img).toEqual({
      src: '/cms/abc-1600.webp',
      srcSet: '/cms/abc-480.webp 480w, /cms/abc-1600.webp 1600w',
      width: 1600,
      height: 1000,
      alt: 'Campaign still',
    });
  });

  it('leaves a remote URL alone and guesses a size WordPress did not record', () => {
    const img = cmsImage({ url: 'https://cms.example/a.jpg', alt: '' });
    expect(img?.src).toBe('https://cms.example/a.jpg');
    expect(img?.srcSet).toBeUndefined();
    expect(img?.alt).toBeNull();
    expect(img?.width).toBeGreaterThan(0);
  });
});
