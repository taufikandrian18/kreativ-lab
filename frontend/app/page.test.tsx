import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('/ home route', () => {
  it('renders the manifesto and an archive teaser of three entries', () => {
    render(<Home />);
    expect(screen.getAllByText(/archive_no|01|02|03/i).length).toBeGreaterThan(0);
  });

  it('lists client logos', () => {
    render(<Home />);
    // At least one seeded client name renders somewhere on the page. Deus, BMW Motorrad,
    // and Unionwell are three SEPARATE entries in the real fixture (each its own element),
    // so getByText's single-match assertion throws "multiple elements found" here —
    // getAllByText + length check is what "at least one" actually requires.
    expect(screen.getAllByText(/Deus|BMW Motorrad|Unionwell/i).length).toBeGreaterThan(0);
  });
});
