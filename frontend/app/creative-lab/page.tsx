import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';

export default function CreativeLab() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">CREATIVE LAB</h1>
          <p className="font-body text-xl max-w-2xl mt-8">
            Capability list and production imagery for the Creative Lab.
          </p>
        </Container>
      </Section>
    </main>
  );
}
