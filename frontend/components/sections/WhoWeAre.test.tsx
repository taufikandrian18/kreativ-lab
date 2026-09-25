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
    expect(screen.getByRole('heading', { name: 'HOW WE WORK' })).toBeInTheDocument();
  });
});

describe('WhoWeAre cards', () => {
  it('gives every card its own line of copy', async () => {
    const { sitePage } = await import('@/lib/site-content');
    const home = sitePage('home', []);
    render(<WhoWeAre />);
    for (const n of [1, 2, 3, 4]) {
      expect(screen.getByText(home.text(`pillar_${n}_line`))).toBeInTheDocument();
    }
  });
});
