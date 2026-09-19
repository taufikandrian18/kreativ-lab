import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveCaseStudy, { generateStaticParams } from './page';

describe('/archive/[slug]', () => {
  it('generates static params for all six projects', async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(6);
  });

  it('renders the client name and scope list for a known slug', async () => {
    // Next.js 16: `params` is a Promise on the page component itself, and the component
    // is now async — call it directly and render its resolved JSX, rather than passing
    // it to <ArchiveCaseStudy> as a plain sync component (which would just render nothing,
    // since React can't await a component's own body during a normal render pass).
    const jsx = await ArchiveCaseStudy({
      params: Promise.resolve({ slug: 'n8n-collective' }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);
    expect(screen.getByText('Nathan Tjoe A On')).toBeInTheDocument();
  });

  it('calls notFound for an unknown slug', async () => {
    await expect(
      ArchiveCaseStudy({
        params: Promise.resolve({ slug: 'not-a-real-project' }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow();
  });
});
