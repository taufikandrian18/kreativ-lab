import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveCaseStudy, { generateStaticParams } from './page';

// Next.js 16: `params` is a Promise and the page component is async — call it directly
// and render its resolved JSX, rather than passing it to <ArchiveCaseStudy> as a plain
// sync component, which would render nothing.
async function renderSlug(slug: string) {
  const jsx = await ArchiveCaseStudy({
    params: Promise.resolve({ slug }),
    searchParams: Promise.resolve({}),
  });
  return render(jsx);
}

describe('/archive/[slug] (spec §4, §6)', () => {
  it('prerenders exactly the six case studies', async () => {
    const params = await generateStaticParams();
    expect(params.map((p) => p.slug)).toEqual([
      'n8n-collective',
      'drx-wear',
      'howard-smith',
      'cargloss-helmet',
      'xl-smart-axiata',
      'kemenpora',
    ]);
  });

  it('opens on the photograph cut from its deck page and then shows the work itself', async () => {
    // The gallery used to be whole deck pages — screenshots of someone else's layout,
    // page margins and "LAB ARCHIVE 01" footer included. It is now the individual pieces
    // of work, cut out of those pages. The opener went the same way on 2026-09-25: the
    // deck page's title card (scope list, client, year) is live text on the page, and
    // the photograph is cut out on its own.
    const { container } = await renderSlug('n8n-collective');
    const srcs = Array.from(container.querySelectorAll('img')).map((img) => img.getAttribute('src'));
    expect(srcs.filter((src) => src?.startsWith('/deck/'))).toEqual([]);
    expect(srcs).toContain('/openers/01-1060.webp');

    const gallery = Array.from(container.querySelectorAll('img'))
      .map((img) => img.getAttribute('src'))
      .filter((src) => src?.startsWith('/gallery/'));
    expect(gallery.length).toBeGreaterThan(5);
    for (const src of gallery) expect(src).toMatch(/^\/gallery\/01-\d{2}\.webp$/);
  });

  it('gives every study a gallery cut from its own pages', async () => {
    for (const slug of ['drx-wear', 'howard-smith', 'kemenpora']) {
      const { container, unmount } = await renderSlug(slug);
      const gallery = Array.from(container.querySelectorAll('img')).filter((img) =>
        img.getAttribute('src')?.startsWith('/gallery/')
      );
      expect(gallery.length).toBeGreaterThan(0);
      for (const img of gallery) expect(img.getAttribute('loading')).toBe('lazy');
      unmount();
    }
  });

  it('renders the project metadata as live text', async () => {
    await renderSlug('drx-wear');
    expect(screen.getByRole('heading', { name: /DRX Wear/i, level: 1 })).toBeInTheDocument();
    // The number appears in the eyebrow and again on the sticker over the photograph.
    expect(screen.getAllByText('02').length).toBeGreaterThan(0);
    expect(screen.getByText(/Sport Brand Apparel/i)).toBeInTheDocument();
  });

  it('sets the scope printed on the deck opener as live text while WordPress has none', async () => {
    const { container } = await renderSlug('kemenpora');
    const items = Array.from(container.querySelectorAll('[data-scope-list] li')).map((li) => li.textContent);
    expect(items).toEqual(['Product R&D', 'Event Merchandise Production', 'Printing Production']);
    expect(screen.queryByText(/undefined|null/i)).not.toBeInTheDocument();
  });

  it('keeps the number sticker out of the accessibility tree', async () => {
    const { container } = await renderSlug('drx-wear');
    const sticker = container.querySelector('.k-sticker-spin')?.parentElement as HTMLElement;
    expect(sticker.getAttribute('aria-hidden')).toBe('true');
  });

  it('404s on a slug that is not a case study', async () => {
    // Asserting on the digest, not merely that something threw: Review Focus #1 is
    // "must render the 404, NOT throw on an undefined archive_no", and a bare
    // .rejects.toThrow() passes for both — deleting notFound() would leave it green
    // while the route crashed on ARCHIVE_OPENER_PAGE[undefined].
    await expect(renderSlug('not-a-real-project')).rejects.toMatchObject({
      digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404'),
    });
  });

  it('uses no alpha-composited grey, which spec §5 forbids', async () => {
    const { container } = await renderSlug('howard-smith');
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
