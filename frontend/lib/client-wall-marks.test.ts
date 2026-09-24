import { describe, it, expect } from 'vitest';
import { CLIENT_MARKS } from './client-marks';
import { clientWallMarks } from './client-wall-marks';
import { getClientLogos, type ClientLogo } from './contract';

const logo = (name: string, url: string | null = null): ClientLogo => ({
  name,
  logo: { url, alt: null, width: url ? 300 : null, height: url ? 150 : null },
  order: 1,
});

describe('clientWallMarks', () => {
  it('finds deck artwork for every client currently in WordPress', () => {
    const marks = clientWallMarks(getClientLogos());
    expect(marks).toHaveLength(getClientLogos().length);
    expect(marks.filter((m) => m.text)).toEqual([]);
  });

  it('prefers an uploaded logo, then the deck mark, then the name as type', () => {
    const [uploaded, deck, fresh] = clientWallMarks([
      logo('Deus', '/cms/abc-300.webp'),
      logo('BMW Motorrad'),
      logo('Brand New Client'),
    ]);
    expect(uploaded).toMatchObject({ name: 'Deus', file: '/cms/abc-300.webp', w: 300, h: 150 });
    expect(deck.file).toBe(CLIENT_MARKS.find((m) => m.name === 'BMW Motorrad')!.file);
    expect(fresh).toMatchObject({ name: 'Brand New Client', text: true });
  });

  it('drops a client the moment it is removed in WordPress', () => {
    expect(clientWallMarks([logo('Deus')]).map((m) => m.name)).toEqual(['Deus']);
  });

  it('falls back to the full deck wall only when there is no CMS content at all', () => {
    expect(clientWallMarks([])).toHaveLength(CLIENT_MARKS.length);
  });
});
