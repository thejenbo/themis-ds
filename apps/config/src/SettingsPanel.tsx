import * as stylex from '@stylexjs/stylex';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import type { Color } from 'react-aria-components';
import {
  Chip,
  type ChipTone,
  ColorField,
  type ContrastLevel,
  collectionModes,
  Heading,
  type ModeOf,
  rateThemeColors,
  Select,
  SelectItem,
  type ThemeColors,
  type ThemeSettings,
} from 'themis-ds';

import { spacing } from '../../../src/tokens/spacing.stylex';

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  brand: 'Brand',
  text: 'Text',
  background: 'Background',
  error: 'Error',
  warning: 'Warning',
  success: 'Success',
};

const LEVEL_TONE: Record<ContrastLevel, ChipTone> = { AAA: 'success', AA: 'success', 'AA Large': 'warning', Fail: 'danger' };

const BORDER_WIDTH_LABELS: Record<ModeOf<'borderWidth'>, string> = {
  none: 'None - Borderless',
  small: 'Small - Subtle',
  medium: 'Medium - Distinct',
  large: 'Large - Bold',
};

const RADIUS_LABELS: Record<ModeOf<'radius'>, string> = {
  none: 'None - Sharp',
  small: 'Small - Crisp',
  medium: 'Medium - Balanced',
  large: 'Large - Soft',
};

/** A starter list until the Google Fonts search lands. */
const FONTS = ['Playfair Display', 'Montserrat', 'Inter', 'Fraunces', 'DM Sans', 'Lora', 'Space Grotesk', 'Fredoka'];

/** One theme's colours, borders and fonts: the sidebar below the theme row. */
export function ThemeSettingsForm({ theme, onChange }: { theme: ThemeSettings; onChange: (theme: ThemeSettings) => void }) {
  const ratings = useMemo(() => rateThemeColors(theme.colors), [theme.colors]);
  // Callbacks read the latest theme from a ref, so they never change and the memoised rows below only re-render
  // when their own value does. (Re-rendering every field on each slider step made keyboard use lag.)
  const latest = useRef({ theme, onChange });
  latest.current = { theme, onChange };
  const update = useCallback((patch: Partial<ThemeSettings>) => latest.current.onChange({ ...latest.current.theme, ...patch }), []);
  const setColor = useCallback(
    (key: keyof ThemeColors, hex: string) => update({ colors: { ...latest.current.theme.colors, [key]: hex } }),
    [update],
  );
  const fonts = theme.fonts ?? { heading: 'Playfair Display', body: 'Montserrat' };

  return (
    <div {...stylex.props(styles.sections)}>
      <section {...stylex.props(styles.section)}>
        <Heading level={2} size="sm">
          Colors
        </Heading>
        {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
          <ColorRow
            key={key}
            colorKey={key}
            hex={theme.colors[key]}
            level={ratings[key].level}
            ratio={ratings[key].ratio}
            worstPair={ratings[key].worstPair}
            onChange={setColor}
          />
        ))}
      </section>
      <BordersSection borderWidth={theme.borderWidth ?? 'medium'} radius={theme.radius ?? 'medium'} onChange={update} />
      <FontsSection
        heading={typeof fonts.heading === 'string' ? fonts.heading : fonts.heading.family}
        body={typeof fonts.body === 'string' ? fonts.body : fonts.body.family}
        onChange={update}
      />
    </div>
  );
}

interface ColorRowProps {
  colorKey: keyof ThemeColors;
  hex: string;
  level: ContrastLevel;
  ratio: number;
  worstPair: string;
  onChange: (key: keyof ThemeColors, hex: string) => void;
}

/** One colour, with its contrast badge. */
const ColorRow = memo(function ColorRow({ colorKey, hex, level, ratio, worstPair, onChange }: ColorRowProps) {
  // The file stores hex, but the field gets back the exact colour it sent: rounding to hex on every step would
  // nudge the sliders (a hue step of 1° could land on 0.8° or 1.2°).
  const [exact, setExact] = useState<Color | null>(null);
  const value = exact && exact.toString('hex').toLowerCase() === hex.toLowerCase() ? exact : hex;
  return (
    <ColorField
      label={
        <span {...stylex.props(styles.colorLabel)}>
          {COLOR_LABELS[colorKey]}
          <Chip variant="solid" tone={LEVEL_TONE[level]}>
            <span title={`Lowest contrast ${ratio.toFixed(2)}:1 (${worstPair})`}>{level}</span>
          </Chip>
        </span>
      }
      value={value}
      formats={FORMATS}
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

const FORMATS: ('hex' | 'rgb' | 'hsl' | 'hsb')[] = ['hex', 'rgb', 'hsl', 'hsb'];

const BordersSection = memo(function BordersSection({
  borderWidth,
  radius,
  onChange,
}: {
  borderWidth: ModeOf<'borderWidth'>;
  radius: ModeOf<'radius'>;
  onChange: (patch: Partial<ThemeSettings>) => void;
}) {
  return (
    <section {...stylex.props(styles.section)}>
      <Heading level={2} size="sm">
        Borders
      </Heading>
      <div {...stylex.props(styles.fields)}>
        <Select label="Width" value={borderWidth} onChange={(v) => onChange({ borderWidth: v as ModeOf<'borderWidth'> })}>
          {collectionModes.borderWidth.map((mode) => (
            <SelectItem key={mode} id={mode}>
              {BORDER_WIDTH_LABELS[mode]}
            </SelectItem>
          ))}
        </Select>
        <Select label="Radius" value={radius} onChange={(v) => onChange({ radius: v as ModeOf<'radius'> })}>
          {collectionModes.radius.map((mode) => (
            <SelectItem key={mode} id={mode}>
              {RADIUS_LABELS[mode]}
            </SelectItem>
          ))}
        </Select>
      </div>
    </section>
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
    <section {...stylex.props(styles.section)}>
      <Heading level={2} size="sm">
        Fonts
      </Heading>
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
    </section>
  );
});

const styles = stylex.create({
  sections: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  section: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  fields: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  colorLabel: { display: 'inline-flex', alignItems: 'center', gap: spacing.xs },
});
