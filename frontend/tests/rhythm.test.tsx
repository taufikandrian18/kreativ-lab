// Two layout bugs found by looking at the running site on 2026-09-19.
//
// 1. The hero clipped its own headline. The <section> was min-h-[100svh] AND its inner
//    box was min-h-[100svh] again, plus pb-20 — so the content was always taller than
//    the viewport by the padding, and "SHARP IN FUNCTION" ran off the bottom.
//
// 2. Sections collided. Every section padded itself with a flat py-24 (96px) while the
//    display type runs to 176px, so one screen held the end of the manifesto, all of
//    Who We Are, and the start of Two Labs. The rhythm has to scale with the type, so it
//    belongs in .section-shell once rather than in eighteen hand-written utilities.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Hero } from '../components/sections/Hero';

const globals = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, acc);
    else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) acc.push(path);
  }
  return acc;
}

describe('hero height (bug: clipped headline)', () => {
  it('claims the viewport height once, not twice', () => {
    const { container } = render(<Hero />);
    const full = container.querySelectorAll('[class*="min-h-[100svh]"]');
    expect(full).toHaveLength(1);
  });

  it('puts that claim on the section, so the inner box can only fill it', () => {
    const { container } = render(<Hero />);
    const section = container.querySelector('section') as HTMLElement;
    expect(section.className).toContain('min-h-[100svh]');
  });

  it('stays a positioning context for the media it lays over itself', () => {
    // The video and the reduced-motion still are `absolute inset-0`. Without `relative`
    // on the section they anchor to whatever ancestor is positioned instead, the hero
    // renders no background, and the following section shows through under the headline
    // — which is exactly what happened when this class was dropped while fixing the
    // height. Caught by eye, not by the height assertion above.
    const { container } = render(<Hero />);
    const section = container.querySelector('section') as HTMLElement;
    expect(section.className).toContain('relative');
    const media = container.querySelector('video, img') as HTMLElement;
    expect(media.className).toContain('absolute');
  });
});

describe('hero headline placement', () => {
  it('sits on the horizontal ladder without the section rhythm', () => {
    // The hero is a full-bleed viewport section, not one of the stacked rhythm
    // sections. Giving it .section-shell's 176px of vertical padding lifted the headline
    // off the bottom and straight into the KREATE LIVE marquee band at top-1/3 — the two
    // overlapped between 274px and 429px in a 784px viewport. It takes the gutter ladder
    // and sets its own bottom offset instead.
    const { container } = render(<Hero />);
    const box = container.querySelector('h1')?.parentElement as HTMLElement;
    expect(box.className).toContain('shell-inline');
    expect(box.className).not.toContain('section-shell');
    expect(box.className).toMatch(/\bpb-\d/);
  });
});

describe('section rhythm (bug: colliding sections)', () => {
  it('scales the vertical rhythm with the display type, in one place', () => {
    expect(globals).toMatch(/\.section-shell[\s\S]{0,300}padding-block: clamp\(/);
  });

  it('leaves no section hand-padding itself out of step with the rest', () => {
    const offenders: string[] = [];
    for (const path of [
      ...sourceFiles(join(__dirname, '../app')),
      ...sourceFiles(join(__dirname, '../components')),
    ]) {
      const source = readFileSync(path, 'utf-8');
      for (const line of source.split('\n')) {
        if (line.includes('section-shell') && /\bpy-\d/.test(line)) {
          offenders.push(`${path}: ${line.trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
