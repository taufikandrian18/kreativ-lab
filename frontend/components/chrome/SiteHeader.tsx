import Link from 'next/link';

const NAV = [
  { name: 'About', href: '/about' },
  { name: 'Product Lab', href: '/product-lab' },
  { name: 'Creative Lab', href: '/creative-lab' },
  { name: 'Archive', href: '/archive' },
  { name: 'Contact', href: '/contact' },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 mix-blend-difference">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="font-display text-k-paper text-xl tracking-tight">
          K STUDIOLAB
        </Link>
        <nav aria-label="Primary">
          <ul className="flex gap-4 sm:gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-k-paper text-xs tracking-widest uppercase"
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
