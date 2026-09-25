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
    // querySelectorAll, not getAllByRole('img'): these images carry alt="" because the
    // link already states the client and industry as visible text, and an empty alt
    // correctly removes the img role from the accessibility tree.
    const { container } = render(<ArchiveTeaser />);
    const images = Array.from(container.querySelectorAll('img'));
    // The photograph alone, cut from each study's deck opener page — not the whole page
    // with its SCOPE OF WORK list printed into it.
    expect(images[0]).toHaveAttribute('src', '/openers/01-1060.webp');
    expect(images[1]).toHaveAttribute('src', '/openers/02-1060.webp');
    expect(images[2]).toHaveAttribute('src', '/openers/03-1060.webp');
  });

  it('links each entry to its case study', () => {
    render(<ArchiveTeaser />);
    expect(screen.getByRole('link', { name: /Nathan Tjoe A On/i })).toHaveAttribute(
      'href',
      '/archive/n8n-collective'
    );
  });
});
