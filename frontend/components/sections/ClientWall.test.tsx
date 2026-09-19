import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientWall } from './ClientWall';
import { getClientLogos } from '@/lib/contract';

describe('ClientWall (spec §6 logo grid)', () => {
  it('sets every client name as visible type, not as pixels inside a raster', () => {
    render(<ClientWall />);
    for (const logo of getClientLogos()) {
      expect(screen.getByText(logo.name)).toBeVisible();
    }
  });

  it('renders one cell per client', () => {
    render(<ClientWall />);
    expect(screen.getAllByTestId('client-cell')).toHaveLength(getClientLogos().length);
  });

  it('drops the composite deck raster, which the type grid replaces', () => {
    const { container } = render(<ClientWall />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('announces each name once, not twice', () => {
    // The raster version put all 24 names in its alt AND in a visually-hidden list, so a
    // screen reader read the wall twice. With the names as real text there is one copy.
    render(<ClientWall />);
    const { name } = getClientLogos()[0];
    expect(screen.getAllByText(name)).toHaveLength(1);
  });

  it('gives every cell the hover treatment', () => {
    render(<ClientWall />);
    for (const cell of screen.getAllByTestId('client-cell')) {
      expect(cell.className).toMatch(/hover:text-k-red/);
      expect(cell.className).toMatch(/hover:scale-/);
    }
  });

  it('renders the section heading', () => {
    render(<ClientWall />);
    expect(screen.getByRole('heading', { name: /OUR CLIENT/i })).toBeInTheDocument();
  });
});
