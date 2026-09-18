import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Contact from './page';

describe('/contact', () => {
  it('renders a contact heading and no form', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /CONTACT/i })).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
