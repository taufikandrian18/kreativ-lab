import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { getSiteSetting } from '@/lib/contract';

export default function Contact() {
  const settings = getSiteSetting();
  const hasContactInfo = settings.phone_primary || settings.email;

  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">CONTACT</h1>
          {hasContactInfo ? (
            <dl className="font-body text-xl mt-8 space-y-4">
              {settings.phone_primary && (
                <div>
                  <dt className="text-sm text-k-black/60">Phone</dt>
                  <dd>{settings.phone_primary}</dd>
                </div>
              )}
              {settings.email && (
                <div>
                  <dt className="text-sm text-k-black/60">Email</dt>
                  <dd>{settings.email}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="font-body text-lg mt-8 text-k-black/60">
              Contact details pending — not yet entered in the CMS.
            </p>
          )}
        </Container>
      </Section>
    </main>
  );
}
