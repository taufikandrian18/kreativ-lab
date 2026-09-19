// Every static route renders without throwing and puts exactly one h1 on the page.
// Cheap, and it catches the breakage a per-route suite misses when a shared component
// changes underneath all six at once.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import About from '../app/about/page';
import ProductLab from '../app/product-lab/page';
import CreativeLab from '../app/creative-lab/page';
import ArchiveIndex from '../app/archive/page';
import Contact from '../app/contact/page';

const ROUTES = [
  ['/', <Home key="/" />],
  ['/about', <About key="/about" />],
  ['/product-lab', <ProductLab key="/product-lab" />],
  ['/creative-lab', <CreativeLab key="/creative-lab" />],
  ['/archive', <ArchiveIndex key="/archive" />],
  ['/contact', <Contact key="/contact" />],
] as const;

describe('every route (spec §4)', () => {
  for (const [name, node] of ROUTES) {
    it(`${name} renders with exactly one level-1 heading`, () => {
      render(node);
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });
  }

  it('every route lays out on the shared shell', () => {
    for (const [, node] of ROUTES) {
      const { container, unmount } = render(node);
      expect(container.querySelector('.section-shell')).not.toBeNull();
      unmount();
    }
  });
});
