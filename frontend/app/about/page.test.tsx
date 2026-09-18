import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './page';

describe('/about', () => {
  it('renders the four-word capability stagger list', () => {
    render(<About />);
    for (const word of ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });
});
