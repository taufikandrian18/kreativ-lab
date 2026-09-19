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

  it('renders the opener page and every gallery page for the study', async () => {
    const { container } = await renderSlug('n8n-collective');
    const sources = Array.from(container.querySelectorAll('img')).map((img) =>
      img.getAttribute('src')
    );
    expect(sources).toEqual([
      '/deck/page-08-1920.webp',
      '/deck/page-09-1920.webp',
      '/deck/page-10-1920.webp',
      '/deck/page-11-1920.webp',
    ]);
  });

  it('renders the project metadata as live text', async () => {
    await renderSlug('drx-wear');
    expect(screen.getByRole('heading', { name: /DRX Wear/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText(/Sport Brand Apparel/i)).toBeInTheDocument();
  });

  it('renders no scope list while the fixture carries none, and no empty container', async () => {
    const { container } = await renderSlug('kemenpora');
    expect(container.querySelector('[data-scope-list]')).toBeNull();
    expect(screen.queryByText(/undefined|null/i)).not.toBeInTheDocument();
  });

  it('404s on a slug that is not a case study', async () => {
    await expect(renderSlug('not-a-real-project')).rejects.toThrow();
  });

  it('uses no alpha-composited grey, which spec §5 forbids', async () => {
    const { container } = await renderSlug('howard-smith');
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
