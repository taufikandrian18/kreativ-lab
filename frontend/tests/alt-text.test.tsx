// Spec §11: "Every image carries meaningful alt text drawn from its project's client and
// scope." The case-study galleries shipped with alt="" on the reasoning that the opener
// already described them — but the opener's alt is a generic template string, and the
// gallery section contains no heading, caption or text of any kind. A screen reader
// reached the metadata line and then the page ended, on the six routes spec §1's success
// path runs through.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ArchiveCaseStudy from '../app/archive/[slug]/page';
import About from '../app/about/page';

async function renderSlug(slug: string) {
  const jsx = await ArchiveCaseStudy({
    params: Promise.resolve({ slug }),
    searchParams: Promise.resolve({}),
  });
  return render(jsx);
}

const SLUGS = [
  'n8n-collective',
  'drx-wear',
  'howard-smith',
  'cargloss-helmet',
  'xl-smart-axiata',
  'kemenpora',
];

describe('alt text on the case-study galleries (spec §11)', () => {
  for (const slug of SLUGS) {
    it(`${slug} describes every gallery spread`, async () => {
      const { container, unmount } = await renderSlug(slug);
      const images = Array.from(container.querySelectorAll('img'));
      expect(images.length).toBeGreaterThan(1);
      for (const img of images) {
        expect(img.getAttribute('alt')).not.toBe('');
      }
      unmount();
    });
  }

  it('names the client on every gallery tile', async () => {
    // The gallery is individual pieces of work now, not whole deck spreads, and there is
    // nothing true and distinct to say about each crop without a caption from the studio.
    // Every tile at least says whose campaign it is; distinct per-tile description is a
    // content-layer task, recorded rather than invented here.
    const { container } = await renderSlug('n8n-collective');
    const alts = Array.from(container.querySelectorAll('img[src^="/gallery/"]')).map((img) =>
      img.getAttribute('alt')
    );
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) expect(alt).toMatch(/Nathan Tjoe A On/);
  });

  it('describes the photographic cards on /about, which are artwork and not text', () => {
    const { container } = render(<About />);
    expect(container.querySelector('img')?.getAttribute('alt')).not.toBe('');
  });
});
