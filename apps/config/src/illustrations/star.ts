import type { ThemeRadius } from 'themis-ds';

/**
 * The four-pointed star of the Themis illustrations, drawn from its geometry so its points can follow the theme's
 * radius: sharp with radius none, softer from small to large. (Figma's stars are the medium look.)
 */

/** How much of each edge the rounding takes, at each corner, per theme radius. */
const ROUNDING: Record<ThemeRadius, number> = { none: 0, small: 0.1, medium: 0.2, large: 0.32 };
/** How far the inner corners sit from the middle, as a share of the points' reach (Figma's stars: about 0.4). */
const INNER = 0.4;

/** A star centered on (cx, cy) reaching `r` to each point, with its corners rounded for the theme radius. */
export function starPath(cx: number, cy: number, r: number, radius: ThemeRadius = 'medium'): string {
  const cut = ROUNDING[radius] ?? ROUNDING.medium;
  const corners = Array.from({ length: 8 }, (_, k) => {
    const a = ((-90 + k * 45) * Math.PI) / 180;
    const reach = k % 2 === 0 ? r : r * INNER;
    return [cx + reach * Math.cos(a), cy + reach * Math.sin(a)] as const;
  });
  const f = (n: number) => +n.toFixed(2);
  if (cut === 0) return `M${corners.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
  // Each corner becomes a curve from `cut` of the way along the edge before it to `cut` along the edge after it,
  // pulled towards the corner.
  const along = (from: readonly [number, number], to: readonly [number, number]) => [
    from[0] + (to[0] - from[0]) * cut,
    from[1] + (to[1] - from[1]) * cut,
  ];
  let d = '';
  corners.forEach((v, i) => {
    const prev = corners[(i + 7) % 8]!;
    const next = corners[(i + 1) % 8]!;
    const [ax, ay] = along(v, prev);
    const [bx, by] = along(v, next);
    d += `${i === 0 ? 'M' : 'L'}${f(ax!)} ${f(ay!)}Q${f(v[0])} ${f(v[1])} ${f(bx!)} ${f(by!)}`;
  });
  return `${d}Z`;
}
