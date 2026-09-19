import Link from 'next/link';
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { getArchiveProjects } from '@/lib/contract';
import { PROCESS_STATEMENT_PAGE } from '@/lib/deck';
import { slugify } from '@/lib/slugify';

export default function ArchiveIndex() {
  const projects = getArchiveProjects();

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type">
            LAB ARCHIVE
          </MaskReveal>

          <DeckFigure
            page={PROCESS_STATEMENT_PAGE}
            alt="Every great outcome starts with a thoughtful process."
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="mt-12"
            priority
          />

          <StaggerReveal className="mt-20">
            {projects.map((project) => (
              <article
                key={project.archive_no}
                data-testid="archive-row"
                className="border-k-black border-t-2"
              >
                <Link
                  href={`/archive/${slugify(project.title)}`}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6"
                >
                  <span
                    data-testid="archive-no"
                    className="font-display text-k-red text-3xl tracking-tight"
                  >
                    {project.archive_no}
                  </span>
                  <span className="font-display text-3xl tracking-tight">{project.client}</span>
                  {/* Uppercase letterspacing rather than the Stage 2 stub's
                      alpha-composited black: the same de-emphasis without a grey. */}
                  <span className="font-body text-sm tracking-widest uppercase">
                    {project.industry}
                  </span>
                  <span className="font-body text-sm">{project.year_range}</span>
                </Link>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
