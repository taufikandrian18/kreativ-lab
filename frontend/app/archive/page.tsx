import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { getArchiveProjects } from '@/lib/contract';

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ArchiveIndex() {
  const projects = getArchiveProjects();

  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">ARCHIVE</h1>
          <ul>
            {projects.map((project) => (
              <li key={project.archive_no} className="border-t border-k-black py-6">
                <Link href={`/archive/${slugify(project.title)}`} className="flex items-baseline gap-6">
                  <span className="text-k-red font-display text-3xl">{project.archive_no}</span>
                  <span className="font-body text-2xl">{project.client}</span>
                  <span className="font-body text-sm text-k-black/60">{project.industry}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
