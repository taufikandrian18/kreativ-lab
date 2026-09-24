import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './page';
import { accentRuns, sitePage } from '@/lib/site-content';

// Copy is the studio's and is edited in WordPress, so these assert that the page renders
// its fields — read from the schema defaults — rather than pinning one draft's wording.
const about = sitePage('about', []);
const plain = (text: string) => accentRuns(text).map((r) => r.text).join('');

describe('/about (spec §4)', () => {
  it('leads with its headline', () => {
    render(<About />);
    expect(
      screen.getByRole('heading', { name: plain(about.text('about_heading')), level: 1 })
    ).toBeInTheDocument();
  });

  it('renders every paragraph of the studio description, and not the hero tagline', () => {
    render(<About />);
    for (const paragraph of about.lines('about_body')) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
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
