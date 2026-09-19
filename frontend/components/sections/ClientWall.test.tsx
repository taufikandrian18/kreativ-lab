import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientWall } from './ClientWall';
import { getClientLogos } from '@/lib/contract';

// The wall went raster (Stage 3) -> type grid (Stage 4) -> real marks lifted out of deck
// page 24. What survives every version: each client is named exactly once for assistive
// technology, and the section says what it is. The mark-specific assertions live in
// tests/deck-assets.test.tsx alongside the extraction they depend on.
describe('ClientWall', () => {
  it('names every client in the fixture exactly once', () => {
    render(<ClientWall />);
    for (const logo of getClientLogos()) {
      expect(screen.getAllByLabelText(logo.name)).toHaveLength(1);
    }
  });

  it('renders the section heading', () => {
    render(<ClientWall />);
    expect(screen.getByRole('heading', { name: /OUR CLIENT/i })).toBeInTheDocument();
  });
});
