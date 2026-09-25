import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { Accented } from '@/components/type/Accented';
import { getSiteSetting } from '@/lib/contract';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { sitePage } from '@/lib/site-content';
import { studioContact, telHref, whatsappHref } from '@/lib/studio-contact';

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="square" />
    </svg>
  );
}

/**
 * The contact page is the ways in and nothing else: the email and the numbers, each set
 * as big as the page will take, one to a row between paper rules — the dark editorial
 * register, with red kept for the one thing to press. The whole row is the link, so the
 * tap target is the width of the screen. Each number also opens WhatsApp, which is how
 * the studio's clients reach it.
 *
 * It replaces deck page 26, which showed the same details a second time, printed into a
 * picture and too small to read on a phone.
 */
export default function Contact() {
  const contact = studioContact(getSiteSetting());
  const page = sitePage('contact');
  const label = 'font-body block text-[0.7rem] font-semibold tracking-[0.3em] uppercase';
  const value =
    'font-display block text-[clamp(1.75rem,7vw,6.5rem)] leading-[0.95] tracking-tight transition-transform duration-500 ease-out';

  return (
    <main>
      <section className="bg-k-black text-k-paper overflow-x-clip">
        <div className="section-shell flex min-h-[80svh] flex-col justify-center">
          <Parallax speed={PARALLAX_SPEEDS.gallery}>
            <MaskReveal as="h1" className="display-type">
              <Accented text={page.text('contact_heading')} />
            </MaskReveal>
          </Parallax>

          <StaggerReveal className="border-k-paper mt-12 border-t-2 lg:mt-16">
            {contact.email ? (
              <div className="border-k-paper border-b-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 lg:py-8"
                >
                  <span className="min-w-0">
                    {/* aria-hidden: the address is its own name; "Email" before it would
                        be read aloud as part of the link. */}
                    <span className={label} aria-hidden="true">
                      {page.text('contact_email_label')}
                    </span>
                    <span className={`${value} mt-3 break-all group-hover:translate-x-2`}>
                      {contact.email}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="bg-k-red text-k-paper grid h-14 w-14 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45 lg:h-20 lg:w-20"
                  >
                    <Arrow />
                  </span>
                </a>
              </div>
            ) : null}

            {contact.phones.map((phone, index) => (
              <div
                key={phone}
                className="border-k-paper grid grid-cols-1 items-center gap-4 border-b-2 py-6 sm:grid-cols-[1fr_auto] lg:py-8"
              >
                <a href={telHref(phone)} className="group min-w-0">
                  <span className={label} aria-hidden="true">
                    {page.text('contact_phone_label')} {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={`${value} mt-3 group-hover:translate-x-2`}>{phone}</span>
                </a>
                <a
                  href={whatsappHref(phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${page.text('contact_whatsapp_label')} ${phone}`}
                  className="k-pill border-k-paper text-k-paper hover:bg-k-paper hover:text-k-black justify-self-start border-2 transition-colors duration-300 sm:justify-self-end"
                >
                  {page.text('contact_whatsapp_label')}
                  <span aria-hidden="true" className="k-pill-arrow bg-k-red text-k-paper">
                    <Arrow />
                  </span>
                </a>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
