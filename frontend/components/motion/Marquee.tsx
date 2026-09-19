'use client';

import { useMotionPreference } from '@/lib/use-motion-preference';

const REPEATS = 8;

export function Marquee({ text, className = '' }: { text: string; className?: string }) {
  // Halted until the preference is known, so the track cannot translate in the
  // prerendered HTML before hydration. The CSS carries the same rule as a media query,
  // so the marquee is still static for a reduced-motion visitor with JS disabled.
  const animated = useMotionPreference() === 'full';

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="k-marquee-track" data-marquee-track data-animated={String(animated)}>
        {Array.from({ length: REPEATS }, (_, i) => (
          <span
            key={i}
            className="font-display shrink-0 px-6 text-[clamp(3rem,10vw,9rem)] leading-none tracking-tight"
            aria-hidden={i > 0 ? 'true' : undefined}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
