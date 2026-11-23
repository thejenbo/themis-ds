import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useContext, useEffect, useId, useRef, useState } from 'react';
import {
  Button,
  type ButtonRenderProps,
  type Color,
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
  ColorPickerStateContext,
  FieldError,
  Input,
  type InputRenderProps,
  type Key,
  Label,
  type PopoverProps,
  Select,
  SelectValue,
  Text,
  TextField,
  type TextFieldRenderProps,
  parseColor,
} from 'react-aria-components';

import { spacing } from '../../tokens/spacing.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { PickerPopover, type PickerPanelOptions } from '../ColorPicker/picker-popover';
import { CaretIcon, Dropdown, DropdownItem, triggerStyles } from '../Select/dropdown';
import { fieldStyles } from '../TextInput/field-base';
import { unitBoxStyles as unit } from '../UnitInput/UnitInput';

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';

const FORMAT_NAMES: Record<ColorFormat, string> = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL', hsb: 'HSB' };

interface ColorFieldBaseProps extends PickerPanelOptions {
  /** The current color (controlled), as a CSS color string or a parsed `Color`. Use with `onChange`. */
  value?: AriaColorPickerProps['value'];
  /** The starting color (uncontrolled). */
  defaultValue?: AriaColorPickerProps['defaultValue'];
  /** Called whenever the color changes: a valid code is entered, or the picker moves. */
  onChange?: (value: Color) => void;
  /**
   * Called once a change is finished: a code is entered (Enter or leaving the field), a picker slider is let go, or a
   * recent color is chosen. Add the color to your recent colors here.
   */
  onChangeEnd?: (value: Color) => void;
  /**
   * The color codes people can type. With more than one, a format button in the box switches between them (like
   * UnitInput's unit), and the code is shown in the chosen format.
   * @default ['hex']
   */
  formats?: ColorFormat[];
  /** The chosen format (controlled). */
  format?: ColorFormat;
  /** The format chosen at first (uncontrolled). Defaults to the first of `formats`. */
  defaultFormat?: ColorFormat;
  /** Called with the new format when one is chosen. */
  onFormatChange?: (format: ColorFormat) => void;
  /**
   * Added after the label to name the format button for screen readers ("Color format"). Pass a translation here.
   * @default 'format'
   */
  formatLabel?: string;
  /**
   * Names the swatch button that opens the picker, after the color's description. Pass a translation here.
   * @default 'Pick a color'
   */
  pickerLabel?: string;
  /** Shown in the box while it's empty. */
  placeholder?: string;
  /** Help text under the box. Linked to the field for screen readers. */
  description?: ReactNode;
  /**
   * Shown under the box when the code can't be read as a color, or when `isInvalid` is set. Pass a translation here.
   * @default 'Enter a color code, e.g. #7A1FEB'
   */
  errorMessage?: ReactNode;
  /** Marks the field invalid (e.g. from your own validation); shows `errorMessage`. */
  isInvalid?: boolean;
  /** Disables the field and the swatch button. */
  isDisabled?: boolean;
  /** Marks the field required for screen readers and form validation. */
  isRequired?: boolean;
  /** Adds "(optional)" after the label. */
  isOptional?: boolean;
  /**
   * Shown after the label, on its line but outside it, e.g. a contrast rating that opens details. Use this rather
   * than putting a button inside `label`: a button inside a label confuses clicks and screen readers.
   */
  labelAccessory?: ReactNode;
  /**
   * The word added after the label when `isOptional` is set. Pass a translation here.
   * @default 'optional'
   */
  optionalText?: string;
  /** Form field name; the code is submitted as typed in the chosen format. */
  name?: string;
  /**
   * Where the picker opens, relative to the swatch.
   * @default 'bottom end'
   */
  placement?: PopoverProps['placement'];
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible `label` is expected; `aria-label` only when the layout really can't show one. */
export type ColorFieldProps = ColorFieldBaseProps &
  ({ /** The field's name, shown above the box, e.g. "Color". */ label: ReactNode; 'aria-label'?: string } | { label?: undefined; 'aria-label': string });

/**
 * A color typed as a code (hex, and optionally RGB, HSL or HSB), with a ColorPickerSwatch beside the box that shows
 * the color and opens a ColorPicker. The code, the swatch and the picker share one color. Codes are read when the
 * person presses Enter or leaves the field; ones that can't be read show `errorMessage` and keep the color as it was.
 * Forgiving input: "7A1FEB" without a "#", and "122 31 235" in the RGB format, both work.
 */
export function ColorField({ value, defaultValue, onChange, ...props }: ColorFieldProps) {
  return (
    <AriaColorPicker value={value} defaultValue={defaultValue} onChange={onChange}>
      <ColorFieldInner {...props} />
    </AriaColorPicker>
  );
}

function ColorFieldInner({
  label,
  onChangeEnd,
  formats = ['hex'],
  format: formatProp,
  defaultFormat,
  onFormatChange,
  formatLabel = 'format',
  pickerLabel = 'Pick a color',
  placeholder,
  description,
  errorMessage = 'Enter a color code, e.g. #7A1FEB',
  isInvalid,
  isDisabled,
  isRequired,
  isOptional = false,
  optionalText = 'optional',
  labelAccessory,
  name,
  placement = 'bottom end',
  xstyle,
  'aria-label': ariaLabel,
  ...panel
}: Omit<ColorFieldProps, 'value' | 'defaultValue' | 'onChange'>) {
  const state = useContext(ColorPickerStateContext)!;
  const [formatState, setFormatState] = useState<ColorFormat>(defaultFormat ?? formats[0] ?? 'hex');
  const format = formatProp ?? formatState;
  // While typing, the box shows what was typed; otherwise the color in the chosen format.
  const [draft, setDraft] = useState<string | null>(null);
  const [unreadable, setUnreadable] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const formatWordId = useId();
  const formatValueId = useId();

  // A color chosen elsewhere (the picker, or a new `value`) replaces whatever is typed in the box, invalid or not:
  // the box shows the new color's code and any "can't read this" error goes. (Typing only changes the draft, and a
  // commit clears it itself, so this only runs for outside changes.)
  const colorKey = state.color.toString('hexa');
  const lastColorKey = useRef(colorKey);
  useEffect(() => {
    if (colorKey === lastColorKey.current) return;
    lastColorKey.current = colorKey;
    setDraft(null);
    setUnreadable(false);
  }, [colorKey]);

  const commit = () => {
    if (draft === null) return;
    const parsed = readColor(draft, format);
    if (!parsed) {
      setUnreadable(true);
      return;
    }
    state.setColor(parsed);
    onChangeEnd?.(parsed);
    setDraft(null);
    setUnreadable(false);
  };

  const chooseFormat = (key: Key | null) => {
    if (key == null) return;
    const next = key as ColorFormat;
    setFormatState(next);
    onFormatChange?.(next);
    setDraft(null);
    setUnreadable(false);
  };

  const fieldLabelledBy = label != null ? labelId : undefined;
  const formatWord = fieldLabelledBy ? formatLabel : `${ariaLabel ?? ''} ${formatLabel}`.trim();

  return (
    <TextField
      value={draft ?? formatColor(state.color, format)}
      onChange={(v) => {
        setDraft(v);
        setUnreadable(false);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        else e.continuePropagation();
      }}
      aria-label={ariaLabel}
      isInvalid={isInvalid || unreadable}
      isDisabled={isDisabled}
      isRequired={isRequired}
      name={name}
      {...racStyles<TextFieldRenderProps>(() => [fieldStyles.field, xstyle])}
    >
      {({ isDisabled: disabled, isInvalid: invalid }) => (
        <>
          {label != null && (
            <div {...stylex.props(styles.labelRow)}>
              <Label id={labelId} {...stylex.props(fieldStyles.label)}>
                {label}
                {isOptional && <span {...stylex.props(fieldStyles.optional)}> ({optionalText})</span>}
              </Label>
              {labelAccessory}
            </div>
          )}
          <div {...stylex.props(styles.row)}>
            <div
              ref={boxRef}
              {...stylex.props(fieldStyles.box, unit.box, styles.box, invalid && fieldStyles.boxInvalid, disabled && fieldStyles.boxDisabled)}
            >
              {/* An input can't draw the ring itself, so this wrapper carries it, as in UnitInput. */}
              <span
                {...stylex.props(
                  unit.number,
                  focusRing.base,
                  codeFocused && focusRing.visible,
                  codeFocused && focusRing.inset,
                  codeFocused && (formats.length > 1 ? unit.numberRing : fieldStyles.boxRing),
                )}
              >
                <Input
                  placeholder={placeholder}
                  spellCheck={false}
                  autoComplete="off"
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                  {...racStyles<InputRenderProps>(() => [fieldStyles.input, unit.numberInput, disabled && fieldStyles.inputDisabled])}
                />
              </span>
              {formats.length > 1 && (
                <Select
                  selectedKey={format}
                  onSelectionChange={chooseFormat}
                  isDisabled={disabled}
                  aria-label={fieldLabelledBy ? undefined : formatWord}
                  aria-labelledby={fieldLabelledBy ? `${fieldLabelledBy} ${formatWordId}` : undefined}
                  {...stylex.props(unit.unitField)}
                >
                  <Button
                    aria-labelledby={[fieldLabelledBy, formatWordId, formatValueId].filter(Boolean).join(' ')}
                    {...racStyles<ButtonRenderProps>((b) => [
                      unit.unit,
                      focusRing.base,
                      b.isFocusVisible && focusRing.visible,
                      b.isFocusVisible && focusRing.inset,
                      b.isFocusVisible && unit.unitRing,
                      b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
                    ])}
                  >
                    <span id={formatWordId} {...stylex.props(fieldStyles.visuallyHidden)}>
                      {formatWord}
                    </span>
                    <span {...stylex.props(unit.unitText)}>
                      {formats.map((f) => (
                        <span key={f} aria-hidden="true" {...stylex.props(unit.stack, unit.sizer)}>
                          {FORMAT_NAMES[f]}
                        </span>
                      ))}
                      <span id={formatValueId} {...stylex.props(unit.stack)}>
                        <SelectValue />
                      </span>
                    </span>
                    <span aria-hidden="true" {...stylex.props(fieldStyles.icon, disabled && triggerStyles.caretDisabled)}>
                      <CaretIcon />
                    </span>
                  </Button>
                  <Dropdown triggerRef={boxRef}>
                    {formats.map((f) => (
                      <DropdownItem key={f} id={f}>
                        {FORMAT_NAMES[f]}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </Select>
              )}
            </div>
            <PickerPopover
              triggerLabel={pickerLabel}
              size="large"
              isDisabled={disabled}
              placement={placement}
              onChangeEnd={onChangeEnd}
              {...panel}
            />
          </div>
          {description != null && (
            <Text slot="description" {...stylex.props(fieldStyles.contextRow, fieldStyles.caption)}>
              {description}
            </Text>
          )}
          <FieldError {...stylex.props(fieldStyles.error)}>{errorMessage}</FieldError>
        </>
      )}
    </TextField>
  );
}

/** The color as a code in the chosen format. HSL and HSB are rounded to whole numbers, as people type them. */
export function formatColor(c: Color, format: ColorFormat): string {
  if (format === 'hex') return c.toString('hex');
  // Just the values: the format button already says which format it is, and "rgb(255, 255, 255)" doesn't fit.
  const f = c.toFormat(format);
  const [first, second, third] = f.getColorChannels().map((ch) => Math.round(f.getChannelValue(ch)));
  return format === 'rgb' ? `${first}, ${second}, ${third}` : `${first}, ${second}%, ${third}%`;
}

/**
 * Reads a typed code, forgivingly: a hex code without "#", values without the format's name ("122 31 235" in RGB,
 * "226 84 52" in HSL), and spaces instead of commas all work. Returns null when it isn't a color.
 */
export function readColor(text: string, format: ColorFormat): Color | null {
  let t = text.trim();
  if (!t) return null;
  if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) t = t.startsWith('#') ? t : `#${t}`;
  else {
    const bare = !t.includes('(');
    if (bare) t = `${format === 'hex' ? 'rgb' : format}(${t})`;
    t = t.replace(/\(([^)]*)\)/, (_, inner: string) => {
      const values = inner.trim().split(/[\s,]+/).filter(Boolean);
      // Typed as shown ("226, 84%, 52%"), the percent signs are optional: "226 84 52" works in HSL and HSB.
      if (bare && (format === 'hsl' || format === 'hsb')) {
        values.forEach((v, i) => {
          if (i > 0 && /^[\d.]+$/.test(v)) values[i] = `${v}%`;
        });
      }
      return `(${values.join(', ')})`;
    });
  }
  try {
    return parseColor(t);
  } catch {
    return null;
  }
}

const styles = stylex.create({
  // Figma "ColorField": the box, then the swatch 8px to its right, the same height.
  // The label, and anything shown after it, 8px apart.
  labelRow: { display: 'flex', alignItems: 'center', gap: spacing.xs, minWidth: 0 },
  row: { display: 'flex', alignItems: 'center', gap: spacing.xs },
  box: { flexGrow: 1, minWidth: 0 },
});
