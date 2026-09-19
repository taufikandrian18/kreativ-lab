import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CONTACT_PAGE } from '@/lib/deck';
import { STUDIO_CONTACT, telHref } from '@/lib/studio-contact';

export default function Contact() {
  return (
    <main>
      <section className="bg-k-black text-k-paper">
        <div className="section-shell flex min-h-[70svh] flex-col justify-center py-24">
          <MaskReveal as="h1" className="display-type">
            LET&apos;S <span className="text-k-red">TALK</span>
          </MaskReveal>

          <ul className="mt-12">
            {STUDIO_CONTACT.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="font-display inline-block py-3 text-3xl tracking-tight"
                >
                  {phone}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${STUDIO_CONTACT.email}`}
                className="font-display inline-block py-3 text-3xl tracking-tight break-all"
              >
                {STUDIO_CONTACT.email}
              </a>
            </li>
          </ul>

          {/* alt="": the numbers and the email are directly above as live text, so a
              description would announce them a second time. */}
          <DeckFigure
            page={CONTACT_PAGE}
            alt=""
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="mt-16"
          />
        </div>
      </section>
    </main>
  );
}
