// Spec §5 grid: gutter 16px mobile, 32px from 768px, 48px from 1280px, max content
// width 1680px. Tailwind's default `sm:` and `lg:` fire at 640px and 1024px, so
// `px-4 sm:px-8 lg:px-12` steps 128px and 256px too early and caps nothing. One CSS
// rule owns the ladder instead, and every section uses it.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Hero } from './Hero';
import { Manifesto } from './Manifesto';
import { WhoWeAre } from './WhoWeAre';
import { TwoLabs } from './TwoLabs';
import { ArchiveTeaser } from './ArchiveTeaser';
import { ClientWall } from './ClientWall';
import { Closing } from './Closing';

const globals = readFileSync(join(__dirname, '../../app/globals.css'), 'utf-8');

const SECTIONS = [
  ['Manifesto', <Manifesto key="m" />],
  ['WhoWeAre', <WhoWeAre key="w" />],
  ['TwoLabs', <TwoLabs key="t" />],
  ['ArchiveTeaser', <ArchiveTeaser key="a" />],
  ['ClientWall', <ClientWall key="c" />],
  ['Closing', <Closing key="x" />],
] as const;

describe('section shell (spec §5)', () => {
  it('Hero takes the horizontal ladder only, by design', () => {
    // A full-bleed viewport section, not a stacked rhythm one — .section-shell's vertical
    // padding pushed its headline into the marquee. tests/rhythm.test.tsx owns that.
    const { container } = render(<Hero />);
    expect(container.querySelector('.shell-inline')).not.toBeNull();
    expect(container.querySelector('.section-shell')).toBeNull();
  });

  for (const [name, node] of SECTIONS) {
    it(`${name} lays its content out on the shared shell`, () => {
      const { container } = render(node);
      expect(container.querySelector('.section-shell')).not.toBeNull();
    });
  }

  it('steps the gutter at the spec breakpoints, not Tailwind defaults', () => {
    expect(globals).toMatch(/@media \(min-width: 768px\)[\s\S]{0,120}\.section-shell/);
    expect(globals).toMatch(/@media \(min-width: 1280px\)[\s\S]{0,120}\.section-shell/);
  });

  it('caps content at the spec max width', () => {
    expect(globals).toMatch(/\.section-shell[\s\S]{0,200}max-width: var\(--width-content-max\)/);
  });
});
