import * as stylex from '@stylexjs/stylex';
import { createElement } from 'react';

import { iconStyle } from '../../theme/icon-style.stylex';
import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { type IconName, type IconShape, iconSet } from './icon-set';

export type { IconName } from './icon-set';
export { iconNames } from './icon-set';

export type IconSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

export interface IconProps {
  /** Which icon. The Themis set is a chosen subset of Lucide, under Lucide's names (see the Gallery story). */
  name: IconName;
  /**
   * 12, 16, 20, 24 or 32px (in rem, so it follows the text size setting). Icons next to labels in Button, IconButton and
   * inputs are `small`; Chip's are `xsmall`.
   * @default 'small'
   */
  size?: IconSize;
  /**
   * What the icon means, for icons that stand on their own (no visible text says the same thing). Without it the icon
   * is decorative and hidden from screen readers. Inside Button, IconButton and the like, leave it out: they're named
   * by their own label or `aria-label`.
   */
  'aria-label'?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colour or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * An icon from the Themis set, drawn in the current text colour. Its lines follow the theme: they're as thick as the
 * component borders (`border/width/mandatory`, from 1.25px up to a cap per size so small icons never clog), and with
 * radius `none` corners turn sharp, line ends flat, and a few icons switch to hand-drawn sharp versions.
 */
export function Icon({ name, size = 'small', 'aria-label': ariaLabel, xstyle }: IconProps) {
  const { shapes, sharp } = iconSet[name] as { shapes: IconShape[]; sharp?: IconShape[] };
  const a11y = ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : { 'aria-hidden': true };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      data-themis-icon={name}
      {...a11y}
      {...stylex.props(styles.icon, sizes[size], xstyle)}
    >
      {sharp ? (
        <>
          <g {...stylex.props(styles.round)}>{draw(shapes, size)}</g>
          <g {...stylex.props(styles.sharp)}>{draw(sharp, size)}</g>
        </>
      ) : (
        draw(shapes, size)
      )}
    </svg>
  );
}

/** Lucide marks dots as zero-length lines (`h.01`) or tiny circles (r 1 or 0.5). */
const isDotLine = (tag: string, attributes: Record<string, string>) => tag === 'path' && /[hv]\.01$/.test(attributes.d ?? '');
const isDotCircle = (tag: string, attributes: Record<string, string>) => tag === 'circle' && Number(attributes.r) <= 1;

function draw(shapes: IconShape[], size: IconSize) {
  return shapes.map(([tag, attributes, options], index) =>
    createElement(tag, {
      key: index,
      ...attributes,
      // A tiny circle only looks solid while the stroke covers its centre; below a 2-unit stroke it shows a hole.
      ...(isDotCircle(tag, attributes) && { fill: 'currentColor' }),
      ...stylex.props(
        isDotLine(tag, attributes) && styles.dotLine,
        tag === 'rect' && styles.rect,
        options?.detail && details[size],
      ),
    }),
  );
}

/*
 * Line weight. Icons draw their lines as thick as the component borders (`border/width/mandatory`) at every size, so
 * an icon reads as part of the component it sits in. Each size has a cap, so large borders don't crowd small icons,
 * and a floor of 1.25px for the thin border modes. The 24 × 24 grid is scaled to the icon's size, so each pixel value
 * is converted to grid units (× 24 / size).
 */
const stroke = (cap: string, units: number) => `calc(clamp(1.25px, ${borderWidth.widthMandatory}, ${cap}) * ${units})`;

const styles = stylex.create({
  icon: {
    flexShrink: 0,
    verticalAlign: 'middle',
    strokeLinejoin: iconStyle.join,
    strokeLinecap: iconStyle.cap,
  },
  round: { display: iconStyle.round },
  sharp: { display: iconStyle.sharp },
  // Flat ends would hide a zero-length line, so dots keep round or square ends.
  dotLine: { strokeLinecap: iconStyle.dotCap },
  // Rectangles inside icons (Copy, CreditCard, Calendar) follow the radius, up to Lucide's own corners.
  rect: { rx: `min(calc(${radius.radiusXs} / 2), 4px)` },
});

const sizes = stylex.create({
  xsmall: { width: '0.75rem', height: '0.75rem', strokeWidth: stroke('1.5px', 2) },
  small: { width: '1rem', height: '1rem', strokeWidth: stroke('2px', 1.5) },
  medium: { width: '1.25rem', height: '1.25rem', strokeWidth: stroke('2.25px', 1.2) },
  large: { width: '1.5rem', height: '1.5rem', strokeWidth: stroke('2.5px', 1) },
  xlarge: { width: '2rem', height: '2rem', strokeWidth: stroke('2.75px', 0.75) },
});

/** Small marks inside an outline (TriangleAlert's "!") are at most 2 grid units, so they keep clear of thick outlines. */
const details = stylex.create({
  xsmall: { strokeWidth: `min(${stroke('1.5px', 2)}, 2px)` },
  small: { strokeWidth: `min(${stroke('2px', 1.5)}, 2px)` },
  medium: { strokeWidth: `min(${stroke('2.25px', 1.2)}, 2px)` },
  large: { strokeWidth: `min(${stroke('2.5px', 1)}, 2px)` },
  xlarge: { strokeWidth: `min(${stroke('2.75px', 0.75)}, 2px)` },
});
