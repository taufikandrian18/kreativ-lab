// Review Focus #1 checks that an unknown slug reaches notFound(). What the visitor then
// sees was never checked: Next's built-in error page, which uses height:100vh and
// rgba(0,0,0,.3) — both forbidden by the Global Constraints — in a system font stack with
// a dark-mode flip no other page has. It is also serialized into every route's flight
// payload, so it renders on any client-side navigation to a missing page.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';
import { sitePage } from '@/lib/site-content';

describe('404 page (spec §4, §5)', () => {
  it('sets the studio type rather than a system stack', () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector('.display-type')).not.toBeNull();
  });

  it('offers a way back into the site', () => {
    render(<NotFound />);
    const page = sitePage('not_found', []);
    expect(screen.getByRole('link', { name: page.text('nf_home_link') })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: page.text('nf_archive_link') })).toHaveAttribute('href', '/archive');
  });

  it('uses no 100vh and no alpha-composited colour', () => {
    const { container } = render(<NotFound />);
    expect(container.innerHTML).not.toMatch(/100vh/);
    expect(container.innerHTML).not.toMatch(/k-(?:black|paper|red)\/\d/);
    expect(container.innerHTML).not.toMatch(/rgba\(/);
  });

  it('lays out on the shared shell', () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector('.section-shell')).not.toBeNull();
  });
});
