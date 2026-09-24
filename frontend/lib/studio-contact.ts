import type { SiteSetting } from '@/lib/contract';

/**
 * Transcribed from deck page 26 (`assets/web/page-26-1920.webp`) and recorded in
 * frontend/content/page-section-mapping.md, which flags that spec §3's claim these were
 * "never transcribed from the deck" is wrong — they are legible at 1920px.
 *
 * This exists because the `site_setting` CPT is empty on every field. It is a narrow
 * exception, not a pattern: /contact is the one route whose job is to be acted on, and a
 * phone number rendered only inside a raster cannot be tapped, selected, or crawled.
 * Everything else, including SiteFooter, still reads the fixture and degrades to nothing.
 *
 * Once the site builds from WordPress, the singleton wins: `studioContact()` returns
 * these values only while the CMS has neither a phone nor an email. Delete this file
 * when the committed fixture is regenerated from a populated CMS —
 * `studio-contact.test.ts` fails the moment that happens.
 */
export const STUDIO_CONTACT = {
  phones: ['+62 813 1131 9739', '+62 812 7230 0977'],
  email: 'kreativestudiolab@gmail.com',
} as const;

/**
 * The contact details /contact shows. The CMS is taken whole or not at all: mixing a
 * CMS email with transcribed phone numbers could pair details that no longer belong
 * together.
 */
export function studioContact(settings: SiteSetting | undefined): {
  phones: readonly string[];
  email: string;
} {
  const phones = [settings?.phone_primary, settings?.phone_secondary].filter(
    (p): p is string => Boolean(p?.trim())
  );
  const email = settings?.email?.trim() ?? '';
  if (phones.length === 0 && !email) return STUDIO_CONTACT;
  return { phones, email };
}

/** Strips spaces for the `tel:` href; the visible text keeps its formatting. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
