import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './page';

describe('/about (spec §4)', () => {
  it('leads with the WHO WE ARE headline', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: 'WHO WE ARE', level: 1 })).toBeInTheDocument();
  });

  it('renders the studio description transcribed from deck page 03, not invented copy', () => {
    render(<About />);
    expect(
      screen.getByText(/specializing in Product Development and Creative Production/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/We don't separate creativity from production/i)).toBeInTheDocument();
    expect(screen.queryByText(/Clean in form\. Sharp in function\./i)).not.toBeInTheDocument();
  });

  it('renders the four pillars', () => {
    render(<About />);
    for (const word of ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });

  it('renders deck page 03 as the route opener', () => {
    const { container } = render(<About />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/deck/page-03-1920.webp');
  });
});
