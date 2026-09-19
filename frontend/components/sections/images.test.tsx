// Spec §10: "Every image below the fold is lazy", and the hero poster frame is the LCP
// element. React 19 emits a high-priority <link rel="preload" as="image"> for every
// eager <img> it renders, so a deck image without loading="lazy" does not merely load
// early — it queues ahead of the poster in the preload scanner.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Manifesto } from './Manifesto';
import { WhoWeAre } from './WhoWeAre';
import { TwoLabs } from './TwoLabs';
import { ArchiveTeaser } from './ArchiveTeaser';
import { ClientWall } from './ClientWall';

const BELOW_FOLD = [
  ['Manifesto', <Manifesto key="m" />],
  ['ArchiveTeaser', <ArchiveTeaser key="a" />],
] as const;

describe('below-the-fold imagery (spec §10)', () => {
  for (const [name, node] of BELOW_FOLD) {
    it(`${name} lazy-loads every deck image it renders`, () => {
      const { container } = render(node);
      const images = Array.from(container.querySelectorAll('img'));
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(img.getAttribute('decoding')).toBe('async');
      }
    });
  }

  it('WhoWeAre lazy-loads its four pillar photographs', () => {
    const { container } = render(<WhoWeAre />);
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(4);
    for (const img of images) expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('ClientWall paints its marks through CSS masks, so it has no <img> to lazy-load', () => {
    const { container } = render(<ClientWall />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelectorAll('[data-client-mark]').length).toBeGreaterThan(0);
  });

  it('TwoLabs draws circles rather than loading the composite raster', () => {
    const { container } = render(<TwoLabs />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
