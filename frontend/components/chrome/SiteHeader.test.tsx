import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('links to all five non-home routes plus the wordmark home link', () => {
    render(<SiteHeader />);
    for (const [name, href] of [
      ['About', '/about'],
      ['Product Lab', '/product-lab'],
      ['Creative Lab', '/creative-lab'],
      ['Archive', '/archive'],
      ['Contact', '/contact'],
    ] as const) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
    expect(screen.getByRole('link', { name: /K STUDIOLAB/i })).toHaveAttribute('href', '/');
  });

  it('exposes the nav as a landmark for assistive technology', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
