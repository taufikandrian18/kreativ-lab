import { CmsFigure } from '@/components/media/CmsFigure';
import { DeckFigure } from '@/components/media/DeckFigure';
import type { ProjectOpener } from '@/lib/project-media';

/** A case study's opening image, from whichever source lib/project-media.ts chose. */
export function ProjectOpenerFigure({
  opener,
  ...figure
}: {
  opener: ProjectOpener;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  parallax?: number;
}) {
  if (!opener) return null;
  if (opener.kind === 'deck') return <DeckFigure page={opener.page} {...figure} />;
  return <CmsFigure image={opener.image} {...figure} />;
}
