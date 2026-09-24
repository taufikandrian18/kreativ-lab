'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';
import { scatterFor } from '@/components/motion/Gather';

gsap.registerPlugin(ScrollTrigger);

export interface CapabilityGroup {
  name: string;
  items: readonly string[];
}

// Named groups become Crency's service cards, one fill each; a flat list becomes its
// chip tags. Fills cycle through the three colours, the only ones there are.
const CARD_FILLS = [
  'bg-k-black text-k-paper',
  'bg-k-red text-k-paper',
  'bg-k-paper text-k-black border-2 border-k-black',
  'bg-k-red text-k-paper',
] as const;

const TAG_FILLS = [
  'bg-k-black text-k-paper border-k-black',
  'bg-k-paper text-k-black border-k-black',
  'bg-k-red text-k-paper border-k-red',
] as const;

export function CapabilityList({
  groups,
  columns = false,
}: {
  groups: readonly CapabilityGroup[];
  /**
   * Set the list as a block rather than a thin column: named groups as a row of filled
   * cards, a flat list as a wrap of pill tags. A list of twelve single-line items down one
   * column reads as a table of contents; either of these reads as what the studio does.
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
      // Cards are dealt in tilted; tags gather out of a scatter on scrub. Both on
      // transform only — a card or a tag held half-faded mid-entrance is a grey.
      const cards = el.querySelectorAll('[data-capability-card]');
      if (cards.length > 0) {
        gsap.from(cards, {
          yPercent: 25,
          rotate: (i: number) => (i % 2 === 0 ? -5 : 5),
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
        return;
      }
      const tags = el.querySelectorAll('[data-capability-tag]');
      if (tags.length > 0) {
        tags.forEach((tag, i) => {
          gsap.fromTo(
            tag,
            { ...scatterFor(i), scale: 0.7 },
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              scale: 1,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'center 60%', scrub: 0.8 },
            }
          );
        });
        return;
      }
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

  if (columns && groups.some((g) => g.name)) {
    return (
      <div ref={ref} data-capability-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {groups.map((group, index) => (
          <div
            key={group.name || `group-${index}`}
            data-capability-card
            className={`rounded-[1.75rem] p-6 lg:p-7 ${CARD_FILLS[index % CARD_FILLS.length]}`}
          >
            {group.name ? (
              <p data-capability-group-name className="font-display text-3xl leading-none tracking-tight lg:text-4xl">
                {group.name}
              </p>
            ) : null}
            <ul className="mt-5">
              {group.items.map((item) => (
                <li key={item} data-capability-item className="font-body py-0.5 text-lg leading-snug">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (columns) {
    const items = groups.flatMap((g) => g.items);
    return (
      // overflow-x-clip: tags start their gather scattered past the edge, which on a phone
      // widened the page by 99px — measured at 390px. Vertical overflow is left alone so a
      // tag rising from below is not cut off. `clip`, so this is not a scroll container.
      <div ref={ref} data-capability-list className="overflow-x-clip">
        <ul className="flex flex-wrap gap-3 lg:gap-4">
          {items.map((item, i) => (
            <li
              key={item}
              data-capability-item
              data-capability-tag
              className={`font-display rounded-full border-2 px-6 py-2.5 text-2xl leading-none tracking-tight lg:px-8 lg:py-3 lg:text-4xl ${TAG_FILLS[i % TAG_FILLS.length]}`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={ref} data-capability-list>
      {groups.map((group, index) => (
        <div key={group.name || `group-${index}`} className="mt-10">
          {group.name ? (
            <p data-capability-group-name className="font-display text-2xl tracking-tight">
              {group.name}
            </p>
          ) : null}
          <ul className={group.name ? 'mt-3' : ''}>
            {group.items.map((item) => (
              <li key={item} data-capability-item className="font-body py-0.5 text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
