import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('asset()', () => {
  it('leaves public paths untouched when no base path is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    const { asset } = await import('./asset');
    expect(asset('/video/hero-720.mp4')).toBe('/video/hero-720.mp4');
  });

  it('prefixes public paths with the base path used on the VPS', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/kreative-lab');
    const { asset } = await import('./asset');
    expect(asset('/logos/deus.png')).toBe('/kreative-lab/logos/deus.png');
  });
});
