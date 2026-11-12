import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  OverlayArrow,
  type OverlayArrowRenderProps,
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  type TooltipRenderProps,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipTriggerComponentProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { racStyles } from '../../utils/stylex-rac';

export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end';

export interface TooltipTriggerProps extends TooltipTriggerComponentProps {
  /**
   * Milliseconds the pointer rests on the trigger before the tooltip shows. Once one tooltip is showing, moving
   * to another trigger shows its tooltip straight away. Keyboard focus shows it immediately.
   * @default 700
   */
  delay?: number;
}

/**
 * Connects a Tooltip to the element it describes. The first child is the trigger (a Button, IconButton or other
 * focusable Themis control); the second is the `Tooltip`.
 */
export function TooltipTrigger({ delay = 700, ...props }: TooltipTriggerProps) {
  return <AriaTooltipTrigger delay={delay} {...props} />;
}

export interface TooltipProps
  extends Omit<
    AriaTooltipProps,
    'className' | 'style' | 'children' | 'offset' | 'crossOffset' | 'arrowBoundaryOffset' | 'containerPadding' | 'placement'
  > {
  /** The hint. Plain text only: a tooltip can't be focused, so links and buttons inside it can't be reached. */
  children: ReactNode;
  /** Optional short heading above the text, in bold. */
  title?: ReactNode;
  /**
   * Side of the trigger the tooltip appears on. `start` and `end` line its edge up with the trigger's.
   * If there isn't room, it flips to the other side.
   * @default 'top'
   */
  placement?: TooltipPlacement;
  /** Layout-only StyleX overrides. Do not restyle colours, type or size. */
  xstyle?: stylex.StyleXStyles;
}

// Figma: the arrow is 18×12, its tip 8px outside the box and its base 4px inside, over the border.
const ARROW_OUT = 8;
// The arrow stays at least spacing.xs from the box's ends, so it doesn't sit on a rounded corner. Any larger and
// it no longer fits centred on the side of a one-line (40px) tooltip.
const ARROW_EDGE = 8;
// Space between the trigger and the arrow tip: spacing.2xs.
const GAP = 4;

/**
 * A short hint about a control, shown on hover and keyboard focus, such as "Copy link" on an icon button.
 * Built on React Aria `Tooltip`: it's linked to the trigger with aria-describedby, Escape closes it, and the
 * pointer can move onto it without it closing. Use inside a `TooltipTrigger`.
 */
export function Tooltip({ children, title, placement = 'top', xstyle, ...props }: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      placement={placement}
      offset={ARROW_OUT + GAP}
      containerPadding={16}
      arrowBoundaryOffset={ARROW_EDGE}
      {...racStyles<TooltipRenderProps>((s) => [
        styles.tooltip,
        s.isEntering && enter[s.placement ?? 'top'],
        s.isExiting && styles.exit,
        xstyle,
      ])}
    >
      <OverlayArrow {...racStyles<OverlayArrowRenderProps>((s) => [styles.arrow, arrowAt[s.placement ?? 'top']])}>
        {({ placement: side }) => <Arrow side={side ?? 'top'} />}
      </OverlayArrow>
      {title != null && <span {...stylex.props(styles.title)}>{title}</span>}
      <span {...stylex.props(styles.text)}>{children}</span>
    </AriaTooltip>
  );
}

/**
 * Drawn pointing down (tooltip above the trigger) and rotated for the other sides. The fill covers the box's
 * border where they meet. The outline starts at the border's inner edge (not the box's outer edge), so it runs
 * through the border's thickness and joins it without a step; inside the box it's hidden.
 */
function Arrow({ side }: { side: 'top' | 'bottom' | 'left' | 'right' | 'center' }) {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" {...stylex.props(styles.arrowSvg, rotate[side])}>
      <defs>
        <clipPath id="themis-tooltip-arrow-outside">
          <rect x="-10" y="4" width="38" height="20" {...stylex.props(styles.arrowClip)} />
        </clipPath>
      </defs>
      <path d="M0 0L9 12L18 0Z" {...stylex.props(styles.arrowFill)} />
      <path d="M0 0L9 12L18 0" clipPath="url(#themis-tooltip-arrow-outside)" {...stylex.props(styles.arrowLine)} />
    </svg>
  );
}

const fadeIn = stylex.keyframes({ from: { opacity: 0 } });
const fadeOut = stylex.keyframes({ to: { opacity: 0 } });
const fromBelow = stylex.keyframes({ from: { opacity: 0, transform: `translateY(${GAP}px)` } });
const fromAbove = stylex.keyframes({ from: { opacity: 0, transform: `translateY(-${GAP}px)` } });
const fromRight = stylex.keyframes({ from: { opacity: 0, transform: `translateX(${GAP}px)` } });
const fromLeft = stylex.keyframes({ from: { opacity: 0, transform: `translateX(-${GAP}px)` } });

const styles = stylex.create({
  tooltip: {
    position: 'relative',
    zIndex: 300,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    // Figma: 320px at most; never closer than spacing.sm to the screen edges.
    maxWidth: `min(20rem, calc(100vw - 2 * ${spacing.sm}))`,
    // Figma's stroke is inside the box, so the border comes off the padding (40px tall for one line).
    paddingBlock: `calc(${spacing.xs} - ${borderWidth.widthSm})`,
    paddingInline: `calc(${spacing.sm} - ${borderWidth.widthSm})`,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    backgroundColor: color.background,
    color: color.text,
    boxShadow: `${dropShadow.xDefault} ${dropShadow.yDefault} ${dropShadow.blurDefault} ${dropShadow.colorDefault}`,
    fontFamily: fontTheme.familyBody,
    outline: 'none',
    animationDuration: duration.base,
    animationTimingFunction: easing.standard,
  },
  exit: { animationName: fadeOut, animationFillMode: 'forwards' },
  // Figma type/label/base.
  title: { fontSize: font.sizeLabel, lineHeight: font.lineHeightLabel, fontWeight: font.weightSemibold },
  // Figma type/body/base.
  text: { fontSize: font.sizeSm, lineHeight: font.lineHeightSm, fontWeight: font.weightRegular },
  arrow: { display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  arrowSvg: { display: 'block', flexShrink: 0, overflow: 'visible' },
  arrowFill: { fill: color.background },
  // The svg's y=4 is the box's outer edge; move the clip up by the border width, to its inner edge.
  arrowClip: { transform: `translateY(calc(-1 * ${borderWidth.widthSm}))` },
  arrowLine: {
    fill: 'none',
    stroke: color.border,
    strokeWidth: borderWidth.widthSm,
    strokeLinejoin: 'miter',
  },
});

/** Slides 4px away from the trigger as it fades in; fades only with reduced motion. */
const enter = stylex.create({
  top: { animationName: { default: fromBelow, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  bottom: { animationName: { default: fromAbove, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  left: { animationName: { default: fromRight, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  right: { animationName: { default: fromLeft, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  center: { animationName: fadeIn },
});

/*
 * React Aria positions the arrow element from the inside of the border (e.g. `top: 100%` for a tooltip above the
 * trigger), but measures where it should point from the outside. These margins move its base to 4px inside the
 * box's outer edge, as in Figma, and take the border back off the cross axis so it points at the trigger's middle.
 */
const ARROW_IN = 4;
const inset = `calc(${borderWidth.widthSm} - ${ARROW_IN}px)`;
const unborder = `calc(-1 * ${borderWidth.widthSm})`;
const arrowAt = stylex.create({
  top: { width: '18px', height: '12px', marginTop: inset, marginLeft: unborder },
  bottom: { width: '18px', height: '12px', marginBottom: inset, marginLeft: unborder },
  left: { width: '12px', height: '18px', marginLeft: inset, marginTop: unborder },
  right: { width: '12px', height: '18px', marginRight: inset, marginTop: unborder },
  center: {},
});

const rotate = stylex.create({
  top: {},
  bottom: { transform: 'rotate(180deg)' },
  left: { transform: 'rotate(-90deg)' },
  right: { transform: 'rotate(90deg)' },
  center: {},
});
