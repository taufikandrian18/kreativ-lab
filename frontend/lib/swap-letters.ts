// Crency sets its display lines in a compressed grotesque and swaps one or two letters
// per line into a wide, light face — the 'e' in WEBSITES, the 'S' in DESIGNED. The
// contrast is the whole trick: one letter breathing inside a line that is otherwise
// packed tight. Here the compressed face is Anton and the wide one is Archivo at its
// widest and lightest, a face the site already ships.
//
// Which letters swap is decided here, from the text alone, so an editor retyping a
// headline in WordPress still gets the treatment without learning any markup, and the
// same headline swaps the same letters on every build.

/**
 * Letters whose wide form reads as a deliberate swap: the rounds, plus R and lowercase e,
 * which Crency swaps too (bRands, wEbsites). Not capital E: at this weight its three
 * hairline arms read as a bracket, "EV⊏RYWHERE" — seen in a browser. An I, L or T set
 * wide just looks like a spacing bug.
 */
const ROUND = /[OSCGQRoscegr]/;

/** At most this many letters per headline. More than two and it stops being an accent. */
export const MAX_SWAPS = 2;

interface Word {
  text: string;
  start: number;
}

function words(text: string): Word[] {
  const out: Word[] = [];
  for (const match of text.matchAll(/[A-Za-z']+/g)) {
    out.push({ text: match[0], start: match.index ?? 0 });
  }
  return out;
}

/** The letter inside a word to swap: the first round one after the opening letter. */
function letterIn(word: Word): number | null {
  for (let i = 1; i < word.text.length; i++) {
    if (ROUND.test(word.text[i])) return word.start + i;
  }
  return ROUND.test(word.text[0]) ? word.start : null;
}

/**
 * Character indices of `text` to set in the wide face.
 *
 * The longest word that has a swappable letter always gets one, since a long word carries
 * the swap without losing legibility. A headline of three words or more also swaps in
 * its last such word, so a two-line headline has an accent on each line.
 */
export function swapPlan(text: string, max: number = MAX_SWAPS): Set<number> {
  const candidates = words(text).filter((w) => w.text.length >= 3 && letterIn(w) !== null);
  const plan = new Set<number>();
  if (candidates.length === 0 || max < 1) return plan;

  const longest = candidates.reduce((a, b) => (b.text.length > a.text.length ? b : a));
  plan.add(letterIn(longest)!);

  const last = candidates[candidates.length - 1];
  if (max > 1 && last !== longest && words(text).length >= 3) plan.add(letterIn(last)!);

  return plan;
}
