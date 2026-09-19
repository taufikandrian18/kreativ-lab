'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

export interface CapabilityGroup {
  name: string;
  items: readonly string[];
}

export function CapabilityList({ groups }: { groups: readonly CapabilityGroup[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    // 'unknown' is the server render and the first client render; 'reduced' is the
    // stated preference. Both render the end state, so the list is never
    // animation-dependent and the two renders agree.
    if (preference !== 'full') {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('[data-capability-item]');
    if (items.length === 0) {
      setRevealed(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(Array.from(items), {
        yPercent: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        // onStart, not onComplete: the keyline wipes in as the lines rise, which is
        // what "reveal per line, red keyline wipe left to right" describes.
        onStart: () => setRevealed(true),
      });
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <div ref={ref} data-capability-list data-revealed={String(revealed)}>
      {groups.map((group, index) => (
        <div key={group.name || `group-${index}`} className="k-keyline mt-10">
          {group.name ? (
            <p data-capability-group-name className="font-display text-2xl tracking-tight">
              {group.name}
            </p>
          ) : null}
          <ul className={group.name ? 'mt-2' : ''}>
            {group.items.map((item) => (
              <li key={item} data-capability-item className="font-body text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
