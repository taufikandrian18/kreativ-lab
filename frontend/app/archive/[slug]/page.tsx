import { notFound } from 'next/navigation';
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { getArchiveProject, getArchiveProjects } from '@/lib/contract';
import { ARCHIVE_OPENER_PAGE, archiveGalleryPages, deckPageAlt } from '@/lib/deck';
import { slugify } from '@/lib/slugify';

export async function generateStaticParams() {
  return getArchiveProjects().map((p) => ({ slug: slugify(p.title) }));
}

export default async function ArchiveCaseStudy({ params }: PageProps<'/archive/[slug]'>) {
  const { slug } = await params;
  const project = getArchiveProject(slug);
  if (!project) {
    notFound();
  }

  const openerPage = ARCHIVE_OPENER_PAGE[project.archive_no];
  const galleryPages = archiveGalleryPages(project.archive_no);

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <p className="font-display text-k-red text-3xl tracking-tight">{project.archive_no}</p>
          <MaskReveal as="h1" className="display-type mt-2">
            {project.client}
          </MaskReveal>
          <p className="font-body mt-6 text-sm tracking-widest uppercase">
            {project.industry} · {project.year_range}
          </p>

          {/* The opener page carries this study's SCOPE OF WORK list as artwork. The
              fixture's `scope` array is empty for all six projects — populating the CPT
              is a content-layer task — so the alt text describes it rather than the page
              duplicating a list it does not have. */}
          <DeckFigure
            page={openerPage}
            alt={`${project.title} case study opener: scope of work and campaign photography`}
            sizes="100vw"
            className="mt-12"
            priority
          />

          {project.scope.length > 0 ? (
            <ul data-scope-list className="mt-12">
              {project.scope.map((item) => (
                <li key={item} className="font-body border-k-black border-t-2 py-3 text-lg">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="bg-k-black text-k-paper">
        <div className="section-shell py-24">
          {/* This section has no heading, caption or body text — the spreads are the
              case study. An empty alt would remove all of it from the accessibility
              tree, so each spread carries its own description from the deck mapping,
              prefixed with the client for a reader who lands mid-gallery. */}
          <StaggerReveal className="flex flex-col gap-8">
            {galleryPages.map((page) => (
              <DeckFigure
                key={page}
                page={page}
                alt={deckPageAlt(page, project.client)}
                sizes="100vw"
              />
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
