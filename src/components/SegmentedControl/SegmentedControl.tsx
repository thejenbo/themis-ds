import * as stylex from '@stylexjs/stylex';
import { Children, createContext, Fragment, isValidElement, type ReactElement, type ReactNode, useContext } from 'react';
import {
  composeRenderProps,
  type Key,
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonGroupRenderProps,
  type ToggleButtonProps,
  type ToggleButtonRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { baseStyles, type ButtonSize, disabledSurfaces, layers, surfaces } from '../Button/button-base';

export type SegmentedControlSize = ButtonSize;

type Position = 'first' | 'middle' | 'last' | 'only';
const ItemContext = createContext<{ size: SegmentedControlSize; position: Position; isFullWidth: boolean }>({
  size: 'small',
  position: 'middle',
  isFullWidth: false,
});

interface SegmentedControlBaseProps
  extends Omit<
    ToggleButtonGroupProps,
    | 'className'
    | 'style'
    | 'children'
    | 'selectionMode'
    | 'disallowEmptySelection'
    | 'selectedKeys'
    | 'defaultSelectedKeys'
    | 'onSelectionChange'
    | 'orientation'
  > {
  /** `SegmentedControlItem`s, each with a unique `id`. */
  children: ReactNode;
  /** The selected item's `id` (controlled). Use with `onSelectionChange`. */
  selectedKey?: Key;
  /** The item selected at first (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Called with the newly selected item's `id`. */
  onSelectionChange?: (key: Key) => void;
  /**
   * Height, matching Button of the same size: 24/32/40px on every screen.
   * @default 'small'
   */
  size?: SegmentedControlSize;
  /** Stretch to the container's width, with every item the same width. */
  isFullWidth?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible label elsewhere on the page (`aria-labelledby`) or a hidden one (`aria-label`) is required. */
export type SegmentedControlProps = SegmentedControlBaseProps &
  ({ 'aria-label': string; 'aria-labelledby'?: string } | { 'aria-label'?: string; 'aria-labelledby': string });

/**
 * A row of joined buttons for picking one option, where the choice takes effect straight away, such as switching
 * units ("cm / in") or views ("List / Grid"). Built on React Aria `ToggleButtonGroup` in single-select mode:
 * screen readers announce a radio group, the arrow keys move between items, and one item is always selected.
 */
export function SegmentedControl({
  children,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  size = 'small',
  isFullWidth = false,
  xstyle,
  ...props
}: SegmentedControlProps) {
  const items = flattenItems(children);
  const positionOf = (i: number): Position =>
    items.length === 1 ? 'only' : i === 0 ? 'first' : i === items.length - 1 ? 'last' : 'middle';
  return (
    <ToggleButtonGroup
      {...props}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={selectedKey !== undefined ? [selectedKey] : undefined}
      defaultSelectedKeys={defaultSelectedKey !== undefined ? [defaultSelectedKey] : undefined}
      onSelectionChange={(keys) => {
        const [key] = keys;
        if (key !== undefined) onSelectionChange?.(key);
      }}
      {...racStyles<ToggleButtonGroupRenderProps>((s) => [
        styles.group,
        size !== 'micro' && styles.groupMd,
        isFullWidth && styles.groupFull,
        s.isDisabled && styles.groupDisabled,
        xstyle,
      ])}
    >
      {items.map((item, i) => (
        <ItemContext.Provider key={item.key ?? i} value={{ size, position: positionOf(i), isFullWidth }}>
          {item}
        </ItemContext.Provider>
      ))}
    </ToggleButtonGroup>
  );
}

/** Items in order, looking through Fragments, so first/last corners are right however the items are passed. */
function flattenItems(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenItems(child.props.children)
      : isValidElement(child)
        ? [child]
        : [],
  );
}

export interface SegmentedControlItemProps extends Omit<ToggleButtonProps, 'className' | 'style' | 'id' | 'isSelected' | 'defaultSelected' | 'onChange'> {
  /** Unique within the control; this is what `selectedKey` and `onSelectionChange` use. */
  id: Key;
  /** The label. Keep it to a word or two. Icon-only items need `aria-label`. */
  children: ReactNode;
}

/** One option in a `SegmentedControl`. */
export function SegmentedControlItem({ children, ...props }: SegmentedControlItemProps) {
  const { size, position, isFullWidth } = useContext(ItemContext);
  return (
    <ToggleButton
      {...props}
      data-themis-touch-target=""
      {...racStyles<ToggleButtonRenderProps>((s) => [
        baseStyles.root,
        styles.item,
        size === 'micro' ? cornersSm[position] : cornersMd[position],
        size !== 'micro' && styles.itemInset,
        isFullWidth && styles.itemFull,
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isFocusVisible && styles.itemFocused,
        s.isFocusVisible && (size === 'micro' ? ringCornersSm[position] : ringCornersMd[position]),
        s.isDisabled ? interactiveCursor.disabled : s.isSelected ? styles.cursorSelected : interactiveCursor.enabled,
      ])}
    >
      {composeRenderProps(children, (children, s) => {
        const look = s.isSelected ? 'default' : 'outline';
        // Selecting the selected item again does nothing, so it has no hover.
        const active = (s.isHovered || s.isPressed) && !s.isDisabled && !s.isSelected;
        return (
          <span
            data-themis-part="surface"
            {...stylex.props(
              baseStyles.surface,
              styles.surface,
              surfaceSizes[size],
              surfaces.brand[look],
              layers.brand[look],
              active && baseStyles.stateLayerOn,
              // Selected items have no hover, so the hover layer goes at once: fading it out would flash the selected
              // look's darker brand-hover over the fill as it fades in.
              s.isSelected && styles.layerOffAtOnce,
              s.isDisabled && disabledSurfaces[look],
              // The control has one outer border; items don't get the outline look's own border.
              styles.noItemBorder,
            )}
          >
            <span {...stylex.props(baseStyles.slot)}>{children}</span>
          </span>
        );
      })}
    </ToggleButton>
  );
}

// Focus ring geometry, matching utils/focus-ring.ts.
const ringOut = `calc(${spacing['3xs']} + ${borderWidth.widthFocusRing})`;

const styles = stylex.create({
  // The outer border is drawn on top of the items, like Figma's inside stroke, so it adds no size.
  group: {
    position: 'relative',
    display: 'inline-flex',
    verticalAlign: 'middle',
    backgroundColor: color.background,
    borderRadius: radius.radiusSm,
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: borderWidth.widthMandatory,
      borderColor: color.borderBrand,
      pointerEvents: 'none',
    },
  },
  // Figma: small and medium have border/radius/md corners; micro keeps sm.
  groupMd: { borderRadius: radius.radiusMd },
  groupFull: { display: 'flex', width: '100%' },
  groupDisabled: { '::after': { borderColor: system.borderDisabled } },
  item: {
    borderRadius: 0,
    // On touch screens, keep each item at least 44px wide so neighbouring touch areas don't overlap.
    minWidth: { default: '24px', '@media (pointer: coarse)': '44px' },
  },
  // Figma (small and medium): 4px between the selected fill or hover tint and the control's border; micro fills it.
  itemInset: { padding: spacing['2xs'] },
  itemFull: { flexGrow: 1, flexBasis: 0 },
  // Lift the focused item (and its ring) above its neighbours and the outer border.
  itemFocused: { zIndex: 2 },
  cursorSelected: { cursor: 'default' },
  layerOffAtOnce: { '::before': { transitionDuration: '0s' } },
  noItemBorder: { '::after': { borderWidth: 0 } },
  surface: {
    fontSize: font.sizeLabel,
    transitionProperty: 'background-color, color',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
});

/*
 * The fill (selected) and tint (hover) layer. Figma: 10px from the item's edge to the label on each side. Micro fills
 * the item, following its corners; small and medium sit 4px inside it (itemInset) with border/radius/sm corners (the
 * control's md less the 4px), so
 * they're 24px and 32px tall inside 32px and 40px items.
 */
const surfaceSizes = stylex.create({
  micro: { paddingBlock: 0, paddingInline: `calc(2 * ${spacing['2xs']} + ${spacing['3xs']})`, borderRadius: 'inherit' },
  small: { paddingBlock: 0, paddingInline: `calc(${spacing['2xs']} + ${spacing['3xs']})`, borderRadius: radius.radiusSm },
  medium: { paddingBlock: spacing['2xs'], paddingInline: `calc(${spacing['2xs']} + ${spacing['3xs']})`, borderRadius: radius.radiusSm },
});

/** Only the outer corners are rounded, matching the control: sm for micro, md for small and medium. */
const cornersSm = stylex.create({
  first: { borderStartStartRadius: radius.radiusSm, borderEndStartRadius: radius.radiusSm },
  middle: {},
  last: { borderStartEndRadius: radius.radiusSm, borderEndEndRadius: radius.radiusSm },
  only: { borderRadius: radius.radiusSm },
});

const cornersMd = stylex.create({
  first: { borderStartStartRadius: radius.radiusMd, borderEndStartRadius: radius.radiusMd },
  middle: {},
  last: { borderStartEndRadius: radius.radiusMd, borderEndEndRadius: radius.radiusMd },
  only: { borderRadius: radius.radiusMd },
});

/** The focus ring follows the item's corners: square inside the control, rounded at its ends. */
const ringCornersSm = stylex.create({
  first: {
    '::before': {
      borderRadius: ringOut,
      borderStartStartRadius: `calc(${radius.radiusSm} + ${ringOut})`,
      borderEndStartRadius: `calc(${radius.radiusSm} + ${ringOut})`,
    },
  },
  middle: { '::before': { borderRadius: ringOut } },
  last: {
    '::before': {
      borderRadius: ringOut,
      borderStartEndRadius: `calc(${radius.radiusSm} + ${ringOut})`,
      borderEndEndRadius: `calc(${radius.radiusSm} + ${ringOut})`,
    },
  },
  only: { '::before': { borderRadius: `calc(${radius.radiusSm} + ${ringOut})` } },
});

const ringCornersMd = stylex.create({
  first: {
    '::before': {
      borderRadius: ringOut,
      borderStartStartRadius: `calc(${radius.radiusMd} + ${ringOut})`,
      borderEndStartRadius: `calc(${radius.radiusMd} + ${ringOut})`,
    },
  },
  middle: { '::before': { borderRadius: ringOut } },
  last: {
    '::before': {
      borderRadius: ringOut,
      borderStartEndRadius: `calc(${radius.radiusMd} + ${ringOut})`,
      borderEndEndRadius: `calc(${radius.radiusMd} + ${ringOut})`,
    },
  },
  only: { '::before': { borderRadius: `calc(${radius.radiusMd} + ${ringOut})` } },
});
