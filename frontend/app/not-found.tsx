import Link from 'next/link';
import { Accented } from '@/components/type/Accented';
import { sitePage } from '@/lib/site-content';

/**
 * Without this file Next serves its built-in error page, which uses `height:100vh` and
 * `rgba(0,0,0,.3)` — both forbidden by spec §5 and the project's Global Constraints — in
 * a system font stack with a dark-mode flip no other page has. Next also serializes that
 * component into every route's payload, so it renders on any client-side navigation to a
 * missing page, not only on a cold 404.
 */
export default function NotFound() {
  const page = sitePage('not_found');

  return (
    <main>
      <section className="bg-k-black text-k-paper">
        <div className="section-shell flex min-h-[70svh] flex-col justify-center">
          <p className="font-display text-k-red text-3xl tracking-tight">{page.text('nf_code')}</p>
          <h1 className="display-type mt-2">
            <Accented text={page.text('nf_heading')} />
          </h1>
          <p className="font-body mt-6 max-w-[48ch] text-lg">
            {page.text('nf_body')}
          </p>
          <div className="mt-12 flex flex-wrap gap-x-8">
            <Link
              href="/"
              className="font-body inline-block py-3 text-xs tracking-widest uppercase"
            >
              {page.text('nf_home_link')}
            </Link>
            <Link
              href="/archive"
              className="font-body inline-block py-3 text-xs tracking-widest uppercase"
            >
              {page.text('nf_archive_link')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
