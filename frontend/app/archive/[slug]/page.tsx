import { notFound } from "next/navigation";
import { ProjectOpenerFigure } from "@/components/media/ProjectOpenerFigure";
import { PARALLAX_SPEEDS } from "@/lib/parallax";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { CaseStudyReel } from "@/components/sections/CaseStudyReel";
import { CaseStudyGallery } from "@/components/sections/CaseStudyGallery";
import { getArchiveProject, getArchiveProjects } from "@/lib/contract";
import {
  projectGallery,
  projectOpener,
  projectReel,
} from "@/lib/project-media";
import { slugify } from "@/lib/slugify";
import { projectScope } from "@/lib/project-scope";
import { sitePage } from "@/lib/site-content";
import { Accented } from "@/components/type/Accented";
import { StaggerReveal } from "@/components/motion/StaggerReveal";
import { NumberSticker } from "@/components/sections/NumberSticker";

// Scope tags cycle through the three colours, as the Creative Lab capability tags do.
const SCOPE_FILLS = [
  "bg-k-black text-k-paper border-k-black",
  "bg-k-paper text-k-black border-k-black",
  "bg-k-red text-k-paper border-k-red",
] as const;

export async function generateStaticParams() {
  return getArchiveProjects().map((p) => ({ slug: slugify(p.title) }));
}

export default async function ArchiveCaseStudy({
  params,
}: PageProps<"/archive/[slug]">) {
  const { slug } = await params;
  const project = getArchiveProject(slug);
  if (!project) {
    notFound();
  }

  const opener = projectOpener(project);
  const reel = projectReel(project);
  const tiles = projectGallery(project);
  const scope = projectScope(project);
  const page = sitePage("archive");
  const home = sitePage("home");
  const lab =
    project.lab === "both"
      ? page.text("case_lab_both")
      : home.text(project.lab === "product" ? "labs_product" : "labs_creative");

  return (
    <main>
      {/* overflow-x-clip: the number sticker hangs off the photograph's corner, and its
          turning burst swept 18px past a 390px screen. */}
      <section className="bg-k-paper text-k-black overflow-x-clip">
        <div className="section-shell">
          {/* The deck's opener page used to stand here whole: photograph, SCOPE OF WORK
              list, client, industry and year all printed into one image, legible on a
              desktop and not on a phone. The words are live text now and the photograph
              stands alone (lib/project-media.ts, lib/project-scope.ts). */}
          <div className="grid grid-cols-12 items-end gap-x-4 gap-y-10 sm:gap-x-8 lg:gap-x-12">
            <div className="col-span-12 lg:col-span-7">
              <p className="font-body text-xs font-semibold tracking-[0.3em] uppercase">
                {page.text("case_eyebrow")}{" "}
                <span className="text-k-red">{project.archive_no}</span>
              </p>
              <MaskReveal as="h1" className="display-type mt-3">
                <Accented text={project.client} />
              </MaskReveal>
              <dl className="mt-8 grid grid-cols-3 gap-4 sm:max-w-xl">
                {[
                  [page.text("case_industry_label"), project.industry],
                  [page.text("case_year_label"), project.year_range],
                  [page.text("case_lab_label"), lab],
                ].map(([term, value]) => (
                  <div key={term} className="border-k-black border-t-2 pt-3">
                    <dt className="font-body text-[0.7rem] font-semibold tracking-[0.2em] uppercase">
                      {term}
                    </dt>
                    <dd className="font-body mt-1 text-base leading-snug font-semibold capitalize lg:text-lg">
                      {value.toLowerCase()}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {scope.length > 0 ? (
              <div className="col-span-12 lg:col-span-5">
                <h2 className="font-body text-xs font-semibold tracking-[0.3em] uppercase">
                  {page.text("case_scope_label")}
                </h2>
                <StaggerReveal className="mt-4">
                  <ul data-scope-list className="flex flex-wrap gap-2 sm:gap-3">
                    {scope.map((item, index) => (
                      <li
                        key={item}
                        className={`font-display rounded-full border-2 px-4 py-2 text-lg leading-none tracking-tight sm:px-5 sm:text-2xl ${SCOPE_FILLS[index % SCOPE_FILLS.length]}`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </StaggerReveal>
              </div>
            ) : null}
          </div>

          <div className="mt-14 grid grid-cols-12 items-start gap-x-4 gap-y-8 sm:gap-x-8 lg:gap-x-12">
            {opener ? (
              <div className={`relative ${reel ? "col-span-12 lg:col-span-7" : "col-span-12 lg:col-span-8 lg:col-start-3"}`}>
                <ProjectOpenerFigure
                  opener={opener}
                  alt={
                    (opener.uploaded && opener.image.alt) ||
                    `${project.client}: campaign photography`
                  }
                  sizes={reel ? "(min-width: 1024px) 56vw, 100vw" : "(min-width: 1024px) 64vw, 100vw"}
                  className="overflow-hidden rounded-[1.5rem]"
                  priority
                  parallax={PARALLAX_SPEEDS.figure}
                />
                <NumberSticker number={project.archive_no} label={page.text("case_eyebrow")} />
              </div>
            ) : null}
            {reel ? (
              <div className="col-span-12 lg:col-span-5">
                <CaseStudyReel reel={reel} client={project.client} />
              </div>
            ) : null}
          </div>
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
