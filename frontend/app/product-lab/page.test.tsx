import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductLab from './page';

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
    expect(screen.getByText(/Where Ideas Become Products\./i)).toBeInTheDocument();
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

  it('renders deck page 05 as the process imagery', () => {
    const { container } = render(<ProductLab />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/deck/page-05-1920.webp');
  });

  it('drops the Stage 2 stub placeholder line', () => {
    render(<ProductLab />);
    expect(screen.queryByText(/Capability list and process imagery/i)).not.toBeInTheDocument();
  });
});
