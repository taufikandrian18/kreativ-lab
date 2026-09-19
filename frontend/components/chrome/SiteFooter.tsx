import Link from 'next/link';
import { getSiteSetting } from '@/lib/contract';

const FOOTER_NAV = [
  { name: 'About', href: '/about' },
  { name: 'Product Lab', href: '/product-lab' },
  { name: 'Creative Lab', href: '/creative-lab' },
  { name: 'Archive', href: '/archive' },
  { name: 'Contact', href: '/contact' },
] as const;

export function SiteFooter() {
  const settings = getSiteSetting();
  const phones = [settings.phone_primary, settings.phone_secondary].filter(Boolean);

  return (
    <footer className="bg-k-black text-k-paper">
      <div className="section-shell">
        <p className="font-display text-3xl tracking-tight">K STUDIOLAB</p>

        {settings.email ? (
          <p className="font-body mt-6 text-sm">
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
        ) : null}

        {phones.length > 0 ? (
          <ul className="font-body mt-2 text-sm">
            {phones.map((phone) => (
              <li key={phone}>{phone}</li>
            ))}
          </ul>
        ) : null}

        {settings.address ? <p className="font-body mt-2 text-sm">{settings.address}</p> : null}

        <nav aria-label="Footer" className="mt-10">
          <ul className="font-body flex flex-wrap gap-x-6 text-xs tracking-widest uppercase">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-block py-3">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
