import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientWall } from './ClientWall';
import { getClientLogos } from '@/lib/contract';

describe('ClientWall', () => {
  it('renders deck page 24 as the logo wall', () => {
    render(<ClientWall />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/deck/page-24-1920.webp');
  });

  it('keeps every fixture logo name in the accessibility tree', () => {
    render(<ClientWall />);
    for (const logo of getClientLogos()) {
      expect(screen.getByText(logo.name)).toBeInTheDocument();
    }
  });

  it('renders the section heading', () => {
    render(<ClientWall />);
    expect(screen.getByRole('heading', { name: /OUR CLIENT/i })).toBeInTheDocument();
  });
});
