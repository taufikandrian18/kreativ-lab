import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Contact from './page';

describe('/contact (spec §4)', () => {
  it('is the email and the numbers and nothing else — no deck page, no picture', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg[viewBox="0 0 454 466"]')).toBeNull();
  });

  it('opens WhatsApp for each number', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: 'WhatsApp +62 813 1131 9739' })).toHaveAttribute(
      'href',
      'https://wa.me/6281311319739'
    );
    expect(screen.getByRole('link', { name: 'WhatsApp +62 812 7230 0977' })).toHaveAttribute(
      'href',
      'https://wa.me/6281272300977'
    );
  });

  it('makes both numbers dialable', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: '+62 813 1131 9739' })).toHaveAttribute(
      'href',
      'tel:+6281311319739'
    );
    expect(screen.getByRole('link', { name: '+62 812 7230 0977' })).toHaveAttribute(
      'href',
      'tel:+6281272300977'
    );
  });

  it('makes the email a mailto link', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: 'kreativestudiolab@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:kreativestudiolab@gmail.com'
    );
  });

  it('ships no contact form, per spec §4', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelectorAll('input')).toHaveLength(0);
  });

  it('drops the Stage 2 stub placeholder and its grey', () => {
    const { container } = render(<Contact />);
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
