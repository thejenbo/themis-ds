import * as stylex from '@stylexjs/stylex';
import { memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Color } from 'react-aria-components';
import {
  Chip,
  type ChipTone,
  ColorField,
  type ColorFormat,
  type ContrastLevel,
  rateThemeColors,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectItem,
  THEME_BORDER_WIDTHS,
  THEME_RADII,
  type ThemeBorderWidth,
  type ThemeColors,
  type ThemeRadius,
  type ThemeSettings,
} from 'themis-ds';

import { color } from '../../../src/tokens/colorTheme.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { SidebarSection } from './SidebarSection';
import { type ColorFormats, loadCollapsed, saveCollapsed, type SectionId } from './storage';

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  brand: 'Brand',
  text: 'Text',
  background: 'Background',
  error: 'Error',
  warning: 'Warning',
  success: 'Success',
};

const LEVEL_TONE: Record<ContrastLevel, ChipTone> = { AAA: 'success', AA: 'success', 'AA Large': 'warning', Fail: 'danger' };

const BORDER_WIDTH_LABELS: Record<ThemeBorderWidth, string> = {
  none: 'None - Borderless',
  small: 'Small - Subtle',
  medium: 'Medium - Distinct',
  large: 'Large - Bold',
};

const RADIUS_LABELS: Record<ThemeRadius, string> = {
  none: 'None - Sharp',
  small: 'Small - Crisp',
  medium: 'Medium - Balanced',
  large: 'Large - Soft',
};

/** A starter list until the Google Fonts search lands. */
const FONTS = ['Playfair Display', 'Montserrat', 'Inter', 'Fraunces', 'DM Sans', 'Lora', 'Space Grotesk', 'Fredoka'];

interface ThemeSettingsFormProps {
  theme: ThemeSettings;
  onChange: (theme: ThemeSettings) => void;
  /** The colour code each field shows; a field that isn't listed shows HEX. */
  colorFormats: ColorFormats;
  onColorFormatsChange: (formats: ColorFormats) => void;
}

/** One theme's colours, borders and fonts: the sidebar below the theme row. */
export function ThemeSettingsForm({ theme, onChange, colorFormats, onColorFormatsChange }: ThemeSettingsFormProps) {
  const ratings = useMemo(() => rateThemeColors(theme.colors), [theme.colors]);
  // Callbacks read the latest theme from a ref, so they never change and the memoised rows below only re-render
  // when their own value does. (Re-rendering every field on each slider step made keyboard use lag.)
  const latest = useRef({ theme, onChange, colorFormats, onColorFormatsChange });
  latest.current = { theme, onChange, colorFormats, onColorFormatsChange };
  const update = useCallback((patch: Partial<ThemeSettings>) => latest.current.onChange({ ...latest.current.theme, ...patch }), []);
  const setColor = useCallback(
    (key: keyof ThemeColors, hex: string) => update({ colors: { ...latest.current.theme.colors, [key]: hex } }),
    [update],
  );
  const setFormat = useCallback(
    (key: keyof ThemeColors, format: ColorFormat) =>
      latest.current.onColorFormatsChange({ ...latest.current.colorFormats, [key]: format }),
    [],
  );
  const formatOf = (key: keyof ThemeColors) => colorFormats[key] ?? 'hex';
  // The control shows the code all six fields share. Once one field is switched on its own, none is selected, and
  // choosing any switches them all again.
  const allFormats = new Set(COLOR_KEYS.map(formatOf));
  const sharedFormat = allFormats.size === 1 ? [...allFormats][0]! : MIXED;
  const fonts = theme.fonts ?? { heading: 'Playfair Display', body: 'Montserrat' };

  // Which sections are closed. Remembered in this browser, like the themes.
  const [collapsed, setCollapsed] = useState<ReadonlySet<SectionId>>(loadCollapsed);
  useEffect(() => saveCollapsed(collapsed), [collapsed]);
  const section = (id: SectionId) => ({
    isExpanded: !collapsed.has(id),
    onExpandedChange: (open: boolean) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (open) next.delete(id);
        else next.add(id);
        return next;
      }),
  });
  const failing = (Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).filter((key) => ratings[key].level === 'Fail');
  const borders = { borderWidth: theme.borderWidth ?? 'medium', radius: theme.radius ?? 'medium' } as const;
  const fontNames = {
    heading: typeof fonts.heading === 'string' ? fonts.heading : fonts.heading.family,
    body: typeof fonts.body === 'string' ? fonts.body : fonts.body.family,
  };

  return (
    <div {...stylex.props(styles.sections)}>
      <SidebarSection title="Colors" summary={<ColorsSummary colors={theme.colors} failing={failing} />} {...section('colors')}>
        <div {...stylex.props(styles.fields, styles.colorFields)}>
          <SegmentedControl
            aria-label="Color code for every field"
            size="micro"
            selectedKey={sharedFormat}
            onSelectionChange={(key) =>
              onColorFormatsChange(Object.fromEntries(COLOR_KEYS.map((k) => [k, key as ColorFormat])) as ColorFormats)
            }
            xstyle={styles.formatControl}
          >
            {FORMATS.map((format) => (
              <SegmentedControlItem key={format} id={format}>
                {format.toUpperCase()}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          {COLOR_KEYS.map((key) => (
            <ColorRow
              key={key}
              colorKey={key}
              format={formatOf(key)}
              onFormatChange={setFormat}
              hex={theme.colors[key]}
              level={ratings[key].level}
              ratio={ratings[key].ratio}
              worstPair={ratings[key].worstPair}
              onChange={setColor}
            />
          ))}
        </div>
      </SidebarSection>
      <SidebarSection
        title="Borders"
        summary={`${firstWord(BORDER_WIDTH_LABELS[borders.borderWidth])} · ${firstWord(RADIUS_LABELS[borders.radius])}`}
        {...section('borders')}
      >
        <BordersSection borderWidth={borders.borderWidth} radius={borders.radius} onChange={update} />
      </SidebarSection>
      <SidebarSection
        title="Fonts"
        summary={
          <>
            <span style={{ fontFamily: JSON.stringify(fontNames.heading) }}>{fontNames.heading}</span>·
            <span style={{ fontFamily: JSON.stringify(fontNames.body) }}>{fontNames.body}</span>
          </>
        }
        {...section('fonts')}
      >
        <FontsSection heading={fontNames.heading} body={fontNames.body} onChange={update} />
      </SidebarSection>
    </div>
  );
}

const firstWord = (label: string) => label.split(' ')[0]!;

/** A closed Colors section: the six colours as dots, and a warning if any of them fails contrast. */
function ColorsSummary({ colors, failing }: { colors: ThemeColors; failing: (keyof ThemeColors)[] }): ReactNode {
  return (
    <>
      <span aria-hidden="true" {...stylex.props(styles.dots)}>
        {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
          <span key={key} {...stylex.props(styles.dot)} style={{ backgroundColor: colors[key] }} />
        ))}
      </span>
      {failing.length > 0 && (
        <Chip tone="danger">
          <span title={`Fails contrast: ${failing.map((k) => COLOR_LABELS[k]).join(', ')}`}>Fail</span>
        </Chip>
      )}
    </>
  );
}

interface ColorRowProps {
  colorKey: keyof ThemeColors;
  format: ColorFormat;
  onFormatChange: (key: keyof ThemeColors, format: ColorFormat) => void;
  hex: string;
  level: ContrastLevel;
  ratio: number;
  worstPair: string;
  onChange: (key: keyof ThemeColors, hex: string) => void;
}

/** One colour, with its contrast badge. */
const ColorRow = memo(function ColorRow({ colorKey, format, onFormatChange, hex, level, ratio, worstPair, onChange }: ColorRowProps) {
  // The file stores hex, but the field gets back the exact colour it sent: rounding to hex on every step would
  // nudge the sliders (a hue step of 1° could land on 0.8° or 1.2°).
  const [exact, setExact] = useState<Color | null>(null);
  const value = exact && exact.toString('hex').toLowerCase() === hex.toLowerCase() ? exact : hex;
  return (
    <ColorField
      label={
        <span {...stylex.props(styles.colorLabel)}>
          {COLOR_LABELS[colorKey]}
          <Chip tone={LEVEL_TONE[level]}>
            <span title={`Lowest contrast ${ratio.toFixed(2)}:1 (${worstPair})`}>{level}</span>
          </Chip>
        </span>
      }
      value={value}
      formats={FORMATS}
      format={format}
      onFormatChange={(f) => onFormatChange(colorKey, f)}
      // Six fields share the sidebar, so each picker button says which colour it's for.
      pickerLabel={`Pick the ${COLOR_LABELS[colorKey].toLowerCase()} color`}
      onChange={(c) => {
        if (!c) return;
        setExact(c);
        onChange(colorKey, c.toString('hex'));
      }}
    />
  );
});

const FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsb'];
const COLOR_KEYS = Object.keys(COLOR_LABELS) as (keyof ThemeColors)[];
/** Matches no item, so the format control shows nothing selected while the fields differ. */
const MIXED = 'mixed';

const BordersSection = memo(function BordersSection({
  borderWidth,
  radius,
  onChange,
}: {
  borderWidth: ThemeBorderWidth;
  radius: ThemeRadius;
  onChange: (patch: Partial<ThemeSettings>) => void;
}) {
  return (
    <div {...stylex.props(styles.fields)}>
        <Select label="Width" value={borderWidth} onChange={(v) => onChange({ borderWidth: v as ThemeBorderWidth })}>
          {THEME_BORDER_WIDTHS.map((mode) => (
            <SelectItem key={mode} id={mode}>
              {BORDER_WIDTH_LABELS[mode]}
            </SelectItem>
          ))}
        </Select>
        <Select label="Radius" value={radius} onChange={(v) => onChange({ radius: v as ThemeRadius })}>
          {THEME_RADII.map((mode) => (
            <SelectItem key={mode} id={mode}>
              {RADIUS_LABELS[mode]}
            </SelectItem>
          ))}
        </Select>
    </div>
  );
});

const FontsSection = memo(function FontsSection({
  heading,
  body,
  onChange,
}: {
  heading: string;
  body: string;
  onChange: (patch: Partial<ThemeSettings>) => void;
}) {
  const fonts = { heading, body };
  return (
    <div {...stylex.props(styles.fields)}>
        {(['heading', 'body'] as const).map((slot) => (
          <Select
            key={slot}
            label={slot === 'heading' ? 'Heading' : 'Body'}
            value={fonts[slot]}
            onChange={(v) => onChange({ fonts: { ...fonts, [slot]: String(v) } })}
          >
            {FONTS.map((family) => (
              <SelectItem key={family} id={family}>
                {family}
              </SelectItem>
            ))}
          </Select>
        ))}
    </div>
  );
});

const styles = stylex.create({
  sections: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  // The closed Colors summary: six 12px dots, outlined so one that matches the background still shows.
  dots: { display: 'inline-flex', alignItems: 'center', gap: spacing['2xs'] },
  dot: {
    width: '0.75rem',
    height: '0.75rem',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: '50%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.border,
  },
  fields: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  // Six colours, so a tighter stack than the other sections (Figma 2422:35688).
  colorFields: { gap: spacing.sm },
  // Figma 2434:39151: the micro control at the end of the row, above the fields.
  formatControl: { alignSelf: 'flex-end' },
  colorLabel: { display: 'inline-flex', alignItems: 'center', gap: spacing.xs },
});
