import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifesto } from './Manifesto';

describe('Manifesto', () => {
  it('renders deck page 02 at all four widths', () => {
    render(<Manifesto />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/deck/page-02-1920.webp');
    expect(img.getAttribute('srcset')).toContain('/deck/page-02-420.webp 420w');
    expect(img.getAttribute('srcset')).toContain('/deck/page-02-1920.webp 1920w');
  });

  it('renders the verified statement line as live text, not only as image content', () => {
    render(<Manifesto />);
    expect(screen.getByRole('heading', { name: /WE CREATE LIVE\./i })).toBeInTheDocument();
  });

  it('gives the image descriptive alt text', () => {
    render(<Manifesto />);
    expect(screen.getByRole('img').getAttribute('alt')).toMatch(/more than creativity/i);
  });
});
