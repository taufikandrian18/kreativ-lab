import { burstPoints } from '@/lib/shapes';

/**
 * The study's archive number on a red burst, stuck over the corner of its photograph —
 * Crency's badge stickers, in the archive's own numbering. The burst turns slowly behind
 * the number (globals.css, .k-sticker-spin); the number itself stays upright. Hidden from
 * assistive technology: the number is already in the page heading's eyebrow.
 */
export function NumberSticker({ number, label }: { number: string; label: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-6 -right-3 z-10 grid h-28 w-28 place-items-center sm:-top-8 sm:-right-6 sm:h-36 sm:w-36"
    >
      <svg viewBox="0 0 100 100" className="k-sticker-spin absolute inset-0 h-full w-full">
        <polygon points={burstPoints(16, 38, 50)} fill="var(--k-red)" />
      </svg>
      <span className="text-k-paper relative -rotate-12 text-center leading-none">
        <span className="font-body block text-[0.6rem] font-bold tracking-[0.2em] uppercase sm:text-xs">
          {label}
        </span>
        <span className="font-display block text-4xl tracking-tight sm:text-5xl">{number}</span>
      </span>
    </div>
  );
}
