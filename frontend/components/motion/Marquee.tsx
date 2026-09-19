'use client';

import { prefersReducedMotion } from '@/lib/motion-env';

const REPEATS = 8;

export function Marquee({ text, className = '' }: { text: string; className?: string }) {
  const animated = !prefersReducedMotion();

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
