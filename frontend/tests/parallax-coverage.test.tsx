// "Parallax across the website" is a sitewide property: a single route that forgets the
// wrapper reads as the flat one. Asserted per route rather than per component, because
// the omission is always at the call site.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import Home from '../app/page';
import About from '../app/about/page';
import ProductLab from '../app/product-lab/page';
import CreativeLab from '../app/creative-lab/page';
import ArchiveIndex from '../app/archive/page';
import ArchiveCaseStudy from '../app/archive/[slug]/page';
import Contact from '../app/contact/page';

afterEach(() => vi.unstubAllGlobals());

const ROUTES = [
  ['/', <Home key="a" />],
  ['/about', <About key="b" />],
  ['/product-lab', <ProductLab key="c" />],
  ['/creative-lab', <CreativeLab key="d" />],
  ['/archive', <ArchiveIndex key="e" />],
  ['/contact', <Contact key="f" />],
] as const;

describe('parallax coverage (studio direction, 2026-09-19)', () => {
  for (const [name, node] of ROUTES) {
    it(`${name} drifts at least one element`, () => {
      const { container } = render(node);
      expect(container.querySelectorAll('[data-parallax]').length).toBeGreaterThan(0);
    });
  }

  it('a case study drifts its opener and every gallery spread', async () => {
    const jsx = await ArchiveCaseStudy({
      params: Promise.resolve({ slug: 'n8n-collective' }),
      searchParams: Promise.resolve({}),
    });
    const { container } = render(jsx);
    // one opener plus one Parallax per gallery tile (the tile paired with the reel sits
    // in the reel's row and is not wrapped, so it is one fewer than the tile count).
    expect(container.querySelectorAll('[data-parallax]').length).toBeGreaterThan(4);
  });

  it('every drift is off the page speed, or it is not a drift', () => {
    const { container } = render(<Home />);
    for (const el of Array.from(container.querySelectorAll('[data-parallax]'))) {
      expect(Number(el.getAttribute('data-parallax'))).not.toBe(1);
    }
  });
});
