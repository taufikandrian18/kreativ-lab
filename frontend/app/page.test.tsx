import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

afterEach(() => vi.unstubAllGlobals());

describe('/ (spec §4 section order)', () => {
  it('renders all seven sections', () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll('section')).toHaveLength(7);
  });

  it('leads with the hero headline', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /CLEAN IN FORM\. SHARP IN FUNCTION\./i, level: 1 })
    ).toBeInTheDocument();
  });

  it('previews three archive entries and links to the full index', () => {
    render(<Home />);
    expect(screen.getAllByTestId('teaser-entry')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /View the full archive/i })).toHaveAttribute('href', '/archive');
  });

  it('closes with the call to action', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Start a project/i })).toHaveAttribute('href', '/contact');
  });
});
