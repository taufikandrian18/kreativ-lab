import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { getArchiveProject, getArchiveProjects } from '@/lib/contract';
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

  // Alt text drawn from client and industry, per spec §11.
  const heroAlt = `${project.client} — ${project.industry}`;

  return (
    <main>
      <Section>
        <Container>
          <span className="text-k-red font-display text-3xl">{project.archive_no}</span>
          <h1 className="display-type">{project.client}</h1>
          <p className="font-body text-lg">{project.industry} · {project.year_range}</p>

          {project.hero_image.url ? (
            <img src={project.hero_image.url} alt={project.hero_image.alt ?? heroAlt} className="w-full mt-8" />
          ) : (
            // Note: black-alpha for de-emphasis technically composites to a grey, which spec §5 reserves for image content only — flagged in Stage 2's final review, not resolved; left as-is pending a deliberate call.
            <p className="font-body text-sm text-k-black/60 mt-8">
              Hero image not yet supplied — placeholder pending Stage 4 asset population.
            </p>
          )}

          {project.scope.length > 0 && (
            <ul className="mt-8">
              {project.scope.map((item) => (
                <li key={item} className="font-body border-t border-k-black py-2">{item}</li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  );
}
