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
  ['TwoLabs', <TwoLabs key="t" />],
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

  it('WhoWeAre renders no imagery at all', () => {
    const { container } = render(<WhoWeAre />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('ClientWall renders no imagery either, now that the wall is set in type', () => {
    // It used to render deck page 24, the composite raster of every mark. The type grid
    // replaced it, so there is no image here to lazy-load.
    const { container } = render(<ClientWall />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
