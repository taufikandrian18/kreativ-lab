import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductLab from './page';
import { sitePage } from '@/lib/site-content';

const ITEMS = [
  'Packaging Design & Production',
  'Premium Gift Sets',
  'Printing Production',
  'Publications',
  'Brand Merchandise',
  'Corporate Merchandise',
  'Event Merchandise',
  'Apparel Development',
  'Uniform Development',
  'Retail Display',
  'Exhibition Production',
  'Custom Product Development',
];

describe('/product-lab (spec §4)', () => {
  it('leads with the headline and the positioning line', () => {
    render(<ProductLab />);
    expect(screen.getByRole('heading', { name: /PRODUCT LAB/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(sitePage('product_lab', []).text('pl_subhead'))).toBeInTheDocument();
  });

  it('renders all four capability groups', () => {
    render(<ProductLab />);
    for (const group of [
      'Print & Packaging',
      'Brand Products',
      'Spatial Experience',
      'Custom Solutions',
    ]) {
      expect(screen.getByText(group)).toBeInTheDocument();
    }
  });

  it('renders every capability item, not just the group names', () => {
    render(<ProductLab />);
    for (const item of ITEMS) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it('opens with the process photography beside the title', () => {
    // Only the photographic half of deck page 05 — the other half carried the capability
    // list as pixels, and that list is live text on this page.
    const { container } = render(<ProductLab />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/panels/product-lab.webp');
    expect(img.getAttribute('alt')).toMatch(/process/i);
  });

  it('sets the capability groups side by side rather than down one column', () => {
    const { container } = render(<ProductLab />);
    expect(container.querySelector('[data-capability-list]')?.className).toMatch(/lg:grid-cols-4/);
  });

  it('drops the Stage 2 stub placeholder line', () => {
    render(<ProductLab />);
    expect(screen.queryByText(/Capability list and process imagery/i)).not.toBeInTheDocument();
  });
});
