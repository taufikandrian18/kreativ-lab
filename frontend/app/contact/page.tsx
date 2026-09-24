import { DeckFigure } from '@/components/media/DeckFigure';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CONTACT_PAGE } from '@/lib/deck';
import { CmsFigure } from '@/components/media/CmsFigure';
import { Accented } from '@/components/type/Accented';
import { getSiteSetting } from '@/lib/contract';
import { sitePage } from '@/lib/site-content';
import { studioContact, telHref } from '@/lib/studio-contact';

export default function Contact() {
  const contact = studioContact(getSiteSetting());
  const page = sitePage('contact');
  const image = page.image('contact_image');
  // alt="": the numbers and the email are directly above as live text, so a description
  // would announce them a second time.
  const figure = {
    alt: '',
    sizes: '(min-width: 1024px) 70vw, 100vw',
    className: 'mt-16',
    parallax: PARALLAX_SPEEDS.figure,
  };

  return (
    <main>
      <section className="bg-k-black text-k-paper">
        <div className="section-shell flex min-h-[70svh] flex-col justify-center">
          <MaskReveal as="h1" className="display-type">
            <Accented text={page.text('contact_heading')} />
          </MaskReveal>

          <ul className="mt-12">
            {contact.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="font-display inline-block py-3 text-3xl tracking-tight"
                >
                  {phone}
                </a>
              </li>
            ))}
            {contact.email ? (
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-display inline-block py-3 text-3xl tracking-tight break-all"
                >
                  {contact.email}
                </a>
              </li>
            ) : null}
          </ul>

          {image ? <CmsFigure image={image} {...figure} /> : <DeckFigure page={CONTACT_PAGE} {...figure} />}
        </div>
      </section>
    </main>
  );
}
