import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveIndex from './page';

describe('/archive (spec §4, §6)', () => {
  it('lists all six entries', () => {
    render(<ArchiveIndex />);
    expect(screen.getAllByTestId('archive-row')).toHaveLength(6);
  });

  it('numbers them 01 through 06 in ascending order', () => {
    render(<ArchiveIndex />);
    expect(screen.getAllByTestId('archive-no').map((el) => el.textContent)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
  });

  it('links every row to its case study', () => {
    render(<ArchiveIndex />);
    expect(screen.getByRole('link', { name: /Nathan Tjoe A On/i })).toHaveAttribute(
      'href',
      '/archive/n8n-collective'
    );
    expect(screen.getByRole('link', { name: /Kemenpora/i })).toHaveAttribute(
      'href',
      '/archive/kemenpora'
    );
  });

  it('opens with deck page 07', () => {
    const { container } = render(<ArchiveIndex />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/deck/page-07-1920.webp');
  });

  it('uses no alpha-composited grey, which spec §5 forbids', () => {
    const { container } = render(<ArchiveIndex />);
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
