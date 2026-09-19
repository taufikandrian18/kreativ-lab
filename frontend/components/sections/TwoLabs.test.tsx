import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TwoLabs } from './TwoLabs';

describe('TwoLabs', () => {
  it('renders deck page 04', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/deck/page-04-1920.webp');
  });

  it('links to both lab routes', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('link', { name: /PRODUCT LAB/i })).toHaveAttribute('href', '/product-lab');
    expect(screen.getByRole('link', { name: /CREATIVE LAB/i })).toHaveAttribute('href', '/creative-lab');
  });

  it('renders the verified headline', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('heading', { name: /One Studio\. Two Labs\./i })).toBeInTheDocument();
  });
});
