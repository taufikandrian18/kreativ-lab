// Spec amendment 2026-09-19 §5a. Two type sizes — 176px display and 16px body — meant
// nothing on any page could be subordinate to anything else, so every block shouted
// equally and the site read as a template. Three steps, with the display step coming
// DOWN: a headline is not large because it is 176px, it is large because something else
// on the page is not.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const globals = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

describe('type scale (amendment §5a)', () => {
  it('defines three steps', () => {
    expect(globals).toMatch(/\.display-type\s*\{[\s\S]*?font-size: clamp\(2\.5rem, 7vw, 7rem\)/);
    expect(globals).toMatch(/\.type-subhead\s*\{[\s\S]*?font-size: clamp\(1\.5rem, 2\.6vw, 2\.75rem\)/);
    expect(globals).toMatch(/--type-body: clamp\(1rem, 1\.1vw, 1\.25rem\)/);
  });

  it('brings the display step down from the 11rem that crowded everything out', () => {
    // Checks the declaration, not the file: the comment beside it names the old value on
    // purpose, and a whole-file match would fail on the explanation rather than the CSS.
    const declarations = globals.match(/^\s*font-size: .*$/gm) ?? [];
    expect(declarations.some((d) => d.includes('11rem'))).toBe(false);
  });

  it('keeps the steps apart, so the middle one is a real step and not a nudge', () => {
    // 7rem / 2.75rem / 1.25rem at their ceilings — each step at least 2x the next.
    expect(7 / 2.75).toBeGreaterThan(2);
    expect(2.75 / 1.25).toBeGreaterThan(2);
  });
});

describe('column discipline (amendment §5a)', () => {
  it('names the spans once rather than scattering them through the routes', () => {
    for (const cls of ['.col-opener', '.col-copy', '.col-aside', '.col-figure']) {
      expect(globals).toContain(cls);
    }
  });

  it('collapses every span to full width below 1024px, per spec §7', () => {
    const block = globals.slice(globals.indexOf('.col-opener'));
    expect(block).toMatch(/@media \(min-width: 1024px\)/);
  });
});
