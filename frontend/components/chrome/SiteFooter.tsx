import Link from 'next/link';
import { getSiteSetting } from '@/lib/contract';

export function SiteFooter() {
  const settings = getSiteSetting();
  const phones = [settings.phone_primary, settings.phone_secondary].filter(Boolean);

  return (
    <footer className="bg-k-black text-k-paper">
      <div className="mx-auto w-full px-4 py-16 sm:px-8 lg:px-12">
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
          <ul className="font-body flex flex-wrap gap-6 text-xs tracking-widest uppercase">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/product-lab">Product Lab</Link></li>
            <li><Link href="/creative-lab">Creative Lab</Link></li>
            <li><Link href="/archive">Archive</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
