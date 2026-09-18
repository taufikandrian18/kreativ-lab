import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { Section } from '@/components/layout/Section';
import { getArchiveProjects, getClientLogos } from '@/lib/contract';

export default function Home() {
  // getArchiveProjects() returns entries sorted ascending by archive_no (01..06);
  // the "LAB ARCHIVE" teaser previews the earliest three entries.
  const latestThree = getArchiveProjects().slice(0, 3);
  const logos = getClientLogos();

  return (
    <main>
      <Section className="flex items-center bg-k-black text-k-paper">
        <Container>
          <Image
            src="/images/hero-poster.jpg"
            alt="Kreative Studio Lab"
            width={1920}
            height={1080}
            priority
            className="w-full h-auto"
          />
          <h1 className="display-type mt-8">CLEAN IN FORM. SHARP IN FUNCTION.</h1>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="display-type">WHO WE ARE</h2>
          <Grid>
            {['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'].map((word) => (
              <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <p className="font-body text-xl">{word}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="display-type">LAB ARCHIVE</h2>
          <Grid>
            {latestThree.map((project) => (
              <div key={project.archive_no} className="col-span-12 sm:col-span-4">
                <span className="text-k-red font-display text-2xl">{project.archive_no}</span>
                <p className="font-body">{project.client}</p>
                <p className="font-body text-sm">{project.industry}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="display-type">CLIENT WALL</h2>
          <Grid>
            {logos.map((logo) => (
              <div key={logo.name} className="col-span-6 sm:col-span-3 lg:col-span-2">
                <p className="font-body text-sm">{logo.name}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section className="flex items-center justify-center bg-k-black text-k-paper">
        <Container>
          <p className="display-type text-center">
            LET&apos;S <span className="text-k-red">CREATE</span> SOMETHING THAT{' '}
            <span className="text-k-red">LIVES</span>.
          </p>
        </Container>
      </Section>
    </main>
  );
}
