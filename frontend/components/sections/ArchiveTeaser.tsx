import Link from 'next/link';
import { getHomepageProjects } from '@/lib/contract';
import { sitePage } from '@/lib/site-content';
import { slugify } from '@/lib/slugify';
import { ProjectOpenerFigure } from '@/components/media/ProjectOpenerFigure';
import { CardFan } from '@/components/motion/CardFan';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { Signpost } from '@/components/motion/Signpost';
import { TornEdge } from '@/components/motion/TornEdge';
import { Accented } from '@/components/type/Accented';
import { projectOpener } from '@/lib/project-media';

/**
 * Crency's cases: a big centred heading, the case cards held as a hand and fanned out
 * over a turning burst (CardFan), and a signpost to the full archive.
 */
export function ArchiveTeaser() {
  // Ticked "Show on homepage" first, then the newest — see getHomepageProjects().
  const preview = getHomepageProjects();
  const home = sitePage('home');

  return (
    <section className="bg-k-black text-k-paper relative overflow-x-clip">
      <TornEdge from="paper" seed={7} />
      <div className="section-shell">
        <MaskReveal as="h2" className="display-type text-center">
          <Accented text={home.text('teaser_heading')} />
        </MaskReveal>

        <div className="mt-16">
          <CardFan className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {preview.map((project) => (
              <article
                key={project.archive_no}
                data-testid="teaser-entry"
                className="bg-k-paper text-k-black col-span-12 rounded-[1.5rem] p-3 sm:col-span-4"
              >
                <Link href={`/archive/${slugify(project.title)}`} className="block">
                  {/* alt="": this link already states the client and the industry as
                      visible text below, so a description would be announced twice and
                      would bloat the link's accessible name. */}
                  <div className="overflow-hidden rounded-[1.1rem]">
                    <ProjectOpenerFigure
                      opener={projectOpener(project)}
                      alt=""
                      sizes="(min-width: 640px) 33vw, 100vw"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-4 px-2 pt-4 pb-2">
                    <div>
                      <p className="font-body text-xl font-bold tracking-tight">{project.client}</p>
                      <p className="font-body mt-1 text-sm">{project.industry}</p>
                    </div>
                    <p
                      data-testid="teaser-no"
                      className="font-display text-k-red text-4xl leading-none tracking-tight"
                    >
                      {project.archive_no}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </CardFan>
        </div>

        <div className="mt-20 flex justify-center">
          <Signpost href="/archive" point="right" tone="red">
            {home.text('teaser_link')}
          </Signpost>
        </div>
      </div>
    </section>
  );
}
