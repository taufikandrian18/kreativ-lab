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
 * Delete this file when the singleton is populated. `studio-contact.test.ts` fails the
 * moment that happens.
 */
export const STUDIO_CONTACT = {
  phones: ['+62 813 1131 9739', '+62 812 7230 0977'],
  email: 'kreativestudiolab@gmail.com',
} as const;

/** Strips spaces for the `tel:` href; the visible text keeps its formatting. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
