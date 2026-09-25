import { describe, it, expect } from 'vitest';
import schema from '../data/site-pages.json';
import {
  accentRuns,
  accentWords,
  parseGroups,
  parseLines,
  parsePairs,
  sitePage,
} from './site-content';

// The same inputs as SitePagesTest.php feeds the plugin's parsers: a default and an
// edited value must arrive in the same shape.
describe('textarea parsers (twins of KSL_Site_Pages::parse_*)', () => {
  it('parses lines, pairs and groups exactly like the plugin', () => {
    expect(parseLines('  a \r\n\n b\n')).toEqual(['a', 'b']);
    expect(parsePairs('It begins | with understanding.\nAlone')).toEqual([
      { first: 'It begins', second: 'with understanding.' },
      { first: 'Alone', second: '' },
    ]);
    expect(parseGroups('Loose\nPrint & Packaging:\nGift Sets\nPublications\nEmpty group:')).toEqual([
      { name: '', items: ['Loose'] },
      { name: 'Print & Packaging', items: ['Gift Sets', 'Publications'] },
    ]);
  });
});

describe('headline accents', () => {
  it('strips the stars and reports the red words for WordReveal', () => {
    expect(accentWords("LET'S *CREATE* SOMETHING THAT *LIVES.*")).toEqual({
      text: "LET'S CREATE SOMETHING THAT LIVES.",
      accent: ['create', 'lives.'],
    });
  });

  it('splits into runs for headlines that render their own spans', () => {
    expect(accentRuns('PRODUCT *LAB*')).toEqual([
      { text: 'PRODUCT ', accent: false },
      { text: 'LAB', accent: true },
    ]);
    expect(accentRuns('NO STARS')).toEqual([{ text: 'NO STARS', accent: false }]);
  });
});

describe('sitePage', () => {
  const cms = [
    {
      key: 'home',
      fields: {
        hero_headline: '  EDITED IN WORDPRESS  ',
        hero_marquee: '',
        manifesto_every: ['one', 'two'],
        manifesto_steps: [],
        hero_poster: { url: '/cms/abc-1600.webp', alt: '', width: 1600, height: 900 },
        hero_video_wide: { url: '/cms/abc.mp4', mime: 'video/mp4' },
        hero_video_narrow: { url: null, mime: null },
      },
    },
  ];

  it('uses the WordPress value when there is one', () => {
    const home = sitePage('home', cms);
    expect(home.text('hero_headline')).toBe('EDITED IN WORDPRESS');
    expect(home.lines('manifesto_every')).toEqual(['one', 'two']);
    expect(home.image('hero_poster')?.src).toBe('/cms/abc-1600.webp');
    expect(home.file('hero_video_wide')).toBe('/cms/abc.mp4');
  });

  it('falls back to the current copy for anything left empty', () => {
    const home = sitePage('home', cms);
    expect(home.text('hero_marquee')).toBe('KREATE LIVE');
    expect(home.pairs('manifesto_steps')[0]).toEqual({ first: 'First, we listen', second: 'so we know what you actually need.' });
    expect(home.file('hero_video_narrow')).toBeNull();
    expect(home.image('manifesto_image')).toBeNull();
    expect(sitePage('about', []).lines('about_pillars')).toEqual(['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']);
  });

  it('throws on a field the schema does not have, or asked for as the wrong type', () => {
    expect(() => sitePage('home', cms).text('hero_headlin')).toThrow(/no field "hero_headlin"/);
    expect(() => sitePage('home', cms).lines('hero_headline')).toThrow(/is a text/);
  });

  it('gives every text field in the schema a non-empty default', () => {
    type Page = { key: string; sections: { fields: { name: string; type: string }[] }[] };
    for (const page of schema.pages as Page[]) {
      const content = sitePage(page.key as Parameters<typeof sitePage>[0], []);
      for (const field of page.sections.flatMap((s) => s.fields)) {
        if (field.type === 'text' || field.type === 'textarea') {
          expect(content.text(field.name), `${page.key}.${field.name}`).not.toBe('');
        }
      }
    }
  });
});
