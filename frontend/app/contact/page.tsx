import { ContactMark } from '@/components/sections/ContactMark';
import { PARALLAX_SPEEDS } from '@/lib/parallax';
import { Parallax } from '@/components/motion/Parallax';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CmsFigure } from '@/components/media/CmsFigure';
import { Accented } from '@/components/type/Accented';
import { getSiteSetting } from '@/lib/contract';
import { sitePage } from '@/lib/site-content';
import { studioContact, telHref } from '@/lib/studio-contact';

/** "@studio", "studio" or a full profile URL → the handle and its URL. */
function instagram(value: string): { handle: string; href: string } | null {
  const handle = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
  return handle ? { handle: `@${handle}`, href: `https://instagram.com/${handle}` } : null;
}

export default function Contact() {
  const settings = getSiteSetting();
  const contact = studioContact(settings);
  const insta = instagram(settings?.instagram ?? '');
  const address = (settings?.address ?? '').trim();
  const page = sitePage('contact');
  const image = page.image('contact_image');

  return (
    <main>
      <section className="bg-k-black text-k-paper overflow-x-clip">
        <div className="section-shell grid min-h-[70svh] grid-cols-12 items-center gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-7">
            <MaskReveal as="h1" className="display-type">
              <Accented text={page.text('contact_heading')} />
            </MaskReveal>

            {/* Each way in is a pill, as Crency sets its calls to action: the email in
                paper, the numbers and Instagram outlined, so the one most people use
                leads. Instagram and the address come from Site Settings in WordPress and
                appear only once they are filled in. */}
            <ul className="mt-12 flex flex-wrap gap-3">
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className="k-pill bg-k-paper text-k-black break-all">
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
              {insta ? (
                <li>
                  <a
                    href={insta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="k-pill border-k-paper text-k-paper hover:bg-k-paper hover:text-k-black border-2 pr-7 transition-colors duration-300"
                  >
                    {insta.handle}
                  </a>
                </li>
              ) : null}
            </ul>

            {address ? (
              <address className="font-body mt-8 max-w-[36ch] text-base leading-relaxed not-italic whitespace-pre-line">
                {address}
              </address>
            ) : null}
          </div>

          <div className="col-span-8 col-start-3 sm:col-span-6 sm:col-start-4 lg:col-span-5 lg:col-start-8">
            <Parallax speed={PARALLAX_SPEEDS.figure}>
              <ContactMark />
            </Parallax>
          </div>
        </div>

        {image ? (
          <div className="section-shell pt-0">
            <CmsFigure
              image={image}
              alt=""
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="overflow-hidden rounded-[1.5rem]"
              parallax={PARALLAX_SPEEDS.figure}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
