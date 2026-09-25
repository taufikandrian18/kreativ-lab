import { Fragment } from 'react';

/**
 * A run of text with the planned letters set in the wide face (lib/swap-letters.ts).
 *
 * `offset` is where this run starts inside the whole headline, because the plan is made
 * once for the headline and a headline is rendered as several runs (accent words, or
 * one span per word while it animates). The swapped letter is a plain inline span, so
 * the heading's accessible name is the same string as before the swap.
 *
 * A word that holds a swapped letter is wrapped nowrap. The swap is an inline-block, and
 * an inline-block is a line-break opportunity on both sides — at 390px the 404 heading
 * broke as "AWKWA R / D", the last letter of a word alone on its own line.
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

  // Split into words and the whitespace between them, keeping each piece's position.
  const pieces: { text: string; start: number }[] = [];
  let at = 0;
  for (const part of text.split(/(\s+)/)) {
    if (part) pieces.push({ text: part, start: at });
    at += part.length;
  }

  return (
    <>
      {pieces.map((piece) => {
        const chars = Array.from(piece.text);
        if (!chars.some((_, i) => plan.has(offset + piece.start + i))) {
          return <Fragment key={piece.start}>{piece.text}</Fragment>;
        }
        return (
          <span key={piece.start} className="whitespace-nowrap">
            {chars.map((char, i) =>
              plan.has(offset + piece.start + i) ? (
                <span key={i} data-swap className="k-swap">
                  {char}
                </span>
              ) : (
                <Fragment key={i}>{char}</Fragment>
              )
            )}
          </span>
        );
      })}
    </>
  );
}
