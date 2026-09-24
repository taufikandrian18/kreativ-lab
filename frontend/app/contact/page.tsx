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

          {/* Each way in is a pill, as Crency sets its calls to action: the email in
              paper, the numbers outlined, so the one most people use leads. */}
          <ul className="mt-12 flex flex-wrap gap-3">
            {contact.email ? (
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="k-pill bg-k-paper text-k-black break-all"
                >
                  {contact.email}
                  <span aria-hidden="true" className="k-pill-arrow bg-k-red text-k-paper">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="square" />
                    </svg>
                  </span>
                </a>
              </li>
            ) : null}
            {contact.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="k-pill border-k-paper text-k-paper hover:bg-k-paper hover:text-k-black border-2 pr-7 transition-colors duration-300"
                >
                  {phone}
                </a>
              </li>
            ))}
          </ul>

          {image ? <CmsFigure image={image} {...figure} /> : <DeckFigure page={CONTACT_PAGE} {...figure} />}
        </div>
      </section>
    </main>
  );
}
