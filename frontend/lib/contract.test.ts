import { describe, it, expect } from 'vitest';
import {
  getArchiveProjects,
  getArchiveProject,
  getClientLogos,
  getHomepageProjects,
  getSiteSetting,
  pickHomepageProjects,
  type ArchiveProject,
} from './contract';

describe('contract data loader', () => {
  it('loads exactly six archive projects', () => {
    expect(getArchiveProjects()).toHaveLength(6);
  });

  it('finds a project by slugified title', () => {
    const project = getArchiveProject('n8n-collective');
    expect(project?.client).toBe('Nathan Tjoe A On');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getArchiveProject('does-not-exist')).toBeUndefined();
  });

  it('loads exactly 25 client logos, ordered', () => {
    // 25 with Nippon Paint, which is on the deck's client page and was added to the seed.
    const logos = getClientLogos();
    expect(logos).toHaveLength(25);
    expect(logos[0].order).toBeLessThan(logos[1].order);
  });

  it('loads the single site setting', () => {
    const settings = getSiteSetting();
    expect(settings).toHaveProperty('email');
    expect(settings).toHaveProperty('phone_primary');
  });
});

describe('homepage preview selection', () => {
  const p = (archive_no: string, featured = false) =>
    ({ archive_no, featured }) as unknown as ArchiveProject;

  it('shows the ticked case studies first, in archive order', () => {
    const picked = pickHomepageProjects([p('01'), p('02', true), p('03'), p('04', true), p('05', true), p('06', true)]);
    expect(picked.map((x) => x.archive_no)).toEqual(['02', '04', '05']);
  });

  it('fills the remaining places with the newest', () => {
    const picked = pickHomepageProjects([p('01', true), p('02'), p('03'), p('04'), p('05'), p('06'), p('07')]);
    expect(picked.map((x) => x.archive_no)).toEqual(['01', '07', '06']);
  });

  it('matches what the homepage has always shown for the seeded content', () => {
    expect(getHomepageProjects().map((x) => x.archive_no)).toEqual(['01', '02', '03']);
  });
});
