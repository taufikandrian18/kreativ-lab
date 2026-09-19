import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Spec §5 requires both faces self-hosted with "No Google Fonts network request".
// That requirement has no runtime signal: a blocked or slow fetch to
// fonts.googleapis.com falls back to a system grotesque silently, with no build error
// and no console warning — which is exactly how Stage 2 shipped with its display
// identity destroyed. Asserting on source text is the cheapest honest regression gate.
const layout = readFileSync(join(__dirname, '../app/layout.tsx'), 'utf-8');
const globals = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

describe('fonts are self-hosted (spec §5)', () => {
  it('makes no Google Fonts network request', () => {
    expect(layout).not.toContain('next/font/google');
    expect(globals).not.toContain('fonts.googleapis.com');
    expect(globals).not.toContain('fonts.gstatic.com');
  });

  it('imports both faces from @fontsource', () => {
    expect(layout).toContain('@fontsource/anton/latin-400.css');
    expect(layout).toContain('@fontsource-variable/archivo/wght.css');
  });

  it('preloads both faces, which @fontsource CSS imports do not do on their own', () => {
    // Spec §5: "Both self-hosted as subset woff2, font-display: swap, preloaded."
    // Without the preload the woff2 is only discovered when the CSS that references it
    // has parsed, so `swap` shows a system grotesque on the display lockup first.
    expect(layout).toContain('rel="preload"');
    expect(layout).toContain('as="font"');
    expect(layout).toContain('anton-latin-400-normal.woff2');
    expect(layout).toContain('archivo-latin-wght-normal.woff2');
  });

  it('points the display and body tokens at the self-hosted family names', () => {
    expect(globals).toContain("--font-display: 'Anton'");
    expect(globals).toContain("--font-body: 'Archivo Variable'");
  });
});
