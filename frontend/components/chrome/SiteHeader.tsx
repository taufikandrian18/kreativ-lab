import Link from 'next/link';
import { siteNav } from '@/lib/site-nav';
import { sitePage } from '@/lib/site-content';

export function SiteHeader() {
  const wordmark = sitePage('global').text('wordmark');

  return (
    <header className="fixed top-0 right-0 left-0 z-50 mix-blend-difference">
      <div className="shell-inline flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Link href="/" className="font-display text-k-paper text-xl tracking-tight">
          {wordmark}
        </Link>
        {/* Spec §7: mobile is the priority surface. Five uppercase links plus the
            wordmark overflow 375px, and because the header is fixed the overflow clips
            silently instead of scrolling — Archive and Contact simply vanish. Wrapping
            keeps every link reachable; `py-3` gives each one a tap target taller than
            its 12px text. */}
        <nav aria-label="Primary">
          <ul className="flex flex-wrap gap-x-4 gap-y-0 sm:gap-x-8">
            {siteNav().map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
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
