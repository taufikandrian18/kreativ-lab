import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DeckFigure } from './DeckFigure';

describe('DeckFigure', () => {
  it('renders the deck page responsively at all four widths', () => {
    const { container } = render(<DeckFigure page={5} alt="Product Lab capabilities" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/deck/page-05-1920.webp');
    expect(img.getAttribute('srcset')).toContain('/deck/page-05-420.webp 420w');
    expect(img.getAttribute('srcset')).toContain('/deck/page-05-1920.webp 1920w');
  });

  it('carries the intrinsic dimensions so nothing reflows on decode', () => {
    const { container } = render(<DeckFigure page={5} alt="Product Lab capabilities" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('width')).toBe('1920');
    expect(img.getAttribute('height')).toBe('1358');
  });

  it('lazy-loads by default, per spec §10', () => {
    const { container } = render(<DeckFigure page={5} alt="Product Lab capabilities" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('loads eagerly at high priority when it is the route opener', () => {
    const { container } = render(<DeckFigure page={3} alt="Who we are" priority />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });

  it('accepts an empty alt for an image whose content is already visible text', () => {
    const { container } = render(<DeckFigure page={9} alt="" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('');
  });

  it('throws on a page number outside the deck', () => {
    expect(() => render(<DeckFigure page={99} alt="nope" />)).toThrow(/1\.\.26/);
  });
});
