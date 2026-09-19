import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TwoLabs } from './TwoLabs';

describe('TwoLabs', () => {
  it('draws the two labs as live circles instead of deck page 04', () => {
    // Page 04 bakes both circles into one raster, and two circles inside one image
    // cannot converge. Spec §6 wants them meeting on scrub, so they are elements now.
    const { container } = render(<TwoLabs />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('[data-lab-circle]')).toHaveLength(2);
  });

  it('links to both lab routes', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('link', { name: /PRODUCT LAB/i })).toHaveAttribute('href', '/product-lab');
    expect(screen.getByRole('link', { name: /CREATIVE LAB/i })).toHaveAttribute('href', '/creative-lab');
  });

  it('renders the verified headline', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('heading', { name: /One Studio\. Two Labs\./i })).toBeInTheDocument();
  });
});
