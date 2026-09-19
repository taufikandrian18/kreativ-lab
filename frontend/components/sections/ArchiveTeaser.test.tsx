import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchiveTeaser } from './ArchiveTeaser';

describe('ArchiveTeaser', () => {
  it('previews exactly three entries', () => {
    render(<ArchiveTeaser />);
    expect(screen.getAllByTestId('teaser-entry')).toHaveLength(3);
  });

  it('previews 01, 02 and 03 in ascending order', () => {
    render(<ArchiveTeaser />);
    const numbers = screen.getAllByTestId('teaser-no').map((el) => el.textContent);
    expect(numbers).toEqual(['01', '02', '03']);
  });

  it('pairs each entry with its verified opener page image', () => {
    render(<ArchiveTeaser />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', '/deck/page-08-1920.webp');
    expect(images[1]).toHaveAttribute('src', '/deck/page-12-1920.webp');
    expect(images[2]).toHaveAttribute('src', '/deck/page-15-1920.webp');
  });

  it('links each entry to its case study', () => {
    render(<ArchiveTeaser />);
    expect(screen.getByRole('link', { name: /Nathan Tjoe A On/i })).toHaveAttribute(
      'href',
      '/archive/n8n-collective'
    );
  });
});
