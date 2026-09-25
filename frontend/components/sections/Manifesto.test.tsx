import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifesto } from './Manifesto';
import { accentRuns, sitePage } from '@/lib/site-content';

// Deck page 02 used to be dropped in whole: the studio statement was pixels — not
// selectable, not crawlable, not resizable. The statement is live text, edited in
// WordPress, so these read the expected copy from the schema defaults rather than
// pinning one draft's wording.
const home = sitePage('home', []);
const plain = (text: string) => accentRuns(text).map((r) => r.text).join('');
const lineText = (el: Element) => el.textContent?.replace(/\s+/g, ' ').trim();

describe('Manifesto', () => {
  it('sets the statement and body as live text rather than as image content', () => {
    const { container } = render(<Manifesto />);
    const statement = container.querySelector('[data-chip-statement]') as HTMLElement;
    expect(lineText(statement)).toBe(home.text('manifesto_opening'));
    for (const paragraph of home.lines('manifesto_body')) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    // The ladder splits each step's verb from its clause so the verb can carry the
    // display face, and the Every-block splits the repeated word from the noun that
    // changes — so both are matched on the line's own text, not on a single text node.
    const lines = Array.from(container.querySelectorAll('li')).map(lineText);
    const step = home.pairs('manifesto_steps')[1];
    expect(lines).toContain(`${step.first} ${step.second}`);
    // "Every" and the noun are separate spans with a flex gap, so the DOM text has no
    // space between them — the gap is layout, not a character.
    expect(lines).toContain(`${home.text('manifesto_every_label')}${home.lines('manifesto_every')[1]}.`);
  });

  it('opens on the two-line heading and closes on the display line', () => {
    const { container } = render(<Manifesto />);
    expect(
      screen.getByRole('heading', { name: plain(home.text('manifesto_heading')) })
    ).toBeInTheDocument();
    const closing = Array.from(container.querySelectorAll('p')).map((p) => p.textContent);
    expect(closing).toContain(plain(home.text('manifesto_closing')));
  });

  it('flies real work into the statement, hidden from assistive technology', () => {
    const { container } = render(<Manifesto />);
    const chips = Array.from(container.querySelectorAll('[data-chip]'));
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.getAttribute('aria-hidden')).toBe('true');
      expect(chip.querySelector('img')?.getAttribute('src')).toMatch(/^\/chips\//);
      expect(chip.querySelector('img')?.getAttribute('alt')).toBe('');
    }
  });

  it('renders the halftone panel as its own asset, not the whole deck page', () => {
    const { container } = render(<Manifesto />);
    const img = container.querySelector('[data-parallax] img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/panels/manifesto.webp');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('drifts the panel against the copy', () => {
    const { container } = render(<Manifesto />);
    expect(container.querySelector('[data-parallax]')).not.toBeNull();
  });
});
