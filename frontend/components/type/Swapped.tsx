import { Fragment } from 'react';

/**
 * A run of text with the planned letters set in the wide face (lib/swap-letters.ts).
 *
 * `offset` is where this run starts inside the whole headline, because the plan is made
 * once for the headline and a headline is rendered as several runs (accent words, or
 * one span per word while it animates). The swapped letter is a plain inline span, so
 * the heading's accessible name is the same string as before the swap.
 */
export function Swapped({
  text,
  plan,
  offset = 0,
}: {
  text: string;
  plan: ReadonlySet<number>;
  offset?: number;
}) {
  if (!Array.from(text).some((_, i) => plan.has(offset + i))) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let plain = '';
  Array.from(text).forEach((char, i) => {
    if (plan.has(offset + i)) {
      if (plain) parts.push(<Fragment key={`p${i}`}>{plain}</Fragment>);
      plain = '';
      parts.push(
        <span key={`s${i}`} data-swap className="k-swap">
          {char}
        </span>
      );
    } else {
      plain += char;
    }
  });
  if (plain) parts.push(<Fragment key="tail">{plain}</Fragment>);
  return <>{parts}</>;
}
