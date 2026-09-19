import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('renders the wordmark', () => {
    render(<SiteFooter />);
    expect(screen.getAllByText(/K STUDIOLAB/i).length).toBeGreaterThan(0);
  });

  it('omits contact rows entirely while the fixture fields are empty', () => {
    render(<SiteFooter />);
    expect(screen.queryByText(/undefined|null/i)).not.toBeInTheDocument();
  });
});
