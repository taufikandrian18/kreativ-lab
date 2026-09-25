// Justified rows for a case-study gallery: tiles are packed into rows whose aspect ratios
// add up to about `target`, and every row is then set at the height that makes it exactly
// fill the width. Every photograph keeps its own proportions, no row has a hole in it,
// and the rhythm changes from study to study because the photography does.
//
// Replaces a 12-column grid that spanned tiles by shape. With four DRX tiles it left one
// alone on its last row beside a screen of empty black — the grid had columns to fill and
// nothing to fill them with.

export interface Sized {
  w: number;
  h: number;
}

/** A row whose ratios add to less than this share of the target is too short to stand alone. */
const ORPHAN = 0.6;

export function justifyRows<T extends Sized>(tiles: readonly T[], target = 2.6): T[][] {
  const rows: T[][] = [];
  let row: T[] = [];
  let sum = 0;
  for (const tile of tiles) {
    row.push(tile);
    sum += tile.w / tile.h;
    if (sum >= target) {
      rows.push(row);
      row = [];
      sum = 0;
    }
  }
  if (row.length > 0) {
    // A short tail joins the row above rather than sitting alone at a height that
    // towers over everything else in the gallery.
    if (rows.length > 0 && sum < target * ORPHAN) rows[rows.length - 1].push(...row);
    else rows.push(row);
  }
  return rows;
}
