import * as stylex from '@stylexjs/stylex';
import { memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button as AriaButton, type ButtonRenderProps, type Color } from 'react-aria-components';
import {
  type FontChoice,
  Chip,
  ColorField,
  type ColorFormat,
  type ContrastLevel,
  Icon,
  rateThemeColors,
  SegmentedControl,
  SegmentedControlItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
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
import { border as radius } from '../../../src/tokens/radius.stylex';
import { focusRing } from '../../../src/utils/focus-ring';
import { interactiveCursor } from '../../../src/utils/interactive-cursor';
import { racStyles } from '../../../src/utils/stylex-rac';
import { touchTarget } from '../../../src/utils/touch-target';
import { font as fontTheme } from '../../../src/tokens/fontTheme.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { font } from '../../../src/tokens/typography.stylex';
import { COLOR_KEYS, COLOR_LABELS, type ContrastTab } from './contrast/contrast-copy';
import { RatingChip } from './contrast/RatingChip';
import { FontField } from './fonts/FontField';
import { SidebarSection } from './SidebarSection';
import { type ColorFormats, loadCollapsed, saveCollapsed, type SectionId } from './storage';



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

interface ThemeSettingsFormProps {
  theme: ThemeSettings;
  onChange: (theme: ThemeSettings) => void;
  /** The color code each field shows; a field that isn't listed shows HEX. */
  colorFormats: ColorFormats;
  onColorFormatsChange: (formats: ColorFormats) => void;
  /**
   * `sections`: Colors, Borders and Fonts open and close, one under the other (the desktop sidebar and mobile).
   * `tabs`: one tab each, labeled with what's set inside, and the fields in two columns (tablet).
   */
  layout?: 'sections' | 'tabs';
  /** Opens the contrast modal, on a color or on the explanation of the ratings. Keep it stable (a state setter). */
  onOpenContrast: (tab: ContrastTab) => void;
}

/** One theme's colors, borders and fonts: the sidebar below the theme row. */
export function ThemeSettingsForm({
  theme,
  onChange,
  colorFormats,
  onColorFormatsChange,
  layout = 'sections',
  onOpenContrast,
}: ThemeSettingsFormProps) {
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
  const setAllFormats = useCallback(
    (format: ColorFormat) =>
      latest.current.onColorFormatsChange(Object.fromEntries(COLOR_KEYS.map((k) => [k, format])) as ColorFormats),
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
  const toggle = useCallback(
    (id: SectionId, open: boolean) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (open) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );
  const section = (id: SectionId) => ({
    isExpanded: !collapsed.has(id),
    onExpandedChange: (open: boolean) => toggle(id, open),
  });
  const failing = (Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).filter((key) => ratings[key].level === 'Fail');
  const borderWidth = theme.borderWidth ?? 'medium';
  const radius = theme.radius ?? 'medium';
  const headingFont = typeof fonts.heading === 'string' ? fonts.heading : fonts.heading.family;
  const bodyFont = typeof fonts.body === 'string' ? fonts.body : fonts.body.family;
  const bordersOpen = !collapsed.has('borders');
  const fontsOpen = !collapsed.has('fonts');

  // What's set in each area at a glance: beside a closed section's title, or in its tab.
  const colorsSummary = <ColorsSummary colors={theme.colors} failing={failing} />;
  const bordersSummary = (
    <>
      <span>{summaryLevel(BORDER_WIDTH_LABELS[borderWidth])} width</span> <span>•</span>{' '}
      <span>{summaryLevel(RADIUS_LABELS[radius])} radius</span>
    </>
  );
  const fontsSummary = (
    <>
      <span style={{ fontFamily: JSON.stringify(headingFont) }}>{headingFont}</span> <span>•</span>{' '}
      <span style={{ fontFamily: JSON.stringify(bodyFont) }}>{bodyFont}</span>
    </>
  );

  // Borders and Fonts don't change while a color does, so the same elements are reused and React skips them on
  // color slider steps (keeps those steps quick; see the lag test in colors.test.tsx).
  const bordersSection = useMemo(
    () => (
      <SidebarSection
        title="Borders"
        summary={bordersSummary}
        isExpanded={bordersOpen}
        onExpandedChange={(open) => toggle('borders', open)}
      >
        <BordersSection borderWidth={borderWidth} radius={radius} onChange={update} />
      </SidebarSection>
    ),
    [borderWidth, radius, bordersOpen, toggle, update],
  );
  const fontsSection = useMemo(
    () => (
      <SidebarSection
        title="Fonts"
        summary={fontsSummary}
        isLast
        isExpanded={fontsOpen}
        onExpandedChange={(open) => toggle('fonts', open)}
      >
        <FontsSection heading={fonts.heading} body={fonts.body} onChange={update} />
      </SidebarSection>
    ),
    [fonts.heading, fonts.body, fontsOpen, toggle, update],
  );

  const columns = layout === 'tabs';
  // In the sidebar it sits right under the Colors heading; on tablet, at the end of the color code row.
  const aboutLink = (
    <AriaButton
      onPress={() => onOpenContrast('about')}
      {...racStyles<ButtonRenderProps>((s) => [
        styles.aboutLink,
        s.isHovered && styles.aboutLinkHovered,
        interactiveCursor.enabled,
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
      ])}
    >
      <Icon name="info" size="xsmall" />
      About contrast ratings
    </AriaButton>
  );
  const colorFields = (
    <div {...stylex.props(styles.fields, columns && styles.columns, columns && styles.colorColumns)}>
      <div {...stylex.props(styles.colorTools, columns && styles.colorToolsColumns)}>
        {columns && aboutLink}
        <ColorCodeControl selected={sharedFormat} onChange={setAllFormats} atStart={columns} />
      </div>
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
          onOpenContrast={onOpenContrast}
        />
      ))}
    </div>
  );

  if (layout === 'tabs') {
    const tab = (title: string, summary: ReactNode) => (
      <span {...stylex.props(styles.tabLabel)}>
        {title}
        <span {...stylex.props(styles.tabSummary)}>{summary}</span>
      </span>
    );
    return (
      <Tabs isFullWidth>
        {/* Sticks below the theme row, so the three areas stay named while the fields scroll. */}
        <div {...stylex.props(styles.tabBar)}>
          <TabList aria-label="Theme settings">
            <Tab id="colors">{tab('Colors', colorsSummary)}</Tab>
            <Tab id="borders">{tab('Borders', bordersSummary)}</Tab>
            <Tab id="fonts">{tab('Fonts', fontsSummary)}</Tab>
          </TabList>
        </div>
        <TabPanel id="colors" {...stylex.props(styles.tabPanel)}>
          {colorFields}
        </TabPanel>
        <TabPanel id="borders" {...stylex.props(styles.tabPanel)}>
          <BordersSection borderWidth={borderWidth} radius={radius} onChange={update} columns />
        </TabPanel>
        <TabPanel id="fonts" {...stylex.props(styles.tabPanel)}>
          <FontsSection heading={fonts.heading} body={fonts.body} onChange={update} columns />
        </TabPanel>
      </Tabs>
    );
  }

  return (
    <div {...stylex.props(styles.sections)}>
      <SidebarSection title="Colors" summary={colorsSummary} action={aboutLink} {...section('colors')}>
        {colorFields}
      </SidebarSection>
      {bordersSection}
      {fontsSection}
    </div>
  );
}

const firstWord = (label: string) => label.split(' ')[0]!;
/** The closed Borders summary's wording for a level: "No width", "Small radius". */
const summaryLevel = (label: string) => (firstWord(label) === 'None' ? 'No' : firstWord(label));

/** A closed Colors section: the six colors as dots, and a warning if any of them fails contrast. */
function ColorsSummary({ colors, failing }: { colors: ThemeColors; failing: (keyof ThemeColors)[] }): ReactNode {
  return (
    <span {...stylex.props(styles.colorsSummary)}>
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
    </span>
  );
}

/**
 * HEX / RGB / HSL / HSB for every color field at once. Memoised (with a stable `onChange`) so slider steps don't
 * re-render it.
 */
const ColorCodeControl = memo(function ColorCodeControl({
  selected,
  onChange,
  atStart = false,
}: {
  selected: ColorFormat | typeof MIXED;
  onChange: (format: ColorFormat) => void;
  /** At the start of the row (tablet) rather than the end. */
  atStart?: boolean;
}) {
  return (
    <SegmentedControl
      aria-label="Color code for every field"
      size="micro"
      selectedKey={selected}
      onSelectionChange={(key) => onChange(key as ColorFormat)}
      xstyle={[styles.formatControl, atStart && styles.formatControlStart]}
    >
      {FORMATS.map((format) => (
        <SegmentedControlItem key={format} id={format}>
          {format.toUpperCase()}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
});

interface ColorRowProps {
  colorKey: keyof ThemeColors;
  format: ColorFormat;
  onFormatChange: (key: keyof ThemeColors, format: ColorFormat) => void;
  hex: string;
  level: ContrastLevel;
  ratio: number;
  worstPair: string;
  onChange: (key: keyof ThemeColors, hex: string) => void;
  onOpenContrast: (tab: ContrastTab) => void;
}

/** One color, with its contrast rating: a chip that opens the contrast modal on this color. */
const ColorRow = memo(function ColorRow({ colorKey, format, onFormatChange, hex, level, ratio, worstPair, onChange, onOpenContrast }: ColorRowProps) {
  // The file stores hex, but the field gets back the exact color it sent: rounding to hex on every step would
  // nudge the sliders (a hue step of 1° could land on 0.8° or 1.2°).
  const [exact, setExact] = useState<Color | null>(null);
  const value = exact && exact.toString('hex').toLowerCase() === hex.toLowerCase() ? exact : hex;
  return (
    <ColorField
      label={COLOR_LABELS[colorKey]}
      labelAccessory={<RatingChip colorKey={colorKey} level={level} ratio={ratio} worstPair={worstPair} onOpen={onOpenContrast} />}
      value={value}
      formats={FORMATS}
      format={format}
      onFormatChange={(f) => onFormatChange(colorKey, f)}
      // Six fields share the sidebar, so each picker button says which color it's for.
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
/** Matches no item, so the format control shows nothing selected while the fields differ. */
const MIXED = 'mixed';

const BordersSection = memo(function BordersSection({
  borderWidth,
  radius,
  onChange,
  columns = false,
}: {
  borderWidth: ThemeBorderWidth;
  radius: ThemeRadius;
  onChange: (patch: Partial<ThemeSettings>) => void;
  /** Side by side (tablet). */
  columns?: boolean;
}) {
  return (
    <div {...stylex.props(styles.fields, columns && styles.columns)}>
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
  columns = false,
}: {
  heading: FontChoice;
  body: FontChoice;
  onChange: (patch: Partial<ThemeSettings>) => void;
  /** Side by side (tablet). */
  columns?: boolean;
}) {
  const fonts = { heading, body };
  return (
    <div {...stylex.props(styles.fields, columns && styles.columns)}>
      {(['heading', 'body'] as const).map((slot) => (
        <FontField
          key={slot}
          label={slot === 'heading' ? 'Heading' : 'Body'}
          value={fonts[slot]}
          onChange={(choice) => onChange({ fonts: { ...fonts, [slot]: choice } })}
        />
      ))}
    </div>
  );
});

const styles = stylex.create({
  // 8px, plus each heading's 8px top padding: 16px from one closed heading's line to the next title (Figma 2437:2652).
  sections: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  // Prototype tabs: the tab row sticks below the theme row, on a strip as wide as the sidebar.
  tabBar: {
    position: 'sticky',
    insetBlockStart: 'var(--theme-bar-height, 0px)',
    zIndex: 1,
    marginInline: `calc(-1 * ${spacing.md})`,
    paddingInline: spacing.md,
    backgroundColor: color.background,
  },
  // A tab's title, with what's set inside under it in caption text (as a closed section shows it).
  tabLabel: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing['2xs'] },
  tabSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing['2xs'],
    whiteSpace: 'nowrap',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    fontWeight: font.weightRegular,
    color: color.textPlaceholderDefault,
  },
  tabPanel: { paddingBlock: spacing.md },
  // The closed Colors summary (Figma 2437:2652): 8px under the title rather than 4, the Fail chip 16px after the dots.
  colorsSummary: { display: 'flex', alignItems: 'center', gap: spacing.sm, paddingBlockStart: spacing['2xs'] },
  // Six 12px dots, outlined so one that matches the background still shows.
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
  // Two columns (tablet tabs); the color code control keeps a row of its own.
  columns: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: spacing.md },
  // The colors fill down each column: brand, text and background on the left; error, warning and success on the
  // right. The code control takes the first row.
  colorColumns: { gridTemplateRows: 'repeat(4, auto)', gridAutoFlow: 'column' },
  // Figma 2434:39151: the micro control at the end of the row, above the fields.
  formatControl: { alignSelf: 'flex-end', gridColumn: '1 / -1', justifySelf: 'end' },
  formatControlStart: { alignSelf: 'flex-start', justifySelf: 'start' },
  // In the sidebar, the link on its own line at the start, the control under it at the end. On tablet, one row: the
  // control first, the link at the end.
  colorTools: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  colorToolsColumns: { gridColumn: '1 / -1', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  // A small text link (caption size) with its icon, lined up with the field labels.
  aboutLink: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing['2xs'],
    alignSelf: 'flex-start',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: color.text,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    textDecorationLine: 'none',
    textUnderlineOffset: spacing['3xs'],
    borderRadius: radius.radiusSm,
  },
  aboutLinkHovered: { textDecorationLine: 'underline' },
});
