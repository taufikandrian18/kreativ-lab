import fixture from '../../wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json';

export interface ArchiveProject {
  archive_no: string;
  title: string;
  client: string;
  industry: string;
  year_range: string;
  scope: string[];
  lab: 'product' | 'creative' | 'both';
  hero_image: { url: string | null; alt: string | null };
  gallery: { url: string | null; alt: string | null }[];
  accent_color: string | null;
}

export interface ClientLogo {
  name: string;
  logo: { url: string | null; alt: string | null };
  order: number;
}

export interface SiteSetting {
  phone_primary: string;
  phone_secondary: string;
  email: string;
  instagram: string;
  address: string;
  og_image: { url: string | null; alt: string | null };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getArchiveProjects(): ArchiveProject[] {
  return fixture.archive_projects as ArchiveProject[];
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
