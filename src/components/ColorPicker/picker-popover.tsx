import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';
import {
  Button,
  type ButtonRenderProps,
  type Color,
  ColorSwatchPicker,
  Dialog,
  DialogTrigger,
  Disclosure,
  DisclosurePanel,
  Popover,
  type PopoverProps,
  type PopoverRenderProps,
  parseColor,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { textStyles } from '../../styles/type-styles';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { baseStyles, blockPadding, disabledSurfaces, layers, surfaces } from '../Button/button-base';
import { ColorArea } from '../ColorArea';
import { ColorPickerSwatch, ColorPickerSwatchItem, type ColorPickerSwatchSize } from '../ColorPickerSwatch';
import { ColorSlider } from '../ColorSlider';
import { ColorSwatch } from '../ColorSwatch';
import { Icon } from '../Icon';

/** Figma: six 40px recent-color slots, 8px apart, span the panel's 280px exactly. */
export const RECENT_SLOTS = 6;

/** The panel's options, shared by ColorPicker and ColorField. */
export interface PickerPanelOptions {
  /**
   * Recent colors, newest first, shown under the sliders. Keep the list in your app (e.g. add the color from
   * `onChangeEnd`) and pass it in; the picker doesn't remember colors itself. Up to 6 are shown, and unused slots
   * show empty placeholders. Leave it out to hide the section.
   */
  recentColors?: (string | Color)[];
  /**
   * The recent colors' heading. Pass a translation here.
   * @default 'Recently used'
   */
  recentColorsLabel?: string;
  /** Shows the "Advanced" button, which opens Saturation, Brightness and Hue sliders. */
  showAdvanced?: boolean;
  /** Whether the advanced sliders are open (controlled). */
  isAdvancedOpen?: boolean;
  /** Whether the advanced sliders start open (uncontrolled). */
  defaultAdvancedOpen?: boolean;
  /** Called when the advanced sliders open or close. */
  onAdvancedOpenChange?: (isOpen: boolean) => void;
  /**
   * The advanced button's text. Pass a translation here.
   * @default 'Advanced'
   */
  advancedLabel?: string;
  /**
   * Labels for the sliders and the area, for screen readers and the advanced sliders' headings. Pass translations here.
   * @default { area: 'Saturation and brightness', saturation: 'Saturation', brightness: 'Brightness', hue: 'Hue' }
   */
  channelLabels?: {
    area?: string;
    saturation?: string;
    brightness?: string;
    hue?: string;
  };
}

interface PickerPopoverProps extends PickerPanelOptions {
  /** Name for the swatch button and the dialog, e.g. "Pick a color". */
  triggerLabel: string;
  /** The swatch button's size. */
  size: ColorPickerSwatchSize;
  isDisabled?: boolean;
  placement?: PopoverProps['placement'];
  /** Called once a change is finished (let go of a slider, chose a recent color). */
  onChangeEnd?: (value: Color) => void;
}

/**
 * The swatch button and the popover it opens. Must be inside a React Aria `ColorPicker`, which holds the color: every
 * part here reads and changes it through context.
 */
export function PickerPopover({
  triggerLabel,
  size,
  isDisabled,
  placement = 'bottom start',
  onChangeEnd,
  ...panel
}: PickerPopoverProps) {
  return (
    <DialogTrigger>
      <ColorPickerSwatch size={size} isDisabled={isDisabled} aria-label={triggerLabel} />
      <Popover
        placement={placement}
        offset={4}
        containerPadding={16}
        {...racStyles<PopoverRenderProps>((p) => [
          styles.popover,
          p.isEntering && styles.enter,
          p.isExiting && styles.exit,
        ])}
      >
        <Dialog aria-label={triggerLabel} {...stylex.props(styles.dialog)}>
          <PickerPanel {...panel} onChangeEnd={onChangeEnd} />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

function PickerPanel({
  recentColors,
  recentColorsLabel = 'Recently used',
  showAdvanced = false,
  isAdvancedOpen,
  defaultAdvancedOpen,
  onAdvancedOpenChange,
  advancedLabel = 'Advanced',
  channelLabels,
  onChangeEnd,
}: PickerPanelOptions & { onChangeEnd?: (value: Color) => void }) {
  const labels = {
    area: 'Saturation and brightness',
    saturation: 'Saturation',
    brightness: 'Brightness',
    hue: 'Hue',
    ...channelLabels,
  };
  const recentId = useId();
  const recents = recentColors?.slice(0, RECENT_SLOTS).map((c) => (typeof c === 'string' ? parseColor(c) : c));

  const content = (open: boolean) => (
    <div {...stylex.props(styles.panel, showAdvanced && !open && styles.panelAdvancedClosed)}>
      <div {...stylex.props(styles.top)}>
        <ColorArea
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
          aria-label={labels.area}
          onChangeEnd={onChangeEnd}
        />
        {showAdvanced && <AdvancedButton label={advancedLabel} isExpanded={open} />}
      </div>
      <div {...stylex.props(styles.bottom)}>
        {open ? (
          <DisclosurePanel {...stylex.props(styles.sliders)}>
            <ColorSlider
              colorSpace="hsb"
              channel="saturation"
              label={labels.saturation}
              showValue={false}
              onChangeEnd={onChangeEnd}
            />
            <ColorSlider
              colorSpace="hsb"
              channel="brightness"
              label={labels.brightness}
              showValue={false}
              onChangeEnd={onChangeEnd}
            />
            <ColorSlider
              colorSpace="hsb"
              channel="hue"
              label={labels.hue}
              showValue={false}
              onChangeEnd={onChangeEnd}
            />
          </DisclosurePanel>
        ) : (
          <ColorSlider colorSpace="hsb" channel="hue" aria-label={labels.hue} onChangeEnd={onChangeEnd} />
        )}
        {recents && (
          <div {...stylex.props(styles.recent)}>
            <span id={recentId} {...stylex.props(textStyles.label, styles.recentLabel)}>
              {recentColorsLabel}
            </span>
            <div {...stylex.props(styles.recentRow)}>
              {recents.length > 0 && (
                // Wrapped, so React Aria's hidden helper elements beside the list don't take a gap in the row.
                <div {...stylex.props(styles.recentList)}>
                  <ColorSwatchPicker
                    aria-labelledby={recentId}
                    // React Aria's ColorPicker sets the color; choosing a recent one also finishes a change, like letting
                    // go of a slider.
                    onChange={(c) => onChangeEnd?.(c)}
                    {...stylex.props(styles.recentRow)}
                  >
                    {recents.map((c) => (
                      <ColorPickerSwatchItem key={c.toString('hexa')} color={c} />
                    ))}
                  </ColorSwatchPicker>
                </div>
              )}
              {Array.from({ length: RECENT_SLOTS - recents.length }, (_, i) => (
                <ColorSwatch key={i} variant="empty" size="large" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!showAdvanced) return content(false);
  return (
    <Disclosure
      isExpanded={isAdvancedOpen}
      defaultExpanded={defaultAdvancedOpen}
      onExpandedChange={onAdvancedOpenChange}
    >
      {({ isExpanded }) => content(isExpanded)}
    </Disclosure>
  );
}

/**
 * Figma "Toggle Button" (small, settings icon on the right): an outline brand Button when closed, filled when open.
 * It shows and hides the sliders, so it's a disclosure button (aria-expanded), not a toggle (aria-pressed).
 */
function AdvancedButton({ label, isExpanded }: { label: string; isExpanded: boolean }) {
  return (
    <Button
      slot="trigger"
      data-themis-touch-target=""
      {...racStyles<ButtonRenderProps>((s) => [
        baseStyles.root,
        styles.advanced,
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
      ])}
    >
      {(s) => {
        const look = isExpanded ? 'default' : 'outline';
        const active = (s.isHovered || s.isPressed) && !s.isDisabled;
        return (
          <span
            {...stylex.props(
              baseStyles.surface,
              styles.advancedSurface,
              pressMotion.base,
              blockPadding.small,
              surfaces.brand[look],
              layers.brand[look],
              active && baseStyles.stateLayerOn,
              s.isPressed && !s.isDisabled && pressMotion.pressed,
              s.isDisabled && disabledSurfaces[look],
            )}
          >
            <span {...stylex.props(baseStyles.slot)}>{label}</span>
            <span aria-hidden="true" {...stylex.props(baseStyles.slot)}>
              <Icon name="settings" />
            </span>
          </span>
        );
      }}
    </Button>
  );
}

const fadeIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
});
const fadeOut = stylex.keyframes({ to: { opacity: 0 } });

const styles = stylex.create({
  // Figma "ColorPicker": background, border/width/lg in color/border, radius lg, the default drop shadow.
  popover: {
    boxSizing: 'border-box',
    maxWidth: 'calc(100vw - 32px)',
    borderStyle: 'solid',
    borderWidth: borderWidth.widthLg,
    borderColor: color.border,
    borderRadius: radius.radiusLg,
    backgroundColor: color.background,
    boxShadow: `${dropShadow.xDefault} ${dropShadow.yDefault} ${dropShadow.blurDefault} ${dropShadow.colorDefault}`,
    outline: 'none',
    // React Aria limits the popover to the space on screen; the content scrolls inside it rather than squashing.
    overflowY: 'auto',
    animationDuration: duration.base,
    animationTimingFunction: easing.standard,
  },
  enter: { animationName: fadeIn },
  exit: { animationName: fadeOut, animationFillMode: 'forwards' },
  dialog: { outline: 'none' },
  // 24px padding around 280px of content; 16px between the area, the sliders and the recent colors (24px under
  // the Advanced button while it's closed, so the button doesn't crowd the hue slider).
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    boxSizing: 'border-box',
    width: `calc(17.5rem + 2 * ${spacing.md})`,
    maxWidth: '100%',
    padding: spacing.md,
  },
  panelAdvancedClosed: { gap: spacing.md },
  top: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  advanced: { alignSelf: 'flex-end' },
  advancedSurface: { paddingInline: spacing.sm },
  bottom: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  sliders: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  recent: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  recentLabel: { color: color.text },
  // Six 40px swatches 8px apart fill the 280px row.
  recentRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xs },
  recentList: { display: 'flex' },
});
