import { notFound } from 'next/navigation';
import { ProjectOpenerFigure } from '@/components/media/ProjectOpenerFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CaseStudyReel } from '@/components/sections/CaseStudyReel';
import { ARCHIVE_REELS } from '@/lib/archive-reels';
import { CaseStudyGallery } from '@/components/sections/CaseStudyGallery';
import { getArchiveProject, getArchiveProjects } from '@/lib/contract';
import { projectGallery, projectOpener } from '@/lib/project-media';
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

  const opener = projectOpener(project);
  const reel = ARCHIVE_REELS[project.archive_no];
  const tiles = projectGallery(project);

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell">
          <p className="font-display text-k-red text-3xl tracking-tight">{project.archive_no}</p>
          <MaskReveal as="h1" className="display-type col-opener -mt-4">
            {project.client}
          </MaskReveal>
          <p className="font-body col-span-12 text-sm tracking-widest uppercase">
            {project.industry} · {project.year_range}
          </p>

          {/* The opener page carries this study's SCOPE OF WORK list as artwork. The
              fixture's `scope` array is empty for all six projects — populating the CPT
              is a content-layer task — so the alt text describes it rather than the page
              duplicating a list it does not have. */}
          {/* The opener card and the reel share the top row. The opener carries the
              SCOPE OF WORK list as artwork, so it belongs beside the moving work rather
              than above it with the film buried further down the page. */}
          {opener ? (
            <div className={reel ? 'col-span-12 lg:col-span-7' : 'col-span-12'}>
              <ProjectOpenerFigure
                opener={opener}
                alt={
                  opener.kind === 'cms'
                    ? opener.image.alt || `${project.title} campaign photography`
                    : `${project.title} case study opener: scope of work and campaign photography`
                }
                sizes={reel ? '(min-width: 1024px) 56vw, 100vw' : '100vw'}
                priority
                parallax={PARALLAX_SPEEDS.figure}
              />
            </div>
          ) : null}
          {reel ? (
            <div className="col-span-12 lg:col-span-5">
              <CaseStudyReel reel={reel} client={project.client} />
            </div>
          ) : null}

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
        <div className="section-shell">
          {/* This section has no heading, caption or body text — the spreads are the
              case study. An empty alt would remove all of it from the accessibility
              tree, so each spread carries its own description from the deck mapping,
              prefixed with the client for a reader who lands mid-gallery. */}
          <CaseStudyGallery tiles={tiles} client={project.client} />
        </div>
      </section>
    </main>
  );
}
