import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveCaseStudy, { generateStaticParams } from './page';

describe('/archive/[slug]', () => {
  it('generates static params for all six projects', async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(6);
  });

  it('renders the client name and scope list for a known slug', () => {
    render(<ArchiveCaseStudy params={{ slug: 'n8n-collective' }} />);
    expect(screen.getByText('Nathan Tjoe A On')).toBeInTheDocument();
  });

  it('calls notFound for an unknown slug', () => {
    expect(() => render(<ArchiveCaseStudy params={{ slug: 'not-a-real-project' }} />)).toThrow();
  });
});
