import type { ArchiveProject } from '@/lib/contract';

/**
 * Each study's scope of work: the list entered in WordPress, or else the list printed on
 * its deck opener page, transcribed here on 2026-09-25 so it can be live text. "Product
 * RND" on the deck is written "Product R&D"; nothing else is reworded.
 */
const DECK_SCOPE: Readonly<Record<string, readonly string[]>> = {
  '01': [
    'Creative Direction',
    'Product R&D',
    'Campaign Production',
    'Content Production',
    'Partnership Collaborations',
    'Social Media Management',
  ],
  '02': ['Creative Direction', 'Product R&D', 'Campaign Production', 'Partnership Collaborations'],
  '03': ['Creative Direction', 'Campaign Production'],
  '04': ['Creative Direction', 'Campaign Production'],
  '05': [
    'Product R&D',
    'Event Merchandise Production',
    'Uniform Production',
    'Digital Campaign for YouTube',
    'Partnership Event Collaborations',
  ],
  '06': ['Product R&D', 'Event Merchandise Production', 'Printing Production'],
};

export function projectScope(project: ArchiveProject): readonly string[] {
  const entered = project.scope.map((item) => item.trim()).filter(Boolean);
  if (entered.length > 0) return entered;
  return DECK_SCOPE[project.archive_no] ?? [];
}
