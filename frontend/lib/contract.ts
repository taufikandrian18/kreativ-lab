// When the site is built for deployment, scripts/fetch-cms.mjs overwrites
// data/rest-contract.json with live WordPress content first, so everything below reads
// the CMS in production and the committed fixture everywhere else.
//
// Local mirror of Stage 1's frozen fixture at
// wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json — copied here
// (not imported cross-directory) because Next.js's production bundler (Turbopack)
// refuses to resolve module imports that reach outside the app's own project directory
// ("Module not found", confirmed via `npm run build`, independent of the sandbox's
// separate Google Fonts network limitation). Vitest's plain Node/Vite resolution
// tolerated the cross-directory import fine, which is why this only surfaced once a
// real `next build` ran. Re-sync with `npm run sync-fixture` whenever Stage 1's fixture
// is deliberately regenerated; `fixture-sync.test.ts` fails loudly if the two drift.
//
// Alternative considered and rejected: Next.js's `turbopack.root` config (next.config.ts)
// can widen Turbopack's resolution root to a parent directory, letting the original
// cross-directory import resolve as-is with no duplication. Not used here because it
// widens filesystem-watch scope for a monorepo-wide config change to fix one import, and
// doesn't solve deployability if frontend/ is ever built as a standalone unit (a deploy
// pipeline that only has frontend/ on disk) — the local copy makes frontend/ self-contained.
import fixture from '../data/rest-contract.json';
import { slugify } from './slugify';

/**
 * An image as the contract carries it. `width`/`height` come from WordPress; `variants`
 * exist only after scripts/fetch-cms.mjs has downloaded and resized the image into
 * public/cms/, and `url` then points at the largest of them. Paths are root-relative and
 * get the base path at render time (lib/cms-image.ts). Empty fields are all null.
 */
export interface ContractImage {
  url: string | null;
  alt: string | null;
  width?: number | null;
  height?: number | null;
  variants?: { url: string; width: number }[];
}

export interface ArchiveProject {
  archive_no: string;
  title: string;
  client: string;
  industry: string;
  year_range: string;
  scope: string[];
  lab: 'product' | 'creative' | 'both';
  hero_image: ContractImage;
  gallery: ContractImage[];
  accent_color: string | null;
}

export interface ClientLogo {
  name: string;
  logo: ContractImage;
  order: number;
}

export interface SiteSetting {
  phone_primary: string;
  phone_secondary: string;
  email: string;
  instagram: string;
  address: string;
  og_image: ContractImage;
}

export function getArchiveProjects(): ArchiveProject[] {
  return [...(fixture.archive_projects as ArchiveProject[])].sort((a, b) =>
    a.archive_no.localeCompare(b.archive_no)
  );
}

export function getArchiveProject(slug: string): ArchiveProject | undefined {
  return getArchiveProjects().find((p) => slugify(p.title) === slug);
}

export function getClientLogos(): ClientLogo[] {
  return [...(fixture.client_logos as ClientLogo[])].sort((a, b) => a.order - b.order);
}

export function getSiteSetting(): SiteSetting {
  return fixture.site_settings[0] as SiteSetting;
}
