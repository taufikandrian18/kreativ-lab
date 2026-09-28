import { Grain } from '@/components/motion/Grain';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { PillLink } from '@/components/motion/PillLink';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { LostCode, MissingPath } from '@/components/sections/LostCode';
import { Accented } from '@/components/type/Accented';
import { sitePage } from '@/lib/site-content';

/**
 * The 404, in the dark editorial register of the rest of the site: the code set as a
 * word-mark the width of the screen with the studio's red mark for its 0, the address the
 * visitor tried so they can see what went wrong, and two pills straight back in.
 *
 * Without this file Next serves its built-in error page, which uses `height:100vh` and
 * `rgba(0,0,0,.3)` — both forbidden by spec §5 and the project's Global Constraints — in
 * a system font stack with a dark-mode flip no other page has. Next also serializes that
 * component into every route's payload, so it renders on any client-side navigation to a
 * missing page, not only on a cold 404. Every word here is editable under Site Pages →
 * Page not found (404).
 */
export default function NotFound() {
  const page = sitePage('not_found');

  return (
    <main>
      <section className="bg-k-black text-k-paper relative overflow-hidden">
        <Grain />
        <div className="section-shell relative flex min-h-[100svh] flex-col justify-center gap-10 lg:gap-14">
          <MissingPath label={page.text('nf_path_label')} />

          <LostCode code={page.text('nf_code')} />

          <div className="border-k-paper grid gap-8 border-t-2 pt-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16 lg:pt-10">
            <MaskReveal as="h1" className="display-type">
              <Accented text={page.text('nf_heading')} />
            </MaskReveal>
            <StaggerReveal className="flex flex-col gap-8">
              <p className="font-body max-w-[42ch] text-lg">{page.text('nf_body')}</p>
              <div className="flex flex-wrap gap-4">
                <PillLink href="/" tone="red">
                  {page.text('nf_home_link')}
                </PillLink>
                <PillLink href="/archive" tone="paper">
                  {page.text('nf_archive_link')}
                </PillLink>
              </div>
            </StaggerReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
