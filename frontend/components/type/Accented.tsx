import { Fragment } from 'react';
import { accentRuns } from '@/lib/site-content';

/**
 * Renders CMS headline markup: words wrapped in *stars* come out in the accent red, the
 * way "PRODUCT <span class=text-k-red>LAB</span>" used to be written by hand.
 */
export function Accented({ text, className = 'text-k-red' }: { text: string; className?: string }) {
  return (
    <>
      {accentRuns(text).map((run, index) =>
        run.accent ? (
          <span key={index} className={className}>
            {run.text}
          </span>
        ) : (
          <Fragment key={index}>{run.text}</Fragment>
        )
      )}
    </>
  );
}
