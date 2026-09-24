// Pull the live content out of WordPress and into the build.
//
//   KSL_CMS_URL=https://website.example/kreative-lab-cms npm run fetch-cms
//
// The site is a static export, so WordPress is read once, here, at build time: the three
// collections are fetched over REST, every image they reference is downloaded and resized
// into public/cms/, and the result overwrites data/rest-contract.json — the same file, in
// the same shape, that the committed fixture provides when no CMS is configured. Nothing
// downstream knows which of the two it is reading.
//
// Any failure exits non-zero and stops the deploy. That is deliberate: a build that went
// ahead on half-fetched content would publish a site with case studies missing, and the
// live site is better left as it was than replaced with that.
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = join(ROOT, 'data/rest-contract.json');
const MEDIA_DIR = join(ROOT, 'public/cms');
const MEDIA_URL = '/cms';

// Widths generated for each photograph. A width the original cannot reach is skipped,
// never upscaled; the original's own width is always the largest variant.
export const IMAGE_WIDTHS = [480, 960, 1600];
const LABS = ['product', 'creative', 'both'];

// Must stay identical to lib/slugify.ts — the route for a case study is its slug, and a
// mismatch here would let two titles collide on one URL without this script noticing.
// fetch-cms.test.ts asserts the two agree.
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Throws with every problem at once, so one failed deploy shows the editor everything. */
export function validateContent(content) {
  const problems = [];
  const projects = content.archive_projects;

  if (projects.length === 0) {
    problems.push('no published archive projects — refusing to deploy an empty archive');
  }

  const seenNo = new Map();
  const seenSlug = new Map();
  for (const p of projects) {
    const label = `archive project "${p.title || '(untitled)'}"`;
    if (!p.title?.trim()) problems.push(`${label}: title is empty`);
    if (!p.archive_no?.trim()) problems.push(`${label}: archive number is empty`);
    if (!p.client?.trim()) problems.push(`${label}: client is empty`);
    if (!LABS.includes(p.lab)) problems.push(`${label}: lab must be one of ${LABS.join(', ')}`);

    if (p.archive_no) {
      if (seenNo.has(p.archive_no)) {
        problems.push(`archive number ${p.archive_no} is used by both "${seenNo.get(p.archive_no)}" and "${p.title}"`);
      }
      seenNo.set(p.archive_no, p.title);
    }

    const slug = slugify(p.title ?? '');
    if (p.title && !slug) problems.push(`${label}: title has no letters or digits to build a URL from`);
    if (slug) {
      if (seenSlug.has(slug)) {
        problems.push(`"${seenSlug.get(slug)}" and "${p.title}" would share the URL /archive/${slug}/`);
      }
      seenSlug.set(slug, p.title);
    }
  }

  for (const logo of content.client_logos) {
    if (!logo.name?.trim()) problems.push('a client logo has an empty name');
  }

  if (problems.length > 0) {
    throw new Error(`CMS content failed validation:\n  - ${problems.join('\n  - ')}`);
  }
}

/** Every image object in the content, so they can be downloaded and rewritten in place. */
export function collectImages(content) {
  const images = [];
  for (const p of content.archive_projects) {
    images.push(p.hero_image, ...p.gallery);
  }
  for (const l of content.client_logos) images.push(l.logo);
  for (const s of content.site_settings) images.push(s.og_image);
  return images.filter((img) => img && img.url);
}

async function fetchCollection(baseUrl, restBase, field) {
  const items = [];
  for (let page = 1; ; page++) {
    // ?rest_route= rather than /wp-json/: it works whatever the permalink settings are.
    // See scripts/fetch-contract-fixture.sh for the history.
    const url = `${baseUrl}/?rest_route=/wp/v2/${restBase}&per_page=100&page=${page}&_fields=id,${field}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);

    const body = await res.json();
    if (!Array.isArray(body)) throw new Error(`GET ${url} did not return a list`);
    for (const item of body) {
      if (!item[field]) {
        throw new Error(
          `GET ${url}: item ${item.id} has no "${field}" — is the Kreative Studio Lab plugin active?`
        );
      }
      items.push(item[field]);
    }

    const totalPages = Number(res.headers.get('x-wp-totalpages') ?? 1);
    if (page >= totalPages) return items;
  }
}

async function localiseImage(img, sharp, mediaDir) {
  const res = await fetch(img.url);
  if (!res.ok) throw new Error(`image ${img.url} → HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const id = createHash('sha1').update(img.url).digest('hex').slice(0, 12);

  // Vector logos are copied as they are: resizing an SVG would only rasterise it.
  const isSvg =
    res.headers.get('content-type')?.includes('svg') || /\.svg(\?|$)/i.test(img.url);
  if (isSvg) {
    const file = `${id}.svg`;
    await writeFile(join(mediaDir, file), bytes);
    img.url = `${MEDIA_URL}/${file}`;
    img.variants = [];
    return;
  }

  const source = sharp(bytes, { failOn: 'error' }).rotate();
  const meta = await source.metadata();
  // .rotate() applies EXIF orientation, so a portrait phone photo reports swapped axes.
  const swap = meta.orientation && meta.orientation >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;

  const widths = [...IMAGE_WIDTHS.filter((w) => w < width), width];
  img.variants = [];
  for (const w of widths) {
    const file = `${id}-${w}.webp`;
    await source.clone().resize({ width: w }).webp({ quality: 80 }).toFile(join(mediaDir, file));
    img.variants.push({ url: `${MEDIA_URL}/${file}`, width: w });
  }

  // The file on disk is the truth, not what WordPress recorded for the upload.
  img.url = img.variants.at(-1).url;
  img.width = width;
  img.height = height;
}

// The paths are parameters only so the test can run this without touching the real
// data file, which every other test imports.
export async function main({ outFile = OUT_FILE, mediaDir = MEDIA_DIR } = {}) {
  const baseUrl = process.env.KSL_CMS_URL?.replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('KSL_CMS_URL is not set (e.g. https://website.example/kreative-lab-cms)');
  }

  console.log(`==> Fetching content from ${baseUrl}`);
  const [archive_projects, client_logos, site_settings] = await Promise.all([
    fetchCollection(baseUrl, 'archive-projects', 'ksl_project'),
    fetchCollection(baseUrl, 'client-logos', 'ksl_logo'),
    fetchCollection(baseUrl, 'site-settings', 'ksl_site_setting'),
  ]);
  const content = { archive_projects, client_logos, site_settings };
  validateContent(content);

  if (site_settings.length !== 1) {
    console.warn(
      `    ${site_settings.length} published site settings; the site reads only the first.`
    );
  }

  const images = collectImages(content);
  console.log(
    `==> ${archive_projects.length} projects, ${client_logos.length} logos, ${images.length} images`
  );

  const { default: sharp } = await import('sharp');
  await rm(mediaDir, { recursive: true, force: true });
  await mkdir(mediaDir, { recursive: true });
  // A few at a time: fast enough, and gentle on a small VPS serving the uploads.
  const queue = [...images];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length > 0) await localiseImage(queue.shift(), sharp, mediaDir);
    })
  );

  await writeFile(outFile, `${JSON.stringify(content, null, 2)}\n`);
  console.log(`==> Wrote ${outFile}`);
  console.log('    This replaces the committed fixture for this build; do not commit it.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
