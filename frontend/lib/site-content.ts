import schemaFile from '../data/site-pages.json';
import fixture from '../data/rest-contract.json';
import { asset } from '@/lib/asset';
import { cmsImage, type CmsImage } from '@/lib/cms-image';
import type { ContractFile, ContractImage } from '@/lib/contract';

/**
 * Every editable section's content: WordPress first, today's copy second.
 *
 * data/site-pages.json lists every field the studio can edit and the copy the site shows
 * when it is left empty. The same file builds the WordPress admin screens (the plugin
 * reads its canonical copy), so a field cannot exist in one place and not the other.
 * Values come from data/rest-contract.json, which is the committed fixture in dev and
 * live WordPress content in a deploy build (scripts/fetch-cms.mjs).
 *
 * Asking for a field that is not in the schema, or as the wrong type, throws. A typo in a
 * component then fails the build instead of silently rendering the fallback forever.
 */
export type PageKey =
  | 'global'
  | 'home'
  | 'about'
  | 'product_lab'
  | 'creative_lab'
  | 'archive'
  | 'contact'
  | 'not_found';

type FieldType = 'text' | 'textarea' | 'lines' | 'pairs' | 'groups' | 'image' | 'file' | 'message';

interface SchemaField {
  name: string;
  type: FieldType;
  default?: string;
}

export interface Pair {
  first: string;
  second: string;
}

export interface Group {
  name: string;
  items: string[];
}

interface CmsPage {
  key: string;
  fields: Record<string, unknown>;
}

// The three parsers are exact twins of KSL_Site_Pages::parse_* in the plugin, which
// shapes the same textareas for REST. Defaults are parsed here with the same rules, so a
// default and an edited value always arrive in the same shape.
export function parseLines(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '');
}

export function parsePairs(text: string): Pair[] {
  return parseLines(text).map((line) => {
    const at = line.indexOf('|');
    return at === -1
      ? { first: line, second: '' }
      : { first: line.slice(0, at).trim(), second: line.slice(at + 1).trim() };
  });
}

export function parseGroups(text: string): Group[] {
  const groups: Group[] = [];
  for (const line of parseLines(text)) {
    if (line.endsWith(':')) {
      groups.push({ name: line.slice(0, -1).trim(), items: [] });
      continue;
    }
    if (groups.length === 0) groups.push({ name: '', items: [] });
    groups[groups.length - 1].items.push(line);
  }
  return groups.filter((g) => g.items.length > 0);
}

/**
 * Headlines mark their red words with *stars*: "PRODUCT *LAB*". Returns the text with the
 * stars removed and the starred words, lowercased, for WordReveal's `accent`.
 */
export function accentWords(text: string): { text: string; accent: string[] } {
  const accent: string[] = [];
  const plain = text.replace(/\*([^*]+)\*/g, (_, inner: string) => {
    accent.push(...inner.split(/\s+/).filter(Boolean).map((w) => w.toLowerCase()));
    return inner;
  });
  return { text: plain, accent };
}

/** The same markup split into runs, for headlines that render their own spans. */
export function accentRuns(text: string): { text: string; accent: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/)
    .filter((part) => part !== '')
    .map((part) =>
      part.startsWith('*') && part.endsWith('*') && part.length > 2
        ? { text: part.slice(1, -1), accent: true }
        : { text: part, accent: false }
    );
}

export interface PageContent {
  text(name: string): string;
  lines(name: string): string[];
  pairs(name: string): Pair[];
  groups(name: string): Group[];
  /** null when nothing is uploaded — the caller falls back to its own artwork. */
  image(name: string): CmsImage | null;
  /** A resolved URL, or null when nothing is uploaded. */
  file(name: string): string | null;
}

const SCHEMA = new Map(
  (schemaFile.pages as { key: string; sections: { fields: SchemaField[] }[] }[]).map((page) => [
    page.key,
    new Map(page.sections.flatMap((s) => s.fields).map((f) => [f.name, f])),
  ])
);

const TEXT_TYPES: FieldType[] = ['text', 'textarea'];

export function sitePage(
  key: PageKey,
  source: readonly CmsPage[] = (fixture as { site_pages?: CmsPage[] }).site_pages ?? []
): PageContent {
  const fields = SCHEMA.get(key);
  if (!fields) throw new Error(`site-pages.json has no page "${key}"`);
  const values = source.find((p) => p.key === key)?.fields ?? {};

  function field(name: string, types: FieldType[]): SchemaField {
    const f = fields!.get(name);
    if (!f) throw new Error(`site-pages.json: page "${key}" has no field "${name}"`);
    if (!types.includes(f.type)) {
      throw new Error(`site-pages.json: ${key}.${name} is a ${f.type}, not ${types.join('/')}`);
    }
    return f;
  }

  function list<T>(name: string, type: FieldType, parse: (s: string) => T[]): T[] {
    const f = field(name, [type]);
    const value = values[name];
    return Array.isArray(value) && value.length > 0 ? (value as T[]) : parse(f.default ?? '');
  }

  return {
    text(name) {
      const f = field(name, TEXT_TYPES);
      const value = values[name];
      return typeof value === 'string' && value.trim() !== '' ? value.trim() : (f.default ?? '');
    },
    lines: (name) => list(name, 'lines', parseLines),
    pairs: (name) => list(name, 'pairs', parsePairs),
    groups: (name) => list(name, 'groups', parseGroups),
    image(name) {
      field(name, ['image']);
      return cmsImage(values[name] as ContractImage | undefined);
    },
    file(name) {
      field(name, ['file']);
      const url = (values[name] as ContractFile | undefined)?.url;
      if (!url) return null;
      return /^https?:\/\//.test(url) ? url : asset(url);
    },
  };
}
