import * as stylex from '@stylexjs/stylex';
import { createElement } from 'react';

import { iconStyle } from '../../theme/icon-style.stylex';
import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { type IconName, type IconShape, iconSet } from './icon-set';

export type { IconName } from './icon-set';
export { iconNames } from './icon-set';

export type IconSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface IconProps {
  /** Which icon. The Themis set is a chosen subset of Lucide, under Lucide's names (see the Gallery story). */
  name: IconName;
  /**
   * 16, 20, 24 or 32px (in rem, so it follows the text size setting). Icons next to labels in Button, IconButton and
   * inputs are `small`.
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
 * An icon from the Themis set, drawn in the current text colour. Its lines follow the theme: the stroke follows the
 * border width (`border/width/mandatory`, kept between 1.5 and 2.75 on the 24px grid so icons never fade or clog), and
 * with radius `none` corners turn sharp, line ends flat, and a few icons switch to hand-drawn sharp versions.
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
          <g {...stylex.props(styles.round)}>{draw(shapes)}</g>
          <g {...stylex.props(styles.sharp)}>{draw(sharp)}</g>
        </>
      ) : (
        draw(shapes)
      )}
    </svg>
  );
}

/** Lucide marks dots as zero-length lines (`h.01`) or tiny circles (r 1 or 0.5). */
const isDotLine = (tag: string, attributes: Record<string, string>) => tag === 'path' && /[hv]\.01$/.test(attributes.d ?? '');
const isDotCircle = (tag: string, attributes: Record<string, string>) => tag === 'circle' && Number(attributes.r) <= 1;

function draw(shapes: IconShape[]) {
  return shapes.map(([tag, attributes, options], index) =>
    createElement(tag, {
      key: index,
      ...attributes,
      // A tiny circle only looks solid while the stroke covers its centre; below a 2-unit stroke it shows a hole.
      ...(isDotCircle(tag, attributes) && { fill: 'currentColor' }),
      ...stylex.props(
        isDotLine(tag, attributes) && styles.dotLine,
        tag === 'rect' && styles.rect,
        options?.detail && styles.detail,
      ),
    }),
  );
}

// On the 24 × 24 grid, so it scales with the icon (16px icons get two thirds of it).
const STROKE = `clamp(1.5px, ${borderWidth.widthMandatory}, 2.75px)`;

const styles = stylex.create({
  icon: {
    flexShrink: 0,
    verticalAlign: 'middle',
    strokeWidth: STROKE,
    strokeLinejoin: iconStyle.join,
    strokeLinecap: iconStyle.cap,
  },
  round: { display: iconStyle.round },
  sharp: { display: iconStyle.sharp },
  // Flat ends would hide a zero-length line, so dots keep round or square ends.
  dotLine: { strokeLinecap: iconStyle.dotCap },
  // Rectangles inside icons (Copy, CreditCard, Calendar) follow the radius, up to Lucide's own corners.
  rect: { rx: `min(calc(${radius.radiusXs} / 2), 4px)` },
  detail: { strokeWidth: `min(${STROKE}, 2px)` },
});

const sizes = stylex.create({
  small: { width: '1rem', height: '1rem' },
  medium: { width: '1.25rem', height: '1.25rem' },
  large: { width: '1.5rem', height: '1.5rem' },
  xlarge: { width: '2rem', height: '2rem' },
});
