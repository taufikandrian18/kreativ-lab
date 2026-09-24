import Link from 'next/link';
import { getArchiveProjects } from '@/lib/contract';
import { slugify } from '@/lib/slugify';
import { ProjectOpenerFigure } from '@/components/media/ProjectOpenerFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { projectOpener } from '@/lib/project-media';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';

export function ArchiveTeaser() {
  // getArchiveProjects() is sorted ascending by archive_no; the teaser previews 01-03.
  const preview = getArchiveProjects().slice(0, 3);

  return (
    <section className="bg-k-black text-k-paper">
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type">
          LAB ARCHIVE
        </MaskReveal>

        <StaggerReveal className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          {preview.map((project) => {
            return (
              <article
                key={project.archive_no}
                data-testid="teaser-entry"
                className="col-span-12 sm:col-span-4"
              >
                <Link href={`/archive/${slugify(project.title)}`}>
                  {/* alt="": this link already states the client and the industry as
                      visible text below, so a description would be announced twice and
                      would bloat the link's accessible name. */}
                  <ProjectOpenerFigure
                    opener={projectOpener(project)}
                    alt=""
                    sizes="(min-width: 640px) 33vw, 100vw"
                    parallax={PARALLAX_SPEEDS.gallery}
                  />
                  <p
                    data-testid="teaser-no"
                    className="font-display text-k-red mt-4 text-3xl tracking-tight"
                  >
                    {project.archive_no}
                  </p>
                  <p className="font-body mt-1 text-xl">{project.client}</p>
                  <p className="font-body mt-1 text-sm">{project.industry}</p>
                </Link>
              </article>
            );
          })}
        </StaggerReveal>

        <Link
          href="/archive"
          className="font-body mt-16 inline-block py-3 text-xs tracking-widest uppercase"
        >
          View the full archive
        </Link>
      </div>
    </section>
  );
}
