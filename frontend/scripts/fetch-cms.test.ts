// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { collectMedia, main, slugify as scriptSlugify, validateContent } from './fetch-cms.mjs';
import { slugify } from '@/lib/slugify';

function project(overrides: Record<string, unknown> = {}) {
  return {
    archive_no: '07',
    title: 'New Client',
    client: 'New Client Co',
    industry: 'Retail',
    year_range: '2026',
    scope: ['Creative Direction'],
    lab: 'creative',
    hero_image: { url: null, alt: null, width: null, height: null },
    gallery: [],
    accent_color: null,
    ...overrides,
  };
}

function content(projects: unknown[]) {
  return { archive_projects: projects, client_logos: [{ name: 'Deus', logo: {}, order: 1 }], site_settings: [] };
}

describe('fetch-cms validation', () => {
  it('slugifies exactly like lib/slugify.ts, which decides the routes', () => {
    for (const title of ['N8N Collective', 'XL Smart / Axiata', '  Jägermeister 2026 ', '---']) {
      expect(scriptSlugify(title)).toBe(slugify(title));
    }
  });

  it('accepts well-formed content', () => {
    expect(() => validateContent(content([project()]))).not.toThrow();
  });

  it('refuses to deploy an empty archive', () => {
    expect(() => validateContent(content([]))).toThrow(/empty archive/);
  });

  it('refuses a reel without a poster, which is what reduced-motion visitors see', () => {
    const reel = {
      wide: { url: 'https://cms.example/r.mp4', mime: 'video/mp4' },
      narrow: { url: null, mime: null },
      poster: { url: null, alt: null },
    };
    expect(() => validateContent(content([project({ reel })]))).toThrow(/reel poster/);
  });

  it('reports every problem at once, including two titles on one URL', () => {
    const bad = content([
      project({ title: 'Same Name' }),
      project({ title: 'Same  name!', archive_no: '07', client: '', lab: 'other' }),
    ]);
    let message = '';
    try {
      validateContent(bad);
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toMatch(/share the URL \/archive\/same-name\//);
    expect(message).toMatch(/archive number 07 is used by both/);
    expect(message).toMatch(/client is empty/);
    expect(message).toMatch(/lab must be one of/);
  });

  it('collects every upload that has a URL, images and files alike, however deep', () => {
    const img = { url: 'https://cms.example/a.jpg', alt: null };
    const c = content([project({ hero_image: img, gallery: [img, { url: null, alt: null }] })]);
    const withPages = {
      ...c,
      site_pages: [
        {
          key: 'home',
          fields: {
            hero_headline: 'X',
            hero_poster: { url: 'https://cms.example/p.jpg', alt: '', width: 1, height: 1 },
            hero_video_wide: { url: 'https://cms.example/v.mp4', mime: 'video/mp4' },
            hero_video_narrow: { url: null, mime: null },
          },
        },
      ],
    };
    expect(collectMedia(c)).toHaveLength(2);
    expect(collectMedia(withPages)).toHaveLength(4);
  });
});

describe('fetch-cms against a WordPress stand-in', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fetch-cms-'));
  const dataFile = join(dir, 'rest-contract.json');
  const mediaDir = join(dir, 'cms');
  const run = () => main({ outFile: dataFile, mediaDir });
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const photo = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: '#d7261e' },
    })
      .jpeg()
      .toBuffer();

    server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://x');
      if (url.pathname === '/uploads/hero.jpg') {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(photo);
        return;
      }
      if (url.pathname === '/uploads/reel.mp4') {
        res.writeHead(200, { 'Content-Type': 'video/mp4' }).end(Buffer.from('not really a video'));
        return;
      }
      if (url.pathname !== '/') {
        res.writeHead(404).end();
        return;
      }
      const route = url.searchParams.get('rest_route');
      const page = Number(url.searchParams.get('page'));
      const send = (items: unknown[], totalPages = 1) =>
        res
          .writeHead(200, { 'Content-Type': 'application/json', 'X-WP-TotalPages': String(totalPages) })
          .end(JSON.stringify(items));

      if (route === '/wp/v2/archive-projects') {
        // Two pages, to prove pagination is followed.
        const hero = { url: `${base}/uploads/hero.jpg`, alt: 'Hero', width: 1200, height: 800 };
        send(
          page === 1
            ? [{ id: 1, ksl_project: project({ hero_image: hero }) }]
            : [{ id: 2, ksl_project: project({ archive_no: '08', title: 'Another' }) }],
          2
        );
      } else if (route === '/wp/v2/client-logos') {
        send([{ id: 3, ksl_logo: { name: 'Deus', logo: { url: null, alt: null }, order: 1 } }]);
      } else if (route === '/wp/v2/site-pages') {
        send([
          {
            id: 5,
            ksl_page: {
              key: 'home',
              fields: {
                hero_headline: 'FROM THE CMS',
                hero_video_wide: { url: `${base}/uploads/reel.mp4`, mime: 'video/mp4' },
              },
            },
          },
        ]);
      } else if (route === '/wp/v2/site-settings') {
        send([{ id: 4, ksl_site_setting: { email: 'hi@studio.example' } }]);
      } else {
        res.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    rmSync(dir, { recursive: true, force: true });
    await new Promise((resolve) => server.close(resolve));
    delete process.env.KSL_CMS_URL;
  });

  it('writes the contract and localises and resizes every image', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    process.env.KSL_CMS_URL = `${base}/`;
    await run();

    const written = JSON.parse(readFileSync(dataFile, 'utf-8'));
    expect(written.archive_projects.map((p: { archive_no: string }) => p.archive_no)).toEqual([
      '07',
      '08',
    ]);
    expect(written.site_settings[0].email).toBe('hi@studio.example');

    const hero = written.archive_projects[0].hero_image;
    expect(hero.url).toMatch(/^\/cms\/[0-9a-f]{12}-1200\.webp$/);
    expect(hero.variants.map((v: { width: number }) => v.width)).toEqual([480, 960, 1200]);
    expect([hero.width, hero.height]).toEqual([1200, 800]);
    for (const v of hero.variants) {
      expect(existsSync(join(mediaDir, v.url.replace('/cms/', '')))).toBe(true);
    }
  });

  it('carries the Site Pages through and copies videos byte for byte', async () => {
    process.env.KSL_CMS_URL = base;
    await run();
    const written = JSON.parse(readFileSync(dataFile, 'utf-8'));
    const home = written.site_pages[0].fields;
    expect(home.hero_headline).toBe('FROM THE CMS');
    expect(home.hero_video_wide.url).toMatch(/^\/cms\/[0-9a-f]{12}\.mp4$/);
    expect(readFileSync(join(mediaDir, home.hero_video_wide.url.replace('/cms/', '')), 'utf-8')).toBe(
      'not really a video'
    );
  });

  it('fails instead of writing anything when the plugin is not answering', async () => {
    process.env.KSL_CMS_URL = `${base}/missing`;
    const before = readFileSync(dataFile, 'utf-8');
    await expect(run()).rejects.toThrow(/HTTP 404/);
    expect(readFileSync(dataFile, 'utf-8')).toBe(before);
  });
});
