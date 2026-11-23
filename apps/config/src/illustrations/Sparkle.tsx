// The Figma "Star 5" (node 2002:21842), drawn from its geometry (star.ts). Brand fill, color.border outline.
import * as stylex from '@stylexjs/stylex';
import { useId, useRef } from 'react';
import type { ThemeRadius } from 'themis-ds';

import { border as borderWidth } from '../../../../src/tokens/borderWidth.stylex';
import { color } from '../../../../src/tokens/colorTheme.stylex';
import { lightBrand } from './ScalesIllustration';
import { starPath } from './star';
import { useTwinkleOnThemeChange } from './twinkle';

const c = { brand: color.brand, line: color.border } as unknown as Record<'brand' | 'line', string>;

export interface SparkleProps {
  /** Rendered width; the height follows the drawing's proportions. */
  width?: number | string;
  /** Lighten the brand fill by 50%, as the scales illustration does for dark brands, so the two match. */
  lightenBrand?: boolean;
  /** The theme's radius: the star's points are sharp with none, softer from small to large. */
  radius?: ThemeRadius;
  xstyle?: stylex.StyleXStyles;
}

/**
 * A four-pointed star. Its outline takes the theme's border width (border/width/sm: none in borderless themes), as the
 * scales illustration's do; its points follow the theme's radius; and it twinkles when the theme changes. Decoration only: hidden from assistive tech.
 */
export function Sparkle({ width, lightenBrand = false, radius = 'medium', xstyle }: SparkleProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const d = starPath(9.5, 9.5, 9.5, radius);
  const star = useRef<SVGGElement>(null);
  useTwinkleOnThemeChange([star]);
  return (
    <svg viewBox="0 0 19 19" width={width} fill="none" aria-hidden="true" focusable="false" {...stylex.props(styles.svg, xstyle)}>
      <g ref={star} data-part="star" {...stylex.props(styles.star)}>
        <path d={d} style={{ fill: lightenBrand ? lightBrand : c.brand }} />
        {/* An inside outline, as the illustration's: twice the width, masked to the star. */}
        <mask id={`${uid}star`} fill="white">
          <path d={d} />
        </mask>
        <path
          d={d}
          mask={`url(#${uid}star)`}
          vectorEffect="non-scaling-stroke"
          style={{ stroke: c.line, strokeWidth: `calc(2 * ${borderWidth.widthSm as unknown as string})` }}
        />
      </g>
    </svg>
  );
}

const styles = stylex.create({
  svg: { display: 'block', height: 'auto', overflow: 'visible' },
  // It twinkles around its own middle.
  star: { transformBox: 'fill-box', transformOrigin: 'center' },
});
