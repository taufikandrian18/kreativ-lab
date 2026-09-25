import { CmsFigure } from '@/components/media/CmsFigure';
import type { ProjectOpener } from '@/lib/project-media';

/** A case study's opening photograph, from whichever source lib/project-media.ts chose. */
export function ProjectOpenerFigure({
  opener,
  ...figure
}: {
  opener: ProjectOpener | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  parallax?: number;
}) {
  if (!opener) return null;
  return <CmsFigure image={opener.image} {...figure} />;
}
