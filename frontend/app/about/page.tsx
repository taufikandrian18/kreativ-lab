import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { Section } from '@/components/layout/Section';

export default function About() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">WHO WE ARE</h1>
          <p className="font-body text-xl max-w-2xl mt-8">
            Kreative Studio Lab is a creative production studio. Clean in form. Sharp in
            function.
          </p>
          <Grid>
            {['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'].map((word) => (
              <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3 mt-12">
                <p className="display-type text-3xl">{word}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>
    </main>
  );
}
