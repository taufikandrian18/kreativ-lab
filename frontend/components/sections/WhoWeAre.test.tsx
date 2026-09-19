import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhoWeAre } from './WhoWeAre';

describe('WhoWeAre', () => {
  it('renders the four pillars', () => {
    render(<WhoWeAre />);
    for (const word of ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });

  it('renders the section heading', () => {
    render(<WhoWeAre />);
    expect(screen.getByRole('heading', { name: 'WHO WE ARE' })).toBeInTheDocument();
  });
});
