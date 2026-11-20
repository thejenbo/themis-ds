import * as stylex from '@stylexjs/stylex';

import { duration } from '../../../../src/tokens/motion.stylex';

interface LogomarkProps {
  /** The fill: the brand colour of the theme being edited. Without it the mark is drawn in the text colour. */
  brand?: string;
  /** Tip the scales, as when a colour in the theme fails contrast: the beam tilts and one pan drops. */
  isUnbalanced?: boolean;
  xstyle?: stylex.StyleXStyles;
}

/**
 * The Themis logomark: a pair of scales, drawn in lines like the Themis icons (logomark option E, 2026-11-20).
 * Filled with the theme's brand colour and outlined in the text colour, so a pale brand still reads. When the theme
 * fails contrast the scales tip, as if no longer equal. Decorative; the wordmark names it.
 *
 * Each part is drawn twice: a wider outline in the text colour underneath, then the brand-coloured part on top,
 * leaving a thin outline (OUTLINE units) all round.
 */
export function Logomark({ brand, isUnbalanced = false, xstyle }: LogomarkProps) {
  const fill = brand ?? 'currentColor';
  const parts = (role: 'outline' | 'fill') => {
    const color = role === 'outline' ? 'currentColor' : fill;
    const line = role === 'outline' ? LINE + 2 * OUTLINE : LINE;
    // Filled bars (pole, base) get their outline from a stroke under the fill.
    const bar = role === 'outline' ? { stroke: color, strokeWidth: 2 * OUTLINE } : {};
    return (
      <g>
        <g fill={color} {...bar}>
          <rect x="22.5" y="2.5" width="3" height="29.5" rx="0.75" />
          <rect x="16.5" y="31.5" width="15" height="3" rx="0.75" />
          <rect x="10.5" y="35.5" width="27" height="3" rx="0.75" />
        </g>
        <g fill="none" stroke={color} strokeWidth={line} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 11.5H43" {...stylex.props(styles.part, styles.beam, isUnbalanced && styles.beamTipped)} />
          {/* Each pan hangs from its end of the beam, and rises or drops with it. */}
          <g {...stylex.props(styles.part, isUnbalanced && styles.panDown)}>
            <path d="M5 11.5L1.5 23M5 11.5L8.5 23" />
            <path d="M1.5 23h7a3.5 3.5 0 0 1-7 0z" fill={role === 'fill' ? fill : color} />
          </g>
          <g {...stylex.props(styles.part, isUnbalanced && styles.panUp)}>
            <path d="M43 11.5L39.5 23M43 11.5L46.5 23" />
            <path d="M39.5 23h7a3.5 3.5 0 0 1-7 0z" fill={role === 'fill' ? fill : color} />
          </g>
        </g>
      </g>
    );
  };
  return (
    <svg
      width="48"
      height="40"
      viewBox="0 0 48 40"
      fill="none"
      aria-hidden="true"
      data-unbalanced={isUnbalanced || undefined}
      {...stylex.props(styles.svg, xstyle)}
    >
      {parts('outline')}
      {parts('fill')}
    </svg>
  );
}

/** The width of the lines, and of the outline around every part, in viewBox units. */
const LINE = 3;
const OUTLINE = 0.6;
/** How far the scales tip, and how far each beam end (and its pan) moves with it: 19 × sin 8°. */
const TILT = '-8deg';
const DROP = '2.6px';

// A tip with a little settle at the end, like a balance coming to rest. None with reduced motion.
const tip = {
  transitionProperty: 'transform',
  transitionDuration: { default: `calc(${duration.slow} * 3)`, '@media (prefers-reduced-motion: reduce)': '0s' },
  transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
} as const;

const styles = stylex.create({
  // The outline reaches a little past the drawing's edges (0.6 units), so let it show.
  svg: { display: 'block', flexShrink: 0, overflow: 'visible' },
  part: { transformBox: 'view-box', ...tip },
  // The beam pivots on the pole.
  beam: { transformOrigin: '24px 11.5px' },
  beamTipped: { transform: `rotate(${TILT})` },
  panDown: { transform: `translateY(${DROP})` },
  panUp: { transform: `translateY(-${DROP})` },
});
