import { Fragment } from 'react';
import { accentRuns } from '@/lib/site-content';
import { MAX_SWAPS, swapPlan } from '@/lib/swap-letters';
import { Swapped } from '@/components/type/Swapped';

/**
 * Renders CMS headline markup: words wrapped in *stars* come out in the accent red, the
 * way "PRODUCT <span class=text-k-red>LAB</span>" used to be written by hand, and one or
 * two round letters are swapped into the wide face (lib/swap-letters.ts). Pass
 * `swaps={0}` for a line that must stay in one face, or 1 for one line of a headline
 * that is rendered in several, so the headline as a whole keeps to the cap.
 */
export function Accented({
  text,
  className = 'text-k-red',
  swaps = MAX_SWAPS,
}: {
  text: string;
  className?: string;
  swaps?: number;
}) {
  const runs = accentRuns(text);
  const plan = swapPlan(runs.map((r) => r.text).join(''), swaps);
  const starts = runs.map((_, i) => runs.slice(0, i).reduce((n, r) => n + r.text.length, 0));

  return (
    <>
      {runs.map((run, index) => {
        const body = <Swapped text={run.text} plan={plan} offset={starts[index]} />;
        return run.accent ? (
          <span key={index} className={className}>
            {body}
          </span>
        ) : (
          <Fragment key={index}>{body}</Fragment>
        );
      })}
    </>
  );
}
