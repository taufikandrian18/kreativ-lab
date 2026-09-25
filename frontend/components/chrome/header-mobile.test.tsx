// Spec §7: "Mobile is the priority surface, not the fallback." Five uppercase links in
// a non-wrapping flex row plus the wordmark overflow a 375px viewport; because the
// header is `fixed`, the overflow clips silently rather than producing a scrollbar, so
// Archive and Contact become unreachable on a phone with no visible symptom.
// §7 also sets a 44px minimum tap target.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { ArchiveTeaser } from '@/components/sections/ArchiveTeaser';
import { Closing } from '@/components/sections/Closing';
import { sitePage } from '@/lib/site-content';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('SiteHeader on a phone (spec §7)', () => {
  it('lets the nav wrap instead of clipping links off the right edge', () => {
    const { container } = render(<SiteHeader />);
    const list = container.querySelector('nav ul') as HTMLElement;
    expect(list.className).toContain('flex-wrap');
  });

  it('gives every nav link a tap target taller than its 12px text', () => {
    render(<SiteHeader />);
    for (const name of ['About', 'Product Lab', 'Creative Lab', 'Archive', 'Contact']) {
      expect(screen.getByRole('link', { name }).className).toMatch(/\bpy-\d/);
    }
  });
});

describe('tap targets elsewhere in the chrome and the calls to action (spec §7)', () => {
  it('pads every footer nav link', () => {
    const { container } = render(<SiteFooter />);
    const links = Array.from(container.querySelectorAll('nav a'));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.className).toMatch(/\bpy-\d/);
    }
  });

  it('sizes the archive and contact calls to action as full tap targets', () => {
    // Both are now shapes whose size lives in globals.css — a signpost plate and a pill —
    // so the class is asserted here and the 44px floor on the rule it names.
    const home = sitePage('home', []);
    render(<ArchiveTeaser />);
    expect(screen.getByRole('link', { name: home.text('teaser_link') }).className).toContain('k-signpost');
    render(<Closing />);
    expect(screen.getByRole('link', { name: home.text('closing_link') }).className).toContain('k-pill');
    const globals = readFileSync(join(__dirname, '../../app/globals.css'), 'utf-8');
    expect(globals).toMatch(/\.k-pill \{[^}]*min-height: 44px/);
    expect(globals).toMatch(/\.k-signpost-face \{[^}]*padding: 1\.1rem/);
  });
});
