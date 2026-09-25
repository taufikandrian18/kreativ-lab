import Link from 'next/link';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { WordReveal } from '@/components/motion/WordReveal';
import { CmsFigure } from '@/components/media/CmsFigure';
import { Accented } from '@/components/type/Accented';
import { getArchiveProjects } from '@/lib/contract';
import { projectOpener } from '@/lib/project-media';
import { sitePage } from '@/lib/site-content';
import { slugify } from '@/lib/slugify';

/**
 * The archive index. It used to open on deck page 07 — a white page with one line of
 * type and a tiny logo, shipped as a 1920px image. The line is live text now, set as the
 * page's statement and assembled as it scrolls in; an Archive image uploaded in WordPress
 * still shows beneath it. Each row leads with its study's own photograph, so the list
 * reads as work rather than as a table of names.
 */
export default function ArchiveIndex() {
  const projects = getArchiveProjects();
  const page = sitePage('archive');
  const image = page.image('archive_image');

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell">
          <MaskReveal as="h1" className="display-type">
            <Accented text={page.text('archive_heading')} />
          </MaskReveal>

          {/* The statement drifts against the page: with the deck image gone it is the
              one element here that carries the site's depth. */}
          <Parallax speed={PARALLAX_SPEEDS.figure} className="mt-10">
            <WordReveal
              as="p"
              text={page.text('archive_statement')}
              className="type-statement max-w-[20ch]"
              scrub
            />
          </Parallax>

          {image ? (
            <CmsFigure
              image={image}
              alt={page.text('archive_image_alt')}
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="mt-12 overflow-hidden rounded-[1.5rem]"
              priority
              parallax={PARALLAX_SPEEDS.figure}
            />
          ) : null}

          <StaggerReveal className="mt-16 lg:mt-20">
            {projects.map((project) => {
              const opener = projectOpener(project);
              return (
                <article
                  key={project.archive_no}
                  data-testid="archive-row"
                  className="border-k-black border-t-2 last:border-b-2"
                >
                  <Link
                    href={`/archive/${slugify(project.title)}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 py-4 sm:gap-x-6 sm:py-5"
                  >
                    {/* The thumbnail repeats the client name beside it as a picture, so
                        it is decoration to a screen reader: alt="". */}
                    <span className="bg-k-black block h-16 w-16 overflow-hidden rounded-[0.9rem] sm:h-24 sm:w-24">
                      {opener ? (
                        <img
                          src={opener.image.src}
                          srcSet={opener.image.srcSet}
                          sizes="96px"
                          alt=""
                          width={opener.image.width}
                          height={opener.image.height}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-3">
                        <span
                          data-testid="archive-no"
                          className="font-display text-k-red text-2xl tracking-tight sm:text-3xl"
                        >
                          {project.archive_no}
                        </span>
                        <span className="font-display truncate text-3xl tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-5xl">
                          {project.client}
                        </span>
                      </span>
                      {/* Uppercase letterspacing rather than an alpha-composited black:
                          the same de-emphasis without a grey. */}
                      <span className="font-body mt-1 block text-xs tracking-widest uppercase sm:text-sm">
                        {project.industry} · {project.year_range}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="bg-k-black text-k-paper group-hover:bg-k-red grid h-11 w-11 place-items-center rounded-full transition-colors duration-300"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="square" />
                      </svg>
                    </span>
                  </Link>
                </article>
              );
            })}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
