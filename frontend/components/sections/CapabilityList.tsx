'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

export interface CapabilityGroup {
  name: string;
  items: readonly string[];
}

export function CapabilityList({
  groups,
  columns = false,
}: {
  groups: readonly CapabilityGroup[];
  /**
   * Set the list as a block rather than a thin column. A flat list of twelve single-line
   * items down one column reads as a table of contents; flowed across three columns at
   * display size it reads as what the studio does. Named groups sit side by side.
   */
  columns?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useLayoutEffect(() => {
    if (preference !== 'full') return;
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('[data-capability-item]');
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(Array.from(items), {
        yPercent: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <div
      ref={ref}
      data-capability-list
      className={columns && groups.length > 1 ? 'grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4' : ''}
    >
      {groups.map((group, index) => (
        <div key={group.name || `group-${index}`} className={columns ? 'mt-0' : 'mt-10'}>
          {group.name ? (
            <p data-capability-group-name className="font-display text-2xl tracking-tight">
              {group.name}
            </p>
          ) : null}
          <ul
            className={`${group.name ? 'mt-3' : ''} ${
              columns && !group.name ? 'gap-x-12 sm:columns-2 lg:columns-3' : ''
            }`}
          >
            {group.items.map((item) => (
              <li
                key={item}
                data-capability-item
                className={
                  columns && !group.name
                    ? 'font-display break-inside-avoid py-1 text-3xl leading-tight tracking-tight lg:text-4xl'
                    : 'font-body py-0.5 text-lg'
                }
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
