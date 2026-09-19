import Link from 'next/link';
import { getArchiveProjects } from '@/lib/contract';
import { slugify } from '@/lib/slugify';
import { ARCHIVE_OPENER_PAGE, deckImage } from '@/lib/deck';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';

export function ArchiveTeaser() {
  // getArchiveProjects() is sorted ascending by archive_no; the teaser previews 01-03.
  const preview = getArchiveProjects().slice(0, 3);

  return (
    <section className="bg-k-black text-k-paper">
      <div className="px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="h2" className="display-type">
          LAB ARCHIVE
        </MaskReveal>

        <StaggerReveal className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          {preview.map((project) => {
            const img = deckImage(ARCHIVE_OPENER_PAGE[project.archive_no]);
            return (
              <article
                key={project.archive_no}
                data-testid="teaser-entry"
                className="col-span-12 sm:col-span-4"
              >
                <Link href={`/archive/${slugify(project.title)}`}>
                  <img
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    width={img.width}
                    height={img.height}
                    alt={`${project.client} — ${project.industry}`}
                    className="h-auto w-full"
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
          className="font-body mt-16 inline-block text-xs tracking-widest uppercase"
        >
          View all six
        </Link>
      </div>
    </section>
  );
}
