import Link from 'next/link';
import { siteNav } from '@/lib/site-nav';
import { sitePage } from '@/lib/site-content';

export function SiteHeader() {
  const wordmark = sitePage('global').text('wordmark');

  return (
    <header className="fixed top-0 right-0 left-0 z-50 mix-blend-difference">
      <div className="shell-inline flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Link href="/" className="font-display text-k-paper inline-block py-2 text-xl tracking-tight">
          {wordmark}
        </Link>
        {/* Below 1024px these links give way to the floating dock and its menu
            (MobileDock): wrapped onto two lines at 390px they took the top of every
            page. From 1024px they fit on one line. They still wrap rather than clip if
            a label is edited long, and `py-3` keeps each tap target taller than its text. */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex flex-wrap gap-x-4 gap-y-0 sm:gap-x-8">
            {siteNav().map((item) => (
              <li key={item.href}>
                {/* prefetch={false}: a prefetch loads the linked route whole, images included,
                    so with five header links in view every desktop visit to any page
                    downloaded the About and Product Lab openers — 220KB, measured on the
                    production build. A click costs one ~15KB request instead. */}
                <Link
                  href={item.href}
                  prefetch={false}
                  className="font-body text-k-paper inline-block py-3 text-xs tracking-widest uppercase"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
