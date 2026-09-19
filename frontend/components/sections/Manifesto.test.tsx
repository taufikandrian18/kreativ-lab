import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifesto } from './Manifesto';

// Deck page 02 used to be dropped in whole: the studio statement was pixels — not
// selectable, not crawlable, not resizable — and the halftone panel came along at
// whatever size the page happened to be. The statement is live text now, transcribed
// verbatim, and the panel is its own cropped asset holding its own column.
describe('Manifesto', () => {
  it('sets the studio statement as live text rather than as image content', () => {
    const { container } = render(<Manifesto />);
    expect(screen.getByText(/More than creativity\. Ideas are everywhere\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/creativity doesn't end with making something beautiful/i)
    ).toBeInTheDocument();
    // The ladder splits each step's verb from its clause so the verb can carry the
    // display face, and the Every-block splits the repeated word from the noun that
    // changes — so both are matched on the line's own text, not on a single text node.
    const lines = Array.from(container.querySelectorAll('li')).map((li) =>
      li.textContent?.replace(/\s+/g, ' ').trim()
    );
    expect(lines).toContain('It grows through experimentation.');
    // "Every" and the noun are separate spans with a flex gap, so the DOM text has no
    // space between them — the gap is layout, not a character.
    expect(lines).toContain('Everydetail.');
  });

  it('leads and closes on the two verified display lines', () => {
    render(<Manifesto />);
    expect(
      screen.getByRole('heading', { name: 'KREATE LIVE STUDIO LAB' })
    ).toBeInTheDocument();
    // WordReveal splits a headline into one span per word so each can animate, so the
    // closing line is matched on the element's own text rather than a single text node.
    const { container } = render(<Manifesto />);
    const closing = Array.from(container.querySelectorAll('p')).map((p) => p.textContent);
    expect(closing).toContain('We Create Live.');
  });

  it('renders the halftone panel as its own asset, not the whole deck page', () => {
    const { container } = render(<Manifesto />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/panels/manifesto.webp');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('drifts the panel against the copy', () => {
    const { container } = render(<Manifesto />);
    expect(container.querySelector('[data-parallax]')).not.toBeNull();
  });
});
