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

  it('pads the archive and contact calls to action', () => {
    render(<ArchiveTeaser />);
    expect(screen.getByRole('link', { name: /View all six/i }).className).toMatch(/\bpy-\d/);
    render(<Closing />);
    expect(screen.getByRole('link', { name: /Start a project/i }).className).toMatch(/\bpy-\d/);
  });
});
