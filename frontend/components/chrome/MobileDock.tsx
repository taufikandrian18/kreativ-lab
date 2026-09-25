'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Accented } from '@/components/type/Accented';
import { useMotionPreference } from '@/lib/use-motion-preference';

export interface DockLabels {
  menu: string;
  cta: string;
  work: string;
  close: string;
}

/**
 * The phone's navigation, after Crency's floating dock: a black pill held off the bottom
 * edge with the menu, the call to action and the work, where a thumb already is. The five
 * header links wrapped onto two lines at 390px and the header ate the top of every page;
 * on a phone the header keeps only the wordmark and this carries the rest. Hidden from
 * 1024px, where the header's own links fit.
 *
 * The menu is a full-screen dialog with the routes set huge, each one rising into place.
 * Escape and the close button shut it, focus moves in on open and back to the menu button
 * on close, and the page behind cannot scroll while it is up.
 */
export function MobileDock({
  nav,
  labels,
}: {
  nav: readonly { name: string; href: string }[];
  labels: DockLabels;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const preference = useMotionPreference();
  const dock = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  // Navigating closes the menu. Keyed on the path so it runs once per route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    menu.current?.querySelector<HTMLElement>('a')?.focus();
    return () => {
      html.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // The dock rises in once the page (and the preloader, when there is one) is up.
  useLayoutEffect(() => {
    if (preference !== 'full' || !dock.current) return;
    const ctx = gsap.context(() => {
      gsap.from(dock.current, { yPercent: 180, duration: 0.9, delay: 0.6, ease: 'expo.out' });
    }, dock);
    return () => ctx.revert();
  }, [preference]);

  useLayoutEffect(() => {
    if (!open || preference !== 'full' || !menu.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-menu-link]', {
        yPercent: 110,
        rotate: 4,
        duration: 0.8,
        stagger: 0.06,
        ease: 'expo.out',
        transformOrigin: '0% 100%',
      });
    }, menu);
    return () => ctx.revert();
  }, [open, preference]);

  return (
    <>
      <div
        ref={dock}
        data-mobile-dock
        className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 lg:hidden"
      >
        <div className="bg-k-black text-k-paper border-k-paper flex items-center gap-1 rounded-full border-2 p-1.5">
          <button
            ref={trigger}
            type="button"
            aria-expanded={open}
            aria-controls="k-mobile-menu"
            onClick={() => setOpen(true)}
            className="font-body focus-visible:outline-k-red min-h-11 rounded-full px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {labels.menu}
          </button>
          <Link
            href="/contact"
            className="bg-k-red text-k-paper font-body flex min-h-11 items-center rounded-full px-5 text-sm font-bold"
          >
            {labels.cta}
          </Link>
          <Link href="/archive" className="font-body flex min-h-11 items-center rounded-full px-4 text-sm font-semibold">
            {labels.work}
          </Link>
        </div>
      </div>

      {open ? (
        <div
          ref={menu}
          id="k-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          className="bg-k-black text-k-paper fixed inset-0 z-[70] flex flex-col overflow-y-auto px-4 pt-6 pb-32 lg:hidden"
        >
          <button
            type="button"
            onClick={close}
            className="font-body border-k-paper min-h-11 self-end rounded-full border-2 px-5 text-sm font-semibold"
          >
            {labels.close}
          </button>
          <nav aria-label="Menu" className="mt-10">
            <ul>
              {nav.map((item) => (
                <li key={item.href} className="overflow-hidden">
                  <Link
                    href={item.href}
                    data-menu-link
                    onClick={() => setOpen(false)}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={`font-display block py-1 text-[clamp(3rem,15vw,5.5rem)] leading-[0.95] tracking-tight uppercase ${
                      pathname === item.href ? 'text-k-red' : ''
                    }`}
                  >
                    <Accented text={item.name} swaps={1} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
