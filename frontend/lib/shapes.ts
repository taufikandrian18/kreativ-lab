// Pure SVG shape generators, kept out of the 'use client' motion modules that draw with
// them. A server component cannot call a function exported from a client module — Next
// refuses at render ("Attempted to call burstPoints() from the server") — and the case
// study's number sticker is a server component.

/** A burst of `points` spikes, as an SVG polygon in a 0–100 box. */
export function burstPoints(points = 14, inner = 26, outer = 50): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    out.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return out.join(' ');
}

/** A deterministic ragged line: the same tear on every build, different per seed. */
export function tearPoints(seed: number, steps = 64): string {
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points = ['0,0'];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    // Mostly shallow with the occasional deep bite, which is how paper actually tears.
    const depth = next() < 0.18 ? 55 + next() * 45 : 15 + next() * 35;
    points.push(`${x.toFixed(2)},${depth.toFixed(1)}`);
  }
  points.push('100,0');
  return points.join(' ');
}
