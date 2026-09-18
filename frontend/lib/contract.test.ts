import { describe, it, expect } from 'vitest';
import { getArchiveProjects, getArchiveProject, getClientLogos, getSiteSetting } from './contract';

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

  it('loads exactly 24 client logos, ordered', () => {
    const logos = getClientLogos();
    expect(logos).toHaveLength(24);
    expect(logos[0].order).toBeLessThan(logos[1].order);
  });

  it('loads the single site setting', () => {
    const settings = getSiteSetting();
    expect(settings).toHaveProperty('email');
    expect(settings).toHaveProperty('phone_primary');
  });
});
