import Link from 'next/link';
import { Magnetic } from '@/components/motion/Magnetic';

const TONE = {
  paper: { pill: 'bg-k-paper text-k-black', arrow: 'bg-k-red text-k-paper' },
  red: { pill: 'bg-k-red text-k-paper', arrow: 'bg-k-black text-k-paper' },
  black: { pill: 'bg-k-black text-k-paper', arrow: 'bg-k-red text-k-paper' },
} as const;

/**
 * The call to action as a pill with a round arrow badge — Crency's "design trust ↗" —
 * leaning toward the pointer (Magnetic). The arrow turns a quarter on hover.
 */
export function PillLink({
  href,
  tone = 'paper',
  className = '',
  children,
}: {
  href: string;
  tone?: keyof typeof TONE;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Magnetic className={className}>
      <Link href={href} className={`k-pill ${TONE[tone].pill}`}>
        {children}
        <span aria-hidden="true" className={`k-pill-arrow ${TONE[tone].arrow}`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="square" />
          </svg>
        </span>
      </Link>
    </Magnetic>
  );
}
