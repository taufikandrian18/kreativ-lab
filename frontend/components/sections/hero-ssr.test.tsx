// @vitest-environment node
//
// Runs in the `node` environment on purpose: the bug is that `window` is absent
// during the static prerender, and the jsdom default (which vitest.setup.ts stubs to
// report reduced motion) hides it completely.
//
// Regression gate for the server-rendered hero and marquee.
//
// prefersReducedMotion() reads window.matchMedia, which does not exist during the
// static prerender — so a render-time branch always emits the MOTION branch into the
// shipped HTML. Every visitor, including one who asked for reduced motion, then
// received <video autoplay> (fetched and played before any JS ran) and a marquee track
// already animating, and React hit an element-type hydration mismatch on the client.
// Spec §6 requires the video be swapped for the still and every marquee stopped.
//
// The server render is therefore pinned to the static, motion-free branch, and motion
// is switched on after mount only when the preference allows it.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Hero } from './Hero';
import { Marquee } from '@/components/motion/Marquee';
import { CapabilityList } from './CapabilityList';

const ssr = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('server-rendered hero (spec §6, §10)', () => {
  it('ships no autoplaying video in the prerendered HTML', () => {
    expect(ssr(<Hero />)).not.toContain('<video');
  });

  it('ships the poster as the static hero image, which spec §10 names the LCP element', () => {
    expect(ssr(<Hero />)).toContain('/video/hero-poster.webp');
  });

  it('preloads the poster at high priority', () => {
    const html = ssr(<Hero />);
    expect(html).toMatch(/rel="preload"[^>]*\/video\/hero-poster\.webp|\/video\/hero-poster\.webp[^>]*rel="preload"/);
    expect(html).toContain('fetchPriority="high"');
  });
});

describe('server-rendered marquee (spec §6)', () => {
  it('ships halted, so it cannot translate before hydration', () => {
    expect(ssr(<Marquee text="KREATE LIVE" />)).toContain('data-animated="false"');
  });
});

describe('server-rendered capability list (spec §6)', () => {
  // The jsdom test resolves the preference to 'reduced' and so never exercises
  // 'unknown' — the prerender path, and the exact path that shipped the motion branch
  // to every visitor in Stage 3. This is that path: the content must be in the HTML
  // before any JS runs, whatever the motion does afterwards.
  it('ships every capability as real text, so the list never depends on motion', () => {
    const html = ssr(
      <CapabilityList groups={[{ name: 'Print & Packaging', items: ['Premium Gift Sets'] }]} />
    );
    expect(html).toContain('Print &amp; Packaging');
    expect(html).toContain('Premium Gift Sets');
  });
});
