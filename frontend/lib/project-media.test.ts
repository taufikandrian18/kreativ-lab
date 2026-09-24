import { describe, it, expect } from 'vitest';
import type { ArchiveProject } from './contract';
import { projectGallery, projectOpener } from './project-media';

function project(overrides: Partial<ArchiveProject>): ArchiveProject {
  return {
    archive_no: '01',
    title: 'N8N Collective',
    client: 'Nathan Tjoe A On',
    industry: 'Clothing Brand',
    year_range: '2025',
    scope: [],
    lab: 'both',
    hero_image: { url: null, alt: null },
    gallery: [],
    accent_color: null,
    ...overrides,
  };
}

const upload = { url: '/cms/abc-1600.webp', alt: 'Hero', width: 1600, height: 900 };

describe('project imagery', () => {
  it('keeps the deck opener and gallery while the CMS entry has no images', () => {
    expect(projectOpener(project({}))).toEqual({ kind: 'deck', page: 8 });
    expect(projectGallery(project({})).length).toBeGreaterThan(5);
  });

  it('prefers images uploaded in WordPress over the deck', () => {
    const p = project({ hero_image: upload, gallery: [upload, { url: null, alt: null }] });
    expect(projectOpener(p)).toMatchObject({ kind: 'cms', image: { src: '/cms/abc-1600.webp' } });
    expect(projectGallery(p)).toEqual([
      { file: '/cms/abc-1600.webp', srcSet: undefined, w: 1600, h: 900, alt: 'Hero' },
    ]);
  });

  it('renders a study added in WordPress with no deck pages and no images yet', () => {
    const p = project({ archive_no: '07', title: 'New Client' });
    expect(projectOpener(p)).toBeNull();
    expect(projectGallery(p)).toEqual([]);
  });
});
